# Configura OTRO equipo de la red para entrar a https://tce
# Ejecutar en PowerShell COMO ADMINISTRADOR en ese equipo, con tce-ca.crt en la misma carpeta que este script:
#   .\client-setup.ps1 -ServerIp 192.168.1.50
param(
    [Parameter(Mandatory = $true)][string]$ServerIp
)

$id = [Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
if (-not $id.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "Ejecuta PowerShell como Administrador." -ForegroundColor Red; exit 1
}

# 1) tce -> IP del servidor
$hosts = "$env:SystemRoot\System32\drivers\etc\hosts"
$lines = Get-Content $hosts | Where-Object { $_ -notmatch '^\s*[\d\.]+\s+tce\s*$' }
$lines + "$ServerIp tce" | Set-Content $hosts -Encoding ASCII
Write-Host "tce -> $ServerIp (archivo hosts)" -ForegroundColor Green

# 2) Certificado de la CA del servidor
$ca = Join-Path $PSScriptRoot "tce-ca.crt"
if (Test-Path $ca) {
    certutil -addstore -f Root $ca | Out-Null
    Write-Host "Certificado instalado." -ForegroundColor Green
} else {
    Write-Host "No encontré tce-ca.crt junto al script; copia el archivo (está en data\ del servidor)." -ForegroundColor Yellow
}

Write-Host "`nListo. Abre https://tce" -ForegroundColor Cyan
