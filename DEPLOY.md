# Despliegue en el PC del cliente (Windows, red interna)

Arquitectura: `caddy` (HTTPS, puertos 80/443, lo único visible en la red) → `frontend` + `backend` → `mysql`.
Un contenedor extra, `backup`, guarda un volcado de la BD cada 24 h.

## 1. Qué instalar en el PC del cliente

**Solo Docker Desktop** (con el backend WSL 2, que es el predeterminado). No hace falta instalar Ubuntu ni usar WSL a mano:
Docker Desktop crea por su cuenta una distro interna (`docker-desktop`) que el usuario no ve ni toca.

- Requisitos: Windows 10/11 64 bits, virtualización activada en BIOS, 8 GB de RAM recomendado (mínimo 4 GB libres).
- Licencia: Docker Desktop es gratis para empresas pequeñas (< 250 empleados y < 10 M USD de ingresos); si no, es de pago.
- Instalarlo: `winget install Docker.DockerDesktop` (o el instalador de docker.com), reiniciar, abrir Docker Desktop y en
  *Settings → General* marcar **Start Docker Desktop when you sign in**.
- ¿Por qué no Docker dentro de Ubuntu/WSL? Es más frágil (no arranca solo, la red hacia la LAN es más complicada) y no
  ahorra nada. Docker Desktop es lo más simple para un cliente que además usa el PC normalmente.

**Limitar el consumo de RAM de WSL** (si no, puede llegar a tomar la mitad de la RAM): crear `C:\Users\<usuario>\.wslconfig`:
```
[wsl2]
memory=3GB
processors=2
```
y ejecutar `wsl --shutdown` (luego reabrir Docker Desktop).

## 2. Dónde se guarda cada cosa

| Qué | Dónde | Sobrevive a rebuild/`down`/reinicio |
|---|---|---|
| **Imágenes de productos** | `<carpeta del proyecto>\data\uploads` (carpeta normal de Windows) | Sí |
| **Respaldos diarios de la BD** | `<carpeta del proyecto>\data\backups\db-AAAA-MM-DD.sql` (14 días) | Sí |
| **Base de datos MySQL** | volumen Docker `tce-system_tce_mysql_data`, dentro del disco virtual de Docker: `%LOCALAPPDATA%\Docker\wsl\...\docker_data.vhdx` | Sí |
| **Certificados HTTPS** | volumen `tce-system_tce_caddy_data` | Sí |
| `.env` (contraseñas) | raíz del proyecto | Sí |

Por qué MySQL va en un volumen y no en una carpeta de Windows: en carpetas NTFS montadas en WSL, MySQL es lento y puede dar
errores de permisos. Para compensar, cada día se vuelca la BD a `data\backups` (carpeta visible, fácil de copiar).

**Lo único que borra datos**: `docker compose down -v`, `docker volume rm ...`, "Reset to factory defaults" o desinstalar
Docker Desktop (borra el disco virtual). `docker compose up --build`, `down` y reiniciar el PC **no** borran nada.

**Espacio en disco**: imágenes Docker ~1.5–2 GB + disco virtual (BD) ~1 GB al inicio. Cuenta unos **5 GB** iniciales.
Crece con los datos (la BD de un negocio pequeño son decenas de MB; las fotos, lo que subas). El `.vhdx` crece pero
no se encoge solo.

**Respaldo real = copiar la carpeta `data\` a un disco externo/otro equipo** (contiene fotos y volcados de la BD). Respaldo
manual completo en un zip: `.\scripts\backup.ps1`.

## 3. Instalación (primera vez)

1. Dar al PC una **IP fija** (reserva DHCP en el router o IP estática de Windows). Los demás equipos apuntan `tce` a esa IP.
2. Copiar el proyecto al PC (p. ej. `C:\tce-system`), por `git clone` o carpeta/zip. No hace falta instalar Node ni MySQL.
3. PowerShell **como administrador**:
   ```powershell
   cd C:\tce-system
   Set-ExecutionPolicy -Scope Process Bypass
   .\scripts\install.ps1
   ```
   El script: crea `.env` con contraseñas aleatorias (`SITE_ADDRESS=tce`), agrega `127.0.0.1 tce` al archivo hosts de ese PC,
   crea `data\`, abre el firewall (80/443, redes privadas), hace `docker compose up -d --build`, y exporta/instala el
   certificado en ese PC (`data\tce-ca.crt`). La primera vez tarda unos minutos (descarga imágenes y compila).
4. Abrir **`https://tce`** en ese PC.
5. Crear el primer administrador con el código del rol ADMIN (campo `code` de la tabla `roles`); luego cámbialo.

