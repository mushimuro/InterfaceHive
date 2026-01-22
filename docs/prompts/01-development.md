# 개발 프롬프트 (Development Prompts)

새로운 기능 구현, API 엔드포인트 추가, UI 컴포넌트 생성을 위한 프롬프트 모음입니다.

---

## 백엔드 개발

### DEV-B01: Django 모델 생성

**목적:** 새로운 데이터 모델 정의

**필수 컨텍스트:**
- 모델 이름과 목적
- 필드 목록 및 타입
- 관계 (ForeignKey, ManyToMany 등)
- 인덱싱 요구사항

**프롬프트:**
```
InterfaceHive 백엔드에 새로운 Django 모델을 생성해줘.

## 기술 스택
- Django 6.0.1, Python 3.12
- PostgreSQL 16
- 기존 앱: backend/apps/[앱이름]/

## 모델 요구사항
- 모델명: [모델명]
- 목적: [모델의 용도]
- 필드:
  - [필드명]: [타입] - [설명]
  - [필드명]: [타입] - [설명]
- 관계:
  - [관련모델] via [ForeignKey/ManyToMany]
- 인덱스: [검색에 자주 사용될 필드]

## 제약조건
- InterfaceHive 코딩 컨벤션 준수 (CLAUDE.md 참조)
- 기존 모델 패턴 따르기 (apps/users/models.py 참조)
- soft delete 지원 필요하면 포함
- created_at, updated_at 타임스탬프 포함

## 출력 형식
1. models.py 코드
2. admin.py 등록 코드
3. migration 명령어
```

**예시:**
```
InterfaceHive 백엔드에 새로운 Django 모델을 생성해줘.

## 모델 요구사항
- 모델명: ProjectTemplate
- 목적: AI 생성 프로젝트 템플릿 저장
- 필드:
  - title: CharField(max_length=200) - 템플릿 제목
  - description: TextField - 상세 설명
  - category: CharField(max_length=50) - 카테고리
  - tags: ArrayField(CharField) - 태그 목록
  - difficulty: CharField(choices) - 난이도
  - estimated_hours: PositiveIntegerField - 예상 시간
  - is_active: BooleanField - 활성화 여부
- 관계:
  - created_by → User via ForeignKey
- 인덱스: category, difficulty, is_active
```

---

### DEV-B02: DRF Serializer 생성

**목적:** API 데이터 직렬화/역직렬화

**필수 컨텍스트:**
- 대상 모델
- 포함/제외 필드
- 중첩 관계 처리 방식
- 검증 규칙

**프롬프트:**
```
InterfaceHive 모델을 위한 DRF Serializer를 생성해줘.

## 대상 모델
- 모델: [모델명] (apps/[앱]/models.py)
- 용도: [List/Detail/Create/Update]

## 필드 요구사항
- 포함 필드: [필드 목록]
- 제외 필드: [필드 목록]
- 읽기 전용: [필드 목록]
- 중첩 관계: [관계 필드 - 깊이/별도 Serializer]

## 검증 규칙
- [필드]: [검증 규칙]
- [필드]: [검증 규칙]

## 제약조건
- 기존 serializers.py 패턴 따르기
- 필요시 커스텀 validate_[field] 메서드
- SerializerMethodField 사용 최소화
```

**예시:**
```
InterfaceHive contributions 모델을 위한 DRF Serializer를 생성해줘.

## 대상 모델
- 모델: Contribution (apps/contributions/models.py)
- 용도: List/Detail API

## 필드 요구사항
- 포함 필드: id, project, contributor, status, message, created_at
- 제외 필드: internal_notes
- 읽기 전용: id, created_at, status
- 중첩 관계:
  - project: id, title만 포함
  - contributor: id, display_name, avatar_url만 포함

## 검증 규칙
- message: 최소 10자, 최대 1000자
- project: 존재하고 status='open'이어야 함
```

---

### DEV-B03: API ViewSet 생성

**목적:** RESTful API 엔드포인트 구현

**필수 컨텍스트:**
- 대상 모델/Serializer
- 필요한 액션 (list, create, retrieve, update, delete)
- 권한 규칙
- 필터링/검색/정렬

