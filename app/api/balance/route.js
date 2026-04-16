export async function GET(request) {
  // Optionally accept user key via header for BYOP balance check
  const userKey = request.headers.get('x-user-key')
  const key = userKey || process.env.POLLI_PK

  if (!key) return Response.json({ balance: 0, currency: 'pollen' })

  try {
    const res = await fetch('https://gen.pollinations.ai/account/balance', {
      headers: { 'Authorization': `Bearer ${key}` },
    })
    if (!res.ok) throw new Error('Failed')
    const data = await res.json()
    return Response.json(data)
  } catch {
    return Response.json({ balance: 0, currency: 'pollen' })
  }
}
