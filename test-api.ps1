# API Testing Script
$baseUrl = "http://127.0.0.1:3000/api"
$testNum = Get-Random -Minimum 1000 -Maximum 9999
$testUsername = "user$testNum"
$testPassword = "password123"
$testName = "Test User"

Write-Host "=== API Testing ===" -ForegroundColor Cyan
Write-Host "Base URL: $baseUrl" -ForegroundColor Gray

# Test 1: Register User
Write-Host "`n1. Testing User Registration..." -ForegroundColor Yellow
$registerBody = @{
    username = $testUsername
    password = $testPassword
    name = $testName
} | ConvertTo-Json

try {
    $result = Invoke-WebRequest -Uri "$baseUrl/users" -Method Post -Headers @{'Content-Type'='application/json'} -Body $registerBody -TimeoutSec 10
    Write-Host "✅ Registration Success (Status: $($result.StatusCode))" -ForegroundColor Green
    Write-Host "Response: $($result.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Registration Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Login User
Write-Host "`n2. Testing User Login..." -ForegroundColor Yellow
$loginBody = @{
    username = $testUsername
    password = $testPassword
} | ConvertTo-Json

try {
    $result = Invoke-WebRequest -Uri "$baseUrl/users/login" -Method Post -Headers @{'Content-Type'='application/json'} -Body $loginBody -TimeoutSec 10
    $loginResponse = $result.Content | ConvertFrom-Json
    $token = $loginResponse.data.token
    Write-Host "✅ Login Success (Status: $($result.StatusCode))" -ForegroundColor Green
    Write-Host "Response: $($result.Content)" -ForegroundColor Gray
    Write-Host "Token: $token" -ForegroundColor Gray
} catch {
    Write-Host "❌ Login Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 3: Get Current User (Protected)
Write-Host "`n3. Testing Get Current User (Protected)..." -ForegroundColor Yellow
$headers = @{
    'Content-Type' = 'application/json'
    'X-API-TOKEN' = $token
}

try {
    $result = Invoke-WebRequest -Uri "$baseUrl/users/current" -Method Get -Headers $headers -TimeoutSec 10
    Write-Host "✅ Get Current User Success (Status: $($result.StatusCode))" -ForegroundColor Green
    Write-Host "Response: $($result.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Get Current User Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Create Posting
Write-Host "`n4. Testing Create Posting..." -ForegroundColor Yellow
$postingBody = @{
    title = "Test Posting"
    description = "This is a test posting"
    date = (Get-Date -Format "yyyy-MM-dd")
    pictures = @()
} | ConvertTo-Json

try {
    $result = Invoke-WebRequest -Uri "$baseUrl/posting" -Method Post -Headers $headers -Body $postingBody -TimeoutSec 10
    Write-Host "✅ Create Posting Success (Status: $($result.StatusCode))" -ForegroundColor Green
    $postingResponse = $result.Content | ConvertFrom-Json
    $postingId = $postingResponse.data.id
    Write-Host "Response: $($result.Content)" -ForegroundColor Gray
    Write-Host "Posting ID: $postingId" -ForegroundColor Gray
} catch {
    Write-Host "❌ Create Posting Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Update Posting
Write-Host "`n5. Testing Update Posting..." -ForegroundColor Yellow
$updatePostingBody = @{
    title = "Test Posting Updated"
    description = "This is an updated test posting"
    date = (Get-Date -Format "yyyy-MM-dd")
} | ConvertTo-Json

try {
    $result = Invoke-WebRequest -Uri "$baseUrl/posting/$postingId" -Method Patch -Headers $headers -Body $updatePostingBody -TimeoutSec 10
    Write-Host "✅ Update Posting Success (Status: $($result.StatusCode))" -ForegroundColor Green
    Write-Host "Response: $($result.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Update Posting Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Get Updated Posting
Write-Host "`n6. Testing Get Updated Posting..." -ForegroundColor Yellow
try {
    $result = Invoke-WebRequest -Uri "$baseUrl/posting/$postingId" -Method Get -TimeoutSec 10
    Write-Host "✅ Get Updated Posting Success (Status: $($result.StatusCode))" -ForegroundColor Green
    Write-Host "Response: $($result.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Get Updated Posting Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Get All Postings (to verify update)
Write-Host "`n7. Testing Get All Postings (After Update)..." -ForegroundColor Yellow
try {
    $result = Invoke-WebRequest -Uri "$baseUrl/posting" -Method Get -TimeoutSec 10
    Write-Host "✅ Get All Postings Success (Status: $($result.StatusCode))" -ForegroundColor Green
    Write-Host "Response: $($result.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Get All Postings Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 8: Delete Posting
Write-Host "`n8. Testing Delete Posting..." -ForegroundColor Yellow
try {
    $result = Invoke-WebRequest -Uri "$baseUrl/posting/$postingId" -Method Delete -Headers $headers -TimeoutSec 10
    Write-Host "✅ Delete Posting Success (Status: $($result.StatusCode))" -ForegroundColor Green
    Write-Host "Response: $($result.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Delete Posting Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 9: Update Blog
Write-Host "`n9. Testing Update Blog..." -ForegroundColor Yellow
$blogId = ($result.Content | ConvertFrom-Json).data.id  # Get blog ID from previous create

# Get blog ID from earlier response
$blogData = Invoke-WebRequest -Uri "$baseUrl/blogs" -Method Get -TimeoutSec 10
$blogResponse = $blogData.Content | ConvertFrom-Json
if ($blogResponse.data.Count -gt 0) {
    $blogId = $blogResponse.data[0].id
    
    $updateBlogBody = @{
        title = "Test Blog Updated"
        description = "This is an updated test blog"
        date = (Get-Date -Format "yyyy-MM-dd")
    } | ConvertTo-Json

    try {
        $result = Invoke-WebRequest -Uri "$baseUrl/blogs/$blogId" -Method Patch -Headers $headers -Body $updateBlogBody -TimeoutSec 10
        Write-Host "✅ Update Blog Success (Status: $($result.StatusCode))" -ForegroundColor Green
        Write-Host "Response: $($result.Content)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Update Blog Failed: $($_.Exception.Message)" -ForegroundColor Red
    }

    # Test 10: Get Updated Blog
    Write-Host "`n10. Testing Get Updated Blog..." -ForegroundColor Yellow
    try {
        $result = Invoke-WebRequest -Uri "$baseUrl/blogs/$blogId" -Method Get -TimeoutSec 10
        Write-Host "✅ Get Updated Blog Success (Status: $($result.StatusCode))" -ForegroundColor Green
        Write-Host "Response: $($result.Content)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Get Updated Blog Failed: $($_.Exception.Message)" -ForegroundColor Red
    }

    # Test 11: Delete Blog
    Write-Host "`n11. Testing Delete Blog..." -ForegroundColor Yellow
    try {
        $result = Invoke-WebRequest -Uri "$baseUrl/blogs/$blogId" -Method Delete -Headers $headers -TimeoutSec 10
        Write-Host "✅ Delete Blog Success (Status: $($result.StatusCode))" -ForegroundColor Green
        Write-Host "Response: $($result.Content)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Delete Blog Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== Testing Complete ===" -ForegroundColor Cyan