**프롬프트:**
```
InterfaceHive용 DRF ViewSet을 생성해줘.

## 기본 정보
- 모델: [모델명]
- Serializer: [Serializer명]
- URL 프리픽스: /api/v1/[경로]/

## 액션
- [ ] list: [설명]
- [ ] create: [설명]
- [ ] retrieve: [설명]
- [ ] update: [설명]
- [ ] partial_update: [설명]
- [ ] delete: [설명]
- 커스텀 액션: [액션명] - [설명]

## 권한
- list: [인증 필요 여부, 추가 조건]
- create: [권한 조건]
- retrieve: [권한 조건]
- update/delete: [소유자 확인 등]

## 필터링/검색
- 필터 필드: [필드 목록]
- 검색 필드: [필드 목록]
- 정렬 필드: [필드 목록]

## 제약조건
- 기존 views.py 패턴 따르기
- drf-spectacular 데코레이터로 문서화
- 적절한 HTTP 상태 코드 반환
```

---

### DEV-B04: Celery 비동기 태스크 생성

**목적:** 백그라운드 작업 구현

**필수 컨텍스트:**
- 태스크 목적
- 입력 파라미터
- 실행 조건/스케줄
- 실패 처리

**프롬프트:**
```
InterfaceHive용 Celery 비동기 태스크를 생성해줘.

## 태스크 정보
- 이름: [태스크명]
- 목적: [상세 설명]
- 앱: apps/[앱이름]/tasks.py

## 파라미터
- [파라미터명]: [타입] - [설명]

## 실행 조건
- 트리거: [API 호출/스케줄/시그널]
- 스케줄: [crontab 표현식, 선택사항]
- 재시도: [횟수, 간격]

## 로직
[태스크가 수행할 작업 설명]

## 에러 처리
- [에러 케이스]: [처리 방법]

## 제약조건
- 기존 tasks.py 패턴 따르기
- 로깅 포함
- 멱등성 보장 (가능하면)
```

---

### DEV-B05: WebSocket Consumer 생성

**목적:** 실시간 통신 구현

**필수 컨텍스트:**
- 채널 그룹 구조
- 메시지 타입
- 인증 방식
- 연결/해제 로직

**프롬프트:**
```
InterfaceHive용 Django Channels Consumer를 생성해줘.

## Consumer 정보
- 이름: [Consumer명]
- 목적: [실시간 기능 설명]
- 경로: ws://[도메인]/ws/[경로]/

## 채널 그룹
- 그룹 패턴: [예: chat_{room_id}]
- 조인 조건: [인증, 권한 등]

## 메시지 타입
### 클라이언트 → 서버
- [타입명]: [페이로드 구조]

### 서버 → 클라이언트
- [타입명]: [페이로드 구조]

## 인증
- JWT 토큰 검증 방식
- 미인증 시 처리

## 제약조건
- JsonWebsocketConsumer 사용
- 기존 chat/consumers.py 패턴 참조
- 적절한 에러 메시지
```

---

### DEV-B06: Django 커스텀 매니저/쿼리셋 생성

**목적:** 재사용 가능한 쿼리 로직 캡슐화

**프롬프트:**
```
InterfaceHive 모델을 위한 커스텀 Manager와 QuerySet을 생성해줘.

## 대상 모델
- 모델: [모델명] (apps/[앱]/models.py)

## 필요한 메서드
### QuerySet 메서드 (체이닝 가능)
- [메서드명](): [설명]
- [메서드명](param): [설명]

### Manager 메서드 (단독 사용)
- [메서드명](): [설명]

## 예시 사용법
[실제 사용 예시 코드]

## 제약조건
- QuerySet은 as_manager() 활용
- 성능 고려한 쿼리 최적화
- 필요시 select_related/prefetch_related 포함
```

**예시:**
```
InterfaceHive Project 모델을 위한 커스텀 Manager와 QuerySet을 생성해줘.

## 필요한 메서드
### QuerySet 메서드
- active(): status='open'인 프로젝트만
- by_difficulty(level): 난이도별 필터
- with_contribution_count(): 기여 수 annotate
- search(query): 제목/설명 전문 검색

### Manager 메서드
- popular(): 최근 7일간 조회수 상위 10개
```

---

### DEV-B07: Django Signal 핸들러 생성

**목적:** 모델 이벤트 기반 로직 구현

