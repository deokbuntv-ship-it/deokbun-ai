param(
  [ValidateSet('PROBE', 'ACQUIRE')]
  [string]$Mode = 'PROBE',
  [string]$SecretPath = 'C:\Development\DeokbunAI-engine-secrets\kasi-service-key.txt',
  [string]$OutputDirectory = 'C:\Development\DeokbunAI-engine-acquisition',
  [int[]]$ProbeYears = @(1969, 1991, 1994, 2023, 2024, 2051),
  [int]$StartYear = 1969,
  [int]$EndYear = 2051
)

$ErrorActionPreference = 'Stop'
$endpoint = 'https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/get24DivisionsInfo'
$strictUtf8 = [Text.UTF8Encoding]::new($false, $true)
$requiredFields = @('dateName', 'locdate', 'kst')

function Invoke-KasiXmlRequest {
  param(
    [string]$Uri,
    [hashtable]$Parameters,
    [Text.Encoding]$Encoding
  )

  $serviceKey = [string]$Parameters.ServiceKey
  $decodedServiceKey = [Uri]::UnescapeDataString($serviceKey)
  $isPercentEncoded = $decodedServiceKey -cne $serviceKey
  if ($isPercentEncoded -and $serviceKey -match '%(?![0-9A-Fa-f]{2})') {
    throw 'KASI ServiceKey contains an invalid percent-encoding sequence.'
  }
  $queryParts = [Collections.Generic.List[string]]::new()
  foreach ($name in @($Parameters.Keys | Sort-Object)) {
    $value = [string]$Parameters[$name]
    $encodedValue = if ($name -eq 'ServiceKey' -and $isPercentEncoded) {
      $value
    } else {
      [Uri]::EscapeDataString($value)
    }
    $queryParts.Add("$([Uri]::EscapeDataString([string]$name))=$encodedValue")
  }
  $requestUri = $Uri + '?' + ($queryParts -join '&')

  try {
    $httpResponse = Invoke-WebRequest `
      -UseBasicParsing `
      -Method Get `
      -Uri $requestUri
  } finally {
    Remove-Variable serviceKey,decodedServiceKey,requestUri -ErrorAction SilentlyContinue
  }

  $stream = $httpResponse.RawContentStream
  $stream.Position = 0
  $buffer = [IO.MemoryStream]::new()
  try {
    $stream.CopyTo($buffer)
    return [pscustomobject]@{
      HttpStatus = [int]$httpResponse.StatusCode
      ContentType = [string]$httpResponse.Headers['Content-Type']
      BodyFormat = 'XML'
      Xml = [xml]$Encoding.GetString($buffer.ToArray())
    }
  } finally {
    $buffer.Dispose()
  }
}

function Get-ServiceKey {
  if (-not [string]::IsNullOrWhiteSpace($env:DEOKBUNAI_KASI_SERVICE_KEY)) {
    return $env:DEOKBUNAI_KASI_SERVICE_KEY.Trim()
  }
  if (Test-Path -LiteralPath $SecretPath -PathType Leaf) {
    $value = [IO.File]::ReadAllText($SecretPath).Trim()
    if (-not [string]::IsNullOrWhiteSpace($value)) {
      return $value
    }
  }
  throw 'USER_ACTION_REQUIRED: KASI ServiceKey is unavailable to this process.'
}

function Convert-ToInteger {
  param([object]$Value, [string]$Field, [string]$Context)

  $parsed = 0
  if (-not [int]::TryParse(([string]$Value).Trim(), [ref]$parsed)) {
    throw "Invalid integer field '$Field' at $Context."
  }
  return $parsed
}

function Convert-ItemFields {
  param([object]$Item)

  $fields = [ordered]@{}
  foreach ($child in $Item.ChildNodes) {
    if ($child.NodeType -ne [Xml.XmlNodeType]::Element) {
      continue
    }
    $fields[$child.LocalName] = ([string]$child.InnerText).Trim()
  }
  return $fields
}

if ($StartYear -gt $EndYear) {
  throw 'StartYear must not be greater than EndYear.'
}

$serviceKey = Get-ServiceKey
$years = if ($Mode -eq 'ACQUIRE') {
  @($StartYear..$EndYear)
} else {
  @($ProbeYears | Sort-Object -Unique)
}
$yearResults = [Collections.Generic.List[object]]::new()
$allSchemaFields = [Collections.Generic.HashSet[string]]::new()

try {
  foreach ($year in $years) {
    $context = [string]$year
    try {
      $httpResult = Invoke-KasiXmlRequest `
        -Uri $endpoint `
        -Encoding $strictUtf8 `
        -Parameters @{
          ServiceKey = $serviceKey
          solYear = '{0:D4}' -f $year
          numOfRows = '40'
          pageNo = '1'
        }
    } catch {
      throw "KASI request failed for year $context. Request details are suppressed."
    }

    $response = $httpResult.Xml

    $resultCode = ([string]$response.response.header.resultCode).Trim()
    $itemNodes = $response.response.body.items.item
    $items = if ($null -eq $itemNodes) { @() } else { @($itemNodes) }
    $declaredCount = Convert-ToInteger $response.response.body.totalCount 'totalCount' $context
    if ($declaredCount -ne $items.Count) {
      throw "KASI pagination/count mismatch for year $context (declared=$declaredCount, parsed=$($items.Count))."
    }

    $records = [Collections.Generic.List[object]]::new()
    foreach ($item in $items) {
      $fields = Convert-ItemFields $item
      foreach ($fieldName in $fields.Keys) {
        [void]$allSchemaFields.Add($fieldName)
      }
      $records.Add([ordered]@{ fields = $fields })
    }

    $schemaFields = @($records | ForEach-Object { $_.fields.Keys } | Sort-Object -Unique)
    $missingRequiredFields = @($requiredFields | Where-Object { $_ -notin $schemaFields })
    $yearResult = [ordered]@{
      requestedYear = $year
      httpStatus = $httpResult.HttpStatus
      responseFormat = $httpResult.BodyFormat
      contentType = $httpResult.ContentType
      resultCode = $resultCode
      declaredCount = $declaredCount
      schemaFields = $schemaFields
      missingRequiredFields = $missingRequiredFields
      records = $records
    }
    $yearResults.Add($yearResult)

    if ($Mode -eq 'ACQUIRE') {
      if ($resultCode -ne '00') {
        throw "KASI returned a non-success result for year $context."
      }
      if ($declaredCount -ne 24) {
        throw "KASI did not return exactly 24 solar terms for year $context."
      }
      if ($missingRequiredFields.Count -ne 0) {
        throw "KASI response is missing required fields for year $context."
      }
    }

    Write-Output "KASI_YEAR=$year RESULT_CODE=$resultCode RECORD_COUNT=$declaredCount"
  }
} finally {
  Remove-Variable serviceKey -ErrorAction SilentlyContinue
}

