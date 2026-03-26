export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()
  
  const { sx, sy, ex, ey } = body

  if (!sx || !sy || !ex || !ey) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required coordinate parameters (sx, sy, ex, ey).',
    })
  }

  try {
    const params = new URLSearchParams({
      apiKey: config.odsayApiKey as string,
      SX: sx,
      SY: sy,
      EX: ex,
      EY: ey,
      SearchPathType: '0', // 0: Search all types (bus, subway, etc.)
    })

    // ODsay transit path API URL
    const url = `https://api.odsay.com/v1/api/searchPubTransPathT?${params.toString()}`

    const response = await $fetch(url)

    // Pass the raw ODsay response back to the client
    return response

  } catch (error: any) {
    console.error('ODsay API Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch route data from ODsay API.',
    })
  }
})