**프롬프트:**
```
InterfaceHive용 Django Signal 핸들러를 생성해줘.

## Signal 정보
- 앱: apps/[앱]/signals.py
- 대상 모델: [모델명]
- 시그널: [pre_save/post_save/pre_delete/post_delete/m2m_changed]

## 트리거 조건
[시그널이 발생해야 하는 조건]

## 수행할 작업
[시그널 수신 시 실행할 로직]

## 제약조건
- apps.py에서 ready() 메서드로 import
- 순환 import 방지
- 무한 루프 방지 (save() 호출 시)
```

---

## 프론트엔드 개발

### DEV-F01: React 페이지 컴포넌트 생성

**목적:** 새로운 페이지 구현

**필수 컨텍스트:**
- 페이지 목적
- 필요한 데이터/API
- 레이아웃 요구사항
- 사용자 인터랙션

**프롬프트:**
```
InterfaceHive 프론트엔드에 새 페이지 컴포넌트를 생성해줘.

## 기술 스택
- React 19 + TypeScript 5.9
- TanStack Query 5.90 (서버 상태)
- shadcn/ui + Tailwind CSS 3.4
- react-hook-form + zod (폼 처리)

## 페이지 정보
- 파일: src/pages/[페이지명].tsx
- 라우트: /[경로]
- 목적: [페이지 설명]

## 데이터 요구사항
- API 엔드포인트: [GET/POST /api/v1/...]
- 필요한 데이터: [데이터 구조]
- 로딩/에러 상태: [처리 방식]

## UI 요구사항
- 레이아웃: [구조 설명]
- 주요 컴포넌트: [컴포넌트 목록]
- 반응형: [브레이크포인트별 동작]

## 사용자 인터랙션
- [액션]: [결과]

## 제약조건
- 기존 pages/*.tsx 패턴 따르기
- 적절한 로딩/에러 상태 표시
- SEO 고려 (필요시)
- 접근성 준수
```

---

### DEV-F02: 재사용 가능한 UI 컴포넌트 생성

**목적:** 공통 UI 요소 구현

**프롬프트:**
```
InterfaceHive용 재사용 가능한 UI 컴포넌트를 생성해줘.

## 기술 스택
- React 19 + TypeScript 5.9
- shadcn/ui + Tailwind CSS 3.4

## 컴포넌트 정보
- 파일: src/components/[컴포넌트명].tsx
- 목적: [컴포넌트 설명]

## Props 인터페이스
```typescript
interface [컴포넌트명]Props {
  [prop명]: [타입];  // [설명]
}
```

## 상태 관리
- [상태명]: [용도]

## 렌더링 조건
- [조건별 렌더링 설명]

## 스타일링
- 기본 스타일: [설명]
- 변형(variants): [variant 목록]
- 사이즈: [size 목록]

## 접근성
- ARIA 속성: [필요한 속성]
- 키보드 네비게이션: [지원 여부]

## 제약조건
- shadcn/ui 컴포넌트 활용 권장
- Tailwind CSS만 사용 (인라인 스타일 X)
- forwardRef 필요시 적용
- 컴포넌트 export 방식 통일
```

---

### DEV-F03: TanStack Query 훅 생성

**목적:** API 데이터 패칭 로직 캡슐화

**프롬프트:**
```
InterfaceHive용 TanStack Query 커스텀 훅을 생성해줘.

## 훅 정보
- 파일: src/hooks/use[훅명].ts
- 목적: [API 호출 목적]

## API 정보
- 엔드포인트: [METHOD /api/v1/...]
- 요청 파라미터: [파라미터 구조]
- 응답 데이터: [응답 구조]

## 쿼리/뮤테이션 설정
- 타입: [useQuery / useMutation / useInfiniteQuery]
- queryKey: [키 구조]
- staleTime: [시간]
- cacheTime: [시간]

## 에러 처리
- [에러 케이스]: [처리 방식]

## 반환값
- data: [데이터 타입]
- [추가 반환값]

## 제약조건
- src/api/*.ts의 API 함수 활용
- 타입 안전성 보장
- 기존 훅 패턴 따르기
```

**예시:**
```
InterfaceHive용 TanStack Query 커스텀 훅을 생성해줘.

## 훅 정보
- 파일: src/hooks/useProjects.ts
- 목적: 프로젝트 목록 조회 및 필터링

## API 정보
- 엔드포인트: GET /api/v1/projects/
- 요청 파라미터: { status?, difficulty?, search?, page?, page_size? }
- 응답 데이터: { count, next, previous, results: Project[] }

## 쿼리 설정
- 타입: useInfiniteQuery
- queryKey: ['projects', filters]
- staleTime: 5분

## 반환값
- data: Project[]
- hasNextPage, fetchNextPage
- isLoading, isError, error
- refetch
```

