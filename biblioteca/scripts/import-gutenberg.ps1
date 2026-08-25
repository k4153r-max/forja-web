<#
.SYNOPSIS
  Importa ebooks en español de Project Gutenberg al catálogo de textos de Hojear.

.DESCRIPTION
  - Descarga el catálogo CSV de Gutenberg (o usa cache local).
  - Filtra Language=es, Type=Text.
  - Opcionalmente filtra por género (palabras en Title/Subjects/Bookshelves).
  - Descarga TXT, limpia preámbulo legal y valida que sea español.
  - Guarda en biblioteca/libros/{slug}.txt
  - Emite un fragmento JSON/JS de metadatos para pegar en app.js.

.EXAMPLE
  .\import-gutenberg.ps1 -Genre Poesia -Limit 10
  .\import-gutenberg.ps1 -Ids 14765,15066 -Force
  .\import-gutenberg.ps1 -Genre Educativo -Limit 8 -DryRun
#>
[CmdletBinding()]
param(
  [ValidateSet('Todos','Novela','Cuentos','Poesia','Teatro','Ensayo','Historia','Educativo','Ciencia','Viajes','Infantil','Chile')]
  [string]$Genre = 'Todos',
  [int]$Limit = 15,
  [int[]]$Ids = @(),
  [string]$OutDir = (Join-Path $PSScriptRoot '..\libros'),
  [string]$CatalogCache = (Join-Path $env:TEMP 'pg_catalog.csv'),
  [switch]$Force,
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$UserAgent = 'HojearImport/1.0 (+https://etemen.cl; hola@etemen.cl; educational library)'
$Headers = @{ 'User-Agent' = $UserAgent }

$GenrePatterns = @{
  Novela     = 'novela|novel|ficción|ficcion'
  Cuentos    = 'cuento|relato|leyenda|tradicion|tradición|short story'
  Poesia     = 'poes|rimas|romanc|verso|poetry|parnaso|fábula|fabula'
  Teatro     = 'teatro|comedia|drama|entremes|entremés|acto'
  Ensayo     = 'ensayo|filosof|pensamiento|meditacion|meditación|tratado|lógica|logica'
  Historia   = 'historia|crónica|cronica|biograf|conquista|independencia|revoluci'
  Educativo  = 'gramática|gramatica|lecciones|manual|elementos|curso|educaci|geograf|aritmética|aritmetica'
  Ciencia    = 'ciencia|física|fisica|química|quimica|botánica|botanica|zoología|zoologia|médica|medica|astronom'
  Viajes     = 'viaje|viajes|naufrag|diario de|expedici|derrotero'
  Infantil   = 'niños|ninos|infantil|fábulas|fabulas|edad de oro|cuento popular'
  Chile      = 'chile|chilen|lillo|blest|santiago|valparaíso|valparaiso'
}

function Get-Slug([string]$title) {
  $s = $title.ToLowerInvariant()
  $s = $s -replace '[áàäâ]', 'a' -replace '[éèëê]', 'e' -replace '[íìïî]', 'i'
  $s = $s -replace '[óòöô]', 'o' -replace '[úùüû]', 'u' -replace 'ñ', 'n'
  $s = $s -replace '[^a-z0-9]+', '-'
  $s = $s.Trim('-')
  if ($s.Length -gt 48) { $s = $s.Substring(0, 48).TrimEnd('-') }
  return $s
}

function Get-Catalog {
  if ($Ids.Count -gt 0) { return @() }
  if (-not (Test-Path $CatalogCache) -or ((Get-Item $CatalogCache).LastWriteTime -lt (Get-Date).AddDays(-7))) {
    Write-Host "Descargando catalogo Gutenberg..."
    Invoke-WebRequest -Uri "https://www.gutenberg.org/cache/epub/feeds/pg_catalog.csv" -OutFile $CatalogCache -Headers $Headers -TimeoutSec 180
  }
  return Import-Csv $CatalogCache
}

function Get-GutenbergText([int]$id) {
  $candidates = @(
    "https://www.gutenberg.org/files/$id/$id-0.txt",
    "https://www.gutenberg.org/cache/epub/$id/pg$id.txt",
    "https://www.gutenberg.org/files/$id/$id-8.txt",
    "https://www.gutenberg.org/ebooks/$id.txt.utf-8"
  )
  foreach ($u in $candidates) {
    try {
      $r = Invoke-WebRequest -Uri $u -Headers $Headers -UseBasicParsing -TimeoutSec 90
      if ($r.StatusCode -eq 200 -and $r.Content.Length -gt 3000) { return $r.Content }
    } catch {}
  }
  return $null
}

function Clean-Gutenberg([string]$text) {
  $start = [regex]::Match($text, '(?m)^\*\*\* START OF (THIS|THE) PROJECT GUTENBERG EBOOK.*$')
  if ($start.Success) { $text = $text.Substring($start.Index + $start.Length) }
  $end = [regex]::Match($text, '(?m)^\*\*\* END OF (THIS|THE) PROJECT GUTENBERG EBOOK.*$')
  if ($end.Success) { $text = $text.Substring(0, $end.Index) }
  return ($text -replace "`r`n", "`n").Trim()
}

function Test-Spanish([string]$text) {
  $sample = if ($text.Length -gt 8000) { $text.Substring(0, 8000) } else { $text }
  $es = ([regex]::Matches($sample, '\b(que|los|las|del|una|para|con|por|como|esta|este)\b', 'IgnoreCase')).Count
  $en = ([regex]::Matches($sample, '\b(the|and|with|this|that|from|which|were|have)\b', 'IgnoreCase')).Count
  return ($es -gt $en -and $es -ge 12)
}

if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir | Out-Null }

