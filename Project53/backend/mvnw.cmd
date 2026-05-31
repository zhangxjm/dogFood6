@echo off
setlocal

set "DIRNAME=%~dp0"
set "APP_BASE_NAME=%~n0"
set "APP_HOME=%DIRNAME%"

set "DEFAULT_JVM_OPTS="

set "WRAPPER_JAR="%DIRNAME%\.mvn\wrapper\maven-wrapper.jar""

set "WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain"

set "MAVEN_OPTS=%MAVEN_OPTS% %DEFAULT_JVM_OPTS%"

if not exist "%WRAPPER_JAR%" (
    echo Maven wrapper not found. Trying to use system Maven...
    mvn %*
    exit /b %ERRORLEVEL%
)

java %MAVEN_OPTS% -classpath "%WRAPPER_JAR%" %WRAPPER_LAUNCHER% %*
