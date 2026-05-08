#!/usr/bin/env bash
# PhysioLog 설치+실행 스크립트 (Mac/Linux)
set -e

cd "$(dirname "$0")"

echo "===================================="
echo "  PhysioLog 시작합니다"
echo "===================================="

# Node.js 체크
if ! command -v node >/dev/null 2>&1; then
  echo ""
  echo "❌ Node.js가 설치되어 있지 않습니다."
  echo "   https://nodejs.org/ 에서 LTS 버전 설치 후 다시 실행해주세요."
  echo ""
  read -p "엔터를 누르면 종료됩니다..." _
  exit 1
fi

NODE_MAJOR=$(node -v | sed 's/v\([0-9]*\).*/\1/')
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo ""
  echo "⚠️  Node.js v20 이상이 필요합니다. 현재: $(node -v)"
  echo "   https://nodejs.org/ 에서 LTS 버전 설치 후 다시 실행해주세요."
  echo ""
  read -p "엔터를 누르면 종료됩니다..." _
  exit 1
fi

# 패키지 설치 (이미 있으면 스킵)
if [ ! -d node_modules ]; then
  echo ""
  echo "📦 처음 실행이라 패키지 설치 중... (1~2분 걸립니다)"
  npm install
else
  echo ""
  echo "✓ 패키지 이미 설치됨"
fi

# 브라우저 자동 오픈 (3초 뒤)
(sleep 3 && open http://localhost:3000 2>/dev/null || true) &

echo ""
echo "🚀 서버 실행 중... 브라우저에서 http://localhost:3000 열림"
echo "   종료하려면 Ctrl + C"
echo ""

npm run dev
