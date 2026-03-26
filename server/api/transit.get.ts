/**
 * 대중교통 실시간 데이터 API
 * - 공공데이터포털 (버스/지하철 실시간 위치)
 * - ODsay API (환승 경로 탐색)
 * TODO: 각 외부 API 연동 구현
 */
export default defineEventHandler(async (_event) => {
  return {
    status: 'ok',
    message: 'transit API 준비 중',
  }
})
