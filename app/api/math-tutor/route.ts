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

    // OpenAI API 키가 설정되지 않은 경우 친절한 안내 및 내장 지식 응답 제공
    if (!apiKey || apiKey.trim() === "") {
      const fallbackReply = generateFallbackResponse(message);
      return NextResponse.json({
        reply: `${fallbackReply}\n\n💡 *안내: Vercel 대시보드의 Environment Variables에 OPENAI_API_KEY를 등록하시면 더욱 풍부한 최신 AI 답변을 실시간으로 이용하실 수 있습니다.*`,
        isFallback: true,
      });
    }

    // 시스템 프롬프트 (지윤샘 AI 수학 튜터 페르소나 설정)
    const systemMessage = {
      role: "system",
      content: `당신은 '지윤샘의 AI 수학 튜터'입니다. 초·중등 학생들과 선생님들을 위해 수학 개념과 문제를 친절하고 알기 쉽게 단계별로 설명하는 친근한 수학 선생님입니다.
      
[답변 지침]
1. 항상 따뜻하고 격려하는 어조(~해요, ~랍니다! ✏️)로 대화하세요.
2. 수학 개념(정비례, 반비례, 좌표평면, 사분면, 일차방정식 등)에 대해 일상생활 예시를 들어 직관적으로 설명해 주세요.
3. 방정식 문제 풀이 요청 시 1단계(이항하기), 2단계(양변 정리), 3단계(해 구하기)와 같이 과정별로 나누어 꼼꼼히 설명해 주세요.
4. 마크다운 형식(불릿 포인트, 강조, 이모지)을 적극 활용하여 읽기 쉽게 작성해 주세요.`,
    };

    // 대화 이력 구성 (최근 6개 대화 유지)
    const formattedHistory = Array.isArray(history)
      ? history.slice(-6).map((msg: { sender: string; text: string }) => ({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.text,
        }))
      : [];

    const messages = [systemMessage, ...formattedHistory, { role: "user", content: message }];

    // OpenAI API 호출 (gpt-4o-mini 모델 사용)
    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!openAiResponse.ok) {
      const errorData = await openAiResponse.json().catch(() => ({}));
      console.error("OpenAI API 에러:", errorData);
      
      // 모델 변경 시도 (gpt-3.5-turbo 폴백)
      const fallbackOpenAi = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages,
          temperature: 0.7,
          max_tokens: 800,
        }),
      });

      if (fallbackOpenAi.ok) {
        const data = await fallbackOpenAi.json();
        const reply = data.choices[0]?.message?.content || "죄송해요, 답변을 생성하지 못했어요.";
        return NextResponse.json({ reply });
      }

      return NextResponse.json({
        reply: `😊 API 연결 확인 안내: ${errorData.error?.message || "OpenAI API 호출 중 오류가 발생했습니다."}\n\n${generateFallbackResponse(message)}`,
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

// API 키 미설정 시 기초 수학 질문에 대한 친절한 내장 응답 생성기
function generateFallbackResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes("방정식") || q.includes("x=") || q.includes("x값")) {
    return `✏️ **일차방정식 풀이 기본 원리 안내**
    
일차방정식은 등식의 성질을 이용하여 미지수 **x**만 좌변에 남기는 것이 핵심이에요!

1. **이항하기**: 변수가 있는 항은 좌변으로, 숫자는 우변으로 이항해요 (부호가 바뀌는 것 주의!).
   - 예: \`2x + 3 = 11\` ➔ \`2x = 11 - 3\`
2. **동류항 정리**: 우변 계산 ➔ \`2x = 8\`
3. **양변 나누기**: x의 계수(2)로 양변을 나눠요 ➔ \`x = 4\`!`;
  }

  if (q.includes("정비례") || q.includes("반비례")) {
    return `📈 **정비례와 반비례의 핵심 차이점**

- **정비례 ($y = ax$)**: x가 2배, 3배가 될 때 y도 2배, 3배가 되는 관계예요! 원점(0,0)을 지나는 직선 모양이랍니다.
  - 예: 한 개에 500원 하는 과자를 x개 살 때 가격 y원 ($y = 500x$)
- **반비례 ($y = a/x$)**: x가 2배, 3배가 될 때 y는 1/2배, 1/3배가 되는 관계예요! 1·3사분면 또는 2·4사분면에 위치하는 매끄러운 곡선(쌍곡선) 모양이에요.
  - 예: 12개의 사탕을 x명이 똑같이 나누어 먹을 때 1명당 받는 개수 y개 ($y = 12/x$)`;
  }

  if (q.includes("사분면") || q.includes("좌표")) {
    return `🧭 **좌표평면과 사분면 안내**

좌표평면은 X축과 Y축이 직교하여 4개의 구역으로 나뉘어요!

- **제1사분면**: (+ , +) 우상단 (x>0, y>0)
- **제2사분면**: (- , +) 좌상단 (x<0, y>0)
- **제3사분면**: (- , -) 좌하단 (x<0, y<0)
- **제4사분면**: (+ , -) 우하단 (x>0, y<0)
- **원점 (0,0)**: X축과 Y축이 만나는 정중앙 점이랍니다!`;
  }

  return `✏️ **지윤샘 AI 수학 튜터의 답변**

질문하신 내용 [**"${query}"**]에 대해 탐구해볼까요?
수학 개념이나 일차방정식, 정비례·반비례 그래프, 좌표평면에 관한 어떤 질문이든 구체적으로 적어주시면 단계별로 쉽게 설명해 드릴게요!`;
}
