param(
  [string]$SecretPath = 'C:\Development\DeokbunAI-engine-secrets\kasi-service-key.txt',
  [string]$OutputDirectory = 'C:\Development\DeokbunAI-engine-acquisition',
  [int]$StartYear = 1900,
  [int]$EndYear = 2050
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

function Convert-ToInteger {
  param([object]$Value, [string]$Field, [string]$Context)

  $parsed = 0
  if (-not [int]::TryParse([string]$Value, [ref]$parsed)) {
    throw "Invalid integer field '$Field' at $Context."
  }
  return $parsed
}

if (-not (Test-Path -LiteralPath $SecretPath -PathType Leaf)) {
  throw 'KASI secret file is unavailable.'
}
if ($StartYear -gt $EndYear) {
  throw 'StartYear must not be greater than EndYear.'
}

$serviceKey = [IO.File]::ReadAllText($SecretPath).Trim()
if ([string]::IsNullOrWhiteSpace($serviceKey)) {
  throw 'KASI secret file is empty.'
}

$rows = [Collections.Generic.List[object]]::new()
$seenGregorianDates = [Collections.Generic.HashSet[string]]::new()

try {
  for ($year = $StartYear; $year -le $EndYear; $year += 1) {
    for ($month = 1; $month -le 12; $month += 1) {
      $context = '{0:D4}-{1:D2}' -f $year, $month
      try {
        $response = Invoke-KasiXmlRequest `
          -Uri $endpoint `
          -Encoding $strictUtf8 `
          -Parameters @{
            ServiceKey = $serviceKey
            solYear = '{0:D4}' -f $year
            solMonth = '{0:D2}' -f $month
            numOfRows = '40'
            pageNo = '1'
          }
      } catch {
        throw "KASI request failed at $context. Request details are suppressed."
      }

      if ([string]$response.response.header.resultCode -ne '00') {
        throw "KASI returned a non-success result at $context."
      }

      $items = @($response.response.body.items.item)
      $declaredCount = Convert-ToInteger $response.response.body.totalCount 'totalCount' $context
      if ($declaredCount -ne $items.Count) {
        throw "KASI pagination/count mismatch at $context."
      }

      foreach ($item in $items) {
        $solarYear = Convert-ToInteger $item.solYear 'solYear' $context
        $solarMonth = Convert-ToInteger $item.solMonth 'solMonth' $context
        $solarDay = Convert-ToInteger $item.solDay 'solDay' $context
        $lunarYear = Convert-ToInteger $item.lunYear 'lunYear' $context
        $lunarMonth = Convert-ToInteger $item.lunMonth 'lunMonth' $context
        $lunarDay = Convert-ToInteger $item.lunDay 'lunDay' $context
        $lunarMonthLength = Convert-ToInteger $item.lunNday 'lunNday' $context
        $monthKindMarker = [string]$item.lunLeapmonth
        if ($monthKindMarker -eq [string][char]0xD3C9) {
          $monthKind = 'REGULAR'
        } elseif ($monthKindMarker -eq [string][char]0xC724) {
          $monthKind = 'LEAP'
        } else {
          throw "Unknown lunar month kind at $context."
        }

        if ($solarYear -ne $year -or $solarMonth -ne $month) {
          throw "KASI returned an unexpected Gregorian month at $context."
        }
        if ($lunarMonthLength -ne 29 -and $lunarMonthLength -ne 30) {
          throw "KASI returned an invalid lunar month length at $context."
        }

        $gregorianKey = '{0:D4}-{1:D2}-{2:D2}' -f $solarYear, $solarMonth, $solarDay
        if (-not $seenGregorianDates.Add($gregorianKey)) {
          throw "KASI returned a duplicate Gregorian date at $context."
        }

        $rows.Add([ordered]@{
          gregorianDate = [ordered]@{
            year = $solarYear
            month = $solarMonth
            day = $solarDay
          }
          lunarDate = [ordered]@{
            year = $lunarYear
            month = $lunarMonth
            day = $lunarDay
            lunarMonthKind = $monthKind
          }
          lunarMonthLengthDays = $lunarMonthLength
        })
      }
    }
    Write-Output "ACQUIRED_YEAR=$year"
  }
} finally {
  Remove-Variable serviceKey -ErrorAction SilentlyContinue
}

$artifact = [ordered]@{
  acquisitionSchemaVersion = 'deokbunai.kasi-calendar-acquisition.v1'
  source = [ordered]@{
    identity = 'KASI_LRSR_CLD_INFO_SERVICE'
    officialGuideRevision = 'v1.1'
    publicDataPortalRevisionDate = '2022-10-29'
    operation = 'getLunCalInfo'
  }
  acquiredAtUtc = [DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ')
  requestedGregorianRange = [ordered]@{
    start = [ordered]@{ year = $StartYear; month = 1; day = 1 }
    end = [ordered]@{ year = $EndYear; month = 12; day = 31 }
  }
  rowCount = $rows.Count
  rows = $rows
}

New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
$outputPath = Join-Path $OutputDirectory 'kasi-calendar-daily.json'
$json = $artifact | ConvertTo-Json -Depth 8
[IO.File]::WriteAllText($outputPath, $json, [Text.UTF8Encoding]::new($false))

Write-Output "ACQUISITION_COMPLETE=True"
Write-Output "ACQUISITION_ROW_COUNT=$($rows.Count)"
Write-Output "ACQUISITION_OUTPUT=$outputPath"
