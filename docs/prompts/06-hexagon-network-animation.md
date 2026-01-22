# Hero Section HexagonNetwork 애니메이션 구현 가이드

## 개요

랜딩 페이지 Hero 섹션에 육각형 네트워크 애니메이션을 추가하는 프롬프트입니다. 육각형 노드들이 순차적으로 나타나고, 연결선이 그려지며, 글로우 효과와 함께 펄스 애니메이션이 적용됩니다.

## 기술 스택

- **React** + **TypeScript**
- **GSAP (GreenSock Animation Platform)** - 애니메이션 라이브러리
- **SVG** - 벡터 그래픽

## 프롬프트

```
Hero 섹션에 육각형 네트워크 애니메이션을 추가해주세요.

## 요구사항

### 1. 데이터 구조
- 7~12개의 육각형 노드 (매번 랜덤 갯수)
- 각 노드의 위치(x, y)와 크기(size)는 랜덤 생성
- 노드 간 연결은 거리 기반으로 자동 계산 (가까운 노드끼리 연결)

### 2. SVG 구조
- viewBox: "0 0 800 400"
- preserveAspectRatio: "xMidYMid slice"
- 연결선 (line 요소)
- 각 노드: 글로우 링 (circle) + 육각형 그룹 (외부/내부 polygon)

### 3. CSS 스타일
- .hexagon-network: position absolute, 전체 크기, pointer-events none
- .hex-line: 앰버색(#f59e0b) stroke, stroke-dasharray로 선 그리기 애니메이션 준비
- .hex-node polygon: 반투명 앰버색 fill, stroke, drop-shadow 필터
- .hex-glow-ring: 투명 fill, 앰버색 stroke, blur 필터

### 4. GSAP 애니메이션 시퀀스
1) 초기 상태: 모든 요소 숨김, 육각형 scale 0.3
2) 순차적으로 각 노드 나타남 (0.5초 간격)
3) 노드 나타날 때 글로우 링 펄스 효과
4) 연결선 순차적으로 그려짐 (strokeDashoffset 애니메이션)
5) 연결 시 출발 노드 grow -> shrink -> pulse 효과
6) 대상 노드도 반응 (살짝 커짐)
7) 최종: 모든 노드 동시 글로우 펄스
8) 페이드 아웃 후 무한 반복 (repeatDelay: 3초)

### 5. transformOrigin 설정
- GSAP에서 transformOrigin: '50% 50%' 사용 (중심 기준 스케일)
- CSS에서 transform-box, transform-origin 제거 (GSAP에 위임)

## 컬러 팔레트
- 메인: #f59e0b (앰버)
- 밝은 앰버: #fbbf24
- 글로우: rgba(245, 158, 11, 0.5~1)
```

---

## 구현 코드

### 1. 랜덤 데이터 생성 함수

```typescript
interface HexNode {
  id: number;
  x: number;
  y: number;
  size: number;
}

// 랜덤 육각형 노드 생성 (7~12개)
function generateRandomHexNodes(): HexNode[] {
  const nodeCount = Math.floor(Math.random() * 6) + 7; // 7~12개
  const nodes: HexNode[] = [];
  const minDistance = 80; // 노드 간 최소 거리

  for (let i = 0; i < nodeCount; i++) {
    let attempts = 0;
    let validPosition = false;
    let x = 0, y = 0;

    // 다른 노드와 겹치지 않는 위치 찾기
    while (!validPosition && attempts < 100) {
      x = Math.random() * 650 + 75;  // 75~725 (viewBox 800 기준 여백)
      y = Math.random() * 280 + 60;  // 60~340 (viewBox 400 기준 여백)

      validPosition = nodes.every(node => {
        const dist = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2));
        return dist >= minDistance;
      });
      attempts++;
    }

    nodes.push({
      id: i + 1,
      x,
      y,
      size: Math.floor(Math.random() * 8) + 10, // 10~17
    });
  }

  return nodes;
}

// 거리 기반 연결 생성
function generateConnections(nodes: HexNode[]): [number, number][] {
  const connections: [number, number][] = [];
  const maxDistance = 200; // 연결 최대 거리
  const minConnections = 2; // 노드당 최소 연결 수

  nodes.forEach((node, i) => {
    // 거리순 정렬
    const distances = nodes
      .map((other, j) => ({
        index: j,
        id: other.id,
        dist: Math.sqrt(Math.pow(node.x - other.x, 2) + Math.pow(node.y - other.y, 2))
      }))
      .filter(d => d.index !== i && d.dist <= maxDistance)
      .sort((a, b) => a.dist - b.dist);

    // 가까운 노드들과 연결 (최소 2개, 최대 4개)
    const connectCount = Math.min(distances.length, Math.max(minConnections, Math.floor(Math.random() * 3) + 2));

    distances.slice(0, connectCount).forEach(d => {
      const pair: [number, number] = node.id < d.id ? [node.id, d.id] : [d.id, node.id];
      const exists = connections.some(c => c[0] === pair[0] && c[1] === pair[1]);
      if (!exists) {
        connections.push(pair);
      }
    });
  });

  return connections;
}

// 컴포넌트에서 사용 (useMemo로 리렌더링 시에만 재생성)
const hexNodes = useMemo(() => generateRandomHexNodes(), []);
const hexConnections = useMemo(() => generateConnections(hexNodes), [hexNodes]);
```

