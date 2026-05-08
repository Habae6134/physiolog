@echo off
chcp 65001 >nul
REM PhysioLog 설치+실행 스크립트 (Windows)
cd /d "%~dp0"

echo ====================================
echo   PhysioLog 시작합니다
echo ====================================

REM Node.js 체크
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo [X] Node.js가 설치되어 있지 않습니다.
  echo     https://nodejs.org/ 에서 LTS 버전 설치 후 다시 실행해주세요.
  echo.
  pause
  exit /b 1
)

REM 패키지 설치 (없을 때만)
if not exist node_modules (
  echo.
  echo [*] 처음 실행이라 패키지 설치 중... ^(1~2분 걸립니다^)
  call npm install
  if errorlevel 1 (
    echo.
    echo [X] npm install 실패. 인터넷 연결 확인 후 재시도.
    pause
    exit /b 1
  )
) else (
  echo.
  echo [OK] 패키지 이미 설치됨
)

REM 3초 뒤 브라우저 오픈
start "" /B cmd /C "timeout /T 3 >nul && start http://localhost:3000"

echo.
echo [OK] 서버 실행 중... 브라우저에서 http://localhost:3000 열림
echo      종료하려면 Ctrl + C
echo.

call npm run dev
