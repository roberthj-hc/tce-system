# Respaldo manual completo (BD + imágenes) en un solo .zip. Desde cualquier carpeta:  .\scripts\backup.ps1
# (Los volcados diarios automáticos ya se guardan solos en data\backups)
Set-Location (Split-Path $PSScriptRoot -Parent)
$stamp = Get-Date -Format "yyyyMMdd-HHmm"
$tmp = "data\backups\manual-$stamp"
New-Item -ItemType Directory -Force $tmp | Out-Null
# El volcado se hace dentro del contenedor y se copia con docker cp (evita problemas de codificación de PowerShell)
docker compose exec -T mysql sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction --routines "$MYSQL_DATABASE" > /tmp/manual.sql'
docker compose cp mysql:/tmp/manual.sql "$tmp\db.sql"
if (-not (Test-Path "$tmp\db.sql") -or (Get-Item "$tmp\db.sql").Length -lt 100) {
    Write-Host "El volcado de la BD falló; no se creó el respaldo." -ForegroundColor Red; exit 1
}
if (Test-Path data\uploads) { Copy-Item data\uploads "$tmp\uploads" -Recurse }
Compress-Archive "$tmp\*" "data\backups\respaldo-$stamp.zip"
Remove-Item $tmp -Recurse -Force
Write-Host "Respaldo: $PWD\data\backups\respaldo-$stamp.zip  (cópialo a un disco externo)"