### 1-1. 고정 데이터 예시 (참고용)

```typescript
// 고정 위치를 원할 경우 아래처럼 직접 정의
const hexNodes = [
  { id: 1, x: 100, y: 200, size: 12 },
  { id: 2, x: 200, y: 100, size: 15 },
  { id: 3, x: 320, y: 180, size: 13 },
  { id: 4, x: 180, y: 300, size: 10 },
  { id: 5, x: 400, y: 80, size: 17 },
  { id: 6, x: 480, y: 200, size: 13 },
  { id: 7, x: 350, y: 320, size: 14 },
  { id: 8, x: 560, y: 100, size: 12 },
  { id: 9, x: 620, y: 220, size: 16 },
  { id: 10, x: 500, y: 340, size: 11 },
  { id: 11, x: 700, y: 150, size: 13 },
  { id: 12, x: 680, y: 300, size: 12 },
];

const hexConnections = [
  [1, 2], [1, 3], [1, 4],
  [2, 3], [2, 5],
  [3, 4], [3, 6], [3, 7],
  [5, 6], [5, 8],
  [6, 7], [6, 9],
  [7, 10],
  [8, 9], [8, 11],
  [9, 10], [9, 11], [9, 12],
  [10, 12],
  [11, 12],
];
```

### 2. React 컴포넌트

