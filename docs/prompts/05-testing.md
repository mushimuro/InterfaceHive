# 테스트 프롬프트 (Testing Prompts)

단위 테스트, 통합 테스트, E2E 테스트, 테스트 커버리지 개선을 위한 프롬프트 모음입니다.

---

## 단위 테스트

### TEST-U01: Django 모델 테스트

**목적:** 모델 비즈니스 로직 검증

**프롬프트:**
```
InterfaceHive [모델명] 모델의 단위 테스트를 작성해줘.

## 테스트 대상
- 모델: [모델명] (apps/[앱]/models.py)
- 테스트 파일: apps/[앱]/tests/test_models.py

## 모델 코드
```python
[모델 코드 붙여넣기]
```

## 테스트 범위
### 필드 검증
- [ ] 필수 필드 검증
- [ ] 기본값 확인
- [ ] 제약조건 (unique, max_length 등)
- [ ] 선택 필드 (choices)

### 관계
- [ ] ForeignKey 관계
- [ ] ManyToMany 관계
- [ ] 역참조 (related_name)

### 커스텀 로직
- [ ] 커스텀 메서드
- [ ] 프로퍼티
- [ ] save() 오버라이드
- [ ] clean() 검증
- [ ] Manager 메서드

### 시그널
- [ ] pre_save/post_save 동작

## pytest 설정
```python
import pytest
from apps.[앱].models import [Model]

@pytest.fixture
def [fixture_name]():
    return [Model].objects.create(...)
```

## 제약조건
- pytest + pytest-django 사용
- Factory 패턴 활용 권장
- 각 테스트는 독립적으로
- 명확한 테스트 이름
```

**예시:**
```
InterfaceHive Project 모델의 단위 테스트를 작성해줘.

## 테스트 범위
- 필드: title, description, status, difficulty
- 관계: host_user (ForeignKey)
- 커스텀 메서드: is_open(), get_contribution_count()
- Manager: active(), by_difficulty()
```

---

### TEST-U02: Serializer 테스트

**목적:** 직렬화/역직렬화 로직 검증

**프롬프트:**
```
InterfaceHive [Serializer명] Serializer의 단위 테스트를 작성해줘.

## 테스트 대상
- Serializer: [Serializer명] (apps/[앱]/serializers.py)
- 테스트 파일: apps/[앱]/tests/test_serializers.py

## Serializer 코드
```python
[Serializer 코드 붙여넣기]
```

## 테스트 범위
### 직렬화 (출력)
- [ ] 모든 필드 포함 확인
- [ ] 중첩 객체 형식
- [ ] SerializerMethodField 결과

### 역직렬화 (입력)
- [ ] 유효한 데이터 처리
- [ ] 필수 필드 누락
- [ ] 잘못된 타입
- [ ] 커스텀 검증 (validate_[field])

### 생성/수정
- [ ] create() 동작
- [ ] update() 동작

## 테스트 구조
```python
class Test[Serializer]Serialization:
    """직렬화 테스트"""

class Test[Serializer]Deserialization:
    """역직렬화 테스트"""

class Test[Serializer]Validation:
    """검증 테스트"""
```

## 제약조건
- 경계값 테스트 포함
- 에러 메시지 검증
- 실제 모델 인스턴스 활용
```

---

### TEST-U03: Service 레이어 테스트

**목적:** 비즈니스 로직 검증

**프롬프트:**
```
InterfaceHive [Service명] Service의 단위 테스트를 작성해줘.

## 테스트 대상
- Service: [Service명] (apps/[앱]/services.py)
- 테스트 파일: apps/[앱]/tests/test_services.py

## Service 코드
```python
[Service 코드 붙여넣기]
```

## 테스트 범위
### 정상 케이스
- [ ] 기본 동작
- [ ] 다양한 입력 조합
- [ ] 반환값 검증

### 예외 케이스
- [ ] 유효하지 않은 입력
- [ ] 권한 없음
- [ ] 리소스 없음
- [ ] 비즈니스 규칙 위반

### 부작용
- [ ] DB 상태 변화
- [ ] 알림 발송
- [ ] 외부 API 호출 (Mock)

## Mock 활용
```python
from unittest.mock import Mock, patch

