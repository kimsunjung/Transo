declare const naver: any

/**
 * 네이버 지도 인스턴스를 관리하는 composable
 * - 지도 생성/제거
 * - 마커, 오버레이 제어
 * - 뷰포트 이동
 */
export const useNaverMap = () => {
  const mapInstance = ref<any>(null)

  const initMap = (el: HTMLElement, options?: Record<string, any>) => {
    if (typeof naver === 'undefined') return

    mapInstance.value = new naver.maps.Map(el, {
      center: new naver.maps.LatLng(37.4299, 127.2552),
      zoom: 15,
      mapTypeId: naver.maps.MapTypeId.NORMAL,
      ...options,
    })
  }

  const moveTo = (lat: number, lng: number, zoom?: number) => {
    if (!mapInstance.value) return
    mapInstance.value.setCenter(new naver.maps.LatLng(lat, lng))
    if (zoom !== undefined) mapInstance.value.setZoom(zoom)
  }

  return { mapInstance, initMap, moveTo }
}
