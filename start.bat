@echo off
cd /d "%~dp0"
start "" http://localhost:8797/
python -m http.server 8797
