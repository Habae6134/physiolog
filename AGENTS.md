<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# UI 작업 규칙

이 프로젝트의 UI 개발 시 다음 규칙을 준수해야 합니다.

## 1. 기술 스택 및 스타일링
- **Tailwind CSS v4**: 모든 스타일링은 Tailwind CSS v4를 사용하여 구현합니다.
- **Shadcn UI**: 기본 컴포넌트 라이브러리로 Shadcn UI를 활용하며, 필요에 따라 커스터마이징합니다.
- **Lucide React**: 일관된 아이콘 시스템을 위해 Lucide React를 사용합니다.
- **Framer Motion**: 부드러운 인터랙션과 애니메이션을 위해 Framer Motion을 적극적으로 활용합니다.

## 2. 디자인 및 레이아웃
- **반응형 디자인**: 모바일 우선(Mobile-first) 접근 방식을 취하며, 모든 화면 크기에서 최적화된 경험을 제공합니다.
- **일관성**: 기존 컬러 팔레트와 타이포그래피 스타일을 유지하여 시각적 일관성을 확보합니다.
- **접근성 (A11y)**: 시멘틱 HTML 태그를 사용하고 ARIA 속성을 적절히 활용하여 접근성을 높입니다.

## 3. 구현 지침
- **컴포넌트화**: 재사용 가능한 로직과 UI는 독립적인 컴포넌트로 분리합니다.
- **데이터 흐름**: React Hook Form과 Zod를 연동하여 폼 검증 및 데이터 관리를 수행합니다.
- **클린 코드**: 가독성 좋은 클래스 네이밍(cn 함수 활용)과 주석을 통해 코드 품질을 유지합니다.
