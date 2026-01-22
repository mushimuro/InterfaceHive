# 리팩토링 프롬프트 (Refactoring Prompts)

코드 구조 개선, 디자인 패턴 적용, 중복 제거, 아키텍처 정리를 위한 프롬프트 모음입니다.

---

## 코드 구조 개선

### REF-S01: 큰 함수/메서드 분리

**목적:** 단일 책임 원칙 적용

**필수 컨텍스트:**
- 대상 함수/메서드 코드
- 현재 책임 목록
- 호출 위치

**프롬프트:**
```
InterfaceHive [함수/메서드명]을 더 작은 단위로 분리해줘.

## 현재 상황
- 위치: [파일 경로]
- 라인 수: [약 n줄]
- 문제: [복잡도/책임 과다/테스트 어려움]

## 현재 코드
```[python/typescript]
[코드 붙여넣기]
```

## 분석 요청
1. 독립적인 책임 식별
2. 추출 가능한 로직 찾기
3. 순환 복잡도 분석

## 리팩토링 원칙
- 각 함수는 한 가지 일만
- 함수명은 동작 설명
- 부작용 최소화
- 테스트 가능성 고려

## 제약조건
- 기존 동작 유지
- 호출부 수정 최소화
- 성능 저하 없이
- 직접 요청된 변경만 수행
```

**예시:**
```
InterfaceHive ProjectViewSet.create 메서드를 분리해줘.

## 현재 상황
- 위치: apps/projects/views.py
- 라인 수: 약 80줄
- 문제: 검증, 생성, 알림, 로깅이 한 메서드에 혼재

## 분석 요청
1. 검증 로직 → validate_project_data()
2. 프로젝트 생성 → create_project()
3. 관련 리소스 생성 → setup_project_resources()
4. 알림 발송 → notify_project_created()
```

---

### REF-S02: 큰 클래스 분리

**목적:** God Class 해체

**프롬프트:**
```
InterfaceHive [클래스명] 클래스를 분리해줘.

## 현재 상황
- 위치: [파일 경로]
- 메서드 수: [개수]
- 문제: [책임 과다/응집도 낮음/의존성 많음]

## 현재 책임
- [책임1]: [관련 메서드들]
- [책임2]: [관련 메서드들]
- [책임3]: [관련 메서드들]

## 분리 방안
1. [책임별 새 클래스명]
2. 의존성 주입 방식
3. 기존 인터페이스 유지 (호환성)

## 제약조건
- 단계적 분리 (한 번에 하나씩)
- 호출부 영향 최소화
- 테스트 유지/추가
```

---

### REF-S03: 컴포넌트 분리 (React)

**목적:** 컴포넌트 재사용성 및 유지보수성 향상

**프롬프트:**
```
InterfaceHive [컴포넌트명] 컴포넌트를 분리해줘.

## 현재 상황
- 위치: [파일 경로]
- JSX 라인 수: [약 n줄]
- 문제: [복잡도/재사용 불가/테스트 어려움]

## 분리 기준
### 로직 분리
- [ ] 커스텀 훅으로 추출: [상태/이펙트 로직]

### UI 분리
- [ ] 프레젠테이션 컴포넌트: [UI 부분]
- [ ] 재사용 가능한 서브 컴포넌트: [목록]

### 관심사 분리
- [ ] Container/Presenter 패턴
- [ ] Compound Components 패턴

## 분리 후 구조
```
[ParentComponent]/
├── index.tsx           # 메인 (Container)
├── [Child1].tsx        # 서브 컴포넌트
├── [Child2].tsx        # 서브 컴포넌트
├── use[Hook].ts        # 커스텀 훅
└── types.ts            # 타입 정의
```

## 제약조건
- Props drilling 최소화
- 기존 동작 유지
- 성능 영향 없이
```

---

### REF-S04: 모듈 의존성 정리

**목적:** 순환 의존성 제거, 결합도 낮추기

**프롬프트:**
```
InterfaceHive [모듈/앱] 간 의존성을 정리해줘.

## 현재 상황
- 관련 모듈: [모듈 목록]
- 문제: [순환 의존성/과도한 결합/import 복잡]

## 현재 의존성 그래프
```
[모듈A] → [모듈B] → [모듈C]
         ↖__________|  (순환!)
