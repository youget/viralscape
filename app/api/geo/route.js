export async function GET() {
  try {
    const res = await fetch('https://ipapi.co/json/', { next: { revalidate: 86400 } })
    if (!res.ok) throw new Error('Failed')
    const data = await res.json()
    return Response.json({
      country: data.country_code || 'US',
      lang: data.languages?.split(',')[0] || 'en',
    })
  } catch {
    return Response.json({ country: 'US', lang: 'en' })
  }
}
