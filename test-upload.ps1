# Test script for upload functionality
Write-Host "Testing login and upload functionality..."

# Test login first
$loginBody = @{
    username = 'agung'
    password = 'agung2711'
} | ConvertTo-Json

try {
    Write-Host "Logging in..."
    $loginResponse = Invoke-WebRequest -Uri 'http://localhost:3000/api/users/login' -Method POST -Headers @{
        'Content-Type' = 'application/json'
    } -Body $loginBody -UseBasicParsing

    $loginData = $loginResponse.Content | ConvertFrom-Json
    Write-Host "Login successful. Token:" $loginData.data.token

    # Now test posting with the token
    $token = $loginData.data.token

    # Create multipart form data for posting
    $boundary = '----FormBoundary7MA4YWxkTrZu0gW'

    # Create the multipart body
    $bodyParts = @(
        "--$boundary",
        'Content-Disposition: form-data; name="title"',
        '',
        'Test Posting with Images',
        "--$boundary",
        'Content-Disposition: form-data; name="description"',
        '',
        'Testing upload functionality',
        "--$boundary",
        'Content-Disposition: form-data; name="date"',
        '',
        '2025-11-27'
    )

    $body = $bodyParts -join "`r`n"
    $body += "`r`n--$boundary--`r`n"

    Write-Host "Uploading posting..."
    $uploadResponse = Invoke-WebRequest -Uri 'http://localhost:3000/api/posting' -Method POST -Headers @{
        'x-api-token' = $token
        'Content-Type' = "multipart/form-data; boundary=$boundary"
    } -Body $body -UseBasicParsing

    Write-Host "Upload Response:"
    Write-Host $uploadResponse.Content

} catch {
    Write-Host "Error:"
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Response Body:"
        Write-Host $reader.ReadToEnd()
    }
}