@patch('apps.[앱].services.[dependency]')
def test_service_calls_dependency(self, mock_dep):
    mock_dep.return_value = ...
```

## 제약조건
- 외부 의존성 Mock
- 각 테스트 독립적
- 의미 있는 assertion
```

---

### TEST-U04: React 컴포넌트 테스트

**목적:** UI 컴포넌트 동작 검증

**프롬프트:**
```
InterfaceHive [컴포넌트명] 컴포넌트의 단위 테스트를 작성해줘.

## 테스트 대상
- 컴포넌트: [컴포넌트명] (src/components/[경로])
- 테스트 파일: src/components/[경로]/__tests__/[컴포넌트명].test.tsx

## 컴포넌트 코드
```typescript
[컴포넌트 코드 붙여넣기]
```

## 테스트 범위
### 렌더링
- [ ] 기본 렌더링
- [ ] Props별 렌더링
- [ ] 조건부 렌더링
- [ ] 로딩/에러 상태

### 인터랙션
- [ ] 클릭 이벤트
- [ ] 폼 입력
- [ ] 키보드 이벤트

### Props
- [ ] 기본값 동작
- [ ] 콜백 호출

## 테스트 도구
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { [Component] } from './[Component]';

describe('[Component]', () => {
  it('renders correctly', () => {
    render(<[Component] />);
    expect(screen.getByRole('...')).toBeInTheDocument();
  });
});
```

## 제약조건
- React Testing Library 사용
- 구현 세부사항 아닌 동작 테스트
- 접근성 쿼리 우선
```

---

### TEST-U05: 커스텀 훅 테스트

**목적:** React 훅 로직 검증

**프롬프트:**
```
InterfaceHive use[훅명] 훅의 단위 테스트를 작성해줘.

## 테스트 대상
- 훅: use[훅명] (src/hooks/use[훅명].ts)
- 테스트 파일: src/hooks/__tests__/use[훅명].test.ts

## 훅 코드
```typescript
[훅 코드 붙여넣기]
```

## 테스트 범위
### 초기 상태
- [ ] 초기 반환값

### 상태 변화
- [ ] 액션 후 상태
- [ ] 여러 액션 시퀀스

### 이펙트
- [ ] API 호출
- [ ] 클린업

## 테스트 도구
```typescript
import { renderHook, act } from '@testing-library/react';
import { use[Hook] } from './use[Hook]';

describe('use[Hook]', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => use[Hook]());
    expect(result.current.value).toBe(...);
  });

  it('updates state on action', async () => {
    const { result } = renderHook(() => use[Hook]());
    await act(async () => {
      result.current.action();
    });
    expect(result.current.value).toBe(...);
  });
});
```

## 제약조건
- @testing-library/react 사용
- act() 래핑 필수
- 비동기 처리 주의
```

---

### TEST-U06: 유틸리티 함수 테스트

**목적:** 순수 함수 검증

**프롬프트:**
```
InterfaceHive [유틸명] 유틸리티 함수의 단위 테스트를 작성해줘.

## 테스트 대상
- 파일: [src/utils 또는 backend/core/utils]/[파일명]
- 테스트 파일: [경로]/__tests__/[파일명].test.[ts/py]

## 함수 코드
```[language]
[함수 코드 붙여넣기]
```

## 테스트 범위
### 정상 입력
- [ ] 일반적인 케이스
- [ ] 다양한 입력 타입

### 경계값
- [ ] 빈 값
- [ ] 최소/최대값
- [ ] null/undefined

### 에러 케이스
- [ ] 잘못된 타입
- [ ] 범위 초과

## 테스트 구조
```[language]
describe('[functionName]', () => {
  describe('valid inputs', () => {
    it.each([
      [input1, expected1],
      [input2, expected2],
    ])('returns %s for input %s', (input, expected) => {
      expect([functionName](input)).toBe(expected);
    });
  });

  describe('edge cases', () => {
    // 경계값 테스트
  });
});
```

## 제약조건
- 테이블 기반 테스트 활용
- 순수 함수 특성 활용
- 문서화 역할
```

---

## 통합 테스트

### TEST-I01: API 엔드포인트 테스트

**목적:** API 전체 흐름 검증

**프롬프트:**
```
InterfaceHive [엔드포인트] API의 통합 테스트를 작성해줘.