$canonicalResults = @($yearResults | Sort-Object requestedYear)
$hashPayload = $canonicalResults | ConvertTo-Json -Depth 10 -Compress
$hashBytes = [Text.Encoding]::UTF8.GetBytes($hashPayload)
$sha256 = [Security.Cryptography.SHA256]::Create()
try {
  $rawHash = ([BitConverter]::ToString($sha256.ComputeHash($hashBytes)) -replace '-', '').ToLowerInvariant()
} finally {
  $sha256.Dispose()
}

$acquisition = [ordered]@{
  acquisitionSchemaVersion = 'deokbunai.kasi-solar-term-acquisition.v1'
  source = [ordered]@{
    provider = 'KASI'
    operation = 'get24DivisionsInfo'
    endpoint = $endpoint
    apiGuideVersion = 'OPENAPI_GUIDE_V1.4'
    publicDataPortalRevisionDate = '2023-03-29'
  }
  mode = $Mode
  acquiredAtUtc = [DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ')
  requestedYears = $years
  observedSchemaFields = @($allSchemaFields | Sort-Object)
  sourceRawHash = [ordered]@{ algorithm = 'SHA-256'; value = $rawHash }
  results = $canonicalResults
}

New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
$fileName = if ($Mode -eq 'ACQUIRE') {
  'kasi-solar-terms-1969-2051.json'
} else {
  'kasi-solar-term-probe.json'
}
$outputPath = Join-Path $OutputDirectory $fileName
$json = $acquisition | ConvertTo-Json -Depth 12
[IO.File]::WriteAllText($outputPath, $json, [Text.UTF8Encoding]::new($false))

Write-Output "KASI_MODE=$Mode"
Write-Output "KASI_SCHEMA_FIELDS=$((@($allSchemaFields | Sort-Object)) -join ',')"
Write-Output "KASI_SOURCE_RAW_SHA256=$rawHash"
Write-Output "KASI_OUTPUT=$outputPath"
