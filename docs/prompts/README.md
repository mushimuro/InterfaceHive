# InterfaceHive AI 프롬프트 가이드

InterfaceHive 프로젝트 개발을 위한 AI 코딩 어시스턴트 프롬프트 모음입니다.

## 개요

이 가이드는 Claude, GPT-4, Copilot 등 AI 코딩 어시스턴트와 효과적으로 협업하기 위한 프롬프트 템플릿을 제공합니다. InterfaceHive의 기술 스택과 아키텍처에 맞게 최적화되어 있습니다.

## 핵심 원칙

### 1. Context-First Thinking (컨텍스트 우선 사고)
```
❌ "로그인 기능 만들어줘"
✅ "Django REST Framework와 JWT 인증을 사용하는 InterfaceHive 백엔드에서,
    이메일 인증이 완료된 사용자만 로그인할 수 있는 엔드포인트를 구현해줘."
```

### 2. 명확하고 상세한 프롬프트
- 프로그래밍 언어, 라이브러리, 프레임워크 명시
- 제약조건과 요구사항 포함
- 기대하는 출력 형식 지정

### 3. 작업 분해
- 큰 기능을 작은 단위로 나누기
- 각 단계 완료 후 검토
- 점진적 구현

### 4. AI를 Pair Programmer로 활용
- Autopilot이 아닌 협업 도구
- 생성된 코드 이해 및 검토 필수
- 보안, 성능 관점에서 항상 검증

### 5. 오버엔지니어링 방지
```
프롬프트에 다음 문구 포함:
- "직접 요청된 변경만 수행해줘"
- "간단하고 집중된 솔루션 유지"
- "불필요한 추상화나 헬퍼 함수 추가하지 않기"
- "시스템 경계에서만 입력 검증"
```

## 프롬프트 카테고리

| 문서 | 설명 | 프롬프트 수 |
|------|------|-------------|
| [01-development.md](./01-development.md) | 새 기능 구현, API 추가, UI 컴포넌트 생성 | ~20개 |
| [02-improvement.md](./02-improvement.md) | 성능 최적화, UX 개선, 접근성 향상 | ~15개 |
| [03-refactoring.md](./03-refactoring.md) | 코드 구조 개선, 패턴 적용, 중복 제거 | ~15개 |
| [04-ideation.md](./04-ideation.md) | 브레인스토밍, 기술 솔루션 탐색 | ~15개 |
| [05-testing.md](./05-testing.md) | 테스트 작성, 커버리지 개선 | ~20개 |

## 템플릿

재사용 가능한 프롬프트 템플릿:

| 템플릿 | 용도 |
|--------|------|
| [feature-development.md](./templates/feature-development.md) | 새 기능 개발 |
| [bug-fix.md](./templates/bug-fix.md) | 버그 수정 |
| [performance-optimization.md](./templates/performance-optimization.md) | 성능 최적화 |
| [code-review.md](./templates/code-review.md) | 코드 리뷰 |

## InterfaceHive 기술 컨텍스트

모든 프롬프트에 필요시 다음 컨텍스트를 포함하세요:

### 백엔드
```
- Django 6.0.1 + Django REST Framework 3.14
- PostgreSQL 16 (GIN 인덱스 활용 전문 검색)
- JWT 인증 (djangorestframework-simplejwt)
- Celery 5.3 + Redis 7 (비동기 작업)
- Channels 4.0 (WebSocket)
- Python 3.12.9
```

### 프론트엔드
```
- React 19 + TypeScript 5.9
- Vite 7.2 (빌드 도구)
- shadcn/ui + Tailwind CSS 3.4
- TanStack Query 5.90 (서버 상태 관리)
- react-hook-form + zod (폼 검증)
```

### 앱 구조
```
backend/apps/
├── users/          # 사용자, 인증, 프로필
├── projects/       # 프로젝트 CRUD, 검색
├── contributions/  # 기여 신청, 승인
├── credits/        # 크레딧 원장, 트랜잭션
├── badges/         # 마일스톤 뱃지
├── moderation/     # 관리자 모더레이션
├── chat/           # 실시간 채팅
└── ai_agent/       # AI 기능

frontend/src/
├── api/            # API 클라이언트
├── components/     # 재사용 컴포넌트
├── pages/          # 페이지 컴포넌트
├── contexts/       # React Context
├── hooks/          # 커스텀 훅
└── schemas/        # Zod 스키마
```

## 프롬프트 구조

각 프롬프트는 다음 형식을 따릅니다:

```markdown
### [프롬프트 제목]

**목적:** 이 프롬프트가 해결하려는 문제

**필수 컨텍스트:**
- 제공해야 할 정보 목록

**프롬프트:**
```
[복사-붙여넣기 가능한 프롬프트]
```

**예시:**
[InterfaceHive 실제 적용 예시]

**예상 결과:**
[기대하는 응답 형식]

**주의사항:**
- 흔한 실수와 회피 방법
```

## 사용 가이드

### 1. 적절한 카테고리 선택
- 새 기능 → `01-development.md`
- 기존 코드 개선 → `02-improvement.md`
- 구조 변경 → `03-refactoring.md`
- 아이디어 탐색 → `04-ideation.md`
- 테스트 작성 → `05-testing.md`

### 2. 컨텍스트 준비
- 관련 파일 경로
- 기존 코드 스니펫
- 에러 메시지 (버그의 경우)
- 요구사항 명세

### 3. 프롬프트 커스터마이징
- 템플릿의 `[placeholder]` 부분 채우기
- 필요시 추가 제약조건 명시
- 출력 형식 조정

### 4. 결과 검토
- 생성된 코드 이해하기
- 보안 취약점 확인
- 코딩 컨벤션 준수 여부
- 테스트 실행

## 베스트 프랙티스

### DO ✅
- 충분한 컨텍스트 제공
- 구체적인 요구사항 명시
- 단계별로 진행
- 생성된 코드 항상 검토
- 테스트 함께 요청

### DON'T ❌
- 모호한 요청하기
- 한 번에 너무 많은 기능 요청
- 검토 없이 코드 커밋
- 보안 관련 코드 무조건 수락
- AI 응답 맹신

## 보안 체크리스트

AI 생성 코드 검토 시 확인할 항목:

- [ ] SQL 인젝션 취약점 없음
- [ ] XSS 취약점 없음
- [ ] CSRF 보호 적용
- [ ] 민감 정보 하드코딩 없음
- [ ] 적절한 인증/인가 확인
- [ ] 입력 검증 수행
- [ ] 에러 메시지에 민감 정보 노출 없음

## 관련 문서

- [CLAUDE.md](/CLAUDE.md) - 프로젝트 개요 및 명령어
- [prd.md](/prd.md) - 제품 요구사항
- [API 문서](http://localhost:8000/api/docs/) - Swagger 문서

---

*이 가이드는 지속적으로 업데이트됩니다. 피드백이나 새로운 프롬프트 제안은 언제든 환영합니다.*
