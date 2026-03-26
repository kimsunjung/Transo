export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const config = useRuntimeConfig()
  const mapObject = query.mapObject as string

  if (!mapObject) {
    throw createError({ statusCode: 400, statusMessage: 'mapObject is required' })
  }

  try {
    const params = new URLSearchParams({
      apiKey: config.odsayApiKey as string,
      mapObject: mapObject
    })
    
    // ODsay lane graphics API
    const url = `https://api.odsay.com/v1/api/loadLane?${params.toString()}`
    const response = await $fetch(url)
    return response

  } catch (error: any) {
    console.error('ODsay Graphics API Error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch polyline data.' })
  }
})
