# 성능 최적화 템플릿 (Performance Optimization Template)

성능 문제를 분석하고 최적화할 때 사용하는 종합 템플릿입니다.

---

## 최적화 정보 입력

| 항목 | 값 |
|------|---|
| 최적화 대상 | |
| 현재 성능 | |
| 목표 성능 | |
| 우선순위 | 높음 / 중간 / 낮음 |
| 유형 | 백엔드 / 프론트엔드 / 데이터베이스 |

---

## Phase 1: 성능 측정

### 1.1 백엔드 성능 측정

```
InterfaceHive [엔드포인트/기능]의 성능을 측정해줘.

## 측정 대상
- 엔드포인트: [METHOD /api/v1/...]
- 파일: [파일 경로]

## 측정 환경
- 데이터 규모: [레코드 수]
- 동시 요청: [수]
- 환경: [로컬/스테이징/프로덕션]

## 측정 항목
### 응답 시간
- 현재: [ms]
- 목표: [ms]

### 쿼리 분석
```python
# django-debug-toolbar 또는
from django.db import connection
print(len(connection.queries))
```

### 프로파일링
```python
import cProfile
cProfile.run('[function]()')
```

## 측정 결과
- 총 응답 시간: [ms]
- DB 쿼리 수: [개]
- DB 쿼리 시간: [ms]
- Python 처리 시간: [ms]
```

### 1.2 프론트엔드 성능 측정

```
InterfaceHive [페이지/컴포넌트]의 성능을 측정해줘.

## 측정 대상
- 페이지: [URL]
- 컴포넌트: [컴포넌트명]

## 측정 도구
- Chrome DevTools Performance
- React DevTools Profiler
- Lighthouse

## 측정 항목
### Core Web Vitals
- LCP (Largest Contentful Paint): [초]
- FID (First Input Delay): [ms]
- CLS (Cumulative Layout Shift): [점수]

### 번들 크기
- 총 번들: [KB]
- 초기 로드: [KB]

### 렌더링
- 첫 렌더링: [ms]
- 리렌더링 횟수: [회]

## 목표
- LCP: 2.5초 이하
- FID: 100ms 이하
- CLS: 0.1 이하
```

### 1.3 데이터베이스 성능 측정

```
InterfaceHive [쿼리/테이블]의 성능을 분석해줘.

## 분석 대상
- 쿼리: [SQL 또는 ORM]
- 테이블: [테이블명]
- 데이터 규모: [레코드 수]

## EXPLAIN ANALYZE
```sql
EXPLAIN ANALYZE [쿼리];
```

## 분석 항목
- 실행 계획
- 인덱스 사용 여부
- 풀 테이블 스캔
- 조인 비용

## 인덱스 현황
```sql
\d+ [테이블명]
```
```

---

## Phase 2: 병목 분석

### 프롬프트

```
[대상]의 성능 병목을 분석해줘.

## 측정 결과
[Phase 1 결과 요약]

## 분석 요청
### 가장 느린 부분
1. [부분]: [시간]
2. [부분]: [시간]

### 병목 원인 추론
- N+1 쿼리 문제?
- 인덱스 누락?
- 불필요한 데이터 로딩?
- 동기 처리로 인한 블로킹?
- 메모리 이슈?
- 네트워크 병목?

### 코드 분석
```[language]
[관련 코드]
```

## 출력 형식
- 병목 부분 식별
- 원인 설명
- 최적화 우선순위
```

---

## Phase 3: 최적화 전략

### 3.1 백엔드 최적화 전략

```
[엔드포인트] 백엔드 최적화 전략을 제안해줘.

## 병목 분석 결과
[Phase 2 결과]

## 최적화 영역
### 데이터베이스 쿼리
- [ ] select_related / prefetch_related
- [ ] 필요한 필드만 조회 (only/defer)
- [ ] 인덱스 추가
- [ ] 쿼리 통합

### 캐싱
- [ ] 쿼리 결과 캐싱 (Redis)
- [ ] 뷰 캐싱 (@cache_page)
- [ ] 객체 캐싱

### 비동기 처리
- [ ] Celery 태스크 분리
- [ ] 백그라운드 처리

### 데이터 페이지네이션
- [ ] 커서 기반 페이지네이션
- [ ] 무한 스크롤

## 각 전략별 예상 효과
- [전략 1]: [예상 개선율]
- [전략 2]: [예상 개선율]

## 권장 우선순위
1. [첫 번째 최적화]
2. [두 번째 최적화]
```