Los contenedores tienen `restart: unless-stopped`: arrancan solos cuando Docker Desktop arranca. Ojo: Docker Desktop arranca
al **iniciar sesión** en Windows, no antes; el PC debe quedar con la sesión abierta tras reiniciar.

## 4. Acceso por intranet (otros equipos)

El sistema se abre con el nombre **`https://tce`**. Un nombre como `tce` no existe en ninguna red por sí solo: cada equipo
debe saber que `tce` es la IP del servidor.

**Equipos Windows:** copiar a ese equipo `scripts\client-setup.ps1` y `data\tce-ca.crt` (misma carpeta) y, en PowerShell
como administrador: `.\client-setup.ps1 -ServerIp 192.168.1.50` (la IP del servidor). Esto agrega `tce` al archivo hosts
e instala el certificado.

**Celulares/tablets, o para no tocar cada equipo (recomendado si hay muchos):** crear en el router (o servidor DNS interno)
un registro estático `tce → IP del servidor`. Así todos los dispositivos lo resuelven solos. Los celulares además deben
instalar `tce-ca.crt` (Android: Ajustes → Seguridad → Instalar certificado CA; iOS: abrir el .crt, instalarlo y activarlo en
*Ajustes → General → Acerca de → Confianza en certificados*).

El certificado es necesario para que no salga advertencia y para que la **cámara/escáner funcione** (exige HTTPS).
Entrar por la IP (`https://192.168...`) abre pero con advertencia de certificado: usa siempre `https://tce`.

Si no abre: `ping tce` debe responder con la IP del servidor; revisar el firewall del servidor (regla "TCE Web") y que la
red esté como **Privada**.

## 4b. Tipo de cambio, costos y precios

- En **Productos → Registrar/Editar**, sección *Precios y Stock*: botón **Configurar tipo de cambio** (alta, edición,
  historial y borrado de registros; el más reciente es el vigente). Tabla: `dollar_exchange`.
- **El tipo de cambio es referencial.** Cada producto guarda **costo en USD**, **margen %**, **costo en Bs**, **precio en Bs**
  y el tipo de cambio con el que se registró. En el formulario, costo Bs = USD × tipo de cambio y precio = costo Bs × (1 + margen)
  solo *sugieren* los valores: todo es editable (si editas el precio, se ajusta el margen) y lo que se guarda es el costo y
  precio en Bs que ves. Margen por defecto en productos nuevos: 30 %.
- Registrar un tipo de cambio nuevo **no recalcula** los productos existentes: uno registrado a 12 y otro a 13 conservan su
  costo y precio. Al editar un producto aparece, si difiere del vigente, el botón *Recalcular con el vigente*.
- **Switch "Usar tipo de cambio más reciente"** (activado por defecto) en **Ventas → Registrar** y en **Productos → Lista**:
  - *Activado:* los productos con costo en USD calculan costo = USD × dólar vigente y precio = costo × (1 + margen)
    (en la venta el precio sigue siendo editable). Los productos sin costo en USD usan sus valores registrados.
  - *Desactivado:* se usan el costo y el precio con los que se registró cada producto.
  - En la lista solo cambia lo que se muestra; en la venta cambia el precio sugerido y el costo guardado para la utilidad.
- **Ventas e historial:** cada venta guarda el precio, el **costo usado** (`sale_details.unit_cost`) y el tipo de cambio
  usado (`sales.exchange_rate`, vacío si el switch estaba desactivado). Los reportes de utilidad usan ese costo, así que el
  pasado no cambia cuando sube o baja el dólar. Las ventas antiguas se completaron con el costo del producto al migrar.
- La base de datos se actualiza sola al arrancar el backend (columnas nuevas); no hay que ejecutar SQL.
- Reparaciones: siguen en Bs, sin relación con el dólar.

## 5. Cómo probarlo