```

## 분석 요청
1. 순환 의존성 찾기
2. 공통 모듈 추출 기회
3. 의존성 역전 적용 지점

## 리팩토링 방안
### 순환 의존성 해결
- 인터페이스 추출
- 이벤트/시그널 사용
- 공통 모듈 분리

### 결합도 낮추기
- 의존성 주입
- 인터페이스 기반 설계
- 이벤트 드리븐

## 제약조건
- 단계적 변경
- 테스트 통과 유지
- 기존 기능 유지
```

---

## 디자인 패턴 적용

### REF-P01: Repository 패턴 적용

**목적:** 데이터 접근 로직 분리

**프롬프트:**
```
InterfaceHive [모델명] 데이터 접근에 Repository 패턴을 적용해줘.

## 현재 상황
- 모델: [모델명] (apps/[앱]/models.py)
- 문제: [View에 쿼리 직접 작성/중복 쿼리/테스트 어려움]

## Repository 구현
```python
# apps/[앱]/repositories.py

class [Model]Repository:
    """[Model] 데이터 접근 캡슐화"""

    def find_by_id(self, id: UUID) -> Optional[[Model]]:
        """ID로 조회"""
        pass

    def find_all(self, **filters) -> QuerySet[[Model]]:
        """필터링된 목록 조회"""
        pass

    def save(self, entity: [Model]) -> [Model]:
        """저장 (생성/수정)"""
        pass

    def delete(self, id: UUID) -> bool:
        """삭제"""
        pass
```

## 적용 범위
- [ ] ViewSet에서 Repository 사용
- [ ] Service 레이어에서 Repository 사용
- [ ] 테스트에서 Mock Repository

## 제약조건
- Django ORM 활용 유지
- 기존 인터페이스 호환
- 과도한 추상화 피하기
```

---

### REF-P02: Service 레이어 패턴 적용

**목적:** 비즈니스 로직 분리

**프롬프트:**
```
InterfaceHive [기능명] 비즈니스 로직을 Service 레이어로 분리해줘.

## 현재 상황
- 위치: [파일 경로]
- 문제: [View에 로직 혼재/재사용 불가/테스트 어려움]

## Service 구현
```python
# apps/[앱]/services.py

class [Feature]Service:
    """[기능] 비즈니스 로직"""

    def __init__(self, repository=None):
        self.repository = repository or [Model]Repository()

    def create_[entity](self, data: dict, user: User) -> [Model]:
        """[엔티티] 생성 로직"""
        # 검증
        # 비즈니스 규칙 적용
        # 저장
        # 사이드 이펙트 (알림 등)
        pass
```

## 적용 범위
- [ ] ViewSet: 요청 처리만
- [ ] Service: 비즈니스 로직
- [ ] Repository: 데이터 접근

## 의존성 주입
- 테스트에서 Mock 주입 가능하게

## 제약조건
- 단순한 CRUD는 직접 처리 가능
- 과도한 레이어링 피하기
- 실용적 수준 유지
```

---

### REF-P03: Factory 패턴 적용

**목적:** 객체 생성 로직 캡슐화

**프롬프트:**
```
InterfaceHive [객체명] 생성에 Factory 패턴을 적용해줘.

## 현재 상황
- 생성 위치: [여러 파일]
- 문제: [생성 로직 중복/복잡한 초기화/테스트 데이터 생성]

## Factory 구현
```python
# apps/[앱]/factories.py

class [Object]Factory:
    """[Object] 생성 팩토리"""

    @classmethod
    def create(cls, **kwargs) -> [Object]:
        """기본 생성"""
        defaults = {
            'field1': 'default_value',
            'field2': cls._generate_field2(),
        }
        defaults.update(kwargs)
        return [Object].objects.create(**defaults)

    @classmethod
    def create_with_[variant](cls, **kwargs) -> [Object]:
        """[변형] 버전 생성"""
        pass