### 3.2 프론트엔드 최적화 전략

```
[페이지/컴포넌트] 프론트엔드 최적화 전략을 제안해줘.

## 병목 분석 결과
[Phase 2 결과]

## 최적화 영역
### 번들 최적화
- [ ] 코드 스플리팅 (React.lazy)
- [ ] 트리 쉐이킹
- [ ] 라이브러리 대체
- [ ] 동적 import

### 렌더링 최적화
- [ ] React.memo
- [ ] useMemo / useCallback
- [ ] 컴포넌트 분할
- [ ] 가상화 (react-window)

### 데이터 로딩
- [ ] 지연 로딩
- [ ] 프리페칭
- [ ] 캐싱 전략

### 이미지/미디어
- [ ] 이미지 최적화
- [ ] 지연 로딩
- [ ] CDN 사용

## 권장 우선순위
1. [첫 번째 최적화]
2. [두 번째 최적화]
```

---

## Phase 4: 최적화 구현

### 4.1 쿼리 최적화 구현

```
[엔드포인트]의 쿼리를 최적화해줘.

## 현재 코드
```python
[현재 쿼리 코드]
```

## 문제점
- 쿼리 수: [현재] → 목표: [목표]
- 응답 시간: [현재] → 목표: [목표]

## 최적화 적용
### select_related
```python
# ForeignKey 관계
.select_related('host_user', 'category')
```

### prefetch_related
```python
# ManyToMany 또는 역참조
.prefetch_related('contributions', 'tags')
```

### only/defer
```python
# 필요한 필드만
.only('id', 'title', 'status')
```

### annotate
```python
# 집계
.annotate(contribution_count=Count('contributions'))
```

## 제약조건
- 기존 기능 유지
- 결과 데이터 동일
- 측정으로 개선 확인
```

### 4.2 캐싱 구현

```
[기능]에 캐싱을 구현해줘.

## 캐싱 대상
- 데이터: [캐싱할 데이터]
- 변경 빈도: [자주/가끔/드물게]
- 접근 빈도: [높음/보통/낮음]

## 캐싱 전략
### Redis 캐싱
```python
from django.core.cache import cache

CACHE_KEY = f"[prefix]:{identifier}"
CACHE_TTL = 60 * 15  # 15분

def get_cached_data():
    cached = cache.get(CACHE_KEY)
    if cached:
        return cached

    data = expensive_query()
    cache.set(CACHE_KEY, data, CACHE_TTL)
    return data
```

### 캐시 무효화
```python
def invalidate_cache():
    cache.delete(CACHE_KEY)
    # 또는 패턴 삭제
    cache.delete_pattern(f"[prefix]:*")
```

## 제약조건
- 데이터 일관성 유지
- 무효화 시점 명확
- 캐시 키 충돌 방지
```

### 4.3 렌더링 최적화 구현

```
[컴포넌트]의 렌더링을 최적화해줘.

## 현재 코드
```typescript
[현재 컴포넌트 코드]
```

## 문제점
- 불필요한 리렌더링: [원인]
- 느린 렌더링: [원인]

## 최적화 적용
### React.memo
```typescript
const OptimizedComponent = React.memo(({ data }) => {
  return <div>{/* ... */}</div>;
});
```

### useMemo
```typescript
const expensiveValue = useMemo(() => {
  return heavyComputation(data);
}, [data]);
```

### useCallback
```typescript
const handleClick = useCallback(() => {
  // 핸들러 로직
}, [dependency]);
```

### 컴포넌트 분할
```typescript
// 독립적으로 업데이트되는 부분 분리
const FastUpdating = () => { /* ... */ };
const SlowUpdating = () => { /* ... */ };
```

## 제약조건
- 기존 동작 유지
- 과도한 메모이제이션 피하기
- 측정으로 개선 확인
```

### 4.4 번들 최적화 구현

