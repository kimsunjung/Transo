<template>
  <div class="relative w-full h-full">
    <div id="map" class="w-full h-full bg-slate-100 dark:bg-slate-800"></div>
    <!-- Loading Overlay -->
    <div v-if="loading" class="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/10 backdrop-blur-sm">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouteState } from '~/composables/useRouteState'

const mapInstance = ref<any>(null)
const loading = ref(true)
const polylines = ref<any[]>([])
const markers = ref<any[]>([])

const { state } = useRouteState()

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  clearMap()
})

const initMap = () => {
  if (typeof window !== 'undefined' && (window as any).naver && (window as any).naver.maps) {
    const naverObj = (window as any).naver
    const mapOptions = {
      center: new naverObj.maps.LatLng(37.5666805, 126.9784147), // Seoul City Hall
      zoom: 14,
      mapTypeControl: false,
      zoomControl: true,
      scaleControl: true,
      logoControl: false,
      mapDataControl: false,
      minZoom: 10
    }
    
    mapInstance.value = new naverObj.maps.Map('map', mapOptions)
    loading.value = false
  } else {
    // Retry if script isn't loaded yet
    setTimeout(initMap, 500)
  }
}

watch(() => state.value.routeData, async (newData) => {
  if (!newData || !mapInstance.value) return
  
  clearMap()

  // For MVP, grab the first recommended path
  const path = newData.path?.[0]
  if (!path) return

  const mapObj = path.info?.mapObj
  if (mapObj) {
    try {
      const gData: any = await $fetch(`/api/polyline?mapObject=${mapObj}`)
      if (gData && gData.result && gData.result.lane) {
         drawPolyline(gData.result.lane)
      }
    } catch (e) {
      console.error('Failed to load true polyline', e)
    }
  }
  
  // Adjust bounds
  if (path.info?.firstStartStationX && path.info?.firstStartStationY) {
      const naverObj = (window as any).naver
      const minX = Math.min(path.info.firstStartStationX, path.info.lastEndStationX)
      const maxX = Math.max(path.info.firstStartStationX, path.info.lastEndStationX)
      const minY = Math.min(path.info.firstStartStationY, path.info.lastEndStationY)
      const maxY = Math.max(path.info.firstStartStationY, path.info.lastEndStationY)

      const bounds = new naverObj.maps.LatLngBounds(
          new naverObj.maps.LatLng(minY, minX),
          new naverObj.maps.LatLng(maxY, maxX)
      )
      // Slight delay to allow map elements to settle
      setTimeout(() => mapInstance.value.fitBounds(bounds, { margin: 50 }), 300)
  }
  
  if (path.subPath) {
      drawOverlays(path.subPath)
  }
})

let trackingInterval: any = null

const drawOverlays = (subPaths: any[]) => {
  const naverObj = (window as any).naver
  
  subPaths.forEach((sp: any, index: number) => {
    // We want to overlay transfer instructions directly on the map
    if ((sp.trafficType === 1 || sp.trafficType === 2) && sp.startX && sp.startY) {
      
      const contentString = `
        <div style="background:rgba(255,255,255,0.95); border-radius:12px; padding:6px 12px; box-shadow:0 4px 15px rgba(0,0,0,0.15); border:1px solid #e2e8f0; transform: translate(-50%, -130%); font-family:sans-serif; text-align:center; min-width: 80px; backdrop-filter: blur(4px);">
          <div style="font-size:12px; font-weight:bold; color:#334155; margin-bottom:4px; white-space:nowrap;">${sp.startName}</div>
          <div style="font-size:11px; color:#64748b;">
             <span style="display:inline-block; padding:2px 6px; background:${sp.trafficType === 1 ? '#e0e7ff' : '#d1fae5'}; color:${sp.trafficType === 1 ? '#4f46e5' : '#059669'}; border-radius:6px; font-weight:bold; font-size:10px;">
                ${sp.lane?.[0]?.name || (sp.trafficType === 1 ? '지하철' : '버스')}
             </span>
             탑승
          </div>
          <div style="position:absolute; bottom:-6px; left:50%; margin-left:-6px; width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; border-top:6px solid rgba(255,255,255,0.95);"></div>
        </div>
      `
      
      const overlay = new naverObj.maps.Marker({
         map: mapInstance.value,
         position: new naverObj.maps.LatLng(sp.startY, sp.startX),
         icon: {
            content: contentString,
            anchor: new naverObj.maps.Point(0, 0),
         },
         zIndex: 10
      })
      markers.value.push(overlay)
    }
  })
}

