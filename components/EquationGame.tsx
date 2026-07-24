"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Zap, Trophy, Timer, Flame, Award, RotateCcw, CheckCircle2, XCircle, Send, Copy, AlertTriangle, Code } from "lucide-react";
import { supabase, isSupabaseConfigured, EquationGameRankingRecord } from "@/lib/supabase";

interface Problem {
  equationStr: string;
  solution: number;
  stepExplanation: string;
}

// SQL 복사용 전체 DDL 쿼리문
const SQL_DDL_SCRIPT = `-- [수학은 이지윤] Supabase 테이블 & RLS 보안 정책 생성 스크립트
create table if not exists public.equation_game_rankings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  student_name text not null,
  score integer not null,
  correct_count integer not null,
  max_combo integer not null default 1
);

alter table public.equation_game_rankings enable row level security;

drop policy if exists "Allow public read access to equation rankings" on public.equation_game_rankings;
drop policy if exists "Allow public insert access to equation rankings" on public.equation_game_rankings;

create policy "Allow public read access to equation rankings"
  on public.equation_game_rankings for select using (true);

create policy "Allow public insert access to equation rankings"
  on public.equation_game_rankings for insert with check (true);

NOTIFY pgrst, 'reload schema';`;

export default function EquationGame() {
  const [gameState, setGameState] = useState<"idle" | "playing" | "ended">("idle");
  const [studentName, setStudentName] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);

  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [feedback, setFeedback] = useState<{ type: "correct" | "wrong"; text: string; explanation?: string } | null>(null);

  const [rankings, setRankings] = useState<EquationGameRankingRecord[]>([]);
  const [isLoadingRankings, setIsLoadingRankings] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [showSqlGuideModal, setShowSqlGuideModal] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // 로컬 스토리지 랭킹 저장/로드 (Supabase 미연동 시 폴백)
  const getLocalRankings = (): EquationGameRankingRecord[] => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("local_equation_rankings");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const saveLocalRanking = (record: EquationGameRankingRecord): EquationGameRankingRecord[] => {
    if (typeof window === "undefined") return [];
    try {
      const current = getLocalRankings();
      const updated = [...current, record].sort((a, b) => b.score - a.score).slice(0, 10);
      localStorage.setItem("local_equation_rankings", JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  };

  // 1. 문제 생성기
  const generateProblem = useCallback((): Problem => {
    const level = Math.floor(Math.random() * 3) + 1;
    const targetX = Math.floor(Math.random() * 19) - 9;
    const finalX = targetX === 0 ? 3 : targetX;

    if (level === 1) {
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
      let a = Math.floor(Math.random() * 5) + 2;
      let cVal = Math.floor(Math.random() * 4) + 1;
      if (a === cVal) a += 1;
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
      const b = Math.floor(Math.random() * 4) + 2;
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

  // 2. Supabase 랭킹 조회 (테이블이 없을 시 로컬 폴백 및 SQL 가이드 표시)
  const fetchRankings = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setRankings(getLocalRankings());
      return;
    }

    setIsLoadingRankings(true);
    try {
      const { data, error } = await supabase
        .from("equation_game_rankings")
        .select("*")
        .order("score", { ascending: false })
        .limit(10);

      if (error) {
        console.warn("Supabase 랭킹 조회 경고:", error.message);
        if (error.message.includes("Could not find the table") || error.code === "PGRST205") {
          setShowSqlGuideModal(true);
        }
        setRankings(getLocalRankings());
      } else if (data && data.length > 0) {
        setRankings(data as EquationGameRankingRecord[]);
        setShowSqlGuideModal(false);
      } else {
        setRankings(getLocalRankings());
      }
    } catch (err) {
      console.error("Rankings fetch exception:", err);
      setRankings(getLocalRankings());
    } finally {
      setIsLoadingRankings(false);
    }
  }, []);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  // 3. 게임 시작
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

  // 4. 60초 타이머
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

  // 5. 게임 종료 시 Supabase 랭킹 저장 (에러 시 사용자 안내 및 로컬 스토리지 저장)
  const saveScoreToSupabase = useCallback(async () => {
    if (score === 0 || !studentName.trim()) return;

    const newRecord: EquationGameRankingRecord = {
      student_name: studentName.trim(),
      score,
      correct_count: correctCount,
      max_combo: maxCombo,
    };

    // 우선 로컬에도 항상 안전하게 보관
    const updatedLocal = saveLocalRanking(newRecord);

    if (!isSupabaseConfigured()) {
      setSaveStatus({
        type: "info",
        text: "로컬 점수가 기록되었습니다. (Vercel에 Supabase DB 환경 변수 연결 시 클라우드 랭킹 공유 가능)",
      });
      setRankings(updatedLocal);
      return;
    }

    setSaveStatus({ type: "info", text: "Supabase DB에 랭킹 등록 중..." });

    try {
      const { error } = await supabase.from("equation_game_rankings").insert([newRecord]);

      if (error) {
        console.error("Supabase 저장 에러:", error);
        if (error.message.includes("Could not find the table") || error.code === "PGRST205") {
          setShowSqlGuideModal(true);
          setSaveStatus({
            type: "error",
            text: "⚠️ Supabase에 'equation_game_rankings' 테이블이 아직 생성되지 않았습니다! 아래 [SQL 생성 가이드]를 확인해 주세요.",
          });
        } else {
          setSaveStatus({ type: "error", text: `저장 안내: ${error.message}` });
        }
        setRankings(updatedLocal);
      } else {
        setSaveStatus({ type: "success", text: "🎉 Supabase 명예의 전당 랭킹 등록 성공!" });
        setShowSqlGuideModal(false);
        fetchRankings();
      }
    } catch (err) {
      console.error("Save score error:", err);
      setRankings(updatedLocal);
    }
  }, [score, studentName, correctCount, maxCombo, fetchRankings]);

  useEffect(() => {
    if (gameState === "ended" && score > 0) {
      saveScoreToSupabase();
    }
  }, [gameState, score, saveScoreToSupabase]);

  // 6. SQL 복사 버튼 핸들러
  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_DDL_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  // 7. 정답 제출
  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProblem || gameState !== "playing") return;

    const parsedUserAns = parseInt(userAnswer.trim(), 10);
    if (isNaN(parsedUserAns)) {
      setFeedback({ type: "wrong", text: "숫자를 입력해 주세요!" });
      return;
    }

    if (parsedUserAns === currentProblem.solution) {
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
      setCombo(0);
      setFeedback({
        type: "wrong",
        text: `❌ 아쉽네요! 정답은 x = ${currentProblem.solution} 입니다.`,
        explanation: currentProblem.stepExplanation,
      });
    }

    setUserAnswer("");
    setCurrentProblem(generateProblem());
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <section id="equation-game" className="w-full py-10 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* 타이틀 및 가이드 */}
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-950 rounded-full border border-dashed border-chalk-yellow text-chalk-yellow text-xs font-mono">
          <Zap className="w-4 h-4 text-chalk-yellow fill-chalk-yellow" />
          <span>중등 수학: 일차방정식 스피드 랭킹전</span>
        </div>
        <h2 className="font-pen text-4xl sm:text-5xl text-chalk-yellow chalk-yellow-shadow tracking-wide">
          ⚡ 일차방정식 스피드 랭킹 게임
        </h2>
        <p className="font-dodum text-sm sm:text-base text-teal-100/90 max-w-2xl mx-auto">
          60초 동안 일차방정식의 해 <strong>x</strong>의 값을 연속으로 맞춰 최고 점수에 도전해보세요! <br />
          결과는 <strong>Supabase 실시간 명예의 전당</strong>에 저장됩니다.
        </p>
      </div>

      {/* Supabase 테이블 미생성 안내 경고 모달 / 배너 */}
      {showSqlGuideModal && (
        <div className="mb-6 p-5 bg-amber-950/90 border-2 border-dashed border-amber-400 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-200 font-bold font-dodum text-base sm:text-lg">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <span>💡 Supabase 테이블 설정 안내 (equation_game_rankings 미생성)</span>
            </div>
            <button
              onClick={() => setShowSqlGuideModal(false)}
              className="text-xs text-amber-300 hover:text-white underline cursor-pointer"
            >
              닫기
            </button>
          </div>

          <p className="text-xs sm:text-sm text-amber-100 font-dodum leading-relaxed">
            Supabase 데이터베이스에 <code className="bg-amber-900 px-1 rounded text-chalk-yellow">equation_game_rankings</code> 테이블이 아직 설치되지 않았습니다. <br />
            <strong>Supabase 대시보드 -&gt; SQL Editor -&gt; New Query</strong>에 아래 SQL 버튼을 클릭하여 복사한 후 붙여넣고 <strong>Run</strong>을 누르시면 즉시 해결됩니다!
          </p>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleCopySql}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-teal-950 font-bold text-xs sm:text-sm rounded-xl border border-dashed border-amber-900 flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Copy className="w-4 h-4" />
              <span>{copiedSql ? "✅ SQL 쿼리문 복사 완료!" : "📋 Supabase SQL 쿼리문 복사하기"}</span>
            </button>

            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-teal-900 hover:bg-teal-800 text-amber-200 font-bold text-xs sm:text-sm rounded-xl border border-dashed border-teal-500 flex items-center gap-1.5"
            >
              <Code className="w-4 h-4 text-teal-300" />
              <span>Supabase 대시보드 열기 ↗</span>
            </a>
          </div>
        </div>
      )}

      {/* 메인 칠판 게임 프레임 */}
      <div className="wood-frame bg-teal-900 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
        
        {/* 대기 화면 */}
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

        {/* 게임 진행 화면 */}
        {gameState === "playing" && currentProblem && (
          <div className="max-w-2xl mx-auto space-y-6">
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

            <div className="bg-teal-950/90 p-8 rounded-2xl border-2 border-dashed border-chalk-yellow/80 text-center space-y-6 shadow-inner">
              <span className="text-xs text-teal-300 font-dodum uppercase tracking-widest">
                문제 #{correctCount + 1} | x의 값을 구하세요!
              </span>

              <div className="font-pen text-5xl sm:text-6xl text-chalk-yellow chalk-yellow-shadow tracking-wider py-2">
                {currentProblem.equationStr}
              </div>

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
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-teal-950 font-bold text-lg rounded-xl border-2 border-dashed border-amber-900 shadow-md cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>제출</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            {feedback && (
              <div
                className={`p-4 rounded-xl border border-dashed font-dodum text-sm space-y-1 ${
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

        {/* 게임 종료 화면 */}
        {gameState === "ended" && (
          <div className="max-w-md mx-auto text-center space-y-6 py-4">
            <div className="p-6 bg-teal-950/90 rounded-2xl border-2 border-dashed border-chalk-yellow/80 space-y-4 shadow-xl">
              <span className="text-5xl">🎉</span>
              <h3 className="font-pen text-4xl text-chalk-yellow chalk-yellow-shadow">게임 종료!</h3>
              <p className="font-dodum text-teal-200 text-sm">{studentName} 선생님/학생의 최종 기록</p>

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
                <p
                  className={`text-xs font-dodum p-2 rounded border border-dashed ${
                    saveStatus.type === "success"
                      ? "bg-emerald-950/80 border-emerald-400 text-emerald-200"
                      : saveStatus.type === "error"
                      ? "bg-rose-950/80 border-rose-400 text-rose-200"
                      : "bg-teal-900/80 border-teal-400 text-teal-200"
                  }`}
                >
                  {saveStatus.text}
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

        {/* 랭킹 보드 (Bottom Section) */}
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
