Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Cross-border Payment Risk Control System" -ForegroundColor Cyan
Write-Host "  Starting Services..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Node.js is not installed" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green

Write-Host ""
Write-Host "[2/4] Installing dependencies..." -ForegroundColor Yellow

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing server dependencies..." -ForegroundColor Gray
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to install server dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
} else {
    Write-Host "Server dependencies already installed" -ForegroundColor Green
}

if (-not (Test-Path "client\node_modules")) {
    Write-Host "Installing client dependencies..." -ForegroundColor Gray
    Push-Location client
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to install client dependencies" -ForegroundColor Red
        Pop-Location
        Read-Host "Press Enter to exit"
        exit 1
    }
    Pop-Location
} else {
    Write-Host "Client dependencies already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "[3/4] Initializing database..." -ForegroundColor Yellow
npm run init
if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: Database initialization may have issues, but continuing..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[4/4] Building frontend..." -ForegroundColor Yellow
Push-Location client
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: Frontend build failed, but server will still start" -ForegroundColor Yellow
}
Pop-Location

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Services Starting..." -ForegroundColor Cyan
Write-Host "  Server: http://localhost:3034" -ForegroundColor Green
Write-Host "  Default Account: admin / admin123" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

npm start
