import React, { useRef, useEffect, useMemo } from 'react';
import gsap from 'gsap';

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
            size: Math.floor(Math.random() * 8) + 12, // slightly larger for visibility
        });
    }

    return nodes;
}

// 거리 기반 연결 생성
function generateConnections(nodes: HexNode[]): [number, number][] {
    const connections: [number, number][] = [];
    const maxDistance = 250; // 연결 최대 거리
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
        gsap.set(lines, { strokeDashoffset: 400, opacity: 0 });
        gsap.set(glowRings, { opacity: 0, scale: 0.5, transformOrigin: '50% 50%' });

        // 연결 카운트 추적
        const connectionCounts: { [key: number]: number } = {};
        hexNodes.forEach(node => { connectionCounts[node.id] = 0; });

        // 마스터 타임라인 생성
        const masterTl = gsap.timeline({ repeat: -1, repeatDelay: 2 });

        // 1) 육각형 순차 등장
        hexNodes.forEach((node, index) => {
            const nodeDelay = index * 0.4;

            masterTl.to(`.hex-node-${node.id}`, {
                opacity: 1,
                scale: 0.6,
                duration: 0.6,
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
        let connectionDelay = hexNodes.length * 0.4 + 0.3;

        hexConnections.forEach(([from, to], idx) => {
            const delay = connectionDelay + idx * 0.5;

            // 선 그리기
            masterTl.to(`.hex-line-${from}-${to}`, {
                strokeDashoffset: 0,
                opacity: 1,
                duration: 1,
                ease: 'power2.inOut',
            }, delay);

            // 출발 노드 펄스 효과
            connectionCounts[from]++;
            const fromBaseScale = 0.6 + Math.min(connectionCounts[from] * 0.05, 0.2);

            masterTl.to(`.hex-node-${from}`, {
                scale: fromBaseScale + 0.3,
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
            const toBaseScale = 0.6 + Math.min(connectionCounts[to] * 0.05, 0.2);

            masterTl.to(`.hex-node-${to}`, {
                scale: toBaseScale + 0.2,
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
        const finalDelay = connectionDelay + hexConnections.length * 0.5 + 1;
        masterTl.to(hexagons, {
            filter: 'drop-shadow(0 0 30px rgba(245, 158, 11, 1))',
            duration: 1.2,
            ease: 'power1.inOut',
        }, finalDelay);

        masterTl.to(glowRings, {
            opacity: 1,
            scale: 2.2,
            duration: 1,
            ease: 'power2.out',
            stagger: 0.1
        }, finalDelay);
        masterTl.to(glowRings, {
            opacity: 0,
            scale: 2.8,
            duration: 0.8,
            ease: 'power2.in',
            stagger: 0.1
        }, finalDelay + 1);

        // 4) 페이드 아웃 후 루프
        masterTl.to({}, { duration: 2 }, finalDelay + 2);
        masterTl.to([hexagons, lines], {
            opacity: 0,
            scale: 0.3,
            duration: 1.5,
            ease: 'power2.in',
        });

        return () => {
            masterTl.kill();
        };
    }, [hexNodes, hexConnections]);

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
                            r={s * 1.5}
                        />
                        {/* 육각형 그룹 */}
                        <g className={`hex-node hex-node-${node.id}`}>
                            {/* 외부 육각형 */}
                            <polygon
                                points={`0,${-s} ${s * 0.866},${-s / 2} ${s * 0.866},${s / 2} 0,${s} ${-s * 0.866},${s / 2} ${-s * 0.866},${-s / 2}`}
                                className="hex-outer"
                            >
                                <animate attributeName="stroke-width" values="2;3;2" dur="2s" repeatCount="indefinite" />
                                <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
                            </polygon>
                            {/* 내부 육각형 */}
                            <polygon
                                points={`0,${-inner} ${inner * 0.866},${-inner / 2} ${inner * 0.866},${inner / 2} 0,${inner} ${-inner * 0.866},${inner / 2} ${-inner * 0.866},${-inner / 2}`}
                                className="hex-inner"
                            >
                                <animate attributeName="opacity" values="0.6;0.9;0.6" dur="3s" repeatCount="indefinite" />
                            </polygon>
                            {/* Center point */}
                            <circle cx="0" cy="0" r="2" fill="#fbbf24" opacity="0.8" />
                        </g>
                    </g>
                );
            })}
        </svg>
    );
};

export default HexagonNetwork;