```

## 활용
- 프로덕션 코드 생성
- 테스트 fixture 생성
- 시드 데이터 생성

## 제약조건
- factory_boy 라이브러리 활용 가능
- 테스트와 프로덕션 구분
```

---

### REF-P04: Strategy 패턴 적용

**목적:** 알고리즘/행동 교체 가능하게

**프롬프트:**
```
InterfaceHive [기능명]에 Strategy 패턴을 적용해줘.

## 현재 상황
- 위치: [파일 경로]
- 문제: [조건문 과다/확장 어려움/타입별 분기]

## 현재 코드 패턴
```python
if type == 'A':
    # A 방식 처리
elif type == 'B':
    # B 방식 처리
elif type == 'C':
    # C 방식 처리
```

## Strategy 구현
```python
from abc import ABC, abstractmethod

class [Feature]Strategy(ABC):
    @abstractmethod
    def execute(self, data: dict) -> Result:
        pass

class [Strategy]A([Feature]Strategy):
    def execute(self, data: dict) -> Result:
        # A 방식
        pass

class [Strategy]B([Feature]Strategy):
    def execute(self, data: dict) -> Result:
        # B 방식
        pass

# Context
class [Feature]Executor:
    def __init__(self, strategy: [Feature]Strategy):
        self.strategy = strategy

    def run(self, data: dict) -> Result:
        return self.strategy.execute(data)
```

## 제약조건
- 기존 동작 유지
- 새 전략 추가 용이하게
- 전략 선택 로직 분리
```

---

### REF-P05: Observer/Event 패턴 적용

**목적:** 느슨한 결합으로 이벤트 처리

**프롬프트:**
```
InterfaceHive [기능명]에 이벤트 기반 아키텍처를 적용해줘.

## 현재 상황
- 위치: [파일 경로]
- 문제: [강한 결합/직접 호출/확장 어려움]

## 이벤트 설계
### 이벤트 정의
```python
# apps/[앱]/events.py

@dataclass
class [Event]Event:
    """[이벤트] 발생 시"""
    entity_id: UUID
    user_id: UUID
    timestamp: datetime
    data: dict
```

### Django Signal 활용
```python
# apps/[앱]/signals.py

[event]_occurred = Signal()

# 발행
[event]_occurred.send(sender=self.__class__, **event_data)

# 구독
@receiver([event]_occurred)
def handle_[event](sender, **kwargs):
    pass
```

## 활용 사례
- 프로젝트 생성 → 알림 발송
- 기여 승인 → 크레딧 지급
- 사용자 가입 → 환영 이메일

## 제약조건
- 이벤트는 불변
- 핸들러는 멱등성 보장
- 순서 의존성 피하기
```

---

## 중복 제거

### REF-D01: 공통 유틸리티 추출

**목적:** 중복 코드를 재사용 가능한 유틸리티로

**프롬프트:**
```
InterfaceHive에서 중복되는 [기능명] 코드를 유틸리티로 추출해줘.

## 중복 발견 위치
- [파일1]: [라인 범위]
- [파일2]: [라인 범위]
- [파일3]: [라인 범위]

## 중복 코드
```[language]
[중복 코드 예시]
```

## 유틸리티 설계
### 위치
- 백엔드: backend/core/utils/[모듈명].py
- 프론트엔드: src/utils/[모듈명].ts

### 인터페이스
```[language]
def/function [함수명]([파라미터]) -> [반환타입]:
    """[설명]"""
    pass
```

## 적용
- 모든 중복 위치에서 유틸리티 호출
- 테스트 추가

## 제약조건
- 과도한 일반화 피하기
- 명확한 책임
- 문서화
```

---

### REF-D02: 공통 컴포넌트 추출 (React)

**목적:** UI 중복을 재사용 컴포넌트로

**프롬프트:**
```
InterfaceHive에서 중복되는 UI 패턴을 공통 컴포넌트로 추출해줘.

## 중복 발견 위치
- [컴포넌트1]: [중복 부분]
- [컴포넌트2]: [중복 부분]
- [컴포넌트3]: [중복 부분]

## 공통 컴포넌트 설계
### 파일
- src/components/[컴포넌트명].tsx

### Props
```typescript
interface [컴포넌트명]Props {
  [prop]: [타입];  // [설명]
  variant?: '[variant1]' | '[variant2]';
  children?: ReactNode;
}
```

### 변형(Variants)
- [variant1]: [스타일/동작]
- [variant2]: [스타일/동작]

## 적용
- 모든 중복 위치에서 새 컴포넌트 사용
- Storybook 문서화 (선택)

## 제약조건
- 과도한 옵션 피하기
- 합성 우선
- 접근성 유지
```

