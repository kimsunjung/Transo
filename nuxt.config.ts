// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss'],

  app: {
    head: {
      title: 'Transo',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '실시간 대중교통 환승 타이밍 대시보드' },
      ],
      script: [
        {
          type: 'text/javascript',
          src: `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${process.env.NAVER_CLIENT_ID}&submodules=geocoder`,
        },
      ],
    },
  },

  runtimeConfig: {
    odsayApiKey: process.env.ODSAY_API_KEY || '',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    public: {
      naverClientId: process.env.NAVER_CLIENT_ID || '',
    },
  },
})
