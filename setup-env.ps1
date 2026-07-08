$ErrorActionPreference = "Stop"

function Ask($label, $optional = $false) {
  while ($true) {
    $value = Read-Host $label
    if ($optional -or -not [string]::IsNullOrWhiteSpace($value)) {
      return $value.Trim()
    }
    Write-Host "필수 값입니다. 다시 입력하세요." -ForegroundColor Yellow
  }
}

$envPath = Join-Path $PSScriptRoot ".env.local"

Write-Host ""
Write-Host "픽가이드 환경변수 설정" -ForegroundColor Cyan
Write-Host "키는 이 창에만 입력되고, .env.local에 저장됩니다."
Write-Host "Supabase 계정이 없으면 Supabase 항목은 비워도 됩니다. 쿠팡 상품은 로컬 JSON에 저장됩니다."
Write-Host ""

$supabaseUrl = Ask "Supabase Project URL (선택, 비워도 됨)" $true
$supabaseAnon = Ask "Supabase anon public key (선택, 비워도 됨)" $true
$supabaseService = Ask "Supabase service_role key (선택, 비워도 됨)" $true
$coupangAccess = Ask "Coupang Access Key"
$coupangSecret = Ask "Coupang Secret Key"
$coupangSubId = Ask "Coupang Sub ID (선택, 비워도 됨)" $true

$content = @"
NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl
NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabaseAnon
SUPABASE_SERVICE_ROLE_KEY=$supabaseService
COUPANG_ACCESS_KEY=$coupangAccess
COUPANG_SECRET_KEY=$coupangSecret
COUPANG_SUB_ID=$coupangSubId
"@

Set-Content -LiteralPath $envPath -Value $content -Encoding UTF8
Write-Host ""
Write-Host ".env.local 저장 완료" -ForegroundColor Green
Write-Host "다음 단계: import-coupang.cmd 실행"
Read-Host "Enter를 누르면 닫힙니다"