$rows = Get-Catalog
$es = $rows | Where-Object { $_.Language -eq 'es' -and $_.Type -eq 'Text' }

if ($Ids.Count -gt 0) {
  $picked = $es | Where-Object { $Ids -contains [int]($_.'Text#') }
} else {
  $picked = $es
  if ($Genre -ne 'Todos' -and $GenrePatterns.ContainsKey($Genre)) {
    $pat = $GenrePatterns[$Genre]
    $picked = $picked | Where-Object {
      ($_.Title + ' ' + $_.Subjects + ' ' + $_.Bookshelves + ' ' + $_.Authors) -match $pat
    }
  }
  $picked = $picked | Select-Object -First $Limit
}

Write-Host "Candidatos: $($picked.Count) (género=$Genre)"
$manifest = @()

foreach ($row in $picked) {
  $id = [int]$row.'Text#'
  $title = $row.Title
  $author = ($row.Authors -split ';')[0] -replace '\s*,.*$', ''
  $slug = Get-Slug $title
  $path = Join-Path $OutDir "$slug.txt"

  Write-Host "→ [$id] $title"
  if ((Test-Path $path) -and -not $Force) {
    Write-Host "  (ya existe, usa -Force para sobrescribir)"
    $manifest += [pscustomobject]@{ id = $slug; gutenberg = $id; title = $title; author = $author; path = $path; status = 'exists' }
    continue
  }
  if ($DryRun) {
    $manifest += [pscustomobject]@{ id = $slug; gutenberg = $id; title = $title; author = $author; status = 'dry-run' }
    continue
  }

  $raw = Get-GutenbergText $id
  if (-not $raw) {
    Write-Host "  ERROR descarga"
    $manifest += [pscustomobject]@{ id = $slug; gutenberg = $id; title = $title; status = 'download-fail' }
    continue
  }
  $clean = Clean-Gutenberg $raw
  if (-not (Test-Spanish $clean)) {
    Write-Host "  ERROR no parece español"
    $manifest += [pscustomobject]@{ id = $slug; gutenberg = $id; title = $title; status = 'not-spanish' }
    continue
  }
  if ($clean.Length -lt 4000) {
    Write-Host "  ERROR texto corto"
    $manifest += [pscustomobject]@{ id = $slug; gutenberg = $id; title = $title; status = 'too-short' }
    continue
  }

  [System.IO.File]::WriteAllText($path, $clean, [System.Text.UTF8Encoding]::new($false))
  $kb = [math]::Round((Get-Item $path).Length / 1KB)
  Write-Host "  OK ${kb}KB → $slug.txt"
  $manifest += [pscustomobject]@{
    id = $slug; gutenberg = $id; title = $title; author = $author
    path = $path; kb = $kb; status = 'ok'; license = 'Dominio público'; source = "Project Gutenberg #$id"
  }
  Start-Sleep -Milliseconds 400
}

$manifestPath = Join-Path $OutDir '_import-manifest.json'
$manifest | ConvertTo-Json -Depth 4 | Set-Content $manifestPath -Encoding UTF8
Write-Host "`nManifiesto: $manifestPath"
Write-Host "OK: $(($manifest | Where-Object status -eq 'ok').Count) | Existentes: $(($manifest | Where-Object status -eq 'exists').Count) | Fallos: $(($manifest | Where-Object status -notin 'ok','exists','dry-run').Count)"

# Fragmento JS de ayuda
Write-Host "`n--- Pegable en app.js (revisar metadatos) ---"
foreach ($m in ($manifest | Where-Object { $_.status -in 'ok','exists' })) {
  $genre = if ($Genre -eq 'Todos') { 'Clásico' } else { $Genre }
  Write-Host "  { id: '$($m.id)', title: '$($m.title -replace "'","\'")', author: '$($m.author -replace "'","\'")', type: '$genre', genre: '$genre', place: 'Universal', color: 'navy', year: 'DP', hasText: true, license: 'Dominio público', source: 'Project Gutenberg #$($m.gutenberg)', desc: 'Texto en dominio público importado para lectura en Hojear.' },"
}

