export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()
  
  if (!config.geminiApiKey) {
    return {
      status: 'warning',
      insight: 'Gemini API 키가 셋업되어있지 않아 환승 생존율을 분석할 수 없어요! 안전운행 하세요 🚌'
    }
  }

  // extract minimal info to save token costs
  const optimizedData = body.pathData?.map((sp: any) => ({
    type: sp.trafficType === 1 ? '지하철' : sp.trafficType === 2 ? '버스' : sp.trafficType === 3 ? '도보' : '기타',
    start: sp.startName,
    end: sp.endName,
    time: sp.sectionTime,
    dist: sp.distance
  }))

  const pathContent = JSON.stringify(optimizedData)
  
  const prompt = `
당신은 대중교통 환승을 도와주는 매운맛(?) AI 'TransO' 입니다. 친근하면서도 팩트폭력을 날리는 위트있는 어조로 답변합니다. 예를 들어 "뛰지 않으면 지하철을 놓칩니다!"와 같이 유머러스하고 약간은 긴장감을 주는 멘트가 좋습니다.
다음은 사용자가 검색한 대중교통 경로 요약 데이터입니다. (도보/탑승 시간이 혼합됨)

경로 데이터:
${pathContent}

위 경로에서 '도보 시간'과 '환승 횟수'를 고려하여, 사용자가 제 시간에 무사히 목적지에 도달할 "환승 성공 및 생존 확률"을 3단계 등급(안전/위험/불가능)으로 평가해주세요.

반드시 다음 JSON 포맷으로 답해주세요. (마크다운 백틱 없이 순수 JSON만 반환할 것)
{
  "status": "안전" | "위험" | "불가능" | "warning",
  "probability": 숫자(0~100),
  "insight": "유머러스한 조언 내용 (긴장감+팩트폭력 섞인 내용)",
  "transfers": "환승 난이도에 대한 1줄 요약평"
}
`

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${config.geminiApiKey}`
    
    const response: any = await $fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          responseMimeType: "application/json"
        }
      }
    })

    const textOutput = response.candidates?.[0]?.content?.parts?.[0]?.text
    if (textOutput) {
      return JSON.parse(textOutput)
    } else {
      throw new Error('No valid content from Gemini')
    }
  } catch (err: any) {
    console.error('Gemini API Error:', err)
    return {
      status: '오류',
      insight: 'AI가 생각하느라 지각(?)중입니다. 잠시 후 다시 시도해주세요.',
      probability: 0,
      transfers: "분석 실패"
    }
  }
})
