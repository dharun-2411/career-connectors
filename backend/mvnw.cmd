@REM ----------------------------------------------------------------------------
@REM Maven Wrapper Batch Script
@REM ----------------------------------------------------------------------------
@echo off
setlocal

if exist "%LOCALAPPDATA%\Programs\IntelliJ IDEA 2025.3.2\jbr\bin\java.exe" (
    set "JAVA_HOME=%LOCALAPPDATA%\Programs\IntelliJ IDEA 2025.3.2\jbr"
    set "PATH=%LOCALAPPDATA%\Programs\IntelliJ IDEA 2025.3.2\jbr\bin;%PATH%"
)

set "MAVEN_USER_HOME=%USERPROFILE%\.maven\apache-maven-3.9.9"

if exist "%MAVEN_USER_HOME%\bin\mvn.cmd" (
    call "%MAVEN_USER_HOME%\bin\mvn.cmd" %*
) else (
    where mvn >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        call mvn %*
    ) else (
        echo [ERROR] Maven not found. Please run powershell script to setup Maven or restart your terminal.
        exit /b 1
    )
)