## 테스트 대상
- 엔드포인트: [METHOD] /api/v1/[경로]/
- View: apps/[앱]/views.py
- 테스트 파일: apps/[앱]/tests/test_views.py

## 테스트 범위
### CRUD 작업
- [ ] Create (POST)
- [ ] Read (GET list/detail)
- [ ] Update (PUT/PATCH)
- [ ] Delete (DELETE)

### 인증/인가
- [ ] 미인증 요청
- [ ] 인증된 요청
- [ ] 권한 없는 요청
- [ ] 소유자 권한

### 응답 형식
- [ ] 성공 응답 구조
- [ ] 에러 응답 구조
- [ ] HTTP 상태 코드

### 검증
- [ ] 입력 검증 에러
- [ ] 비즈니스 규칙 에러

## 테스트 구조
```python
import pytest
from rest_framework.test import APIClient

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def authenticated_client(api_client, user):
    api_client.force_authenticate(user=user)
    return api_client

class TestProjectListAPI:
    def test_list_projects_returns_paginated_response(self, api_client):
        response = api_client.get('/api/v1/projects/')
        assert response.status_code == 200
        assert 'results' in response.data
```

## 제약조건
- 실제 DB 사용 (테스트 DB)
- 인증 상태별 테스트
- 응답 구조 검증
```

---

### TEST-I02: 데이터베이스 통합 테스트

**목적:** DB 연동 로직 검증

**프롬프트:**
```
InterfaceHive [기능명] 데이터베이스 통합을 테스트해줘.

## 테스트 대상
- 기능: [기능 설명]
- 관련 모델: [모델 목록]

## 테스트 범위
### 트랜잭션
- [ ] 성공 시 커밋
- [ ] 실패 시 롤백
- [ ] 부분 실패 처리

### 동시성
- [ ] 동시 쓰기
- [ ] 레이스 컨디션
- [ ] 락 동작

### 무결성
- [ ] FK 제약
- [ ] Unique 제약
- [ ] Check 제약

## 테스트 구조
```python
import pytest
from django.db import transaction

@pytest.mark.django_db(transaction=True)
def test_atomic_operation():
    with transaction.atomic():
        # 작업 수행
        pass
    # 검증
```

## 제약조건
- @pytest.mark.django_db 사용
- 트랜잭션 테스트 시 transaction=True
- 테스트 간 격리 보장
```

---

### TEST-I03: 캐싱 통합 테스트

**목적:** Redis 캐싱 동작 검증

**프롬프트:**
```
InterfaceHive [기능명] 캐싱의 통합 테스트를 작성해줘.

## 테스트 대상
- 캐싱 대상: [함수/뷰]
- 캐시 키: [키 패턴]
- TTL: [만료 시간]

## 테스트 범위
### 캐시 동작
- [ ] 캐시 미스 → 저장
- [ ] 캐시 히트 → 반환
- [ ] TTL 후 만료

### 캐시 무효화
- [ ] 수동 무효화
- [ ] 자동 무효화 (업데이트 시)

### 캐시 키
- [ ] 키 생성 규칙
- [ ] 파라미터별 분리

## 테스트 구조
```python
import pytest
from django.core.cache import cache

@pytest.fixture(autouse=True)
def clear_cache():
    cache.clear()
    yield
    cache.clear()

def test_caches_result():
    result1 = expensive_function()
    result2 = expensive_function()
    # 같은 결과, DB 호출 1회
```

## 제약조건
- 테스트 전후 캐시 클리어
- 캐시 히트/미스 구분
- 실제 Redis 또는 로컬 캐시
```

---

### TEST-I04: WebSocket 통합 테스트

**목적:** 실시간 통신 검증

**프롬프트:**
```
InterfaceHive [Consumer명] WebSocket의 통합 테스트를 작성해줘.

## 테스트 대상
- Consumer: [Consumer명] (apps/[앱]/consumers.py)
- 경로: ws://localhost/ws/[경로]/

## 테스트 범위
### 연결
- [ ] 인증된 연결
- [ ] 미인증 거부
- [ ] 연결 해제

### 메시지
- [ ] 메시지 수신
- [ ] 메시지 발신
- [ ] 브로드캐스트

