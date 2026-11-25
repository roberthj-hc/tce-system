# Instalación / actualización en el PC del cliente.
# Ejecutar en PowerShell COMO ADMINISTRADOR:  .\scripts\install.ps1
$ErrorActionPreference = "Continue"
Set-Location (Split-Path $PSScriptRoot -Parent)

$id = [Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
if (-not $id.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "Ejecuta PowerShell como Administrador." -ForegroundColor Red; exit 1
}

docker info *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker no está corriendo. Abre Docker Desktop, espera a que diga 'Engine running' y repite." -ForegroundColor Red; exit 1
}

function New-Secret($bytes) {
    $b = New-Object byte[] $bytes
    [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b)
    -join ($b | ForEach-Object { $_.ToString("x2") })
}

# 1) .env (solo si no existe, para no cambiar contraseñas de una BD ya creada)
if (-not (Test-Path .env)) {
    $envText = @"
SITE_ADDRESS=tce
DB_NAME=inventory_system
DB_USER=tce
DB_PASSWORD=$(New-Secret 12)
MYSQL_ROOT_PASSWORD=$(New-Secret 12)
JWT_SECRET=$(New-Secret 32)
TZ=America/La_Paz
"@
    [IO.File]::WriteAllText("$PWD\.env", $envText, (New-Object Text.UTF8Encoding($false)))
    Write-Host "Creado .env (SITE_ADDRESS=tce)" -ForegroundColor Green
}

# 1b) 'tce' debe resolverse a este PC (los demás equipos usan scripts\client-setup.ps1)
$hosts = "$env:SystemRoot\System32\drivers\etc\hosts"
if (-not (Select-String -Path $hosts -Pattern '^\s*127\.0\.0\.1\s+tce' -Quiet)) {
    Add-Content -Path $hosts -Value "`r`n127.0.0.1 tce"
    Write-Host "Agregado 'tce' al archivo hosts de este PC." -ForegroundColor Green
}

# 2) Carpetas de datos
New-Item -ItemType Directory -Force data\uploads, data\backups | Out-Null

# 3) Firewall: permitir 80/443 en la red local
if (-not (Get-NetFirewallRule -DisplayName "TCE Web" -ErrorAction SilentlyContinue)) {
    New-NetFirewallRule -DisplayName "TCE Web" -Direction Inbound -Protocol TCP -LocalPort 80,443 `
        -Action Allow -Profile Private,Domain | Out-Null
    Write-Host "Regla de firewall creada (puertos 80 y 443, redes privadas)." -ForegroundColor Green
}

# 4) Levantar: paquete de entrega (imágenes ya compiladas) o, en desarrollo, compilando el código
if (Test-Path images\tce-images.tar) {
    Write-Host "Cargando imágenes (puede tardar un minuto)..."
    docker load -i images\tce-images.tar
    if ($LASTEXITCODE -ne 0) { Write-Host "Falló docker load." -ForegroundColor Red; exit 1 }
    docker compose up -d
} else {
    docker compose up -d --build
}
if ($LASTEXITCODE -ne 0) { Write-Host "Falló docker compose." -ForegroundColor Red; exit 1 }

# 5) Exportar y confiar en el certificado de Caddy
$ca = "data\tce-ca.crt"
for ($i = 0; $i -lt 30; $i++) {
    docker cp tce-caddy:/data/caddy/pki/authorities/local/root.crt $ca 2>$null
    if (Test-Path $ca) { break }
    Start-Sleep 2
}
if (Test-Path $ca) {
    certutil -addstore -f Root $ca | Out-Null
    Write-Host "Certificado exportado a $PWD\$ca e instalado en este PC." -ForegroundColor Green
    Write-Host "Instálalo igual en los demás equipos (doble clic > Instalar > Entidades de certificación raíz de confianza)."
}

$ip = (Get-NetIPConfiguration | Where-Object { $_.IPv4DefaultGateway -and $_.NetAdapter.Status -eq "Up" } |
       Select-Object -First 1).IPv4Address.IPAddress
Write-Host "`nListo. En este PC entra a https://tce" -ForegroundColor Cyan
Write-Host "Para los demás equipos de la red: copia scripts\client-setup.ps1 y data\tce-ca.crt y ejecútalo allí con la IP $ip"
