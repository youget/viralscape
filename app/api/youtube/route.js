const API_KEYS = [
  process.env.YOUTUBE_API_KEY_1,
  process.env.YOUTUBE_API_KEY_2,
  process.env.YOUTUBE_API_KEY_3,
  process.env.YOUTUBE_API_KEY_4,
  process.env.YOUTUBE_API_KEY_5,
].filter(Boolean)

let currentKeyIndex = 0

function getNextKey() {
  if (API_KEYS.length === 0) return null
  const key = API_KEYS[currentKeyIndex]
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length
  return key
}

function parseDuration(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 9999
  return (parseInt(match[1] || 0) * 3600) +
         (parseInt(match[2] || 0) * 60) +
         parseInt(match[3] || 0)
}

async function fetchWithKeyRotation(url) {
  for (let i = 0; i < API_KEYS.length; i++) {
    const key = getNextKey()
    if (!key) break
    const separator = url.includes('?') ? '&' : '?'
    const res = await fetch(`${url}${separator}key=${key}`)
    if (res.ok) return res.json()
    if (res.status === 403) continue
    break
  }
  throw new Error('YouTube API failed. All keys exhausted or error.')
}

async function getVideoDetails(videoIds) {
  const ids = videoIds.join(',')
  const data = await fetchWithKeyRotation(
    `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet,statistics&id=${ids}`
  )
  return data.items || []
}

function formatVideo(v) {
  return {
    id: v.id?.videoId || v.id,
    title: v.snippet.title,
    thumbnail: v.snippet.thumbnails.high?.url ||
               v.snippet.thumbnails.medium?.url ||
               v.snippet.thumbnails.default?.url,
    channel: v.snippet.channelTitle,
    duration: v.contentDetails?.duration || '',
    durationSec: v.contentDetails ? parseDuration(v.contentDetails.duration) : 0,
    views: v.statistics?.viewCount || '0',
    publishedAt: v.snippet.publishedAt,
  }
}

async function searchVideos(query) {
  const q = encodeURIComponent(query)
  const data = await fetchWithKeyRotation(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${q}&type=video&videoDuration=short&maxResults=50&order=viewCount`
  )
  if (!data.items || data.items.length === 0) return []

  const videoIds = data.items.map(item => item.id.videoId).filter(Boolean)
  if (videoIds.length === 0) return []

  const details = await getVideoDetails(videoIds)

  return details
    .filter(v => parseDuration(v.contentDetails.duration) <= 120)
    .map(formatVideo)
}

async function getTrending(region) {
  const rc = region || 'US'
  const data = await fetchWithKeyRotation(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&chart=mostPopular&maxResults=50&regionCode=${rc}`
  )
  if (!data.items) return []

  return data.items.map(formatVideo)
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'trending'
  const query = searchParams.get('q') || ''
  const region = searchParams.get('region') || 'US'

  try {
    let videos
    if (type === 'search' && query) {
      videos = await searchVideos(query)
    } else {
      videos = await getTrending(region)
    }
    return Response.json({ videos, timestamp: Date.now() })
  } catch (error) {
    return Response.json(
      { error: error.message, videos: [] },
      { status: 500 }
    )
  }
}
