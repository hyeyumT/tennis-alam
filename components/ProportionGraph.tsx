"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TrendingUp, Database, Save, RefreshCw, AlertCircle, Sparkles, CheckCircle2, HelpCircle, Sliders } from "lucide-react";
import { supabase, isSupabaseConfigured, GraphExplorationRecord } from "@/lib/supabase";

/**
 * [정비례·반비례 그래프 탐구 및 Supabase 연동 컴포넌트]
 * - 정비례 y = ax 및 반비례 y = a/x 그래프를 칠판 좌표평면에 실시간 그리며 탐구합니다.
 * - 비례상수 a의 범위를 유리수(소수/분수)까지 확장하고, 직선이 좌표평면 상자를 벗어나지 않도록 클리핑 처리합니다.
 */
export default function ProportionGraph() {
  // 1. 그래프 탐구 상태 관리 (상수 a를 유리수 실수 범위로 지원)
  const [graphType, setGraphType] = useState<"direct" | "inverse">("direct");
  const [constantA, setConstantA] = useState<number>(0.5); // 유리수 비례상수 a (예: 0.5, 1.5, -2.5 등)
  const [pointX, setPointX] = useState<number>(4); // 좌표 확인용 X 값
  const [studentName, setStudentName] = useState<string>("");
  const [memo, setMemo] = useState<string>("");

  // Supabase 저장 상태 관리
  const [records, setRecords] = useState<GraphExplorationRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [showSqlGuide, setShowSqlGuide] = useState<boolean>(false);

  // 2. 현재 정비례/반비례 관계식 문자열 계산 (유리수 a 표기 깔끔화)
  const getEquationText = useCallback((): string => {
    const formattedA = Number.isInteger(constantA) ? constantA.toString() : constantA.toFixed(2).replace(/\.?0+$/, "");
    if (graphType === "direct") {
      if (constantA === 1) return "y = x";
      if (constantA === -1) return "y = -x";
      return `y = ${formattedA}x`;
    } else {
      if (constantA === 1) return "y = 1/x";
      if (constantA === -1) return "y = -1/x";
      return `y = ${formattedA}/x`;
    }
  }, [graphType, constantA]);

  // 3. 특정 X값에 대응하는 Y값 계산
  const getCalculatedY = useCallback((): number | null => {
    if (graphType === "direct") {
      return parseFloat((constantA * pointX).toFixed(2));
    } else {
      if (pointX === 0) return null;
      return parseFloat((constantA / pointX).toFixed(2));
    }
  }, [graphType, constantA, pointX]);

  // 4. Supabase 탐구 기록 목록 불러오기
  const fetchRecords = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setStatusMessage({
        type: "info",
        text: "Vercel 대시보드에 Supabase 환경 변수가 연결되면 탐구 결과가 DB에 자동 저장됩니다.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("graph_explorations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Supabase 조회 에러:", error);
        setStatusMessage({
          type: "error",
          text: `Supabase 테이블 조회 실패: ${error.message}. (supabase_schema.sql 실행 여부 확인)`,
        });
      } else if (data) {
        setRecords(data as GraphExplorationRecord[]);
      }
    } catch (err) {
      console.error("Supabase fetch exception:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // 5. Supabase 탐구 결과 저장 핸들러
  const handleSaveToSupabase = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentName.trim()) {
      setStatusMessage({ type: "error", text: "학생 이름을 입력해 주세요!" });
      return;
    }

    if (!isSupabaseConfigured()) {
      setStatusMessage({
        type: "info",
        text: "Supabase 연동 정보가 설정되어 있지 않습니다. 제공된 supabase_schema.sql을 참고하세요.",
      });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    const newRecord: GraphExplorationRecord = {
      student_name: studentName.trim(),
      graph_type: graphType,
      constant_a: constantA,
      equation: getEquationText(),
      memo: memo.trim() || undefined,
    };

    try {
      const { error } = await supabase.from("graph_explorations").insert([newRecord]);

      if (error) {
        console.error("Supabase 저장 에러:", error);
        setStatusMessage({
          type: "error",
          text: `저장 실패: ${error.message}. Supabase SQL Editor에서 supabase_schema.sql을 실행했는지 확인해 주세요.`,
        });
      } else {
        setStatusMessage({ type: "success", text: "🎉 Supabase에 탐구 결과가 성공적으로 저장되었습니다!" });
        setMemo("");
        fetchRecords();
      }
    } catch (err) {
      console.error("Save error:", err);
      setStatusMessage({ type: "error", text: "저장 중 오류가 발생했습니다." });
    } finally {
      setIsSaving(false);
    }
  };

  // 6. SVG 좌표계 세팅 (X: -10 ~ +10, Y: -10 ~ +10, SVG Canvas 크기: 360x360)
  const SVG_SIZE = 360;
  const RANGE = 10; // -10 ~ +10
  const toSvgX = (x: number) => SVG_SIZE / 2 + (x / RANGE) * (SVG_SIZE / 2);
  const toSvgY = (y: number) => SVG_SIZE / 2 - (y / RANGE) * (SVG_SIZE / 2);

  // 7. 정비례 직선 및 반비례 쌍곡선 SVG Path 경로 생성 (좌표평면 상자를 절대 벗어나지 않도록 클리핑 및 경계 계산)
  const renderGraphPath = () => {
    if (graphType === "direct") {
      // 일차함수 y = ax 직선이 [-RANGE, RANGE] 상자를 벗어나지 않도록 경계 교점 정확히 계산
      if (constantA === 0) {
        return (
          <line
            x1={toSvgX(-RANGE)}
            y1={toSvgY(0)}
            x2={toSvgX(RANGE)}
            y2={toSvgY(0)}
            stroke="#fef08a"
            strokeWidth="3"
            className="chalk-yellow-shadow"
          />
        );
      }

      // y = a * x에서 y가 [-10, 10] 범위에 들어오는 x의 최대 한계 계산: |x| <= 10 / |a|
      const xBound = Math.min(RANGE, RANGE / Math.abs(constantA));
      const x1 = -xBound;
      const y1 = constantA * x1;
      const x2 = xBound;
      const y2 = constantA * x2;

      return (
        <line
          x1={toSvgX(x1)}
          y1={toSvgY(y1)}
          x2={toSvgX(x2)}
          y2={toSvgY(y2)}
          stroke="#fef08a"
          strokeWidth="3"
          className="chalk-yellow-shadow"
        />
      );
    } else {
      // y = a/x 반비례 쌍곡선 (양수 구간 & 음수 구간 나누어 정밀 렌더링)
      const generateCurvePath = (isPositive: boolean) => {
        const points: string[] = [];
        const start = isPositive ? 0.1 : -RANGE;
        const end = isPositive ? RANGE : -0.1;
        const step = 0.1;

        for (let x = start; isPositive ? x <= end : x <= end; x += step) {
          if (Math.abs(x) < 0.05) continue;
          const y = constantA / x;
          // y가 좌표평면 한계 범위 내에 있을 때만 그리도록 클리핑
          if (Math.abs(y) <= RANGE) {
            points.push(`${toSvgX(x)},${toSvgY(y)}`);
          }
        }
        return points.length > 0 ? `M ${points.join(" L ")}` : "";
      };

      const pathNeg = generateCurvePath(false);
      const pathPos = generateCurvePath(true);

      return (
        <g>
          {pathNeg && <path d={pathNeg} fill="none" stroke="#fbcfe8" strokeWidth="3" className="chalk-pink-shadow" />}
          {pathPos && <path d={pathPos} fill="none" stroke="#fbcfe8" strokeWidth="3" className="chalk-pink-shadow" />}
        </g>
      );
    }
  };

  const calculatedY = getCalculatedY();

  return (
    <section id="proportion-graph" className="w-full py-10 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* 타이틀 및 개념 소개 */}
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-950 rounded-full border border-dashed border-chalk-yellow text-chalk-yellow text-xs font-mono">
          <TrendingUp className="w-4 h-4 text-chalk-yellow" />
          <span>중등 수학: 일차함수 & 비례 관계 그래프</span>
        </div>
        <h2 className="font-pen text-4xl sm:text-5xl text-chalk-yellow chalk-yellow-shadow tracking-wide">
          📈 정비례 · 반비례 그래프 탐구기
        </h2>
        <p className="font-dodum text-sm sm:text-base text-teal-100/90 max-w-2xl mx-auto">
          유리수 비례상수 <strong>a</strong>(소수, 분수 가능) 값을 조절하여 정비례(y = ax) 직선과 반비례(y = a/x) 쌍곡선을 탐구해 보세요! <br />
          직선이 좌표평면 상자를 벗어나지 않도록 클리핑 처리되었으며, 탐구 결과를 <strong>Supabase</strong>에 저장할 수 있습니다.
        </p>
      </div>

      {/* 메인 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* [좌측] 칠판 SVG 좌표평면 그래프 (col-span-7) */}
        <div className="lg:col-span-7 wood-frame bg-teal-900 rounded-2xl p-5 shadow-2xl flex flex-col items-center">
          
          {/* 그래프 제어 탭 (정비례 vs 반비례) */}
          <div className="flex items-center justify-between w-full mb-4 gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex bg-teal-950 p-1 rounded-xl border border-dashed border-teal-600/70">
              <button
                onClick={() => setGraphType("direct")}
                className={`px-4 py-1.5 rounded-lg text-sm font-pen text-xl transition-all cursor-pointer ${
                  graphType === "direct"
                    ? "bg-amber-500 text-teal-950 font-bold shadow-md"
                    : "text-chalk-white hover:text-chalk-yellow"
                }`}
              >
                ⚪ 정비례 (y = ax)
              </button>
              <button
                onClick={() => setGraphType("inverse")}
                className={`px-4 py-1.5 rounded-lg text-sm font-pen text-xl transition-all cursor-pointer ${
                  graphType === "inverse"
                    ? "bg-amber-500 text-teal-950 font-bold shadow-md"
                    : "text-chalk-white hover:text-chalk-yellow"
                }`}
              >
                🩷 반비례 (y = a/x)
              </button>
            </div>

            {/* 현재 완성된 수식 표시 */}
            <div className="px-3 py-1 bg-teal-950 rounded-lg border border-dashed border-chalk-yellow text-chalk-yellow font-pen text-2xl">
              {getEquationText()}
            </div>
          </div>

          {/* 칠판 SVG 좌표평면 Canvas (상자 밖으로 직선이 일체 이탈하지 않도록 SVG clipPath 및 클리핑 적용) */}
          <div className="relative bg-teal-950/90 rounded-xl p-2 border-2 border-teal-600/80 w-full max-w-[360px] aspect-square shadow-inner flex items-center justify-center overflow-hidden">
            
            {/* 사분면 지시 배경 워터마크 */}
            <div className="absolute inset-0 p-4 grid grid-cols-2 grid-rows-2 pointer-events-none opacity-20 font-pen text-lg text-chalk-white">
              <div className="flex items-start justify-start">2사분면</div>
              <div className="flex items-start justify-end">1사분면</div>
              <div className="flex items-end justify-start">3사분면</div>
              <div className="flex items-end justify-end">4사분면</div>
            </div>

            <svg width={SVG_SIZE} height={SVG_SIZE} className="overflow-hidden">
              {/* 좌표평면 경계 클리핑 정의 */}
              <defs>
                <clipPath id="coord-plane-clip">
                  <rect x="0" y="0" width={SVG_SIZE} height={SVG_SIZE} rx="6" />
                </clipPath>
              </defs>

              {/* 클리핑 처리된 그래프 출력 그룹 */}
              <g clipPath="url(#coord-plane-clip)">
                
                {/* 격자선 (Grid lines) */}
                {Array.from({ length: 9 }, (_, i) => {
                  const val = (i - 4) * 2.5;
                  if (val === 0) return null;
                  return (
                    <g key={`grid-${i}`}>
                      <line x1={toSvgX(val)} y1={0} x2={toSvgX(val)} y2={SVG_SIZE} stroke="#134e4a" strokeWidth="1" strokeDasharray="2,2" />
                      <line x1={0} y1={toSvgY(val)} x2={SVG_SIZE} y2={toSvgY(val)} stroke="#134e4a" strokeWidth="1" strokeDasharray="2,2" />
                    </g>
                  );
                })}

                {/* X축 & Y축 분필 가이드라인 */}
                <line x1={0} y1={toSvgY(0)} x2={SVG_SIZE} y2={toSvgY(0)} stroke="#fef08a" strokeWidth="2" />
                <line x1={toSvgX(0)} y1={0} x2={toSvgX(0)} y2={SVG_SIZE} stroke="#fef08a" strokeWidth="2" />

                {/* 원점 (0,0) 표기 */}
                <circle cx={toSvgX(0)} cy={toSvgY(0)} r="4" fill="#fef08a" />
                <text x={toSvgX(0.5)} y={toSvgY(-0.8)} fill="#fef08a" fontSize="11" fontFamily="sans-serif">
                  O(0,0)
                </text>

                {/* 축 라벨 */}
                <text x={SVG_SIZE - 15} y={toSvgY(0) - 6} fill="#fef08a" fontSize="12" fontWeight="bold">X</text>
                <text x={toSvgX(0) + 6} y={15} fill="#fef08a" fontSize="12" fontWeight="bold">Y</text>

                {/* 클리핑된 정비례 직선 / 반비례 쌍곡선 렌더링 */}
                {renderGraphPath()}

                {/* 점 (Point) 탐구 테스트 마커 */}
                {calculatedY !== null && Math.abs(calculatedY) <= RANGE && Math.abs(pointX) <= RANGE && (
                  <g>
                    {/* 점 위치 점선 안내 */}
                    <line x1={toSvgX(pointX)} y1={toSvgY(0)} x2={toSvgX(pointX)} y2={toSvgY(calculatedY)} stroke="#f472b6" strokeDasharray="3,3" />
                    <line x1={toSvgX(0)} y1={toSvgY(calculatedY)} x2={toSvgX(pointX)} y2={toSvgY(calculatedY)} stroke="#f472b6" strokeDasharray="3,3" />

                    {/* 점 마커 */}
                    <circle cx={toSvgX(pointX)} cy={toSvgY(calculatedY)} r="6" fill="#f472b6" stroke="#ffffff" strokeWidth="1.5" />

                    {/* 점 좌표 라벨 */}
                    <text
                      x={toSvgX(pointX) + 8}
                      y={toSvgY(calculatedY) - 8}
                      fill="#ffffff"
                      fontSize="11"
                      fontWeight="bold"
                    >
                      ({pointX}, {calculatedY})
                    </text>
                  </g>
                )}

              </g>
            </svg>
          </div>

          {/* 비례상수 a 조절 패널 (유리수 소수/분수 지원) */}
          <div className="w-full mt-5 bg-teal-950/90 p-4 rounded-xl border border-dashed border-teal-600/60 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label htmlFor="constant-a-input" className="font-pen text-2xl text-chalk-yellow flex items-center gap-1.5">
                <Sliders className="w-5 h-5 text-chalk-yellow" />
                <span>유리수 비례상수 a:</span>
              </label>
              
              {/* 유리수 직접 숫자로 입력창 */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-teal-300 font-dodum">직접 입력:</span>
                <input
                  id="constant-a-input"
                  type="number"
                  step="0.1"
                  min="-10"
                  max="10"
                  value={constantA}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) {
                      setConstantA(val);
                    }
                  }}
                  className="w-24 px-2 py-1 bg-teal-900 border border-dashed border-chalk-yellow/70 rounded text-chalk-white font-mono text-center text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* 정밀 슬라이더 (step="0.1" 로 소수점 단위 조절 지원) */}
            <input
              id="constant-a-slider"
              type="range"
              min="-6"
              max="6"
              step="0.1"
              value={constantA}
              onChange={(e) => setConstantA(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-2 bg-teal-900 rounded-lg"
            />

            {/* 자주 쓰이는 유리수 (소수/분수) 프리셋 버튼 */}
            <div className="flex flex-wrap gap-1.5 pt-1 justify-center">
              <span className="text-[11px] text-teal-300 font-dodum self-center mr-1">추천 유리수:</span>
              {[
                { label: "-2.5 (-5/2)", val: -2.5 },
                { label: "-1.5 (-3/2)", val: -1.5 },
                { label: "-0.5 (-1/2)", val: -0.5 },
                { label: "0.5 (1/2)", val: 0.5 },
                { label: "1.5 (3/2)", val: 1.5 },
                { label: "2.5 (5/2)", val: 2.5 },
                { label: "0.25 (1/4)", val: 0.25 },
                { label: "3", val: 3 },
              ].map((item) => (
                <button
                  key={`preset-a-${item.val}`}
                  onClick={() => setConstantA(item.val)}
                  className={`px-2 py-0.5 rounded text-xs font-mono border transition-colors cursor-pointer ${
                    constantA === item.val
                      ? "bg-amber-400 text-teal-950 font-bold border-amber-400"
                      : "bg-teal-900 text-chalk-white border-teal-700 hover:border-chalk-yellow"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* [우측] 좌표 확인기 & Supabase 저장/조회 패널 (col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 1. 특정 점 (x, y) 실시간 확인기 카드 */}
          <div className="bg-teal-950/80 p-5 rounded-2xl border border-dashed border-teal-600/60 shadow-lg">
            <h3 className="font-pen text-2xl text-chalk-white mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-chalk-pink" />
              <span>좌표 점 (x, y) 실시간 계산기</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label htmlFor="point-x-input" className="block text-xs font-dodum text-teal-200 mb-1">
                  입력할 X 값 (-10 ~ +10):
                </label>
                <input
                  id="point-x-input"
                  type="number"
                  min="-10"
                  max="10"
                  step="0.5"
                  value={pointX}
                  onChange={(e) => setPointX(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-teal-900 border border-dashed border-teal-500/70 rounded-lg text-chalk-white font-mono text-center focus:outline-none focus:border-chalk-yellow"
                />
              </div>

              {/* 계산 결과 안내 박스 */}
              <div className="p-3 bg-teal-900/80 rounded-xl border border-dashed border-chalk-yellow/50 text-center space-y-1">
                <p className="text-xs text-teal-300 font-dodum">계산된 점의 좌표:</p>
                <p className="font-pen text-3xl text-chalk-yellow">
                  {calculatedY !== null ? `(${pointX}, ${calculatedY})` : "x = 0 (정의되지 않음)"}
                </p>
                <p className="text-[11px] text-teal-200/80">
                  {graphType === "direct"
                    ? `y = ${constantA} × (${pointX}) = ${calculatedY}`
                    : pointX !== 0
                    ? `y = ${constantA} ÷ (${pointX}) = ${calculatedY}`
                    : "반비례에서는 x=0 일 때 정의되지 않습니다!"}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Supabase 탐구 결과 저장 폼 */}
          <div className="bg-teal-950/90 p-5 rounded-2xl border-2 border-dashed border-chalk-yellow/70 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-pen text-2xl text-chalk-yellow chalk-yellow-shadow flex items-center gap-2">
                <Database className="w-5 h-5 text-chalk-yellow" />
                <span>Supabase에 탐구 저장</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowSqlGuide(!showSqlGuide)}
                className="text-xs text-teal-300 hover:text-chalk-yellow underline flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>SQL 가이드</span>
              </button>
            </div>

            {/* SQL 스크립트 복사 안내 토글 */}
            {showSqlGuide && (
              <div className="mb-4 p-3 bg-teal-900 rounded-lg border border-dashed border-teal-400 text-xs text-teal-100 space-y-2">
                <p className="font-bold text-chalk-yellow">💡 Supabase SQL Editor용 설정 가이드:</p>
                <p>프로젝트 루트의 <code className="text-chalk-yellow">supabase_schema.sql</code> 파일 내용을 복사한 뒤 Supabase 대시보드 -&gt; SQL Editor에 실행하시면 테이블과 RLS 권한이 완성됩니다.</p>
              </div>
            )}

            <form onSubmit={handleSaveToSupabase} className="space-y-3">
              <div>
                <label htmlFor="student-name-input" className="block text-xs font-dodum text-teal-200 mb-1">
                  학생/선생님 이름 ✏️
                </label>
                <input
                  id="student-name-input"
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="예: 이지윤"
                  className="w-full px-3 py-2 bg-teal-900 border border-dashed border-teal-500/70 rounded-lg text-chalk-white font-dodum focus:outline-none focus:border-chalk-yellow"
                />
              </div>

              <div>
                <label htmlFor="student-memo-input" className="block text-xs font-dodum text-teal-200 mb-1">
                  탐구 소감 / 메모 (선택)
                </label>
                <textarea
                  id="student-memo-input"
                  rows={2}
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="예: a가 분수일 때(예: 0.5) 기울기가 완만해지는 것을 관찰했다!"
                  className="w-full px-3 py-2 bg-teal-900 border border-dashed border-teal-500/70 rounded-lg text-chalk-white font-dodum text-xs focus:outline-none focus:border-chalk-yellow"
                />
              </div>

              {/* 처리 피드백 메시지 */}
              {statusMessage && (
                <div
                  className={`p-2.5 rounded-lg border border-dashed text-xs font-dodum flex items-start gap-2 ${
                    statusMessage.type === "success"
                      ? "bg-emerald-950/80 border-emerald-400 text-emerald-200"
                      : statusMessage.type === "error"
                      ? "bg-rose-950/80 border-rose-400 text-rose-200"
                      : "bg-teal-900/80 border-teal-400 text-teal-200"
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{statusMessage.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-teal-950 font-bold text-base rounded-xl border-2 border-dashed border-amber-900 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSaving ? (
                  <RefreshCw className="w-5 h-5 animate-spin text-teal-950" />
                ) : (
                  <>
                    <Save className="w-5 h-5 text-teal-950" />
                    <span>[{getEquationText()}] 탐구 결과 DB 저장</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* 3. 최근 저장된 탐구 이력 리스트 (Supabase DB) */}
          <div className="bg-teal-950/70 p-5 rounded-2xl border border-dashed border-teal-600/60 max-h-72 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-pen text-2xl text-chalk-white flex items-center gap-1.5">
                <span>📜 Supabase 탐구 기록</span>
              </h3>
              <button
                onClick={fetchRecords}
                disabled={isLoading}
                className="p-1 text-teal-300 hover:text-chalk-yellow transition-colors cursor-pointer"
                title="새로고침"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {records.length === 0 ? (
              <div className="py-6 text-center text-xs text-teal-300/60 font-dodum space-y-1">
                <p>아직 저장된 탐구 기록이 없습니다.</p>
                <p className="text-[11px]">위 입력 폼에서 탐구 결과를 Supabase에 저장해 보세요!</p>
              </div>
            ) : (
              <div className="overflow-y-auto flex-1 space-y-2 pr-1 text-xs font-dodum">
                {records.map((rec, idx) => (
                  <div
                    key={rec.id || `rec-${idx}`}
                    className="p-3 bg-teal-900/60 rounded-xl border border-dashed border-teal-600/50 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-chalk-yellow font-pen text-lg">
                        👤 {rec.student_name}
                      </span>
                      <span className="px-2 py-0.5 bg-teal-950 rounded text-[10px] font-mono text-teal-300 border border-teal-700">
                        {rec.equation}
                      </span>
                    </div>
                    {rec.memo && (
                      <p className="text-teal-200/90 text-xs italic pl-2 border-l-2 border-chalk-pink">
                        &quot;{rec.memo}&quot;
                      </p>
                    )}
                    <p className="text-[10px] text-teal-400/60 text-right font-mono">
                      {rec.graph_type === "direct" ? "정비례" : "반비례"} | a={rec.constant_a}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
