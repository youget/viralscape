export async function POST(request) {
  const body = await request.json()
  const { action, messages, prompt } = body

  try {
    if (action === 'chat') {
      const res = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages || [{ role: 'user', content: prompt }],
          model: 'qwen-safety',
        }),
      })
      const text = await res.text()
      return Response.json({ result: text })
    }

    if (action === 'enhance') {
      const res = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a creative AI image prompt enhancer. Take the user prompt and make it more detailed and vivid for AI image generation. Keep it under 200 characters. Only return the enhanced prompt, nothing else. No quotes.',
            },
            { role: 'user', content: prompt },
          ],
          model: 'qwen-safety',
        }),
      })
      const text = await res.text()
      return Response.json({ result: text.trim() })
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
