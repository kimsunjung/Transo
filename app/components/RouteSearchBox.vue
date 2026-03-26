<template>
  <div class="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-6 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200 dark:border-slate-700 w-full flex flex-col gap-4 transition-all">
    <h2 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400 whitespace-nowrap">
      어디로 갈까요? 🚀
    </h2>
    <p class="text-xs text-slate-500 dark:text-slate-400 mb-2">실시간 대중교통 정보와 AI가 환승 성공률을 예측해드려요.</p>

    <!-- Forms -->
    <div class="flex flex-col gap-3">
      <!-- Departure -->
      <div class="relative">
        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">출발지</label>
        <div class="relative flex items-center transform transition-transform focus-within:scale-[1.01]">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div class="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
          </div>
          <input 
            v-model="startPoint" 
            type="text" 
            placeholder="예: 강남역"
            class="w-full pl-8 pr-4 py-2.5 rounded-lg bg-slate-50 hover:bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      <!-- Connecting line between start and end -->
      <div class="relative h-2 -my-2 flex pl-4 z-0">
        <div class="w-0.5 h-full bg-slate-200 dark:bg-slate-700"></div>
      </div>

      <!-- Destination -->
      <div class="relative">
        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">도착지</label>
        <div class="relative flex items-center transform transition-transform focus-within:scale-[1.01]">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div class="w-2.5 h-2.5 rounded-full border-[2.5px] border-indigo-500 bg-white dark:bg-slate-900 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
          </div>
          <input 
            v-model="endPoint" 
            type="text" 
            placeholder="예: 홍대입구역"
            class="w-full pl-8 pr-4 py-2.5 rounded-lg bg-slate-50 hover:bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      <!-- Settings -->
      <div class="grid grid-cols-2 gap-3 mt-3">
        <div class="relative">
          <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">출발 날짜</label>
          <div class="relative flex items-center">
            <input 
              v-model="departureDate" 
              type="date" 
              class="w-full px-3 py-2 rounded-lg bg-slate-50 hover:bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors text-sm text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>
        <div class="relative">
          <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">출발 시간</label>
          <div class="relative flex items-center">
            <input 
              v-model="departureTime" 
              type="time" 
              class="w-full px-3 py-2 rounded-lg bg-slate-50 hover:bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors text-sm text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Action -->
    <button @click="onSearch" :disabled="state.isRouting" class="mt-4 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 transform active:scale-[0.98] active:translate-y-0 flex items-center justify-center gap-2 group">
      <svg v-if="state.isRouting" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 group-hover:animate-pulse focus:outline-none" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
      </svg>
      {{ state.isRouting ? '경로 탐색 중...' : '경로 및 생존율 예측하기' }}
    </button>

    <!-- Error Message -->
    <div v-if="state.routeError" class="mt-2 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800/50">
      {{ state.routeError }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouteState } from '~/composables/useRouteState'

const startPoint = ref('')
const endPoint = ref('')
const departureDate = ref('')
const departureTime = ref('')

const { state, findRoute } = useRouteState()

const onSearch = async () => {
  if (!startPoint.value || !endPoint.value) {
    state.value.routeError = '출발지와 도착지를 입력해주세요.'
    return
  }
  await findRoute(startPoint.value, endPoint.value)
}

onMounted(() => {
  const now = new Date()
  departureDate.value = now.toISOString().split('T')[0]
  departureTime.value = now.toTimeString().slice(0, 5)
})
</script>
