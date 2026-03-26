<template>
  <div ref="mapEl" class="w-full h-full" />
</template>

<script setup lang="ts">
const mapEl = ref<HTMLElement | null>(null)

// window.naver가 준비될 때까지 폴링 (스크립트 로딩 지연 대응)
function waitForNaver(timeout = 5000): Promise<any> {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    const check = () => {
      if ((window as any).naver?.maps) {
        resolve((window as any).naver)
      } else if (Date.now() - start > timeout) {
        reject(new Error('[Transo] Naver Maps 로딩 타임아웃. NAVER_CLIENT_ID를 확인해주세요.'))
      } else {
        setTimeout(check, 100)
      }
    }
    check()
  })
}

onMounted(async () => {
  if (!mapEl.value) return

  try {
    const naver = await waitForNaver()
    new naver.maps.Map(mapEl.value, {
      center: new naver.maps.LatLng(37.4299, 127.2552), // 경기 광주역
      zoom: 15,
      mapTypeId: naver.maps.MapTypeId.NORMAL,
    })
  } catch (e) {
    console.error(e)
  }
})
</script>
