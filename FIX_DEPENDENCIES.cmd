@echo off
setlocal enabledelayedexpansion

echo.
echo ====================================================
echo              ELITE LOCKER DEPENDENCY FIX
echo ====================================================
echo.

REM Change to the directory where this script is located
cd /d "%~dp0"
echo Current directory: %CD%
echo.

REM Check if this is the elite-locker directory
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Make sure this script is in the elite-locker directory.
    echo.
    pause
    exit /b 1
)

REM Try multiple ways to find and use npm
echo Searching for npm...

REM Method 1: Try direct npm command
npm --version >nul 2>&1
if !errorlevel! equ 0 (
    echo Found npm in PATH
    goto :install_deps
)

REM Method 2: Try common npm locations
set "npm_paths[0]=C:\Program Files\nodejs\npm.cmd"
set "npm_paths[1]=C:\Users\%USERNAME%\AppData\Roaming\npm\npm.cmd"
set "npm_paths[2]=C:\nodejs\npm.cmd"

for /l %%i in (0,1,2) do (
    if exist "!npm_paths[%%i]!" (
        echo Found npm at: !npm_paths[%%i]!
        set "npm_cmd=!npm_paths[%%i]!"
        goto :install_deps
    )
)

REM Method 3: Search for npm in common directories
echo Searching for npm installation...
for %%D in ("C:\Program Files\nodejs" "C:\nodejs" "%LOCALAPPDATA%\nodejs" "%APPDATA%\npm") do (
    if exist "%%~D\npm.cmd" (
        echo Found npm at: %%~D\npm.cmd
        set "npm_cmd=%%~D\npm.cmd"
        goto :install_deps
    )
)

REM If npm not found, provide instructions
echo.
echo ==========================================
echo            NPM NOT FOUND
echo ==========================================
echo.
echo npm could not be found on your system.
echo.
echo SOLUTIONS:
echo 1. Install Node.js from: https://nodejs.org
echo 2. Restart your computer after installation
echo 3. If you have nvm, run: nvm use [version]
echo 4. Add Node.js to your PATH environment variable
echo.
echo After fixing npm, double-click this script again.
echo.
pause
exit /b 1

:install_deps
echo.
echo Installing dependencies...
echo.

if defined npm_cmd (
    "%npm_cmd%" install
) else (
    npm install
)

if !errorlevel! equ 0 (
    echo.
    echo ==========================================
    echo            SUCCESS!
    echo ==========================================
    echo.
    echo Dependencies have been restored successfully!
    echo You can now start your app with: npm start
    echo.
) else (
    echo.
    echo ==========================================
    echo            ERROR
    echo ==========================================
    echo.
    echo Failed to install dependencies.
    echo Please check the error messages above.
    echo.
)

echo Press any key to exit...
pause >nul 