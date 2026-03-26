# Transo

실시간 대중교통 데이터와 네이버 지도를 결합하여, 최적의 환승 타이밍과 성공 확률을 알려주는 대시보드 웹 서비스.

## Tech Stack

- **Framework**: Nuxt 4 (SSR)
- **Language**: TypeScript
- **CSS**: Tailwind CSS
- **Map**: Naver Maps JavaScript API v3
- **Transit API**: ODsay
- **AI**: Google Gemini 2.5 Flash

## Getting Started

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일에 API 키 입력

# 개발 서버 실행
npm run dev
```

## Environment Variables

`.env.example` 파일을 참고하세요.

| 변수 | 설명 |
|---|---|
| `NAVER_CLIENT_ID` | 네이버 클라우드 플랫폼 Maps Client ID |
| `ODSAY_API_KEY` | ODsay 대중교통 경로 API 키 |
| `GEMINI_API_KEY` | Google Gemini API 키 |
