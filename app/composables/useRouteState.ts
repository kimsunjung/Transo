import { useState } from '#app'

export interface RouteState {
  isRouting: boolean
  routeData: any | null
  routeError: string | null
  isAnalyzing: boolean
  aiData: any | null
}

export const useRouteState = () => {
  const state = useState<RouteState>('routeState', () => ({
    isRouting: false,
    routeData: null,
    routeError: null,
    isAnalyzing: false,
    aiData: null,
  }))

  const geocode = async (address: string): Promise<{x: number, y: number} | null> => {
    return new Promise((resolve) => {
      const naverObj = (window as any).naver
      if (!naverObj || !naverObj.maps || !naverObj.maps.Service) {
        state.value.routeError = 'Naver Maps API (Geocoder) not loaded.'
        return resolve(null)
      }

      naverObj.maps.Service.geocode({ query: address }, (status: any, response: any) => {
        if (status === naverObj.maps.Service.Status.OK && response.v2.addresses.length > 0) {
          const { x, y } = response.v2.addresses[0]
          resolve({ x: parseFloat(x), y: parseFloat(y) })
        } else {
          resolve(null)
        }
      })
    })
  }

  const analyzeRoute = async (pathData: any) => {
    state.value.isAnalyzing = true
    state.value.aiData = null
    try {
      const response: any = await $fetch('/api/analyzer', {
        method: 'POST',
        body: { pathData }
      })
      state.value.aiData = response
    } catch (e) {
      console.error(e)
    } finally {
      state.value.isAnalyzing = false
    }
  }

  const findRoute = async (startAddr: string, endAddr: string) => {
    state.value.isRouting = true
    state.value.routeError = null
    state.value.routeData = null
    state.value.aiData = null

    try {
      const startCoords = await geocode(startAddr)
      if (!startCoords) throw new Error(`출발지 '${startAddr}'를 찾을 수 없습니다.`)

      const endCoords = await geocode(endAddr)
      if (!endCoords) throw new Error(`도착지 '${endAddr}'를 찾을 수 없습니다.`)

      const response: any = await $fetch('/api/route', {
        method: 'POST',
        body: {
          sx: startCoords.x,
          sy: startCoords.y,
          ex: endCoords.x,
          ey: endCoords.y
        }
      })

      if (response && response.result) {
        state.value.routeData = response.result
        if (response.result.path && response.result.path.length > 0) {
          analyzeRoute(response.result.path[0].subPath)
        }
      } else if (response && response.error) {
        throw new Error(response.error.msg || '경로를 찾을 수 없습니다.')
      } else {
        throw new Error('경로 탐색 실패')
      }
    } catch (e: any) {
      state.value.routeError = e.message || '오류가 발생했습니다.'
    } finally {
      state.value.isRouting = false
    }
  }

  return {
    state,
    findRoute,
    analyzeRoute
  }
}
