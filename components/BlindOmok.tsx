"use client";

import React, { useState } from "react";
import { Eye, EyeOff, RotateCcw, Target, Award, Play, Compass } from "lucide-react";

// 좌표평면 범위 설정: -5 ~ +5 (중앙이 (0,0)인 11x11 격자)
const MIN_COORD = -5;
const MAX_COORD = 5;
const GRID_SPAN = MAX_COORD - MIN_COORD + 1; // 11

interface Move {
  x: number; // -5 ~ +5
  y: number; // -5 ~ +5
  player: "white" | "yellow";
  stepNumber: number;
}

type Player = "white" | "yellow";

/**
 * [중앙 (0,0) 좌표평면 순서쌍 블라인드 오목 게임]
 * 원점 (0,0)을 중심에 배치하고, 1~4사분면 및 X/Y축 음수 좌표까지
 * 자유롭게 연습할 수 있는 중·고등 수학 교육용 게임입니다.
 */
export default function BlindOmok() {
  // 1. 게임 상태 관리 (11x11 배열, r=0 ~ 10, c=0 ~ 10)
  const [board, setBoard] = useState<(Player | null)[][]>(() =>
    Array.from({ length: GRID_SPAN }, () => Array(GRID_SPAN).fill(null))
  );

  const [currentPlayer, setCurrentPlayer] = useState<Player>("white");
  const [history, setHistory] = useState<Move[]>([]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [winningCoords, setWinningCoords] = useState<[number, number][]>([]);

  // 블라인드 모드 설정 (착수된 돌을 숨겨서 좌표 기억력을 겨루는 모드)
  const [isBlindMode, setIsBlindMode] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  // 순서쌍 수동 입력용 Input 상태 (초기값 원점 (0,0))
  const [inputX, setInputX] = useState<string>("0");
  const [inputY, setInputY] = useState<string>("0");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // 2. 5목 연속 검사 함수 (가로, 세로, 대각선 2방향)
  const checkWinCondition = (
    currentBoard: (Player | null)[][],
    lastYIdx: number,
    lastXIdx: number,
    player: Player
  ): [number, number][] | null => {
    const directions = [
      [0, 1],  // 가로
      [1, 0],  // 세로
      [1, 1],  // 대각선 ↘
      [-1, 1], // 대각선 ↗
    ];

    for (const [dy, dx] of directions) {
      const lineCoords: [number, number][] = [[lastYIdx, lastXIdx]];

      // 정방향 검색
      let r = lastYIdx + dy;
      let c = lastXIdx + dx;
      while (
        r >= 0 &&
        r < GRID_SPAN &&
        c >= 0 &&
        c < GRID_SPAN &&
        currentBoard[r][c] === player
      ) {
        lineCoords.push([r, c]);
        r += dy;
        c += dx;
      }

      // 역방향 검색
      r = lastYIdx - dy;
      c = lastXIdx - dx;
      while (
        r >= 0 &&
        r < GRID_SPAN &&
        c >= 0 &&
        c < GRID_SPAN &&
        currentBoard[r][c] === player
      ) {
        lineCoords.push([r, c]);
        r -= dy;
        c -= dx;
      }

      if (lineCoords.length >= 5) {
        return lineCoords;
      }
    }

    return null;
  };

  // 3. 착수 처리 로직 (x: -5 ~ 5, y: -5 ~ 5)
  const makeMove = (x: number, y: number) => {
    if (winner) return;

    // 범위 유효성 검사
    if (x < MIN_COORD || x > MAX_COORD || y < MIN_COORD || y > MAX_COORD) {
      setErrorMessage(`x와 y 좌표는 ${MIN_COORD}부터 ${MAX_COORD} 사이의 숫자여야 합니다!`);
      return;
    }

    // 좌표계 변환:
    // x = -5 -> c = 0, x = 0 -> c = 5, x = 5 -> c = 10 (c = x - MIN_COORD)
    // y = 5 -> r = 0, y = 0 -> r = 5, y = -5 -> r = 10 (r = MAX_COORD - y)
    const arrayX = x - MIN_COORD;
    const arrayY = MAX_COORD - y;

    // 중복 착수 검사
    if (board[arrayY][arrayX] !== null) {
      setErrorMessage(`순서쌍 (${x}, ${y}) 위치에는 이미 돌이 놓여 있습니다!`);
      return;
    }

    setErrorMessage("");

    // 보드 업데이트
    const newBoard = board.map((row, rIdx) =>
      row.map((cell, cIdx) => (rIdx === arrayY && cIdx === arrayX ? currentPlayer : cell))
    );

    const newMove: Move = {
      x,
      y,
      player: currentPlayer,
      stepNumber: history.length + 1,
    };

    const newHistory = [newMove, ...history];
    setBoard(newBoard);
    setHistory(newHistory);

    // 승리 검사
    const winLine = checkWinCondition(newBoard, arrayY, arrayX, currentPlayer);
    if (winLine) {
      setWinner(currentPlayer);
      setWinningCoords(winLine);
    } else {
      setCurrentPlayer(currentPlayer === "white" ? "yellow" : "white");
    }

    setInputX("");
    setInputY("");
  };

  // 4. 수동 입력 폼 제출
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numX = parseInt(inputX, 10);
    const numY = parseInt(inputY, 10);

    if (isNaN(numX) || isNaN(numY)) {
      setErrorMessage("x와 y 좌표 숫자를 정확히 입력해 주세요!");
      return;
    }

    makeMove(numX, numY);
  };

  // 5. 게임 리셋
  const handleReset = () => {
    setBoard(Array.from({ length: GRID_SPAN }, () => Array(GRID_SPAN).fill(null)));
    setCurrentPlayer("white");
    setHistory([]);
    setWinner(null);
    setWinningCoords([]);
    setErrorMessage("");
    setShowHint(false);
    setInputX("0");
    setInputY("0");
  };

  return (
    <section id="blind-omok" className="w-full py-10 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* 헤더 & 학습 목표 */}
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-950 rounded-full border border-dashed border-chalk-yellow text-chalk-yellow text-xs font-mono">
          <Compass className="w-4 h-4 text-chalk-yellow" />
          <span>중앙 원점 (0,0) 좌표평면 & 사분면 학습</span>
        </div>
        <h2 className="font-pen text-4xl sm:text-5xl text-chalk-yellow chalk-yellow-shadow tracking-wide">
          🎯 (0,0) 중심 순서쌍 블라인드 오목
        </h2>
        <p className="font-dodum text-sm sm:text-base text-teal-100/90 max-w-2xl mx-auto">
          중앙 **원점 (0,0)**을 기준으로 1·2·3·4 사분면의 양수·음수 좌표 순서쌍을 학습합니다. <br />
          원하는 순서쌍 **(x, y)**를 직접 입력하거나 클릭하여 오목 승리를 거둬보세요!
        </p>
      </div>

      {/* 게임 상태 패널 */}
      <div className="bg-teal-950/70 p-4 rounded-xl border border-dashed border-teal-600/60 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-dodum text-teal-200">현재 상태:</span>
          {winner ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-400 text-teal-950 rounded-lg font-bold text-base animate-bounce">
              <Award className="w-5 h-5 text-amber-900" />
              <span>
                🎉 {winner === "white" ? "⚪ 흰색 분필" : "🟡 노란 분필"} 승리!
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 bg-teal-900 rounded-lg border border-dashed border-teal-500/50">
              <span
                className={`w-3.5 h-3.5 rounded-full ${
                  currentPlayer === "white" ? "bg-chalk-white shadow-sm" : "bg-chalk-yellow"
                }`}
              />
              <span className="font-pen text-xl text-chalk-white">
                {currentPlayer === "white" ? "⚪ 흰색 분필 차례" : "🟡 노란 분필 차례"}
              </span>
            </div>
          )}
        </div>

        {/* 블라인드 모드 토글 & 새 게임 */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsBlindMode(!isBlindMode)}
            className={`px-3.5 py-1.5 rounded-lg border border-dashed text-sm font-dodum transition-all flex items-center gap-1.5 cursor-pointer ${
              isBlindMode
                ? "bg-purple-900/80 border-purple-400 text-purple-200"
                : "bg-teal-900/80 border-teal-500 text-teal-200"
            }`}
          >
            {isBlindMode ? <EyeOff className="w-4 h-4 text-purple-300" /> : <Eye className="w-4 h-4 text-teal-300" />}
            <span>블라인드 모드: {isBlindMode ? "켜짐 (돌 숨김)" : "꺼짐 (보임)"}</span>
          </button>

          {isBlindMode && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="px-3 py-1.5 bg-amber-900/60 hover:bg-amber-800 border border-dashed border-amber-400/60 text-amber-200 rounded-lg text-xs font-dodum cursor-pointer"
            >
              {showHint ? "👁️ 힌트 끄기" : "💡 돌 위치 잠깐 보기"}
            </button>
          )}

          <button
            onClick={handleReset}
            className="px-3.5 py-1.5 bg-teal-900 hover:bg-teal-800 text-chalk-white border border-dashed border-teal-400/50 rounded-lg text-sm font-dodum flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-teal-300" />
            <span>새 게임</span>
          </button>
        </div>
      </div>

      {/* 메인 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* [좌측] 중앙 (0,0) 11x11 좌표평면 오목판 (col-span-7) */}
        <div className="lg:col-span-7 wood-frame bg-teal-900 rounded-2xl p-4 sm:p-6 shadow-2xl relative">
          
          {/* 사분면 배경 워터마크 안내 */}
          <div className="absolute inset-0 p-8 grid grid-cols-2 grid-rows-2 pointer-events-none opacity-15 font-pen text-xl sm:text-2xl text-chalk-white">
            <div className="flex items-start justify-start">제2사분면 (- , +)</div>
            <div className="flex items-start justify-end">제1사분면 (+ , +)</div>
            <div className="flex items-end justify-start">제3사분면 (- , -)</div>
            <div className="flex items-end justify-end">제4사분면 (+ , -)</div>
          </div>

          <div className="relative">
            {/* 오목판 그리드 */}
            <div className="grid grid-cols-11 gap-0 border-2 border-teal-500/80 bg-teal-950/70 rounded-lg overflow-hidden relative aspect-square">
              
              {/* rIdx: 0 ~ 10 (y: 5 ~ -5) */}
              {Array.from({ length: GRID_SPAN }, (_, rIdx) => {
                const yValue = MAX_COORD - rIdx; // 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5

                return Array.from({ length: GRID_SPAN }, (_, cIdx) => {
                  const xValue = MIN_COORD + cIdx; // -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5

                  const cellPlayer = board[rIdx][cIdx];
                  const isWinningCell = winningCoords.some(
                    ([wy, wx]) => wy === rIdx && wx === cIdx
                  );
                  const isLastMove =
                    history.length > 0 &&
                    history[0].x === xValue &&
                    history[0].y === yValue;

                  const hideStone = isBlindMode && !showHint && !winner && cellPlayer !== null;
                  const isOrigin = xValue === 0 && yValue === 0;
                  const isXAxis = yValue === 0;
                  const isYAxis = xValue === 0;

                  return (
                    <button
                      key={`cell-${xValue}-${yValue}`}
                      onClick={() => makeMove(xValue, yValue)}
                      disabled={Boolean(winner)}
                      title={`순서쌍 (${xValue}, ${yValue})`}
                      className={`relative flex items-center justify-center border transition-all aspect-square cursor-pointer group ${
                        isOrigin
                          ? "bg-teal-800/80 border-amber-400/80 ring-1 ring-amber-400/50"
                          : isXAxis || isYAxis
                          ? "bg-teal-900/60 border-teal-400/60"
                          : "border-teal-700/40 hover:bg-teal-800/60"
                      } ${isWinningCell ? "bg-amber-500/40 animate-pulse" : ""}`}
                    >
                      {/* X축 / Y축 분필 가이드 라인 강하게 표시 */}
                      {isXAxis && (
                        <div className="absolute inset-x-0 h-[2px] bg-chalk-yellow/60 pointer-events-none" />
                      )}
                      {isYAxis && (
                        <div className="absolute inset-y-0 w-[2px] bg-chalk-yellow/60 pointer-events-none" />
                      )}

                      {/* 좌표 텍스트 호버 표시 */}
                      <span
                        className={`absolute bottom-0.5 right-0.5 text-[8px] sm:text-[9px] font-mono pointer-events-none ${
                          isOrigin
                            ? "text-chalk-yellow font-bold"
                            : "text-teal-300/40 group-hover:text-chalk-yellow"
                        }`}
                      >
                        ({xValue},{yValue})
                      </span>

                      {/* 원점 (0,0) 배지 표시 */}
                      {isOrigin && !cellPlayer && (
                        <span className="text-[9px] font-pen text-chalk-yellow z-0">
                          (0,0)
                        </span>
                      )}

                      {/* 착수된 분필 돌 */}
                      {cellPlayer && (
                        <div
                          className={`z-10 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-all transform ${
                            hideStone
                              ? "opacity-0 scale-50"
                              : "opacity-100 scale-100"
                          } ${
                            cellPlayer === "white"
                              ? "bg-gradient-to-br from-slate-100 to-slate-300 text-teal-950 border-2 border-dashed border-slate-400 shadow-slate-900/50"
                              : "bg-gradient-to-br from-yellow-200 to-amber-400 text-amber-950 border-2 border-dashed border-amber-500 shadow-amber-900/50"
                          } ${isLastMove ? "ring-2 ring-chalk-pink ring-offset-1 ring-offset-teal-950" : ""}`}
                        >
                          {!hideStone && (
                            <span className="font-pen text-sm">
                              {cellPlayer === "white" ? "⚪" : "🟡"}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                });
              })}
            </div>

            {/* X축 하단 좌표 라벨 (-5 ~ 5) */}
            <div className="grid grid-cols-11 text-center mt-2 text-xs font-pen text-chalk-yellow text-base sm:text-lg">
              {Array.from({ length: GRID_SPAN }, (_, i) => {
                const xVal = MIN_COORD + i;
                return (
                  <div key={`x-lbl-${xVal}`} className={xVal === 0 ? "font-bold text-amber-300" : ""}>
                    {xVal}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 text-center text-xs text-teal-300/80 font-dodum">
            🟡 노란 선: **X축(y=0)** 및 **Y축(x=0)** | 🌟 중앙: **원점 (0,0)**
          </div>
        </div>

        {/* [우측] 순서쌍 수동 입력 폼 & 착수 이력 로그 (col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 1. 순서쌍 (x, y) 입력 카드 */}
          <div className="bg-teal-950/80 p-5 rounded-2xl border-2 border-dashed border-chalk-yellow/60 shadow-lg">
            <h3 className="font-pen text-2xl text-chalk-yellow chalk-yellow-shadow flex items-center gap-2 mb-3">
              <Play className="w-5 h-5 text-chalk-yellow fill-chalk-yellow" />
              <span>순서쌍 (x, y) 입력 착수</span>
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* X 좌표 입력 */}
                <div>
                  <label htmlFor="input-x" className="block text-xs font-dodum text-teal-200 mb-1">
                    X 좌표 (-5 ~ +5)
                  </label>
                  <input
                    id="input-x"
                    type="number"
                    min={MIN_COORD}
                    max={MAX_COORD}
                    value={inputX}
                    onChange={(e) => setInputX(e.target.value)}
                    placeholder="예: 0"
                    disabled={Boolean(winner)}
                    className="w-full px-3 py-2 bg-teal-900 border border-dashed border-teal-500/70 rounded-lg text-chalk-white font-mono text-center focus:outline-none focus:border-chalk-yellow"
                  />
                </div>

                {/* Y 좌표 입력 */}
                <div>
                  <label htmlFor="input-y" className="block text-xs font-dodum text-teal-200 mb-1">
                    Y 좌표 (-5 ~ +5)
                  </label>
                  <input
                    id="input-y"
                    type="number"
                    min={MIN_COORD}
                    max={MAX_COORD}
                    value={inputY}
                    onChange={(e) => setInputY(e.target.value)}
                    placeholder="예: 0"
                    disabled={Boolean(winner)}
                    className="w-full px-3 py-2 bg-teal-900 border border-dashed border-teal-500/70 rounded-lg text-chalk-white font-mono text-center focus:outline-none focus:border-chalk-yellow"
                  />
                </div>
              </div>

              {/* 사분면 실시간 안내 박스 */}
              {inputX !== "" && inputY !== "" && !isNaN(Number(inputX)) && !isNaN(Number(inputY)) && (
                <div className="p-2 bg-teal-900/60 rounded-lg border border-dashed border-teal-500/40 text-xs font-dodum text-teal-200 text-center">
                  📍 위치:{" "}
                  <span className="text-chalk-yellow font-bold">
                    {Number(inputX) === 0 && Number(inputY) === 0
                      ? "원점 (0,0)"
                      : Number(inputX) === 0
                      ? "Y축 위"
                      : Number(inputY) === 0
                      ? "X축 위"
                      : Number(inputX) > 0 && Number(inputY) > 0
                      ? "제1사분면 (+, +)"
                      : Number(inputX) < 0 && Number(inputY) > 0
                      ? "제2사분면 (-, +)"
                      : Number(inputX) < 0 && Number(inputY) < 0
                      ? "제3사분면 (-, -)"
                      : "제4사분면 (+, -)"}
                  </span>
                </div>
              )}

              {/* 에러 메시지 */}
              {errorMessage && (
                <p className="text-xs text-rose-300 bg-rose-950/60 p-2 rounded border border-rose-500/40">
                  ⚠️ {errorMessage}
                </p>
              )}

              {/* 착수 버튼 */}
              <button
                type="submit"
                disabled={Boolean(winner)}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-teal-950 font-bold text-base rounded-xl border-2 border-dashed border-amber-900 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>순서쌍 ({inputX || "0"}, {inputY || "0"}) 착수하기 ✏️</span>
              </button>
            </form>
          </div>

          {/* 2. 착수 이력 목록 */}
          <div className="bg-teal-950/70 p-5 rounded-2xl border border-dashed border-teal-600/60 max-h-72 flex flex-col">
            <h3 className="font-pen text-2xl text-chalk-white mb-2 flex items-center justify-between">
              <span>📜 순서쌍 착수 이력</span>
              <span className="text-xs font-dodum text-teal-400">총 {history.length}수</span>
            </h3>

            {history.length === 0 ? (
              <p className="text-xs text-teal-400/60 py-6 text-center font-dodum">
                아직 둔 돌이 없습니다. 원점 (0,0) 또는 사분면 순서쌍을 입력해보세요!
              </p>
            ) : (
              <div className="overflow-y-auto flex-1 space-y-1.5 pr-1 font-mono text-xs">
                {history.map((move) => (
                  <div
                    key={`move-${move.stepNumber}`}
                    className={`flex items-center justify-between p-2 rounded-lg border border-dashed ${
                      move.player === "white"
                        ? "bg-teal-900/60 border-slate-500/40 text-chalk-white"
                        : "bg-amber-950/40 border-amber-500/40 text-chalk-yellow"
                    }`}
                  >
                    <span className="font-bold">
                      #{move.stepNumber} {move.player === "white" ? "⚪ 흰색" : "🟡 노란색"}
                    </span>
                    <span className="font-pen text-lg text-chalk-yellow">
                      순서쌍 ({move.x}, {move.y})
                    </span>
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