### 그룹
- [ ] 그룹 조인
- [ ] 그룹 메시지
- [ ] 그룹 탈퇴

## 테스트 구조
```python
import pytest
from channels.testing import WebsocketCommunicator
from apps.[앱].consumers import [Consumer]

@pytest.mark.asyncio
async def test_connect():
    communicator = WebsocketCommunicator(
        [Consumer].as_asgi(),
        "/ws/[path]/"
    )
    connected, _ = await communicator.connect()
    assert connected
    await communicator.disconnect()

@pytest.mark.asyncio
async def test_receive_message():
    communicator = WebsocketCommunicator(...)
    await communicator.connect()
    await communicator.send_json_to({"type": "message", "data": "test"})
    response = await communicator.receive_json_from()
    assert response["type"] == "message"
```

## 제약조건
- pytest-asyncio 사용
- WebsocketCommunicator 활용
- 인증 미들웨어 처리
```

---

## E2E 테스트

### TEST-E01: 사용자 플로우 E2E 테스트

**목적:** 전체 사용자 시나리오 검증

**프롬프트:**
```
InterfaceHive [플로우명] 사용자 플로우의 E2E 테스트를 작성해줘.

## 테스트 대상
- 플로우: [플로우 설명]
- 페이지: [관련 페이지 목록]
- 테스트 파일: e2e/tests/[플로우명].spec.ts

## 시나리오
1. [단계1]
2. [단계2]
3. [단계3]
...

## 테스트 범위
### Happy Path
- 정상적인 플로우 완료

### 에러 케이스
- 필수 입력 누락
- 잘못된 데이터
- 서버 에러

### Edge 케이스
- 세션 만료
- 동시 조작

## Playwright 테스트
```typescript
import { test, expect } from '@playwright/test';

test.describe('[Flow Name]', () => {
  test.beforeEach(async ({ page }) => {
    // 공통 설정
  });

  test('completes flow successfully', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("시작")');
    await page.fill('[name="email"]', 'test@example.com');
    await page.click('button:has-text("제출")');
    await expect(page.locator('.success')).toBeVisible();
  });
});
```

## 제약조건
- Playwright 사용
- 실제 브라우저 테스트
- 테스트 데이터 시드
- 스크린샷 캡처
```

**예시:**
```
InterfaceHive "프로젝트 생성 및 기여자 모집" 플로우의 E2E 테스트를 작성해줘.

## 시나리오
1. 호스트로 로그인
2. "프로젝트 만들기" 클릭
3. 프로젝트 정보 입력
4. 제출
5. 프로젝트 상세 페이지 확인
6. 기여자 모집 상태 확인
```

---

### TEST-E02: 인증 플로우 E2E 테스트

**목적:** 인증 관련 전체 플로우 검증

**프롬프트:**
```
InterfaceHive 인증 플로우의 E2E 테스트를 작성해줘.

## 테스트 범위
### 회원가입
- [ ] 정상 가입
- [ ] 중복 이메일
- [ ] 약한 비밀번호
- [ ] 이메일 인증

### 로그인
- [ ] 정상 로그인
- [ ] 잘못된 자격증명
- [ ] 미인증 이메일

### 로그아웃
- [ ] 정상 로그아웃
- [ ] 세션 정리

### 비밀번호
- [ ] 비밀번호 찾기
- [ ] 비밀번호 재설정

## 테스트 구조
```typescript
test.describe('Authentication', () => {
  test.describe('Registration', () => {
    test('registers new user', async ({ page }) => {
      await page.goto('/register');
      await page.fill('[name="email"]', 'new@test.com');
      await page.fill('[name="password"]', 'SecurePass123!');
      await page.click('button[type="submit"]');
      await expect(page.locator('.verification-sent')).toBeVisible();
    });
  });

  test.describe('Login', () => {
    test('logs in with valid credentials', async ({ page }) => {
      // ...
    });
  });
});
```

## 제약조건
- 테스트 사용자 데이터 준비
- 이메일 인증 모킹
- 세션/쿠키 관리
```

---

### TEST-E03: 반응형 테스트

**목적:** 다양한 화면 크기에서 동작 검증

**프롬프트:**
```
InterfaceHive [페이지명] 페이지의 반응형 E2E 테스트를 작성해줘.

