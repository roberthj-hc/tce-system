# Desinstala TCE del PC. ANTES hace un último respaldo (BD + imágenes) y lo guarda FUERA de la carpeta del sistema.
# PowerShell como administrador:
#   .\scripts\uninstall.ps1                 -> respaldo final, borra contenedores, BD (volúmenes), imágenes, firewall, hosts y certificado.
#                                              Conserva la carpeta data\ (fotos y respaldos).
#   .\scripts\uninstall.ps1 -DeleteData     -> además borra data\ (el respaldo final queda en el Escritorio).
param(
    [switch]$DeleteData,
    [string]$BackupDir = (Join-Path ([Environment]::GetFolderPath("Desktop")) "TCE-respaldo-final")
)
$ErrorActionPreference = "Continue"
Set-Location (Split-Path $PSScriptRoot -Parent)

$id = [Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
if (-not $id.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "Ejecuta PowerShell como Administrador." -ForegroundColor Red; exit 1
}
docker info *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker no está corriendo: abre Docker Desktop y repite (hace falta para el respaldo final)." -ForegroundColor Red; exit 1
}

# 1) Respaldo final (si falla, NO se borra nada)
$stamp = Get-Date -Format "yyyyMMdd-HHmm"
$tmp = Join-Path $env:TEMP "tce-final-$stamp"
New-Item -ItemType Directory -Force $tmp, $BackupDir | Out-Null

docker compose up -d mysql 2>$null | Out-Null
$ok = $false
for ($i = 0; $i -lt 30; $i++) {
    if ((docker inspect -f '{{.State.Health.Status}}' tce-mysql 2>$null) -eq "healthy") { $ok = $true; break }
    Start-Sleep 2
}
if ($ok) {
    docker compose exec -T mysql sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction --routines "$MYSQL_DATABASE" > /tmp/final.sql'
    docker compose cp mysql:/tmp/final.sql "$tmp\db.sql"
}
if (-not $ok -or -not (Test-Path "$tmp\db.sql") -or (Get-Item "$tmp\db.sql").Length -lt 100) {
    Write-Host "No se pudo respaldar la base de datos. No se borró nada." -ForegroundColor Red
    Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue; exit 1
}
if (Test-Path data\uploads) { Copy-Item data\uploads "$tmp\uploads" -Recurse }
Copy-Item .env "$tmp\env.txt" -ErrorAction SilentlyContinue
$zip = Join-Path $BackupDir "respaldo-final-$stamp.zip"
Compress-Archive "$tmp\*" $zip -Force
Remove-Item $tmp -Recurse -Force
if (-not (Test-Path $zip) -or (Get-Item $zip).Length -lt 100) {
    Write-Host "No se pudo crear el zip de respaldo. No se borró nada." -ForegroundColor Red; exit 1
}
Write-Host "Respaldo final guardado en: $zip" -ForegroundColor Green

# 2) Confirmación
Write-Host "`nSe va a DESINSTALAR TCE: contenedores, base de datos de Docker e imágenes." -ForegroundColor Yellow
if ($DeleteData) { Write-Host "También se borrará la carpeta data\ (fotos y respaldos diarios)." -ForegroundColor Yellow }
else { Write-Host "La carpeta data\ se conserva." }
if ((Read-Host "Escribe DESINSTALAR para continuar") -ne "DESINSTALAR") { Write-Host "Cancelado (el respaldo ya quedó guardado)."; exit 0 }

# 3) Quitar contenedores, volúmenes (BD y certificados) e imágenes
docker compose down -v --rmi all --remove-orphans

# 4) Firewall, hosts y certificado
Get-NetFirewallRule -DisplayName "TCE Web" -ErrorAction SilentlyContinue | Remove-NetFirewallRule
$hosts = "$env:SystemRoot\System32\drivers\etc\hosts"
(Get-Content $hosts) | Where-Object { $_ -notmatch '^\s*127\.0\.0\.1\s+tce\s*$' } | Set-Content $hosts
Get-ChildItem Cert:\LocalMachine\Root | Where-Object { $_.Subject -like "*Caddy Local Authority*" } | Remove-Item -ErrorAction SilentlyContinue

# 5) Datos
if ($DeleteData -and (Test-Path data)) { Remove-Item data -Recurse -Force }

Write-Host "`nTCE desinstalado." -ForegroundColor Cyan
Write-Host "Para terminar, borra a mano esta carpeta: $PWD"
Write-Host "Para reinstalar con los datos: instala de nuevo y restaura el db.sql del respaldo (ver DEPLOY.md)."