---

### REF-D03: 공통 훅 추출 (React)

**목적:** 로직 중복을 커스텀 훅으로

**프롬프트:**
```
InterfaceHive에서 중복되는 로직을 커스텀 훅으로 추출해줘.

## 중복 발견 위치
- [컴포넌트1]: [중복 로직]
- [컴포넌트2]: [중복 로직]

## 커스텀 훅 설계
### 파일
- src/hooks/use[훅명].ts

### 인터페이스
```typescript
interface Use[훅명]Options {
  [option]: [타입];
}

interface Use[훅명]Return {
  [반환값]: [타입];
  [함수명]: () => void;
}

function use[훅명](options?: Use[훅명]Options): Use[훅명]Return {
  // 훅 로직
}
```

### 활용 예시
```typescript
const { data, isLoading, error } = use[훅명]({ ... });
```

## 적용
- 모든 중복 위치에서 훅 사용
- 테스트 추가

## 제약조건
- 훅 규칙 준수
- 과도한 추상화 피하기
- 명확한 책임
```

---

### REF-D04: API 응답 표준화

**목적:** 일관된 API 응답 형식

**프롬프트:**
```
InterfaceHive API 응답 형식을 표준화해줘.

## 현재 상황
- 엔드포인트별 응답 형식 불일치
- 에러 응답 형식 다양
- 페이지네이션 구조 불일치

## 표준 응답 형식
### 성공 응답
```json
{
  "data": { ... } | [...],
  "meta": {
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total_count": 100,
      "total_pages": 5
    }
  }
}
```

### 에러 응답
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "사용자 친화적 메시지",
    "details": { ... }
  }
}
```

## 구현
### 백엔드
```python
# core/response.py
class StandardResponse:
    @staticmethod
    def success(data, meta=None):
        pass

    @staticmethod
    def error(code, message, details=None):
        pass
```

### 프론트엔드
```typescript
// api/types.ts
interface ApiResponse<T> {
  data: T;
  meta?: Meta;
}

interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}
```

## 제약조건
- 기존 API 호환성 유지 (점진적 적용)
- DRF 표준과 조화
- 문서화
```

---

## 아키텍처 정리

### REF-A01: 레이어드 아키텍처 정리

**목적:** 관심사 분리, 레이어 간 책임 명확화

**프롬프트:**
```
InterfaceHive [앱/모듈]의 레이어드 아키텍처를 정리해줘.

## 현재 상황
- 앱: apps/[앱명]/
- 문제: [레이어 혼재/책임 불명확/의존성 역전]

## 목표 구조
```
apps/[앱명]/
├── models.py          # 도메인 모델 (최하위)
├── repositories.py    # 데이터 접근
├── services.py        # 비즈니스 로직
├── serializers.py     # 직렬화/검증
├── views.py           # HTTP 처리 (최상위)
├── urls.py            # 라우팅
├── tasks.py           # 비동기 작업
├── signals.py         # 이벤트 핸들러
└── tests/             # 테스트
```

## 의존성 방향
```
views → services → repositories → models
                 ↘ serializers ↙
```

## 리팩토링 단계
1. [ ] 현재 구조 분석
2. [ ] 레이어별 파일 분리
3. [ ] 의존성 정리
4. [ ] 테스트 확인

## 제약조건
- 점진적 변경
- 기존 기능 유지
- 과도한 추상화 피하기
```

---

### REF-A02: 모듈 경계 정리

**목적:** 앱 간 책임과 경계 명확화

**프롬프트:**
```
InterfaceHive Django 앱 간 경계를 정리해줘.