```tsx
import { useRef, useEffect, useMemo } from 'react';
import gsap from 'gsap';

const HexagonNetwork: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  // 랜덤 노드 및 연결 생성 (컴포넌트 마운트 시 1회)
  const hexNodes = useMemo(() => generateRandomHexNodes(), []);
  const hexConnections = useMemo(() => generateConnections(hexNodes), [hexNodes]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const hexagons = svg.querySelectorAll('.hex-node');
    const lines = svg.querySelectorAll('.hex-line');
    const glowRings = svg.querySelectorAll('.hex-glow-ring');

    // 초기 상태 설정
    gsap.set(hexagons, { opacity: 0, scale: 0.3, transformOrigin: '50% 50%' });
    gsap.set(lines, { strokeDashoffset: 300, opacity: 0 });
    gsap.set(glowRings, { opacity: 0, scale: 0.5, transformOrigin: '50% 50%' });

    // 연결 카운트 추적
    const connectionCounts: { [key: number]: number } = {};
    hexNodes.forEach(node => { connectionCounts[node.id] = 0; });

    // 마스터 타임라인 생성
    const masterTl = gsap.timeline({ repeat: -1, repeatDelay: 3 });

    // 1) 육각형 순차 등장
    hexNodes.forEach((node, index) => {
      const nodeDelay = index * 0.5;

      masterTl.to(`.hex-node-${node.id}`, {
        opacity: 1,
        scale: 0.5,
        duration: 0.5,
        ease: 'back.out(1.5)',
      }, nodeDelay);

      // 등장 시 글로우 링 효과
      masterTl.to(`.hex-glow-ring-${node.id}`, {
        opacity: 0.8,
        scale: 1.2,
        duration: 0.4,
        ease: 'power2.out',
      }, nodeDelay);
      masterTl.to(`.hex-glow-ring-${node.id}`, {
        opacity: 0,
        scale: 1.5,
        duration: 0.6,
        ease: 'power2.in',
      }, nodeDelay + 0.4);
    });

    // 2) 연결선 애니메이션
    let connectionDelay = hexNodes.length * 0.5 + 0.5;

    hexConnections.forEach(([from, to], idx) => {
      const delay = connectionDelay + idx * 0.6;

      // 선 그리기
      masterTl.to(`.hex-line-${from}-${to}`, {
        strokeDashoffset: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.inOut',
      }, delay);

      // 출발 노드 펄스 효과
      connectionCounts[from]++;
      const fromBaseScale = 0.5 + connectionCounts[from] * 0.1;

      masterTl.to(`.hex-node-${from}`, {
        scale: fromBaseScale + 0.5,
        filter: 'drop-shadow(0 0 25px rgba(245, 158, 11, 1))',
        duration: 0.4,
        ease: 'back.out(2)',
      }, delay + 0.2);
      masterTl.to(`.hex-node-${from}`, {
        scale: fromBaseScale,
        filter: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.5))',
        duration: 0.3,
        ease: 'power2.inOut',
      }, delay + 0.6);

      // 대상 노드 반응
      connectionCounts[to]++;
      const toBaseScale = 0.5 + connectionCounts[to] * 0.1;

      masterTl.to(`.hex-node-${to}`, {
        scale: toBaseScale + 0.3,
        filter: 'drop-shadow(0 0 20px rgba(245, 158, 11, 0.9))',
        duration: 0.3,
        ease: 'power2.out',
      }, delay + 0.5);
      masterTl.to(`.hex-node-${to}`, {
        scale: toBaseScale,
        filter: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.5))',
        duration: 0.3,
        ease: 'power2.inOut',
      }, delay + 0.8);
    });

    // 3) 최종 글로우 펄스
    const finalDelay = connectionDelay + hexConnections.length * 0.6 + 1.5;
    masterTl.to(hexagons, {
      filter: 'drop-shadow(0 0 30px rgba(245, 158, 11, 1))',
      duration: 1,
      ease: 'power1.inOut',
    }, finalDelay);

    masterTl.to(glowRings, {
      opacity: 1,
      scale: 2,
      duration: 0.8,
      ease: 'power2.out',
    }, finalDelay);
    masterTl.to(glowRings, {
      opacity: 0,
      scale: 2.5,
      duration: 0.8,
      ease: 'power2.in',
    }, finalDelay + 0.8);

    // 4) 페이드 아웃
    masterTl.to({}, { duration: 1.5 }, finalDelay + 1.6);
    masterTl.to([hexagons, lines], {
      opacity: 0,
      scale: 0.3,
      duration: 1.5,
      ease: 'power2.in',
    });

    return () => {
      masterTl.kill();
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      className="hexagon-network"
      viewBox="0 0 800 400"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* 연결선 */}
      {hexConnections.map(([from, to]) => {
        const fromNode = hexNodes.find(n => n.id === from)!;
        const toNode = hexNodes.find(n => n.id === to)!;
        return (
          <line
            key={`${from}-${to}`}
            className={`hex-line hex-line-${from}-${to}`}
            x1={fromNode.x}
            y1={fromNode.y}
            x2={toNode.x}
            y2={toNode.y}
          />
        );
      })}

      {/* 육각형 노드 */}
      {hexNodes.map((node) => {
        const s = node.size;
        const inner = s * 0.65;
        return (
          <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
            {/* 글로우 링 */}
            <circle
              className={`hex-glow-ring hex-glow-ring-${node.id}`}
              cx="0"
              cy="0"
              r={s * 1.2}
            />
            {/* 육각형 그룹 */}
            <g className={`hex-node hex-node-${node.id}`}>
              {/* 외부 육각형 */}
              <polygon
                points={`0,${-s} ${s*0.866},${-s/2} ${s*0.866},${s/2} 0,${s} ${-s*0.866},${s/2} ${-s*0.866},${-s/2}`}
              >
                <animate attributeName="stroke-width" values="2;3;2" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
              </polygon>
              {/* 내부 육각형 */}
              <polygon
                points={`0,${-inner} ${inner*0.866},${-inner/2} ${inner*0.866},${inner/2} 0,${inner} ${-inner*0.866},${inner/2} ${-inner*0.866},${-inner/2}`}
                className="hex-inner"
              >
                <animate attributeName="opacity" values="0.6;0.9;0.6" dur="3s" repeatCount="indefinite" />
              </polygon>
            </g>
          </g>
        );
      })}
    </svg>
  );
};
```

