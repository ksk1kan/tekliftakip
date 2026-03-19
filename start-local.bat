@echo off
setlocal
cd /d %~dp0

echo [1/5] Python kontrol ediliyor...
where py >nul 2>nul
if %errorlevel%==0 (
  set PY_CMD=py -3
) else (
  where python >nul 2>nul
  if %errorlevel%==0 (
    set PY_CMD=python
  ) else (
    echo Python bulunamadi. Lutfen Python 3.11+ kur.
    pause
    exit /b 1
  )
)

echo [2/5] Sanal ortam hazirlaniyor...
if not exist .venv (
  %PY_CMD% -m venv .venv
  if errorlevel 1 goto :error
)

call .venv\Scripts\activate
if errorlevel 1 goto :error

echo [3/5] Paketler kuruluyor/guncelleniyor...
python -m pip install --upgrade pip
if errorlevel 1 goto :error
pip install -r requirements.txt
if errorlevel 1 goto :error

echo [4/5] Sunucu baslatiliyor...
start "" http://localhost:3030
python app.py
if errorlevel 1 goto :error

goto :end

:error
echo.
echo Sunucu baslatilirken hata olustu.
echo Bu pencerenin ekran goruntusunu bana atarsan direkt cozerim.
pause
exit /b 1

:end
echo.
echo Uygulama kapandi.
pause
endlocal
