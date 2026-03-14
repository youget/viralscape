'use client'
import { useState, useEffect } from 'react'

const PET_STORAGE_KEY = 'vs-digital-pet'

const evolutionData = [
  { maxLevel: 9, name: 'Slime', emoji: '🟣' },
  { maxLevel: 24, name: 'Rabbit', emoji: '🐇' },
  { maxLevel: 49, name: 'Fox', emoji: '🦊' },
  { maxLevel: 79, name: 'Dragon', emoji: '🐉' },
  { maxLevel: 99, name: 'Dragon Alpha', emoji: '🐲' },
  { maxLevel: Infinity, name: 'Dragon God', emoji: '🐉✨' },
]

export default function DigitalPet() {
  const [pet, setPet] = useState({
    level: 1,
    happiness: 50,
    health: 100,
    hunger: 20,
    lastFed: Date.now(),
    lastPlayed: Date.now(),
  })
  const [token, setToken] = useState(0)
  const [totalClicks, setTotalClicks] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem(PET_STORAGE_KEY)
    if (saved) {
      const data = JSON.parse(saved)
      setPet(data.pet)
      setToken(data.token || 0)
    }
    const gameData = localStorage.getItem('vs-game-dopamine')
    if (gameData) {
      const { totalClicks: clicks } = JSON.parse(gameData)
      setTotalClicks(clicks || 0)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!loading) {
      localStorage.setItem(PET_STORAGE_KEY, JSON.stringify({ pet, token }))
    }
  }, [pet, token, loading])

  const getEvolution = (level) => {
    return evolutionData.find(e => level <= e.maxLevel) || evolutionData[evolutionData.length - 1]
  }

  const currentEvo = getEvolution(pet.level)

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-black vs-text text-center mb-2">
        Digital <span className="vs-gradient-text">Pet</span>
      </h1>
      <p className="text-xs vs-text-sub text-center mb-6">
        your lil dopamine buddy. feed it or face the consequences.
      </p>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <>
          {/* Pet display */}
          <div className="vs-card border vs-border rounded-2xl p-6 mb-6 text-center">
            <div className="text-8xl mb-2 animate-bounce">
              {currentEvo.emoji}
            </div>
            <p className="text-lg font-bold vs-text mb-1">{currentEvo.name}</p>
            <p className="text-[10px] vs-text-sub mb-3">Lvl {pet.level}</p>

            <div className="space-y-2 text-left">
              <div>
                <div className="flex justify-between text-[10px] vs-text-sub mb-1">
                  <span>❤️ Happiness</span>
                  <span>{pet.happiness}%</span>
                </div>
                <div className="h-2 bg-[var(--vs-border)] rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400" style={{ width: `${pet.happiness}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] vs-text-sub mb-1">
                  <span>🍖 Hunger</span>
                  <span>{pet.hunger}%</span>
                </div>
                <div className="h-2 bg-[var(--vs-border)] rounded-full overflow-hidden">
                  <div className="h-full bg-orange-400" style={{ width: `${pet.hunger}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] vs-text-sub mb-1">
                  <span>💊 Health</span>
                  <span>{pet.health}%</span>
                </div>
                <div className="h-2 bg-[var(--vs-border)] rounded-full overflow-hidden">
                  <div className="h-full bg-green-400" style={{ width: `${pet.health}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Token display */}
          <div className="vs-card border vs-border rounded-xl p-3 mb-4 flex justify-between items-center">
            <span className="text-xs vs-text">Your stash</span>
            <span className="text-sm font-bold vs-accent">🪙 {token}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => setPet(prev => ({ ...prev, happiness: Math.min(100, prev.happiness + 10) }))}
              className="vs-card border vs-border rounded-xl p-3 text-center vs-hover"
            >
              <span className="text-2xl block mb-1">🎮</span>
              <p className="text-xs font-semibold vs-text">Play</p>
            </button>
            <button
              onClick={() => setPet(prev => ({ ...prev, hunger: Math.max(0, prev.hunger - 10) }))}
              className="vs-card border vs-border rounded-xl p-3 text-center vs-hover"
            >
              <span className="text-2xl block mb-1">🍎</span>
              <p className="text-xs font-semibold vs-text">Feed</p>
            </button>
          </div>

          <p className="text-[9px] vs-text-sub text-center mt-6">
            ⚡ leveling system coming soon...
          </p>
        </>
      )}
    </div>
  )
}