## 테스트 대상
- 페이지: [페이지 URL]
- 컴포넌트: [주요 컴포넌트]

## 테스트 화면 크기
- Mobile: 375x667 (iPhone SE)
- Tablet: 768x1024 (iPad)
- Desktop: 1440x900

## 테스트 범위
### 레이아웃
- [ ] 요소 배치
- [ ] 그리드/플렉스 동작
- [ ] 숨김/표시 요소

### 네비게이션
- [ ] 모바일 메뉴
- [ ] 햄버거 메뉴 동작

### 인터랙션
- [ ] 터치 타겟 크기
- [ ] 스와이프 제스처

## Playwright 설정
```typescript
import { devices } from '@playwright/test';

const config = {
  projects: [
    { name: 'Mobile', use: devices['iPhone 12'] },
    { name: 'Tablet', use: devices['iPad'] },
    { name: 'Desktop', use: { viewport: { width: 1440, height: 900 } } },
  ],
};

test('shows mobile menu on small screens', async ({ page, isMobile }) => {
  await page.goto('/');
  if (isMobile) {
    await expect(page.locator('.hamburger')).toBeVisible();
    await page.click('.hamburger');
    await expect(page.locator('.mobile-nav')).toBeVisible();
  } else {
    await expect(page.locator('.desktop-nav')).toBeVisible();
  }
});
```

## 제약조건
- 다중 디바이스 설정
- 시각적 회귀 테스트
- 스크린샷 비교
```

---

### TEST-E04: 접근성 E2E 테스트

**목적:** 접근성 요구사항 자동 검증

**프롬프트:**
```
InterfaceHive [페이지명] 페이지의 접근성 E2E 테스트를 작성해줘.

## 테스트 대상
- 페이지: [페이지 URL]
- WCAG 수준: 2.1 AA

## 테스트 범위
### 자동화 가능
- [ ] 색상 대비
- [ ] alt 텍스트
- [ ] 레이블 연결
- [ ] ARIA 속성

### 키보드 네비게이션
- [ ] Tab 순서
- [ ] 포커스 표시
- [ ] 트랩 방지

### 스크린리더
- [ ] 제목 구조
- [ ] 랜드마크
- [ ] 라이브 영역

## axe-core 통합
```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('has no accessibility violations', async ({ page }) => {
  await page.goto('/projects');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  expect(results.violations).toEqual([]);
});
```

## 제약조건
- axe-core 사용
- WCAG 2.1 AA 기준
- 위반 사항 상세 리포트
```

---

## 테스트 커버리지

### TEST-C01: 커버리지 분석 및 개선

**목적:** 테스트 커버리지 확인 및 갭 식별

**프롬프트:**
```
InterfaceHive [앱/모듈]의 테스트 커버리지를 분석하고 개선해줘.

## 현재 상황
- 앱: apps/[앱]/
- 현재 커버리지: [%] (있다면)
- 목표 커버리지: [%]

## 커버리지 측정
### 백엔드
```bash
pytest apps/[앱]/ --cov=apps/[앱] --cov-report=html
```

### 프론트엔드
```bash
npm run test:coverage -- --collectCoverageFrom='src/[경로]/**'
```

## 분석 요청
1. 커버리지 낮은 파일/함수 식별
2. 테스트 누락된 중요 로직
3. 테스트 불필요한 코드 (데드 코드)

## 개선 우선순위
### 높음
- 비즈니스 핵심 로직
- 금융/결제 관련
- 인증/보안 관련

### 중간
- API 엔드포인트
- 데이터 변환

### 낮음
- 단순 CRUD
- 유틸리티

## 제약조건
- 커버리지 숫자보다 품질
- 의미 있는 assertion
- 유지보수 가능한 테스트
```

---

### TEST-C02: 누락된 테스트 케이스 추가

**목적:** 테스트 갭 해소

**프롬프트:**
```
InterfaceHive [파일명]의 누락된 테스트 케이스를 추가해줘.

## 대상 코드
```[language]
[코드 붙여넣기]
```

## 현재 테스트
```[language]
[현재 테스트 코드 붙여넣기]
```