En el servidor:
```powershell
docker compose ps                      # 5 servicios Up; mysql (healthy)
curl.exe -k https://localhost/api/roles   # debe devolver JSON de roles
docker compose logs -f backend         # logs en vivo
```
Prueba de persistencia: subir una foto a un producto y crear un dato; luego
`docker compose down`, `docker compose up -d --build`, y comprobar que todo sigue. Ver el archivo en `data\uploads`.
Prueba de intranet: desde otro PC/celular abrir `https://tce`, iniciar sesión y probar el escáner de cámara.
Prueba de reinicio: reiniciar el PC, iniciar sesión, esperar 1–2 min y abrir la web.

## 6. Operación diaria

| Acción | Comando (en la carpeta del proyecto) |
|---|---|
| Ver estado | `docker compose ps` |
| Reiniciar | `docker compose restart` |
| Parar / arrancar | `docker compose stop` / `docker compose start` |
| Actualizar a nueva versión | `git pull` (o copiar archivos) → `.\scripts\install.ps1` |
| Respaldo manual | `.\scripts\backup.ps1` |
| Restaurar BD | `Get-Content data\backups\db-XXXX.sql -Raw \| docker compose exec -T mysql sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"'` |

## 7. Migrar datos del entorno de desarrollo anterior

El contenedor viejo `system-mysql` (puerto 5000) tiene tus datos en la BD `inventory_system`:
```powershell
docker exec system-mysql mysqldump -uroot -ptce1234 inventory_system > old.sql
```
Con el sistema nuevo ya levantado y **vacío**, restaurar con el comando de la sección 6. Las fotos antiguas están en
`backend\src\public\products`: copiarlas a `data\uploads`.

## 8. Entregar al cliente sin código fuente (recomendado)

En tu PC, en la carpeta del proyecto: `.\scripts\package-release.ps1`. Genera `dist\tce-release\` con solo:

```
tce-release\
  docker-compose.yml     (usa imágenes ya compiladas, sin "build")
  Caddyfile
  db\init\01-schema.sql
  images\tce-images.tar  (backend, frontend, mysql y caddy; sirve también sin internet)
  scripts\               install, uninstall, backup, client-setup
```

Copia esa carpeta al PC del cliente (p. ej. `C:\tce`) y ejecuta `scripts\install.ps1` como administrador: carga las imágenes
y levanta todo. Tras instalar aparecen `.env` y `data\`. **No hace falta el código** (ni `backend\`, `frontend\`, `node_modules`).

- **Qué debe quedar en el cliente:** todo lo de `tce-release\`. `data\` y `.env` son lo importante; `images\tce-images.tar`
  (cientos de MB) se puede borrar tras instalar, pero se necesita de nuevo para actualizar.
- **Actualizar:** generas un paquete nuevo, copias `images\` y `docker-compose.yml` sobre los del cliente y ejecutas
  `install.ps1`. Los datos no se tocan.
- **Límite honesto:** el código no está en la carpeta, pero sí dentro de las imágenes Docker. Quien tenga acceso de
  administrador al PC y sepa usar Docker podría extraerlo (el front va compilado/minificado, el backend es JS legible).
  Si eso importa, la protección real es contractual/de acceso físico, o no darles permisos de administrador.

## 9. Desinstalar

`.\scripts\uninstall.ps1` (PowerShell como administrador, Docker Desktop abierto):
1. **Respaldo final** (BD + fotos + `.env`) en `Escritorio\TCE-respaldo-final\respaldo-final-<fecha>.zip`, fuera de la carpeta
   del sistema. Si el respaldo falla, **no borra nada**.
2. Pide escribir `DESINSTALAR`.
3. Borra contenedores, volúmenes (BD y certificados) e imágenes; quita la regla de firewall, la línea `tce` del hosts y el
   certificado de confianza.
4. Conserva `data\`; con `-DeleteData` también la borra (el respaldo final sigue en el Escritorio).

Después, borra a mano la carpeta del sistema. Los equipos cliente (hosts/certificado) se limpian a mano o con el router.
Para recuperar los datos más tarde: reinstalar y restaurar `db.sql` del zip (comando de la sección 6).

## Pendiente de seguridad (no resuelto aquí)

La API no exige token en casi ninguna ruta (solo 5 de 61 llamadas del frontend envían el token). Está protegida únicamente
por estar en la red interna.
