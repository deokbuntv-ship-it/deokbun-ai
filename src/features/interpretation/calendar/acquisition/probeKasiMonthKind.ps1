param(
  [string]$SecretPath = 'C:\Development\DeokbunAI-engine-secrets\kasi-service-key.txt'
)

$ErrorActionPreference = 'Stop'
$endpoint = 'http://apis.data.go.kr/B090041/openapi/service/LrsrCldInfoService/getLunCalInfo'
$strictUtf8 = [Text.UTF8Encoding]::new($false, $true)

function Invoke-KasiXmlRequest {
  param(
    [string]$Uri,
    [hashtable]$Parameters,
    [Text.Encoding]$Encoding
  )

  $httpResponse = Invoke-WebRequest `
    -UseBasicParsing `
    -Method Get `
    -Uri $Uri `
    -Body $Parameters

  $stream = $httpResponse.RawContentStream
  $stream.Position = 0
  $buffer = [IO.MemoryStream]::new()
  try {
    $stream.CopyTo($buffer)
    $xmlText = $Encoding.GetString($buffer.ToArray())
    return [xml]$xmlText
  } finally {
    $buffer.Dispose()
  }
}

if (-not (Test-Path -LiteralPath $SecretPath -PathType Leaf)) {
  throw 'KASI secret file is unavailable.'
}

$serviceKey = [IO.File]::ReadAllText($SecretPath).Trim()
if ([string]::IsNullOrWhiteSpace($serviceKey)) {
  throw 'KASI secret file is empty.'
}

try {
  foreach ($probe in @(
    @{ Year = 1900; Month = 1; Label = 'REGULAR_BASELINE' },
    @{ Year = 2023; Month = 3; Label = 'KNOWN_LEAP_WINDOW' }
  )) {
    $context = '{0:D4}-{1:D2}' -f $probe.Year, $probe.Month
    try {
      $response = Invoke-KasiXmlRequest `
        -Uri $endpoint `
        -Encoding $strictUtf8 `
        -Parameters @{
          ServiceKey = $serviceKey
          solYear = '{0:D4}' -f $probe.Year
          solMonth = '{0:D2}' -f $probe.Month
          numOfRows = '40'
          pageNo = '1'
        }
    } catch {
      throw "KASI probe request failed at $context. Request details are suppressed."
    }

    if ([string]$response.response.header.resultCode -ne '00') {
      throw "KASI returned a non-success result at $context."
    }

    $items = @($response.response.body.items.item)
    Write-Output "PROBE_LABEL=$($probe.Label)"
    Write-Output "PROBE_MONTH=$context"
    Write-Output "PROBE_ITEM_COUNT=$($items.Count)"

    $groups = $items | Group-Object { [string]$_.lunLeapmonth }
    foreach ($group in $groups) {
      $value = [string]$group.Name
      $codePoints = @($value.ToCharArray() | ForEach-Object { 'U+{0:X4}' -f [int]$_ }) -join ','
      $sample = $group.Group[0]
      Write-Output "MONTH_KIND_VALUE=$value"
      Write-Output "MONTH_KIND_TYPE=$($sample.lunLeapmonth.GetType().FullName)"
      Write-Output "MONTH_KIND_CODEPOINTS=$codePoints"
      Write-Output "MONTH_KIND_COUNT=$($group.Count)"
      Write-Output "MONTH_KIND_SAFE_SAMPLE=$($sample.solYear)-$($sample.solMonth)-$($sample.solDay)|$($sample.lunYear)-$($sample.lunMonth)-$($sample.lunDay)"
    }
  }
} finally {
  Remove-Variable serviceKey -ErrorAction SilentlyContinue
}