```
프론트엔드 번들 크기를 최적화해줘.

## 현재 상태
- 총 번들 크기: [KB]
- 큰 청크: [청크 목록]

## 최적화 적용
### 코드 스플리팅
```typescript
// 라우트 레벨
const ProjectList = React.lazy(() => import('./pages/ProjectList'));

// 컴포넌트 레벨
const HeavyEditor = React.lazy(() => import('./components/HeavyEditor'));
```

### Vite 설정
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-*'],
        }
      }
    }
  }
});
```

### 라이브러리 최적화
```typescript
// 전체 import 대신 개별 import
import { Button } from '@/components/ui/button';
// not: import * as UI from '@/components/ui';
```

## 제약조건
- 기능 유지
- 로딩 UX 고려 (Suspense)
- 번들 분석으로 확인
```

---

## Phase 5: 성능 검증

### 프롬프트

```
[최적화 대상]의 성능 개선을 검증해줘.

## 최적화 적용 내용
- [최적화 1]
- [최적화 2]

## 측정 비교
| 지표 | 최적화 전 | 최적화 후 | 개선율 |
|------|----------|----------|-------|
| 응답 시간 | | | |
| 쿼리 수 | | | |
| 번들 크기 | | | |
| LCP | | | |

## 검증 항목
- [ ] 기존 기능 정상 동작
- [ ] 테스트 통과
- [ ] 프로덕션 환경에서 검증

## 추가 최적화 기회
- [추가로 최적화할 수 있는 부분]
```

---

## 빠른 시작 (Quick Start)

### 느린 API 최적화

```
InterfaceHive [엔드포인트]가 느려.

## 현재 상황
- 엔드포인트: [METHOD /api/v1/...]
- 현재 응답 시간: [ms]
- 목표 응답 시간: [ms]

## 관련 코드
```python
[View 또는 Serializer 코드]
```

성능을 분석하고 최적화해줘.

## 제약조건
- 기존 응답 형식 유지
- 쿼리 최적화 우선
- 측정 가능한 개선
```

### 느린 페이지 최적화

```
InterfaceHive [페이지]가 느려.

## 현재 상황
- 페이지: [URL]
- 현재 LCP: [초]
- 목표 LCP: [초]

## 관련 코드
```typescript
[페이지 컴포넌트 코드]
```

성능을 분석하고 최적화해줘.

## 제약조건
- 사용자 경험 유지
- Core Web Vitals 개선
- 점진적 개선
```

---

## 일반적인 최적화 패턴

### N+1 쿼리 해결

```python
# Before (N+1 문제)
projects = Project.objects.all()
for project in projects:
    print(project.host_user.name)  # 추가 쿼리!

# After
projects = Project.objects.select_related('host_user').all()
for project in projects:
    print(project.host_user.name)  # 추가 쿼리 없음
```

### 불필요한 리렌더링 방지

```typescript
// Before
const Component = ({ items, onSelect }) => {
  return items.map(item => (
    <Item
      key={item.id}
      onClick={() => onSelect(item.id)}  // 매번 새 함수!
    />
  ));
};

// After
const Component = ({ items, onSelect }) => {
  const handleSelect = useCallback((id) => {
    onSelect(id);
  }, [onSelect]);

  return items.map(item => (
    <MemoizedItem
      key={item.id}
      id={item.id}
      onSelect={handleSelect}
    />
  ));
};
```

### 데이터 캐싱

```typescript
// TanStack Query 캐싱 설정
const { data } = useQuery({
  queryKey: ['projects', filters],
  queryFn: () => fetchProjects(filters),
  staleTime: 1000 * 60 * 5,  // 5분간 fresh
  cacheTime: 1000 * 60 * 30, // 30분간 캐시 유지
});
```

---

## 체크리스트

### 측정
- [ ] 현재 성능 수치 기록
- [ ] 목표 수치 설정
- [ ] 측정 환경 문서화

### 분석
- [ ] 병목 지점 식별
- [ ] 근본 원인 파악
- [ ] 최적화 우선순위 결정

### 구현
- [ ] 점진적 최적화 적용
- [ ] 각 단계 측정
- [ ] 회귀 방지

### 검증
- [ ] 목표 달성 확인
- [ ] 사이드 이펙트 확인
- [ ] 프로덕션 모니터링 설정
