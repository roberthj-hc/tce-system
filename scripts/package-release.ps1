# Genera el paquete para el cliente SIN código fuente:  .\scripts\package-release.ps1
# Resultado: dist\tce-release\  (copiar esa carpeta al PC del cliente y ejecutar scripts\install.ps1)
$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

docker info *> $null
if ($LASTEXITCODE -ne 0) { Write-Host "Docker no está corriendo." -ForegroundColor Red; exit 1 }

# 1) Compilar las imágenes (el código queda dentro de ellas)
docker compose build
if ($LASTEXITCODE -ne 0) { exit 1 }

# 2) Carpeta de salida
$out = "dist\tce-release"
if (Test-Path $out) { Remove-Item $out -Recurse -Force }
New-Item -ItemType Directory -Force "$out\images", "$out\scripts", "$out\db\init" | Out-Null

# 3) docker-compose.yml sin las secciones "build" (usa las imágenes ya cargadas)
$c = [IO.File]::ReadAllText("$PWD\docker-compose.yml")
$c = [regex]::Replace($c, '(?m)^    build: \./backend\r?\n', '')
$c = [regex]::Replace($c, '(?ms)^    build:\r?\n      context:.*?NEXT_PUBLIC_API_URL:[^\r\n]*\r?\n', '')
if ($c -match '(?m)^\s+build:') { Write-Host "No se pudo quitar 'build' del compose." -ForegroundColor Red; exit 1 }
[IO.File]::WriteAllText("$PWD\$out\docker-compose.yml", $c, (New-Object Text.UTF8Encoding($false)))

Copy-Item Caddyfile $out
Copy-Item db\init\*.sql "$out\db\init"
Copy-Item scripts\install.ps1, scripts\uninstall.ps1, scripts\backup.ps1, scripts\client-setup.ps1 "$out\scripts"

# 4) Imágenes en un solo archivo (incluye mysql y caddy: sirve también sin internet)
docker pull mysql:8.4 | Out-Null
docker pull caddy:2 | Out-Null
docker save -o "$out\images\tce-images.tar" tce-backend:latest tce-frontend:latest mysql:8.4 caddy:2
if ($LASTEXITCODE -ne 0) { Write-Host "Falló docker save." -ForegroundColor Red; exit 1 }

Get-Date -Format "yyyy-MM-dd HH:mm" | Set-Content "$out\VERSION"
$mb = [math]::Round((Get-Item "$out\images\tce-images.tar").Length / 1MB)
Write-Host "`nPaquete listo: $PWD\$out  (imágenes: $mb MB)" -ForegroundColor Green
Write-Host "Copia esa carpeta al PC del cliente y ejecuta scripts\install.ps1 como administrador."