---

### DEV-F04: React Context 생성

**목적:** 전역 상태 관리

**프롬프트:**
```
InterfaceHive용 React Context를 생성해줘.

## Context 정보
- 파일: src/contexts/[Context명].tsx
- 목적: [전역 상태 목적]

## 상태 구조
```typescript
interface [Context명]State {
  [상태명]: [타입];
}
```

## 제공할 액션/함수
- [함수명]([파라미터]): [설명]

## Provider 위치
- [어디에 래핑할지]

## 사용 예시
[Consumer에서 사용하는 예시]

## 제약조건
- 기존 contexts/*.tsx 패턴 따르기
- useMemo/useCallback 적절히 사용
- 커스텀 훅 (useXxxContext) 제공
- Provider 없이 사용 시 에러 throw
```

---

### DEV-F05: Form 컴포넌트 생성 (react-hook-form + zod)

**목적:** 폼 검증 및 제출 처리

**프롬프트:**
```
InterfaceHive용 폼 컴포넌트를 생성해줘.

## 기술 스택
- react-hook-form
- zod 스키마 검증
- shadcn/ui Form 컴포넌트

## 폼 정보
- 파일: src/components/[Form명].tsx
- 목적: [폼 용도]
- 제출 API: [POST/PUT /api/v1/...]

## 필드 구성
| 필드명 | 타입 | 검증 규칙 | UI 컴포넌트 |
|--------|------|-----------|-------------|
| [필드] | [타입] | [규칙] | [Input/Select/...] |

## Zod 스키마
```typescript
const [Form명]Schema = z.object({
  [필드]: z.[타입]().[검증](),
});
```

## 제출 처리
- 성공 시: [동작]
- 실패 시: [에러 표시 방식]
- 로딩 중: [UI 상태]

## 제약조건
- shadcn/ui Form 컴포넌트 활용
- 필드별 에러 메시지 표시
- 폼 레벨 에러 표시
- 제출 버튼 비활성화 (로딩/유효하지 않음)
```

---

### DEV-F06: API 클라이언트 함수 추가

**목적:** 새 API 엔드포인트 호출 함수

**프롬프트:**
```
InterfaceHive API 클라이언트에 새 함수를 추가해줘.

## 위치
- 파일: src/api/[모듈명].ts
- 기존 클라이언트: src/api/client.ts (Axios)

## API 함수
- 함수명: [함수명]
- HTTP 메서드: [GET/POST/PUT/PATCH/DELETE]
- 엔드포인트: /api/v1/[경로]/

## 요청
- 파라미터 타입:
```typescript
interface [요청타입] {
  [필드]: [타입];
}
```

## 응답
- 응답 타입:
```typescript
interface [응답타입] {
  [필드]: [타입];
}
```

## 제약조건
- 기존 api/*.ts 패턴 따르기
- 타입 안전성 보장
- 에러 처리는 Axios 인터셉터 활용
```

---

### DEV-F07: React Router 라우트 추가

**목적:** 새 페이지 라우팅 설정

**프롬프트:**
```
InterfaceHive 프론트엔드에 새 라우트를 추가해줘.

## 라우트 정보
- 경로: /[경로]
- 동적 세그먼트: [있다면 설명]
- 컴포넌트: [페이지 컴포넌트명]

## 보호 라우트 여부
- 인증 필요: [예/아니오]
- 권한 조건: [조건 설명]

## 레이아웃
- 사용할 레이아웃: [레이아웃 컴포넌트]

## 네비게이션
- GNB 메뉴 추가: [예/아니오]
- 브레드크럼: [경로]

## 제약조건
- React Router v7 사용
- 기존 App.tsx 라우트 패턴 따르기
- 코드 스플리팅 적용 (lazy loading)
```

---

## 통합 개발

### DEV-I01: 전체 CRUD 기능 구현

**목적:** 백엔드 + 프론트엔드 풀스택 구현