## 현재 앱 구조
```
backend/apps/
├── users/          # 사용자
├── projects/       # 프로젝트
├── contributions/  # 기여
├── credits/        # 크레딧
├── badges/         # 뱃지
├── moderation/     # 관리
├── chat/           # 채팅
└── ai_agent/       # AI
```

## 분석 요청
1. 각 앱의 핵심 책임 정의
2. 앱 간 의존성 맵핑
3. 경계 위반 식별

## 정리 원칙
### 앱 간 통신
- 직접 import 최소화
- Signal/Event 활용
- 서비스 인터페이스 통해

### 공유 코드
- core/ 앱 활용
- 추상 클래스/믹스인

## 제약조건
- 단계적 변경
- 기존 기능 유지
- 순환 의존성 제거
```

---

### REF-A03: 프론트엔드 폴더 구조 정리

**목적:** 확장 가능한 폴더 구조

**프롬프트:**
```
InterfaceHive 프론트엔드 폴더 구조를 정리해줘.

## 현재 구조
```
frontend/src/
├── api/
├── components/
├── contexts/
├── hooks/
├── pages/
├── schemas/
└── styles/
```

## 목표 구조 (Feature-based)
```
frontend/src/
├── features/           # 기능 모듈
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api.ts
│   │   └── index.ts
│   ├── projects/
│   └── contributions/
├── components/         # 공통 UI
│   ├── ui/            # 기본 UI (shadcn)
│   └── common/        # 공통 컴포넌트
├── lib/               # 유틸리티
├── hooks/             # 공통 훅
├── api/               # API 클라이언트
└── App.tsx
```

## 마이그레이션 계획
1. [ ] 새 구조 생성
2. [ ] 파일 이동 (기능별)
3. [ ] import 경로 수정
4. [ ] 빌드 확인

## 제약조건
- 기존 기능 유지
- 점진적 마이그레이션
- 공통 컴포넌트 재사용
```

---

### REF-A04: API 버저닝 정리

**목적:** API 버전 관리 체계화

**프롬프트:**
```
InterfaceHive API 버저닝 전략을 정리해줘.

## 현재 상황
- URL: /api/v1/
- 문제: [버전 관리 부재/호환성 이슈]

## 버저닝 전략
### URL 기반
```
/api/v1/projects/
/api/v2/projects/  # Breaking change 시
```

### 구현 구조
```
backend/
├── api/
│   ├── v1/
│   │   ├── urls.py
│   │   ├── views.py
│   │   └── serializers.py
│   └── v2/
│       └── ...
└── config/urls.py
```

## 버전 정책
- 하위 호환 변경: 같은 버전 유지
- Breaking change: 새 버전 추가
- 지원 종료: 최소 3개월 공지

## 마이그레이션 가이드
- 클라이언트 버전 업그레이드 가이드
- 폐기 예정(Deprecation) 헤더

## 제약조건
- 기존 v1 클라이언트 호환
- 점진적 전환
- 문서화
```

---

### REF-A05: 설정 관리 정리

**목적:** 환경별 설정 체계화

**프롬프트:**
```
InterfaceHive 설정 관리를 정리해줘.

## 현재 상황
- settings.py 크기: [약 n줄]
- 문제: [환경 구분 어려움/민감 정보 혼재/설정 분산]

## 목표 구조
```
backend/config/
├── settings/
│   ├── __init__.py      # 환경별 로드
│   ├── base.py          # 공통 설정
│   ├── development.py   # 개발 환경
│   ├── production.py    # 프로덕션
│   └── testing.py       # 테스트
├── .env.example         # 환경 변수 템플릿
└── .env                  # 실제 환경 변수 (git 제외)
```

## 환경 변수 관리
```python
# .env
DATABASE_URL=postgresql://...
SECRET_KEY=...
DEBUG=True/False
```

```python
# settings/base.py
import environ
env = environ.Env()
DATABASE_URL = env('DATABASE_URL')
```

## 검증
- 필수 환경 변수 체크
- 타입 변환
- 기본값 처리

## 제약조건
- 민감 정보 .env로
- 환경별 차이 최소화
- 문서화
```

---

*다음: [04-ideation.md](./04-ideation.md) - 아이디에이션 프롬프트*
