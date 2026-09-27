@echo off
title KIIT IEEE - Where Students Build What's Next
cls
echo ========================================================
echo   KIIT IEEE - Intelligent Student Event Platform
echo   "Where Students Build What's Next."
echo ========================================================
echo.
echo Starting local web server...
python server.py
if %ERRORLEVEL% NEQ 0 (
    echo Python server launch failed, opening index.html directly in your default browser...
    start index.html
)
pause
