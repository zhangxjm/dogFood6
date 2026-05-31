# Heritage Digital Platform - Stop Script (PowerShell)
# Usage: .\stop.ps1

$ErrorActionPreference = "SilentlyContinue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Heritage Digital Platform - Stop" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Stop Node.js processes
Write-Host "[1/3] Stopping frontend..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*\frontend\*" -or $_.MainWindowTitle -like "*next*" } | Stop-Process -Force
Write-Host "  Frontend stopped" -ForegroundColor Green

# Stop Python processes
Write-Host "[2/3] Stopping backend..." -ForegroundColor Yellow
Get-Process python -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*\backend\*" -or $_.MainWindowTitle -like "*uvicorn*" } | Stop-Process -Force
Write-Host "  Backend stopped" -ForegroundColor Green

# Stop Docker containers
Write-Host "[3/3] Stopping Docker services..." -ForegroundColor Yellow
try {
    $dockerRunning = docker ps 2>&1
    if ($LASTEXITCODE -eq 0) {
        docker-compose down
        Write-Host "  Docker services stopped" -ForegroundColor Green
    } else {
        Write-Host "  Docker not running" -ForegroundColor Gray
    }
} catch {
    Write-Host "  Docker not available" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  All services stopped" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
