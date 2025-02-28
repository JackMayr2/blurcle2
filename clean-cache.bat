@echo off
echo Cleaning Next.js cache...

REM Stop any running Next.js processes
taskkill /f /im node.exe 2>nul

REM Wait a moment for processes to fully close
timeout /t 2 /nobreak >nul

REM Delete cache directory if it exists
if exist ".next\cache" (
    rmdir /s /q .next\cache
    echo Next.js cache directory removed.
) else (
    echo No cache directory found.
)

REM Recreate cache directory structure
mkdir .next\cache\webpack\client-development 2>nul
mkdir .next\cache\webpack\server-development 2>nul

echo Cache cleaned and directory structure recreated.
echo Run 'npm run dev' to start the development server.
