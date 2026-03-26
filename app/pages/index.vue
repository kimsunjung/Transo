<template>
  <div class="h-screen w-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans overflow-hidden">
    <!-- Header -->
    <header class="h-16 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg flex items-center px-6 sticky top-0 w-full z-50 transition-colors">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-[0_4px_14px_0_rgba(99,102,241,0.39)]">T</div>
        <h1 class="text-xl font-extrabold tracking-tight">Trans<span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">O</span></h1>
      </div>
      <div class="ml-auto text-xs text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-500/10 py-1.5 px-3 rounded-full border border-indigo-100 dark:border-indigo-500/20">
        MVP Beta
      </div>
    </header>

    <!-- Main Content Layout -->
    <main class="flex-1 flex flex-col lg:flex-row h-full overflow-hidden relative">
      <!-- Left Sidebar: Search & Results -->
      <section class="w-full lg:w-[420px] lg:min-w-[420px] h-1/2 lg:h-full overflow-y-auto border-r border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 p-6 flex flex-col z-20 shadow-2xl lg:shadow-none custom-scrollbar pb-24 lg:pb-6">
        <RouteSearchBox />
        
        <!-- Placeholder for Results / AI Insight -->
        <div class="mt-6 flex-1 flex flex-col gap-4">
          
          <!-- Default Placeholder -->
          <div v-if="!state.routeData && !state.isRouting" class="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 flex flex-col items-center justify-center text-center text-slate-400 h-full bg-slate-100/30 dark:bg-slate-800/30 backdrop-blur-sm hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
            <div class="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-400 dark:text-slate-500 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 class="text-slate-700 dark:text-slate-300 font-bold mb-2">경로를 먼저 검색해주세요</h3>
            <p class="text-sm leading-relaxed">경로를 검색하면 AI가 사용자의 걷는 속도와<br/>실시간 대중교통 상황을 분석해<br/><span class="font-semibold text-indigo-500">환승 성공률을 위트있게 </span>알려드립니다.</p>
          </div>

          <!-- Loading State -->
          <div v-else-if="state.isAnalyzing" class="rounded-2xl border border-blue-200 dark:border-blue-900/50 p-8 flex flex-col items-center justify-center text-center text-blue-500 bg-blue-50/50 dark:bg-blue-900/10 animate-pulse h-full">
             <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
             <p class="font-bold">AI가 환승 생존율을 열심히 계산 중입니다...</p>
             <p class="text-xs text-blue-400 mt-2">잠시만 기다려주세요 🤖</p>
          </div>

          <!-- AI Data Display -->
          <div v-else-if="state.aiData" class="rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 flex flex-col transition-all backdrop-blur-md">
             <div class="p-5" :class="{
                'bg-emerald-500 text-white': state.aiData.status === '안전',
                'bg-amber-500 text-white': state.aiData.status === '위험' || state.aiData.status === 'warning',
                'bg-red-500 text-white': state.aiData.status === '불가능' || state.aiData.status === '오류',
                'bg-slate-500 text-white': !['안전','위험','불가능','warning','오류'].includes(state.aiData.status)
             }">
                <div class="flex justify-between items-center">
                   <h3 class="font-bold text-xl flex items-center gap-2 drop-shadow-sm">
                     <span v-if="state.aiData.status === '안전'">✅</span>
                     <span v-else-if="state.aiData.status === '위험'">⚠️</span>
                     <span v-else-if="state.aiData.status === '불가능'">🚨</span>
                     <span v-else>🤖</span>
                     {{ state.aiData.status }}
                   </h3>
                   <div class="font-black text-3xl tracking-tighter drop-shadow-md bg-white/20 px-3 py-1 rounded-lg" v-if="state.aiData.probability !== undefined">{{ state.aiData.probability }}%</div>
                </div>
             </div>
             <div class="p-6 flex flex-col gap-4">
                <p class="text-slate-800 dark:text-slate-200 font-semibold leading-relaxed text-[15px]">
                  "{{ state.aiData.insight }}"
                </p>
                <div v-if="state.aiData.transfers" class="mt-2 text-sm font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3 shadow-inner">
                  <span class="text-lg">💡</span>
                  <span class="leading-relaxed">{{ state.aiData.transfers }}</span>
                </div>
             </div>
          </div>

          <!-- Path Basic Info Fallback Area -->
          <div v-if="state.routeData && state.routeData.path" class="rounded-2xl border border-slate-200 dark:border-slate-700 p-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md w-full shadow-md">
             <div class="flex justify-between items-center mb-3">
               <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">추천 경로 예상 시간</span>
               <span class="font-black text-2xl text-blue-600 dark:text-blue-400">{{ state.routeData.path[0].info.totalTime }}분</span>
             </div>
             <div class="flex gap-4 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
               <div>도보 <span class="text-slate-800 dark:text-slate-100">{{ state.routeData.path[0].info.totalWalkTime }}분</span></div>
               <div class="w-px h-full bg-slate-300 dark:bg-slate-700"></div>
               <div>거리 <span class="text-slate-800 dark:text-slate-100">{{ (state.routeData.path[0].info.totalDistance / 1000).toFixed(1) }}km</span></div>
               <div class="w-px h-full bg-slate-300 dark:bg-slate-700"></div>
               <div>요금 <span class="text-slate-800 dark:text-slate-100">{{ state.routeData.path[0].info.payment.toLocaleString() }}원</span></div>
             </div>
          </div>
        </div>
      </section>

      <!-- Right Area: Map -->
      <section class="flex-1 h-1/2 lg:h-full relative bg-slate-200 dark:bg-slate-800 lg:order-last order-first z-10 w-full shadow-inner">
        <TransferMap />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import TransferMap from '~/components/TransferMap.vue'
import RouteSearchBox from '~/components/RouteSearchBox.vue'
import { useRouteState } from '~/composables/useRouteState'

const { state } = useRouteState()
</script>

<style>
/* Reset body margin and prevent bouncy scrolling on mobile */
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  overscroll-behavior-y: none;
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 20px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(75, 85, 99, 0.4);
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.5);
}
</style>
