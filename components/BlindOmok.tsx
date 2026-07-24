"use client";

import React, { useState } from "react";
import { Eye, EyeOff, RotateCcw, Target, Award, Play } from "lucide-react";

// 오목판 크기 설정 (10x10 좌표평면: X축 1~10, Y축 1~10)
const GRID_SIZE = 10;

// 좌표 및 착수 이력 데이터 타입 정의
interface Move {
  x: number; // 1 ~ 10
  y: number; // 1 ~ 10
  player: "white" | "yellow";
  stepNumber: number;
}

type Player = "white" | "yellow";

/**
 * [순서쌍 블라인드 오목 게임 컴포넌트]
 * 좌표평면 개념(x, y)을 배우는 학생들을 위해 직접 순서쌍을 입력하거나
 * 칠판 격자를 클릭하여 오목을 두는 두뇌 개발 수학 게임입니다.
 */
export default function BlindOmok() {
  // 1. 게임 상태 관리
  // board[y - 1][x - 1] 형태로 보드 상태 저장 ('white' | 'yellow' | null)
  const [board, setBoard] = useState<(Player | null)[][]>(() =>
    Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null))
  );

  const [currentPlayer, setCurrentPlayer] = useState<Player>("white");
  const [history, setHistory] = useState<Move[]>([]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [winningCoords, setWinningCoords] = useState<[number, number][]>([]);

  // 블라인드 모드 설정 (착수된 돌을 숨겨서 좌표 기억력을 겨루는 모드)
  const [isBlindMode, setIsBlindMode] = useState<boolean>(false);
  // 블라인드 모드 중 잠깐 돌 위치 보기 (힌트)
  const [showHint, setShowHint] = useState<boolean>(false);

  // 순서쌍 수동 입력용 Input 상태
  const [inputX, setInputX] = useState<string>("");
  const [inputY, setInputY] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // 2. 5목 연속 검사 함수 (가로, 세로, 대각선 2방향)
  const checkWinCondition = (
    currentBoard: (Player | null)[][],
    lastY: number,
    lastX: number,
    player: Player
  ): [number, number][] | null => {
    // 4가지 방향 벡터: [dy, dx] -> [가로, 세로, 우하향 대각선, 우상향 대각선]
    const directions = [
      [0, 1],  // 가로
      [1, 0],  // 세로
      [1, 1],  // 대각선 ↘
      [-1, 1], // 대각선 ↗
    ];

    for (const [dy, dx] of directions) {
      const lineCoords: [number, number][] = [[lastY, lastX]];

      // 정방향 검색
      let r = lastY + dy;
      let c = lastX + dx;
      while (
        r >= 0 &&
        r < GRID_SIZE &&
        c >= 0 &&
        c < GRID_SIZE &&
        currentBoard[r][c] === player
      ) {
        lineCoords.push([r, c]);
        r += dy;
        c += dx;
      }

      // 역방향 검색
      r = lastY - dy;
      c = lastX - dx;
      while (
        r >= 0 &&
        r < GRID_SIZE &&
        c >= 0 &&
        c < GRID_SIZE &&
        currentBoard[r][c] === player
      ) {
        lineCoords.push([r, c]);
        r -= dy;
        c -= dx;
      }

      // 5개 이상 연속이면 승리!
      if (lineCoords.length >= 5) {
        return lineCoords;
      }
    }

    return null;
  };

  // 3. 착수 처리 로직 (X: 1~10, Y: 1~10)
  const makeMove = (x: number, y: number) => {
    if (winner) return;

    // 유효 범위 검사 (1 ~ 10)
    if (x < 1 || x > GRID_SIZE || y < 1 || y > GRID_SIZE) {
      setErrorMessage(`x와 y의 좌표는 1부터 ${GRID_SIZE} 사이의 숫자여야 합니다!`);
      return;
    }

    const arrayY = y - 1; // 0 ~ 9 index
    const arrayX = x - 1; // 0 ~ 9 index

    // 이미 돌이 놓여있는지 검사
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

    // 승리 여부 판정
    const winLine = checkWinCondition(newBoard, arrayY, arrayX, currentPlayer);
    if (winLine) {
      setWinner(currentPlayer);
      setWinningCoords(winLine);
    } else {
      // 턴 변경 (흰색 분필 ↔ 노란색 분필)
      setCurrentPlayer(currentPlayer === "white" ? "yellow" : "white");
    }

    // 입력 필드 초기화
    setInputX("");
    setInputY("");
  };

  // 4. 수동 입력 폼 제출 핸들러
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numX = parseInt(inputX, 10);
    const numY = parseInt(inputY, 10);

    if (isNaN(numX) || isNaN(numY)) {
      setErrorMessage("x와 y 좌표 숫자를 모두 입력해 주세요!");
      return;
    }

    makeMove(numX, numY);
  };

  // 5. 게임 리셋 핸들러
  const handleReset = () => {
    setBoard(Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null)));
    setCurrentPlayer("white");
    setHistory([]);
    setWinner(null);
    setWinningCoords([]);
    setErrorMessage("");
    setShowHint(false);
  };

  return (
    <section id="blind-omok" className="w-full py-10 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* 타이틀 및 헤더 영역 */}
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-950 rounded-full border border-dashed border-chalk-yellow text-chalk-yellow text-xs font-mono">
          <Target className="w-4 h-4 text-chalk-yellow" />
          <span>수학 개념 탐구: 좌표평면과 순서쌍 (x, y)</span>
        </div>
        <h2 className="font-pen text-4xl sm:text-5xl text-chalk-yellow chalk-yellow-shadow tracking-wide">
          🎯 순서쌍 블라인드 오목 게임
        </h2>
        <p className="font-dodum text-sm sm:text-base text-teal-100/90 max-w-2xl mx-auto">
          좌표평면 위에서 원하는 위치의 <strong>순서쌍 (x, y)</strong>를 직접 입력하거나 클릭하여 오목을 완성해 보세요! <br />
          <strong>블라인드 모드</strong>를 켜면 돌이 숨겨져 공간 좌표 기억력까지 함께 훈련됩니다.
        </p>
      </div>

      {/* 게임 컨트롤 패널 (모드 토글 & 상태 안내) */}
      <div className="bg-teal-950/70 p-4 rounded-xl border border-dashed border-teal-600/60 mb-6 flex flex-wrap items-center justify-between gap-4">
        
        {/* 현재 턴 & 승자 안내 */}
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

        {/* 블라인드 모드 토글 & 힌트 버튼 */}
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
              className="px-3 py-1.5 bg-amber-900/60 hover:bg-amber-800 border border-dashed border-amber-400/60 text-amber-200 rounded-lg text-xs font-dodum transition-colors cursor-pointer"
            >
              {showHint ? "👁️ 힌트 끄기" : "💡 돌 위치 잠깐 보기"}
            </button>
          )}

          <button
            onClick={handleReset}
            className="px-3.5 py-1.5 bg-teal-900 hover:bg-teal-800 text-chalk-white border border-dashed border-teal-400/50 rounded-lg text-sm font-dodum flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-teal-300" />
            <span>새 게임</span>
          </button>
        </div>

      </div>

      {/* 게임 메인 레이아웃 (좌: 좌표평면 오목판, 우: 순서쌍 입력 & 이력) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* [좌측] 10x10 아날로그 칠판 좌표평면 오목판 (col-span-7) */}
        <div className="lg:col-span-7 wood-frame bg-teal-900 rounded-2xl p-4 sm:p-6 shadow-2xl relative">
          
          {/* Y축 좌표 표시 (상단에서 하단으로 10 -> 1 수학 좌표계) */}
          <div className="relative">
            
            {/* 오목판 그리드 */}
            <div className="grid grid-cols-10 gap-0 border-2 border-teal-600/70 bg-teal-950/60 rounded-lg overflow-hidden relative aspect-square">
              
              {/* 배열을 Y축 역순(10부터 1까지)으로 출력하여 수학 좌표계(Y축 위쪽이 높은 숫자)와 일치시킴 */}
              {Array.from({ length: GRID_SIZE }, (_, rIdx) => {
                const yValue = GRID_SIZE - rIdx; // Y좌표: 10, 9, 8, ... 1
                const arrayY = yValue - 1;       // 실제 배열 Index

                return Array.from({ length: GRID_SIZE }, (_, cIdx) => {
                  const xValue = cIdx + 1;       // X좌표: 1, 2, 3, ... 10
                  const arrayX = cIdx;           // 실제 배열 Index

                  const cellPlayer = board[arrayY][arrayX];
                  const isWinningCell = winningCoords.some(
                    ([wy, wx]) => wy === arrayY && wx === arrayX
                  );
                  const isLastMove =
                    history.length > 0 &&
                    history[0].x === xValue &&
                    history[0].y === yValue;

                  // 블라인드 모드에서 돌을 숨길지 여부 (단, 승리 시 혹은 힌트 버튼 클릭 시 보여줌)
                  const hideStone = isBlindMode && !showHint && !winner && cellPlayer !== null;

                  return (
                    <button
                      key={`cell-${xValue}-${yValue}`}
                      onClick={() => makeMove(xValue, yValue)}
                      disabled={Boolean(winner)}
                      title={`순서쌍 (${xValue}, ${yValue})`}
                      className={`relative flex items-center justify-center border border-teal-700/50 hover:bg-teal-800/60 transition-all aspect-square cursor-pointer group ${
                        isWinningCell ? "bg-amber-500/30 animate-pulse" : ""
                      }`}
                    >
                      {/* 교차선 십자가 가이드라인 */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                        <div className="w-full h-[1px] bg-teal-500/60" />
                        <div className="h-full w-[1px] bg-teal-500/60 absolute" />
                      </div>

                      {/* 미세 좌표 호버 표시 */}
                      <span className="absolute bottom-0.5 right-1 text-[9px] text-teal-400/40 group-hover:text-chalk-yellow font-mono pointer-events-none">
                        ({xValue},{yValue})
                      </span>

                      {/* 착수된 분필 돌 */}
                      {cellPlayer && (
                        <div
                          className={`z-10 w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-all transform ${
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

            {/* X축 하단 라벨 (1 ~ 10) */}
            <div className="grid grid-cols-10 text-center mt-2 text-xs font-pen text-chalk-yellow text-lg">
              {Array.from({ length: GRID_SIZE }, (_, i) => (
                <div key={`x-label-${i + 1}`}>x={i + 1}</div>
              ))}
            </div>

          </div>

          <div className="mt-3 text-center text-xs text-teal-300/70 font-dodum">
            💡 바둑판 위를 직접 클릭하거나, 오른쪽 폼에 순서쌍 (x, y)를 직접 입력하세요!
          </div>

        </div>

        {/* [우측] 순서쌍 수동 입력 폼 & 착수 이력 로그 (col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 1. 순서쌍 (x, y) 직접 입력 카드 */}
          <div className="bg-teal-950/80 p-5 rounded-2xl border-2 border-dashed border-chalk-yellow/60 shadow-lg">
            <h3 className="font-pen text-2xl text-chalk-yellow chalk-yellow-shadow flex items-center gap-2 mb-3">
              <Play className="w-5 h-5 text-chalk-yellow fill-chalk-yellow" />
              <span>순서쌍 (x, y) 직접 입력 착수</span>
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* X 좌표 입력 */}
                <div>
                  <label htmlFor="input-x" className="block text-xs font-dodum text-teal-200 mb-1">
                    X 좌표 (가로: 1~10)
                  </label>
                  <input
                    id="input-x"
                    type="number"
                    min="1"
                    max={GRID_SIZE}
                    value={inputX}
                    onChange={(e) => setInputX(e.target.value)}
                    placeholder="예: 3"
                    disabled={Boolean(winner)}
                    className="w-full px-3 py-2 bg-teal-900 border border-dashed border-teal-500/70 rounded-lg text-chalk-white font-mono text-center focus:outline-none focus:border-chalk-yellow"
                  />
                </div>

                {/* Y 좌표 입력 */}
                <div>
                  <label htmlFor="input-y" className="block text-xs font-dodum text-teal-200 mb-1">
                    Y 좌표 (세로: 1~10)
                  </label>
                  <input
                    id="input-y"
                    type="number"
                    min="1"
                    max={GRID_SIZE}
                    value={inputY}
                    onChange={(e) => setInputY(e.target.value)}
                    placeholder="예: 5"
                    disabled={Boolean(winner)}
                    className="w-full px-3 py-2 bg-teal-900 border border-dashed border-teal-500/70 rounded-lg text-chalk-white font-mono text-center focus:outline-none focus:border-chalk-yellow"
                  />
                </div>
              </div>

              {/* 에러 메시지 표시 */}
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
                <span>순서쌍 ({inputX || "x"}, {inputY || "y"}) 에 돌 놓기 ✏️</span>
              </button>
            </form>
          </div>

          {/* 2. 착수 이력 목록 (순서쌍 학습 히스토리) */}
          <div className="bg-teal-950/70 p-5 rounded-2xl border border-dashed border-teal-600/60 max-h-72 flex flex-col">
            <h3 className="font-pen text-2xl text-chalk-white mb-2 flex items-center justify-between">
              <span>📜 순서쌍 착수 이력</span>
              <span className="text-xs font-dodum text-teal-400">총 {history.length}수</span>
            </h3>

            {history.length === 0 ? (
              <p className="text-xs text-teal-400/60 py-6 text-center font-dodum">
                아직 놓여진 돌이 없습니다. 순서쌍을 입력하거나 바둑판을 클릭해 보세요!
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
