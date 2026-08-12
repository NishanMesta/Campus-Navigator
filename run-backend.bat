@echo off
title Presidency Campus Navigator - Backend
echo ========================================================
echo   Presidency University Bengaluru - Campus Navigator
echo   Starting Spring Boot REST API Backend...
echo ========================================================
cd /d "%~dp0backend"
mvn spring-boot:run
pause
