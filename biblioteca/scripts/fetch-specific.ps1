$ErrorActionPreference = 'Stop'
$Headers = @{ 'User-Agent' = 'Mozilla/5.0' }
$OutDir = (Join-Path $PSScriptRoot '..\libros')

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

$booksToFetch = @(
  @{ id = 58221; title = 'La Odisea'; author = 'Homero'; slug = 'odisea-es' },
  @{ id = 56454; title = 'Hamlet'; author = 'William Shakespeare'; slug = 'hamlet-es' }
)

foreach ($b in $booksToFetch) {
  $path = Join-Path $OutDir "$($b.slug).txt"
  if (Test-Path $path) { Write-Host "Skipping $($b.slug)"; continue }
  Write-Host "Fetching $($b.title)..."
  $raw = Get-GutenbergText $b.id
  if ($raw) {
    $clean = Clean-Gutenberg $raw
    [System.IO.File]::WriteAllText($path, $clean, [System.Text.UTF8Encoding]::new($false))
    Write-Host "  OK $($b.slug).txt"
  } else {
    Write-Host "  FAILED to fetch $($b.id)"
  }
}