**프롬프트:**
```
InterfaceHive에 새로운 리소스의 전체 CRUD 기능을 구현해줘.

## 리소스 정보
- 이름: [리소스명]
- 목적: [설명]
- URL: /api/v1/[리소스복수형]/

## 데이터 모델
| 필드 | 타입 | 검증 | 설명 |
|------|------|------|------|
| [필드] | [타입] | [규칙] | [설명] |

## 권한
- Create: [권한 조건]
- Read: [권한 조건]
- Update: [권한 조건]
- Delete: [권한 조건]

## 프론트엔드 페이지
- 목록 페이지: /[경로]
- 상세 페이지: /[경로]/:id
- 생성/수정 폼: [모달/별도페이지]

## 구현 순서
1. Django 모델 생성
2. Serializer 생성
3. ViewSet 생성
4. URL 등록
5. 프론트엔드 API 함수
6. TanStack Query 훅
7. 페이지 컴포넌트

## 제약조건
- 각 단계별로 파일 생성
- 기존 패턴 따르기
- 테스트 코드 함께 작성
```

---

### DEV-I02: 인증 보호 기능 추가

**목적:** 새 기능에 인증/인가 적용

**프롬프트:**
```
InterfaceHive의 기존 기능에 인증 보호를 추가해줘.

## 대상 기능
- 백엔드: [ViewSet/View 위치]
- 프론트엔드: [컴포넌트/페이지 위치]

## 인증 요구사항
- 인증 필수: [전체/특정 액션]
- 이메일 인증: [필요 여부]
- 권한 조건: [소유자/관리자/기타]

## 미인증 시 동작
- 백엔드: [401/403 응답]
- 프론트엔드: [리다이렉트/모달/메시지]

## 구현 항목
- [ ] 백엔드 permission_classes 추가
- [ ] 프론트엔드 ProtectedRoute 적용
- [ ] 권한 없음 UI 처리
- [ ] 인증 상태별 UI 분기
```

---

### DEV-I03: 검색/필터 기능 구현

**목적:** 리소스 검색 및 필터링

**프롬프트:**
```
InterfaceHive [리소스]에 검색/필터 기능을 구현해줘.

## 백엔드 (django-filter)
- 필터 필드:
  - [필드]: [exact/contains/gte/lte/in]
- 검색 필드:
  - [필드]: 전문 검색
- 정렬:
  - [필드]: 오름차순/내림차순

## 프론트엔드
- 검색 UI: [검색바/필터 패널]
- 필터 UI: [드롭다운/체크박스/슬라이더]
- URL 상태: [쿼리스트링 동기화]
- 디바운싱: [검색어 입력 시]

## 제약조건
- PostgreSQL GIN 인덱스 활용 (전문 검색)
- URL 상태 동기화로 공유 가능
- 필터 초기화 버튼
```

---

### DEV-I04: 실시간 알림 기능 구현

**목적:** WebSocket 기반 실시간 알림

**프롬프트:**
```
InterfaceHive에 실시간 알림 기능을 구현해줘.

## 알림 이벤트
- [이벤트1]: [발생 조건] → [알림 내용]
- [이벤트2]: [발생 조건] → [알림 내용]

## 백엔드
- Consumer: NotificationConsumer
- 채널 그룹: user_{user_id}
- 알림 모델: [필요시]
- Signal 트리거: [이벤트 발생 시점]

## 프론트엔드
- WebSocket 연결: useWebSocket 훅
- 알림 상태: NotificationContext
- UI: 알림 벨 아이콘 + 드롭다운

## 알림 데이터 구조
```typescript
interface Notification {
  id: string;
  type: '[타입]';
  message: string;
  read: boolean;
  created_at: string;
  data?: Record<string, any>;
}
```
```

---

### DEV-I05: 파일 업로드 기능 구현

**목적:** 이미지/파일 업로드 처리

**프롬프트:**
```
InterfaceHive에 파일 업로드 기능을 구현해줘.

## 업로드 대상
- 파일 종류: [이미지/문서/기타]
- 최대 크기: [MB]
- 허용 확장자: [목록]
- 저장 위치: [로컬/S3]

## 백엔드
- 엔드포인트: POST /api/v1/[경로]/upload/
- 파일 필드: [필드명]
- 검증: [크기, 타입, 보안]
- 저장: [django-storages/로컬]

## 프론트엔드
- UI: [드래그앤드롭/버튼]
- 미리보기: [썸네일/파일명]
- 진행률: [프로그레스바]
- 에러 표시: [토스트/인라인]

## 제약조건
- 악성 파일 검증
- 이미지 리사이징 (필요시)
- CDN 캐싱 헤더 설정 (필요시)
```