const clearMap = () => {
  if (trackingInterval) clearInterval(trackingInterval)
  polylines.value.forEach(p => p.setMap(null))
  polylines.value = []
  markers.value.forEach(m => m.setMap(null))
  markers.value = []
}

const drawPolyline = (lanes: any[]) => {
  const naverObj = (window as any).naver
  
  lanes.forEach((lane) => {
     const strokeColor = lane.class === 1 ? '#6366f1' : '#10b981'
     
     lane.section.forEach((sec: any) => {
        const pathCoords = sec.graphPos.map((pos: any) => 
           new naverObj.maps.LatLng(pos.y, pos.x)
        )
        
        const polyline = new naverObj.maps.Polyline({
            map: mapInstance.value,
            path: pathCoords,
            strokeWeight: 7,
            strokeColor: strokeColor,
            strokeOpacity: 0.9,
            strokeStyle: 'solid',
            strokeLineCap: 'round',
            strokeLineJoin: 'round',
        })
        polylines.value.push(polyline)
     })
  })
  
  startRealtimeTracking(lanes)
}

const startRealtimeTracking = (lanes: any[]) => {
  if (trackingInterval) clearInterval(trackingInterval)
  
  // Find first bus or subway lane 
  const transitLane = lanes.find(l => l.class === 1 || l.class === 2)
  if (!transitLane || !transitLane.section || !transitLane.section[0]) return

  const firstSection = transitLane.section[0]
  const pathCoords = firstSection.graphPos.map((pos: any) => 
     new (window as any).naver.maps.LatLng(pos.y, pos.x)
  )
  
  if (pathCoords.length < 2) return

  const markerIcon = transitLane.class === 1 ? '🚇' : '🚌'
  const strokeColor = transitLane.class === 1 ? '#6366f1' : '#10b981'
  
  const vehicleMarker = new (window as any).naver.maps.Marker({
      position: pathCoords[0],
      map: mapInstance.value,
      icon: {
          content: `<div style="font-size:20px; background:white; border-radius:50%; padding:4px; box-shadow:0 4px 10px rgba(0,0,0,0.3); outline: 3px solid ${strokeColor}; display:flex; align-items:center; justify-content:center; width:36px; height:36px; transform:translateY(0); transition: transform 0.2s; animation: bounce 2s infinite;">${markerIcon}</div>`,
          anchor: new (window as any).naver.maps.Point(18, 18)
      },
      zIndex: 100
  })
  markers.value.push(vehicleMarker)

  // Polling Real-time proxy every 1 second
  trackingInterval = setInterval(async () => {
     try {
       const rt: any = await $fetch('/api/realtime')
       if (rt && rt.data) {
         const progress = rt.data.progress
         const totalPoints = pathCoords.length - 1
         const exactIndex = totalPoints * progress
         const lowerIndex = Math.floor(exactIndex)
         const upperIndex = Math.ceil(exactIndex)
         const weight = exactIndex - lowerIndex
         
         if (lowerIndex < pathCoords.length && upperIndex < pathCoords.length) {
            const p1 = pathCoords[lowerIndex]
            const p2 = pathCoords[upperIndex]
            
            const newLat = p1.lat() + (p2.lat() - p1.lat()) * weight
            const newLng = p1.lng() + (p2.lng() - p1.lng()) * weight
            
            vehicleMarker.setPosition(new (window as any).naver.maps.LatLng(newLat, newLng))
         }
       }
     } catch (e) {
       console.error("Realtime fetch failed", e)
     }
  }, 1000)
}
</script>

<style scoped>
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
</style>
