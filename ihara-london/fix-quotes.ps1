$content = Get-Content -Path "admin-dashboard.html" -Raw
$content = $content -replace """, '"'
$content = $content -replace """, '"'
$content = $content -replace "'", "'"
$content = $content -replace "'", "'"
Set-Content -Path "admin-dashboard.html" -Value $content
Write-Host "✅ Comillas corregidas en admin-dashboard.html"