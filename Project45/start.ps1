# Heritage Digital Platform - Startup Script (PowerShell)
# Usage: .\start.ps1

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Heritage Digital Platform - Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get project root directory
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectRoot

# [1/6] Check environment
Write-Host "[1/6] Checking environment..." -ForegroundColor Yellow

# Check Python
try {
    $pythonVersion = python --version 2>&1
    Write-Host "  Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Python is not installed. Please install Python 3.9+." -ForegroundColor Red
    exit 1
}

# Check Node.js
try {
    $nodeVersion = node --version 2>&1
    Write-Host "  Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed. Please install Node.js 18+." -ForegroundColor Red
    exit 1
}

# Check Docker
try {
    $dockerVersion = docker --version 2>&1
    Write-Host "  Docker: $dockerVersion" -ForegroundColor Green
    $dockerAvailable = $true
} catch {
    Write-Host "  WARNING: Docker not installed, using fallback search." -ForegroundColor Yellow
    $dockerAvailable = $false
}

Write-Host ""

# [2/6] Copy environment file
Write-Host "[2/6] Copying environment file..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "  Created .env file from .env.example" -ForegroundColor Green
} else {
    Write-Host "  .env file already exists" -ForegroundColor Green
}

Write-Host ""

# [3/6] Start Docker services
if ($dockerAvailable) {
    Write-Host "[3/6] Starting Docker services..." -ForegroundColor Yellow
    try {
        $dockerRunning = docker ps 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Starting Elasticsearch container..." -ForegroundColor Gray
            docker-compose up -d elasticsearch
            Write-Host "  Waiting for Elasticsearch to be ready..." -ForegroundColor Gray
            Start-Sleep -Seconds 20
            Write-Host "  Elasticsearch started" -ForegroundColor Green
        } else {
            Write-Host "  WARNING: Docker not running, skipping Elasticsearch." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  WARNING: Docker error, skipping Elasticsearch." -ForegroundColor Yellow
    }
} else {
    Write-Host "[3/6] Skipping Docker services..." -ForegroundColor Yellow
}

Write-Host ""

# [4/6] Setup backend
Write-Host "[4/6] Setting up backend..." -ForegroundColor Yellow
Set-Location "$ProjectRoot\backend"

# Create virtual environment if not exists
if (-not (Test-Path "venv")) {
    Write-Host "  Creating virtual environment..." -ForegroundColor Gray
    python -m venv venv
    Write-Host "  Virtual environment created" -ForegroundColor Green
} else {
    Write-Host "  Virtual environment exists" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "  Activating virtual environment..." -ForegroundColor Gray
$VenvPython = "$ProjectRoot\backend\venv\Scripts\python.exe"
$VenvPip = "$ProjectRoot\backend\venv\Scripts\pip.exe"

# Install dependencies
Write-Host "  Installing backend dependencies..." -ForegroundColor Gray
& $VenvPip install -r requirements.txt
Write-Host "  Backend dependencies installed" -ForegroundColor Green

Write-Host ""

# [5/6] Initialize database
Write-Host "[5/6] Initializing database..." -ForegroundColor Yellow
& $VenvPython -c "from app.init_data import init_database; init_database()"
Write-Host "  Database initialized" -ForegroundColor Green

Write-Host ""

# [6/6] Start services
Write-Host "[6/6] Starting services..." -ForegroundColor Yellow

# Start backend in new window
Write-Host "  Starting backend server..." -ForegroundColor Gray
$BackendScript = @"
cd '$ProjectRoot\backend'
`$VenvPython = '$VenvPython'
& `$VenvPython -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
"@
$BackendScriptPath = "$ProjectRoot\backend\start_backend.ps1"
$BackendScript | Out-File -FilePath $BackendScriptPath -Encoding UTF8

Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy Bypass", "-File", $BackendScriptPath -WindowStyle Normal
Write-Host "  Backend server started" -ForegroundColor Green

Write-Host ""
Write-Host "  Waiting for backend to start..." -ForegroundColor Gray
Start-Sleep -Seconds 10

# Start frontend
Write-Host "  Starting frontend..." -ForegroundColor Gray
Set-Location "$ProjectRoot\frontend"

# Install frontend dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "  Installing frontend dependencies..." -ForegroundColor Gray
    npm install --no-audit --no-fund
    Write-Host "  Frontend dependencies installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  All services starting..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend API:    http://localhost:8000" -ForegroundColor Green
Write-Host "API Docs:       http://localhost:8000/docs" -ForegroundColor Green
Write-Host "Frontend:       http://localhost:3000" -ForegroundColor Green
Write-Host "Elasticsearch:  http://localhost:9200" -ForegroundColor Gray
Write-Host ""
Write-Host "Demo Accounts:" -ForegroundColor Yellow
Write-Host "  Admin:      admin / admin123" -ForegroundColor White
Write-Host "  Instructor: master_zhang / 123456" -ForegroundColor White
Write-Host "  User:       learner_wang / 123456" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the frontend server." -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start frontend
npm run dev
