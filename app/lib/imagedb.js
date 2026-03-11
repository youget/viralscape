const DB_NAME = 'viralscape-ai'
const STORE_NAME = 'images'
const DB_VERSION = 1

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
        store.createIndex('timestamp', 'timestamp', { unique: false })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function compressImage(blobUrl, maxSize = 100) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = maxSize
      canvas.height = maxSize
      const ctx = canvas.getContext('2d')
      const scale = Math.min(maxSize / img.width, maxSize / img.height)
      const w = img.width * scale
      const h = img.height * scale
      const x = (maxSize - w) / 2
      const y = (maxSize - h) / 2
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, maxSize, maxSize)
      ctx.drawImage(img, x, y, w, h)
      resolve(canvas.toDataURL('image/jpeg', 0.5))
    }
    img.onerror = () => resolve(null)
    img.src = blobUrl
  })
}

export async function compressImageToSize(blobUrl, targetSize = 512) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let w = img.width
      let h = img.height
      const scale = targetSize / Math.max(w, h)
      if (scale < 1) {
        w = Math.round(w * scale)
        h = Math.round(h * scale)
      }
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }
    img.onerror = () => resolve(null)
    img.src = blobUrl
  })
}

export async function saveImage(item) {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const data = {
      prompt: item.prompt,
      model: item.model,
      size: item.size,
      seed: item.seed,
      style: item.style || 'none',
      thumbnail: item.thumbnail || null,
      medium: item.medium || null,
      timestamp: Date.now(),
    }
    store.add(data)

    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve
      tx.onerror = reject
    })
    db.close()
  } catch (err) {
    console.log('IndexedDB save error:', err)
  }
}

export async function getRecentImages(limit = 10) {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const idx = store.index('timestamp')

    return new Promise((resolve) => {
      const items = []
      const req = idx.openCursor(null, 'prev') // descending
      req.onsuccess = (e) => {
        const cursor = e.target.result
        if (cursor && items.length < limit) {
          items.push(cursor.value)
          cursor.continue()
        } else {
          db.close()
          resolve(items)
        }
      }
      req.onerror = () => {
        db.close()
        resolve([])
      }
    })
  } catch {
    return []
  }
}

export async function getImageCount() {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    return new Promise((resolve) => {
      const countReq = store.count()
      countReq.onsuccess = () => {
        db.close()
        resolve(countReq.result)
      }
      countReq.onerror = () => {
        db.close()
        resolve(0)
      }
    })
  } catch {
    return 0
  }
}

export async function clearAllImages() {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).clear()
    await new Promise((resolve) => {
      tx.oncomplete = resolve
    })
    db.close()
  } catch {}
}

export async function deleteImage(id) {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(id)
    await new Promise((resolve) => {
      tx.oncomplete = resolve
    })
    db.close()
  } catch {}
}