---

### DEV-I06: 페이지네이션 구현

**목적:** 대량 데이터 효율적 로딩

**프롬프트:**
```
InterfaceHive [리소스] 목록에 페이지네이션을 구현해줘.

## 페이지네이션 타입
- [ ] 오프셋 기반 (page, page_size)
- [ ] 커서 기반 (infinite scroll)

## 백엔드
- PageNumberPagination / CursorPagination
- 기본 page_size: [숫자]
- 최대 page_size: [숫자]

## 프론트엔드
- UI: [페이지 번호/더보기 버튼/무한스크롤]
- 로딩 상태: [스피너/스켈레톤]
- URL 동기화: [페이지 번호 쿼리스트링]

## TanStack Query
- useInfiniteQuery 활용 (무한스크롤)
- 또는 page 파라미터 쿼리
```

---

### DEV-I07: 다국어(i18n) 지원 추가

**목적:** 새 페이지/기능에 다국어 적용

**프롬프트:**
```
InterfaceHive [페이지/컴포넌트]에 다국어 지원을 추가해줘.

## 대상
- 파일: [파일 경로]
- 번역 필요 텍스트: [텍스트 목록]

## 현재 i18n 구조
- 라이브러리: react-i18next
- 번역 파일: [경로]
- 지원 언어: [ko, en, ...]

## 번역 키 구조
```json
{
  "[네임스페이스]": {
    "[키]": "[한국어]",
    "[키]": "[한국어]"
  }
}
```

## 제약조건
- 기존 번역 키 패턴 따르기
- 동적 값은 interpolation 사용
- 날짜/숫자 포맷팅 로케일 적용
```

---

## 추가 개발 프롬프트

### DEV-B08: Django Management Command 생성

**프롬프트:**
```
InterfaceHive용 Django 관리 커맨드를 생성해줘.

## 커맨드 정보
- 이름: [커맨드명]
- 위치: apps/[앱]/management/commands/[커맨드명].py
- 목적: [설명]

## 인자/옵션
- [인자명]: [필수/선택] - [설명]
- --[옵션명]: [설명]

## 실행 로직
[수행할 작업]

## 출력
[콘솔 출력 형식]

## 제약조건
- BaseCommand 상속
- self.stdout.write() 사용
- 트랜잭션 처리 (필요시)
- 드라이런 모드 지원 (필요시)
```

---

### DEV-F08: 로딩/에러 상태 컴포넌트

**프롬프트:**
```
InterfaceHive용 로딩/에러 상태 UI 컴포넌트를 생성해줘.

## 컴포넌트 종류
- [ ] LoadingSpinner: 전체 화면 스피너
- [ ] SkeletonCard: 카드 스켈레톤
- [ ] ErrorMessage: 인라인 에러
- [ ] EmptyState: 데이터 없음 상태
- [ ] ErrorBoundary: 에러 경계

## Props
```typescript
interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

interface ErrorProps {
  error: Error | null;
  onRetry?: () => void;
}

interface EmptyProps {
  title: string;
  description?: string;
  action?: ReactNode;
}
```

## 스타일
- shadcn/ui 스타일 일관성
- 다크모드 지원
- 애니메이션 적용
```

---

### DEV-I08: 대시보드/통계 기능 구현

**프롬프트:**
```
InterfaceHive에 [대상]용 대시보드/통계 기능을 구현해줘.

## 통계 항목
- [지표1]: [계산 방식] - [표시 형식]
- [지표2]: [계산 방식] - [표시 형식]

## 백엔드
- 엔드포인트: GET /api/v1/[경로]/stats/
- 집계 쿼리: [Django ORM annotate/aggregate]
- 캐싱: [Redis 캐싱 시간]

## 프론트엔드
- 차트: [Bar/Line/Pie - recharts/chart.js]
- 기간 필터: [일/주/월/년]
- 새로고침: [자동/수동]

## 응답 구조
```typescript
interface Stats {
  [지표]: number;
  trend?: {
    date: string;
    value: number;
  }[];
}
```
```

---

*다음: [02-improvement.md](./02-improvement.md) - 개선 프롬프트*