### 3. CSS 스타일

```css
/* Hexagon Network */
.hexagon-network {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    pointer-events: none;
}

.hex-line {
    stroke: #f59e0b;
    stroke-width: 2;
    stroke-dasharray: 300;
    stroke-dashoffset: 300;
    filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.6));
}

.hex-node {
    /* transform은 GSAP에서 처리 */
}

.hex-node polygon {
    fill: rgba(245, 158, 11, 0.2);
    stroke: #f59e0b;
    stroke-width: 2;
    filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.5));
}

.hex-node .hex-inner {
    fill: rgba(245, 158, 11, 0.1);
    stroke: #fbbf24;
    stroke-width: 1.5;
}

/* 글로우 링 */
.hex-glow-ring {
    fill: none;
    stroke: #f59e0b;
    stroke-width: 3;
    opacity: 0;
    filter: blur(4px);
    /* transform은 GSAP에서 처리 */
}
```

### 4. Hero 섹션에 적용

```tsx
<section className="landing-hero">
  <div className="hero-content">
    <div className="hero-image-wrapper">
      {/* 배경 이미지들 */}
      <div className="hero-images">
        {heroImages.map((src, idx) => (
          <img key={idx} src={src} alt={`Workspace collaboration ${idx + 1}`} />
        ))}
      </div>
      <div className="hero-image-gradient"></div>

      {/* 육각형 네트워크 애니메이션 */}
      <HexagonNetwork />
    </div>

    <h1 className="hero-headline">{t('home.hero.title')}</h1>
    <p className="hero-subheadline">{t('home.hero.subtitle')}</p>

    {/* CTA 버튼들 */}
  </div>
</section>
```

---

## 주의사항

### transformOrigin 이슈
- CSS `transform-box: fill-box`는 filter와 함께 사용 시 bounding box 계산 오류 발생
- GSAP의 `transformOrigin: '50% 50%'` 사용 권장
- CSS에서 transform 관련 속성 제거하고 GSAP에 위임

### 성능 최적화
- `pointer-events: none`으로 인터랙션 방지
- 컴포넌트 언마운트 시 `masterTl.kill()`로 메모리 정리
- `will-change` 속성은 필요시에만 사용

### 반응형 고려
- `viewBox`와 `preserveAspectRatio`로 SVG 크기 자동 조절
- 노드 좌표는 viewBox 기준 (800x400)

---

## 커스터마이징 옵션

| 항목 | 변수 | 기본값 |
|------|------|--------|
| 노드 갯수 | nodeCount | 7~12 (랜덤) |
| 노드 최소 거리 | minDistance | 80px |
| 연결 최대 거리 | maxDistance | 200px |
| 노드 크기 범위 | size | 10~17 |
| 노드 등장 간격 | nodeDelay | 0.5초 |
| 연결선 그리기 간격 | connectionDelay | 0.6초 |
| 반복 대기 시간 | repeatDelay | 3초 |
| 메인 컬러 | #f59e0b | 앰버 |
| 글로우 강도 | drop-shadow | 10~30px |

### 랜덤 vs 고정 모드

```typescript
// 랜덤 모드 (매 렌더링마다 새로운 배치)
const hexNodes = useMemo(() => generateRandomHexNodes(), []);

// 고정 모드 (항상 동일한 배치)
const hexNodes = [
  { id: 1, x: 100, y: 200, size: 12 },
  // ... 고정 좌표
];
```

---

## 참고 파일

- `frontend/src/pages/Home.tsx` - HexagonNetwork 컴포넌트
- `frontend/src/styles/Landing.css` - 스타일 정의
