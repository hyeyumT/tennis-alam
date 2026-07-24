"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Zap, Trophy, Timer, Flame, Award, RotateCcw, CheckCircle2, XCircle, Send, Sparkles, HelpCircle } from "lucide-react";
import { supabase, isSupabaseConfigured, EquationGameRankingRecord } from "@/lib/supabase";

// 일차방정식 문제 구조 인터페이스
interface Problem {
  equationStr: string; // 방정식 문자열 (예: "3x + 5 = 20")
  solution: number;    // 정답 x 값
  stepExplanation: string; // 풀이 단계 설명
}

/**
 * [일차방정식 스피드 랭킹 게임 컴포넌트]
 * - 60초 동안 일차방정식 문제를 풀고 점수/콤보를 적립하여 Supabase 실시간 랭킹 보드에 기록합니다.
 */
export default function EquationGame() {
  // 1. 게임 상태 관리
  const [gameState, setGameState] = useState<"idle" | "playing" | "ended">("idle");
  const [studentName, setStudentName] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);

  // 현재 문제 & 사용자 답안 입력
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [feedback, setFeedback] = useState<{ type: "correct" | "wrong"; text: string; explanation?: string } | null>(null);

  // Supabase 랭킹 상태
  const [rankings, setRankings] = useState<EquationGameRankingRecord[]>([]);
  const [isLoadingRankings, setIsLoadingRankings] = useState<boolean>(false);
  const [isSavingScore, setIsSavingScore] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // 2. 해가 정수인 랜덤 일차방정식 문제 생성기
  const generateProblem = useCallback((): Problem => {
    // 난이도 무작위 선택 (1~3단계)
    const level = Math.floor(Math.random() * 3) + 1;
    const targetX = Math.floor(Math.random() * 19) - 9; // -9 ~ +9 (0 제외 정수)
    const finalX = targetX === 0 ? 3 : targetX;

    if (level === 1) {
      // ax + b = c 형태
      const a = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.3 ? 1 : -1);
      const b = (Math.floor(Math.random() * 15) + 1) * (Math.random() > 0.5 ? 1 : -1);
      const c = a * finalX + b;

      const signB = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
      return {
        equationStr: `${a === 1 ? "" : a === -1 ? "-" : a}x ${signB} = ${c}`,
        solution: finalX,
        stepExplanation: `${a}x = ${c} ${b >= 0 ? `- ${b}` : `+ ${Math.abs(b)}`} ➔ ${a}x = ${c - b} ➔ x = ${finalX}`,
      };
    } else if (level === 2) {
      // ax + b = cx + d 형태
      let a = Math.floor(Math.random() * 5) + 2;
      let cVal = Math.floor(Math.random() * 4) + 1;
      if (a === cVal) a += 1; // a != c 보장

      const b = Math.floor(Math.random() * 10) - 5;
      const d = (a - cVal) * finalX + b;

      const signB = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
      const signD = d >= 0 ? `+ ${d}` : `- ${Math.abs(d)}`;

      return {
        equationStr: `${a}x ${signB} = ${cVal === 1 ? "" : cVal}x ${signD}`,
        solution: finalX,
        stepExplanation: `${a - cVal}x = ${d - b} ➔ x = ${finalX}`,
      };
    } else {
      // (x + a) * b = c 형태
      const b = Math.floor(Math.random() * 4) + 2; // 2 ~ 5
      const a = Math.floor(Math.random() * 10) - 5;
      const c = (finalX + a) * b;

      const signA = a >= 0 ? `+ ${a}` : `- ${Math.abs(a)}`;

      return {
        equationStr: `${b}(x ${signA}) = ${c}`,
        solution: finalX,
        stepExplanation: `x ${signA} = ${c / b} ➔ x = ${finalX}`,
      };
    }
  }, []);

  // 3. Supabase 랭킹 목록 불러오기
  const fetchRankings = useCallback(async () => {
    if (!isSupabaseConfigured()) return;

    setIsLoadingRankings(true);
    try {
      const { data, error } = await supabase
        .from("equation_game_rankings")
        .select("*")
        .order("score", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Supabase 랭킹 조회 에러:", error);
      } else if (data) {
        setRankings(data as EquationGameRankingRecord[]);
      }
    } catch (err) {
      console.error("Rankings fetch exception:", err);
    } finally {
      setIsLoadingRankings(false);
    }
  }, []);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  // 4. 게임 시작
  const startGame = () => {
    if (!studentName.trim()) {
      alert("랭킹 등록을 위해 이름을 입력해 주세요!");
      return;
    }
    setGameState("playing");
    setTimeLeft(60);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setCorrectCount(0);
    setFeedback(null);
    setSaveStatus(null);
    setCurrentProblem(generateProblem());

    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // 5. 60초 카운트다운 타이머
  useEffect(() => {
    if (gameState !== "playing") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameState("ended");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // 6. 게임 종료 시 Supabase 랭킹 자동 저장
  const saveScoreToSupabase = useCallback(async () => {
    if (!isSupabaseConfigured() || score === 0 || !studentName.trim()) return;

    setIsSavingScore(true);
    setSaveStatus("Supabase 랭킹 등록 중...");

    const newRecord: EquationGameRankingRecord = {
      student_name: studentName.trim(),
      score,
      correct_count: correctCount,
      max_combo: maxCombo,
    };

    try {
      const { error } = await supabase.from("equation_game_rankings").insert([newRecord]);
      if (error) {
        setSaveStatus(`저장 실패: ${error.message}`);
      } else {
        setSaveStatus("🎉 Supabase 랭킹 등록 완료!");
        fetchRankings();
      }
    } catch (err) {
      console.error("Save score error:", err);
    } finally {
      setIsSavingScore(false);
    }
  }, [score, studentName, correctCount, maxCombo, fetchRankings]);

  useEffect(() => {
    if (gameState === "ended" && score > 0) {
      saveScoreToSupabase();
    }
  }, [gameState, score, saveScoreToSupabase]);

  // 7. 정답 제출 처리
  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProblem || gameState !== "playing") return;

    const parsedUserAns = parseInt(userAnswer.trim(), 10);

    if (isNaN(parsedUserAns)) {
      setFeedback({ type: "wrong", text: "숫자를 입력해 주세요!" });
      return;
    }

    if (parsedUserAns === currentProblem.solution) {
      // 정답!
      const newCombo = combo + 1;
      const comboMultiplier = Math.min(newCombo, 5);
      const points = 100 * comboMultiplier;

      setScore((prev) => prev + points);
      setCombo(newCombo);
      setMaxCombo((prev) => Math.max(prev, newCombo));
      setCorrectCount((prev) => prev + 1);

      setFeedback({
        type: "correct",
        text: `🎉 정답! (+${points}점${newCombo > 1 ? ` | ${newCombo}연속 콤보!` : ""})`,
      });
    } else {
      // 오답!
      setCombo(0);
      setFeedback({
        type: "wrong",
        text: `❌ 아쉽네요! 정답은 x = ${currentProblem.solution} 입니다.`,
        explanation: currentProblem.stepExplanation,
      });
    }

    // 다음 문제 준비
    setUserAnswer("");
    setCurrentProblem(generateProblem());
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <section id="equation-game" className="w-full py-10 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* 헤더 & 학습 목표 */}
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-950 rounded-full border border-dashed border-chalk-yellow text-chalk-yellow text-xs font-mono">
          <Zap className="w-4 h-4 text-chalk-yellow fill-chalk-yellow" />
          <span>중등 수학: 일차방정식의 풀이 스피드전</span>
        </div>
        <h2 className="font-pen text-4xl sm:text-5xl text-chalk-yellow chalk-yellow-shadow tracking-wide">
          ⚡ 일차방정식 스피드 랭킹 게임
        </h2>
        <p className="font-dodum text-sm sm:text-base text-teal-100/90 max-w-2xl mx-auto">
          60초 동안 일차방정식의 해 <strong>x</strong>의 값을 연속으로 맞춰 최고 점수에 도전해보세요! <br />
          결과는 **Supabase 데이터베이스 실시간 명예의 전당 랭킹 보드**에 저장됩니다.
        </p>
      </div>

      {/* 메인 게임 아날로그 칠판 프레임 */}
      <div className="wood-frame bg-teal-900 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
        
        {/* === 1. 대기 화면 (게임 시작 전 & 이름 입력) === */}
        {gameState === "idle" && (
          <div className="max-w-xl mx-auto text-center space-y-6 py-6">
            <div className="p-4 bg-teal-950/80 rounded-2xl border-2 border-dashed border-chalk-yellow/70 space-y-3">
              <span className="text-4xl">🏆</span>
              <h3 className="font-pen text-3xl text-chalk-yellow">스피드 랭킹전 도전</h3>
              <p className="text-sm font-dodum text-teal-200">
                랭킹 보드에 등록할 이름을 입력하고 [게임 시작]을 누르세요!
              </p>

              <div className="pt-2">
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="선생님/학생 이름 (예: 이지윤)"
                  className="w-full max-w-sm px-4 py-3 bg-teal-900 border-2 border-dashed border-teal-400 rounded-xl text-chalk-white font-pen text-2xl text-center focus:outline-none focus:border-chalk-yellow"
                />
              </div>

              <button
                onClick={startGame}
                className="w-full max-w-sm py-3.5 bg-amber-500 hover:bg-amber-400 text-teal-950 font-bold text-lg rounded-xl border-2 border-dashed border-amber-900 shadow-lg transition-all transform hover:scale-105 cursor-pointer"
              >
                🚀 60초 일차방정식 랭킹전 시작!
              </button>
            </div>
          </div>
        )}

        {/* === 2. 게임 진행 화면 === */}
        {gameState === "playing" && currentProblem && (
          <div className="max-w-2xl mx-auto space-y-6">
            
            {/* 상태바 (타이머, 점수, 콤보) */}
            <div className="grid grid-cols-3 gap-3 bg-teal-950/90 p-4 rounded-xl border border-dashed border-teal-600/70 text-center font-mono">
              <div className="flex flex-col items-center">
                <span className="text-xs text-teal-300 font-dodum flex items-center gap-1">
                  <Timer className="w-4 h-4 text-amber-400" /> 남은 시간
                </span>
                <span className="font-pen text-3xl text-chalk-yellow">{timeLeft}초</span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-xs text-teal-300 font-dodum flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-yellow-400" /> 점수
                </span>
                <span className="font-pen text-3xl text-chalk-white">{score}점</span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-xs text-teal-300 font-dodum flex items-center gap-1">
                  <Flame className="w-4 h-4 text-pink-400" /> 콤보
                </span>
                <span className="font-pen text-3xl text-chalk-pink">{combo} Combo</span>
              </div>
            </div>

            {/* 메인 일차방정식 카드 */}
            <div className="bg-teal-950/90 p-8 rounded-2xl border-2 border-dashed border-chalk-yellow/80 text-center space-y-6 shadow-inner">
              <span className="text-xs text-teal-300 font-dodum uppercase tracking-widest">
                문제 #{correctCount + 1} | x의 값을 구하세요!
              </span>

              {/* 방정식 서식 출력 */}
              <div className="font-pen text-5xl sm:text-6xl text-chalk-yellow chalk-yellow-shadow tracking-wider py-2">
                {currentProblem.equationStr}
              </div>

              {/* 정답 입력 폼 */}
              <form onSubmit={handleSubmitAnswer} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-3 font-pen text-2xl text-teal-400">x =</span>
                  <input
                    ref={inputRef}
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="정수 입력"
                    className="w-full pl-14 pr-4 py-3 bg-teal-900 border-2 border-dashed border-chalk-white rounded-xl text-chalk-white font-mono text-2xl text-center focus:outline-none focus:border-chalk-yellow"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-teal-950 font-bold text-lg rounded-xl border-2 border-dashed border-amber-900 shadow-md transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>제출</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* 이전 문제 피드백 메시지 */}
            {feedback && (
              <div
                className={`p-4 rounded-xl border border-dashed font-dodum text-sm space-y-1 animate-fadeIn ${
                  feedback.type === "correct"
                    ? "bg-emerald-950/80 border-emerald-400 text-emerald-200"
                    : "bg-rose-950/80 border-rose-400 text-rose-200"
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-base">
                  {feedback.type === "correct" ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  <span>{feedback.text}</span>
                </div>
                {feedback.explanation && (
                  <p className="text-xs text-rose-300/90 italic pl-7">
                    💡 풀이 과정: {feedback.explanation}
                  </p>
                )}
              </div>
            )}

          </div>
        )}

        {/* === 3. 게임 종료 결과 화면 === */}
        {gameState === "ended" && (
          <div className="max-w-md mx-auto text-center space-y-6 py-4">
            <div className="p-6 bg-teal-950/90 rounded-2xl border-2 border-dashed border-chalk-yellow/80 space-y-4 shadow-xl">
              <span className="text-5xl">🎉</span>
              <h3 className="font-pen text-4xl text-chalk-yellow chalk-yellow-shadow">게임 종료!</h3>
              <p className="font-dodum text-teal-200 text-sm">{studentName} 선생님/학생의 최종 기록</p>

              {/* 기록 요약 전광판 */}
              <div className="grid grid-cols-3 gap-2 bg-teal-900 p-3 rounded-xl border border-dashed border-teal-600 text-center font-mono">
                <div>
                  <span className="text-[10px] text-teal-300 block">최종 점수</span>
                  <span className="font-pen text-2xl text-chalk-yellow">{score}점</span>
                </div>
                <div>
                  <span className="text-[10px] text-teal-300 block">맞춘 문제</span>
                  <span className="font-pen text-2xl text-chalk-white">{correctCount}개</span>
                </div>
                <div>
                  <span className="text-[10px] text-teal-300 block">최대 콤보</span>
                  <span className="font-pen text-2xl text-chalk-pink">{maxCombo}회</span>
                </div>
              </div>

              {saveStatus && (
                <p className="text-xs font-dodum text-emerald-300 bg-emerald-950/60 p-2 rounded border border-emerald-500/40">
                  {saveStatus}
                </p>
              )}

              <button
                onClick={startGame}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-teal-950 font-bold text-base rounded-xl border-2 border-dashed border-amber-900 shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
                <span>다시 도전하기</span>
              </button>
            </div>
          </div>
        )}

        {/* === 4. Supabase 실시간 랭킹 리더보드 (Bottom Section) === */}
        <div className="mt-8 pt-6 border-t-2 border-dashed border-teal-700/60">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-pen text-3xl text-chalk-yellow chalk-yellow-shadow flex items-center gap-2">
              <Trophy className="w-6 h-6 text-chalk-yellow" />
              <span>🏆 Supabase 명예의 전당 Top 10</span>
            </h3>
            <button
              onClick={fetchRankings}
              disabled={isLoadingRankings}
              className="px-3 py-1 bg-teal-950 hover:bg-teal-800 text-teal-300 rounded-lg text-xs font-dodum border border-dashed border-teal-500 cursor-pointer"
            >
              {isLoadingRankings ? "불러오는 중..." : "🔄 랭킹 갱신"}
            </button>
          </div>

          {rankings.length === 0 ? (
            <p className="text-center py-6 text-xs text-teal-300/60 font-dodum bg-teal-950/50 rounded-xl border border-dashed border-teal-800">
              아직 등록된 랭킹 기록이 없습니다. 첫 번째 랭킹의 주인공이 되어보세요!
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {rankings.map((rank, idx) => (
                <div
                  key={rank.id || `rank-${idx}`}
                  className={`p-3 rounded-xl border border-dashed text-center font-dodum relative transition-transform hover:scale-105 ${
                    idx === 0
                      ? "bg-amber-950/80 border-amber-400 text-amber-200"
                      : idx === 1
                      ? "bg-slate-900/80 border-slate-300 text-slate-200"
                      : idx === 2
                      ? "bg-orange-950/80 border-amber-700 text-amber-300"
                      : "bg-teal-950/70 border-teal-700 text-teal-200"
                  }`}
                >
                  <div className="text-lg mb-1">
                    {idx === 0 ? "🥇 1위" : idx === 1 ? "🥈 2위" : idx === 2 ? "🥉 3위" : `${idx + 1}위`}
                  </div>
                  <div className="font-pen text-2xl text-chalk-yellow truncate">
                    {rank.student_name}
                  </div>
                  <div className="font-mono text-sm font-bold text-chalk-white">
                    {rank.score}점
                  </div>
                  <div className="text-[10px] text-teal-300/70 mt-1">
                    {rank.correct_count}문제 | {rank.max_combo}콤보
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
