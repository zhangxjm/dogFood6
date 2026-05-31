@echo off
echo ========================================
echo Building Backend Services
echo ========================================

set MAVEN_OPTS=-Xmx512m -Xms256m

cd backend
call mvn clean package -DskipTests -Dmaven.javadoc.skip=true
if %errorlevel% neq 0 (
    echo Build failed!
    exit /b %errorlevel%
)

echo ========================================
echo Backend build completed!
echo ========================================