## 분석 요청
1. 테스트되지 않은 분기 (if/else, try/catch)
2. 테스트되지 않은 엣지 케이스
3. 테스트되지 않은 에러 경로

## 추가할 테스트
### 엣지 케이스
- 빈 입력
- null/undefined
- 최대/최소값

### 에러 케이스
- 예외 발생
- 유효하지 않은 상태

### 통합 케이스
- 실제 사용 시나리오

## 제약조건
- 기존 테스트 스타일 유지
- 의미 있는 테스트 이름
- 하나의 assertion에 하나의 개념
```

---

### TEST-C03: 테스트 리팩토링

**목적:** 테스트 코드 품질 개선

**프롬프트:**
```
InterfaceHive [테스트파일]의 테스트 코드를 리팩토링해줘.

## 현재 테스트
```[language]
[테스트 코드 붙여넣기]
```

## 개선 영역
### 가독성
- [ ] 의미 있는 테스트 이름
- [ ] Arrange-Act-Assert 패턴
- [ ] 주석 대신 명확한 코드

### 유지보수성
- [ ] 중복 제거 (fixture, helper)
- [ ] 테스트 간 독립성
- [ ] 불필요한 Mock 제거

### 실행 속도
- [ ] 느린 테스트 최적화
- [ ] 병렬 실행 가능하게
- [ ] 불필요한 setup 제거

### 신뢰성
- [ ] Flaky 테스트 수정
- [ ] 시간 의존성 제거
- [ ] 외부 의존성 격리

## 제약조건
- 테스트 결과 동일 유지
- 커버리지 유지
- 점진적 개선
```

---

### TEST-C04: 성능 테스트 추가

**목적:** 성능 회귀 방지

**프롬프트:**
```
InterfaceHive [기능/엔드포인트]의 성능 테스트를 추가해줘.

## 테스트 대상
- 대상: [엔드포인트/함수]
- 현재 성능: [ms]
- 목표 성능: [ms]

## 테스트 유형
### 부하 테스트
- 동시 사용자: [수]
- 요청률: [req/s]
- 지속 시간: [분]

### 스트레스 테스트
- 최대 부하 찾기
- 회복 시간 측정

### 벤치마크
- 함수 실행 시간
- 메모리 사용량
- 쿼리 수

## 도구
### locust (Python)
```python
from locust import HttpUser, task, between

class WebsiteUser(HttpUser):
    wait_time = between(1, 5)

    @task
    def get_projects(self):
        self.client.get("/api/v1/projects/")
```

### k6 (JavaScript)
```javascript
import http from 'k6/http';
import { check } from 'k6';

export default function () {
  const res = http.get('http://localhost:8000/api/v1/projects/');
  check(res, { 'status is 200': (r) => r.status === 200 });
}
```

## 임계값
- P95 응답시간: [ms]
- 에러율: [%] 이하
- 처리량: [req/s] 이상

## 제약조건
- CI 통합 가능
- 반복 가능한 환경
- 결과 시각화
```

---

## 테스트 자동화

### TEST-A01: CI 파이프라인 테스트 설정

**목적:** 지속적 테스트 자동화

**프롬프트:**
```
InterfaceHive의 CI 파이프라인에 테스트를 설정해줘.

## CI 환경
- 플랫폼: [GitHub Actions/GitLab CI/...]
- 현재 설정: [있다면]

## 테스트 단계
### 1. 린트/포맷
```yaml
- name: Lint
  run: |
    black --check .
    flake8
    npm run lint
```

### 2. 단위 테스트
```yaml
- name: Unit Tests
  run: |
    pytest apps/ --cov --cov-report=xml
    npm run test:ci
```

### 3. 통합 테스트
```yaml
- name: Integration Tests
  services:
    postgres:
      image: postgres:16
    redis:
      image: redis:7
  run: pytest -m integration
```

### 4. E2E 테스트
```yaml
- name: E2E Tests
  run: npx playwright test
```

## 최적화
- 캐싱: 의존성, 빌드
- 병렬화: 테스트 분할
- 조건부 실행: 변경된 파일만

## 제약조건
- PR마다 실행
- 실패 시 상세 리포트
- 커버리지 리포트 업로드
```

---

*다음: [templates/](./templates/) - 재사용 가능한 프롬프트 템플릿*
