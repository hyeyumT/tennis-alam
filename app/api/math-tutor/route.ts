import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "질문 내용을 입력해주세요." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // OpenAI API 키 미설정 시 수식 표기 내장 답변 제공
    if (!apiKey || apiKey.trim() === "") {
      const fallbackReply = generateFallbackResponse(message);
      return NextResponse.json({
        reply: `${fallbackReply}\n\n💡 *안내: Vercel 대시보드의 Environment Variables에 OPENAI_API_KEY를 등록하시면 더 다양하고 풍부한 수식 해설을 실시간으로 받으실 수 있습니다.*`,
        isFallback: true,
      });
    }

    // 시스템 프롬프트 (수식 LaTeX 및 $...$ 수학 표기법 강제 지침)
    const systemMessage = {
      role: "system",
      content: `당신은 '지윤샘의 AI 수학 튜터'입니다. 초·중등 수학 개념과 문제를 친절하고 알기 쉽게 단계별 수식으로 설명하는 수학 선생님입니다.

[수식 표기 및 답변 필수 지침]
1. 모든 수식과 미지수, 수치 표현은 라텍스(LaTeX) 기호 $...$ (인라인 수식) 또는 $$...$$ (블록 수식)을 사용하여 명확하게 작성하세요.
   - 예시 인라인 수식: $2x + 3 = 11$, $y = ax$, $y = \\frac{a}{x}$, $(x, y)$, $x = 4$
   - 예시 블록 수식:
     $$2x + 3 = 11$$
     $$2x = 8$$
     $$x = 4$$
2. 풀이 과정을 설명할 때는 1단계(이항하기), 2단계(동류항 정리), 3단계(x의 해 구하기)와 같이 수식을 순서대로 나열해 주세요.
3. 항상 다정하고 격려하는 한국어 말투(~해요, ~랍니다! ✏️)를 사용하세요.`,
    };

    const formattedHistory = Array.isArray(history)
      ? history.slice(-6).map((msg: { sender: string; text: string }) => ({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.text,
        }))
      : [];

    const messages = [systemMessage, ...formattedHistory, { role: "user", content: message }];

    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.5,
        max_tokens: 1000,
      }),
    });

    if (!openAiResponse.ok) {
      const errorData = await openAiResponse.json().catch(() => ({}));
      console.error("OpenAI API 에러:", errorData);

      const fallbackOpenAi = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages,
          temperature: 0.5,
          max_tokens: 1000,
        }),
      });

      if (fallbackOpenAi.ok) {
        const data = await fallbackOpenAi.json();
        const reply = data.choices[0]?.message?.content || "죄송해요, 수식 답변을 생성하지 못했어요.";
        return NextResponse.json({ reply });
      }

      return NextResponse.json({
        reply: `😊 API 연결 안내: ${errorData.error?.message || "OpenAI API 호출 중 오류가 발생했습니다."}\n\n${generateFallbackResponse(message)}`,
        isFallback: true,
      });
    }

    const data = await openAiResponse.json();
    const reply = data.choices[0]?.message?.content || "답변을 가져오지 못했어요. 다시 질문해 주시겠어요?";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Math Tutor Route Exception:", error);
    return NextResponse.json(
      { error: "서버 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 수식 표기가 포함된 내장 답변 생성기
function generateFallbackResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes("방정식") || q.includes("x=") || q.includes("x값")) {
    return `✏️ **일차방정식 수식 풀이 가이드**

일차방정식은 등식의 성질을 이용하여 미지수 $x$만 좌변에 남기는 것이 핵심이에요!

예시 문제: $2x + 3 = 11$

- **1단계: 이항하기** (숫자 항을 우변으로 이동)
  $$2x = 11 - 3$$
- **2단계: 우변 계산하기**
  $$2x = 8$$
- **3단계: 양변을 $x$의 계수인 $2$로 나누기**
  $$x = \\frac{8}{2} = 4$$

최종 정답: $x = 4$ 🎯`;
  }

  if (q.includes("정비례") || q.includes("반비례")) {
    return `📈 **정비례와 반비례 수식 관계 비교**

- **정비례 관계식**: $y = ax$ ($a \\neq 0$)
  - $x$가 $2$배, $3$배가 될 때 $y$도 $2$배, $3$배가 돼요!
  - 그래프는 원점 $O(0,0)$을 지나는 직선 모양이랍니다.

- **반비례 관계식**: $y = \\frac{a}{x}$ ($x \\neq 0$)
  - $x$가 $2$배, $3$배가 될 때 $y$는 $\\frac{1}{2}$배, $\\frac{1}{3}$배가 돼요!
  - 그래프는 $x$축과 $y$축에 한없이 가까워지는 매끄러운 쌍곡선 모양이랍니다.`;
  }

  if (q.includes("사분면") || q.includes("좌표")) {
    return `🧭 **좌표평면과 사분면의 수식 부호**

좌표평면 상의 임의의 점은 순서쌍 $(x, y)$로 나타내요!

- **제1사분면**: $x > 0, y > 0 \ \rightarrow \ (+, +)$
- **제2사분면**: $x < 0, y > 0 \ \rightarrow \ (-, +)$
- **제3사분면**: $x < 0, y < 0 \ \rightarrow \ (-, -)$
- **제4사분면**: $x > 0, y < 0 \ \rightarrow \ (+, -)$
- **원점**: $O(0,0)$`;
  }

  return `✏️ **지윤샘 AI 수학 튜터의 답변**

질문하신 내용 [**"${query}"**]에 대한 수학 수식 해설이에요!
풀고자 하는 방정식이나 공식(예: $2x + 5 = 15$)을 입력해 주시면 단계별 수식으로 친절하게 풀이해 드립니다!`;
}
