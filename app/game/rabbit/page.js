'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { RotateCcw } from 'lucide-react'

const GAME_STORAGE_KEY = 'vs-game-rabbit'

export default function RabbitGame() {
  const canvasRef = useRef(null)
  const [gameState, setGameState] = useState('menu')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [isNewRecord, setIsNewRecord] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(GAME_STORAGE_KEY)
    if (saved) {
      const { highScore: hs } = JSON.parse(saved)
      setHighScore(hs || 0)
    }
  }, [])

  useEffect(() => {
    if (highScore > 0) {
      localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify({ highScore }))
    }
  }, [highScore])

  // ===== Game loop =====
  useEffect(() => {
    if (gameState !== 'playing' || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Resize handler
    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // ✅ FIX: Baca CSS variables dengan getComputedStyle
    const styles = getComputedStyle(document.documentElement)
    const textColor = styles.getPropertyValue('--vs-text').trim() || '#ffffff'
    const borderColor = styles.getPropertyValue('--vs-border').trim() || '#333333'

    let animationFrame
    let obstacleX = canvas.width
    let playerY = canvas.height - 60
    let playerVelocity = 0
    const gravity = 0.5
    const jumpPower = -10
    let isJumping = false
    let gameScore = 0
    let gameRunning = true

    // ✅ FIX: Proper AABB collision detection
    const collides = (a, b) =>
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y

    const render = () => {
      if (!gameRunning) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // ✅ FIX: Difficulty scaling
      const obstacleSpeed = 5 + Math.floor(gameScore / 50) * 0.5

      // Update player
      if (isJumping) {
        playerVelocity += gravity
        playerY += playerVelocity

        if (playerY >= canvas.height - 60) {
          playerY = canvas.height - 60
          playerVelocity = 0
          isJumping = false
        }
      }

      // Update obstacle
      obstacleX -= obstacleSpeed
      if (obstacleX < -30) {
        obstacleX = canvas.width + Math.random() * 200 + 100
        gameScore += 10
        setScore(gameScore)
      }

      // ✅ FIX: Proper collision
      const playerBox = { x: 30, y: playerY - 20, w: 40, h: 40 }
      const obstacleBox = { x: obstacleX, y: canvas.height - 50, w: 20, h: 40 }

      if (collides(playerBox, obstacleBox)) {
        gameRunning = false
        setScore(gameScore)
        if (gameScore > highScore) {
          setHighScore(gameScore)
          setIsNewRecord(true)
        } else {
          setIsNewRecord(false)
        }
        setGameState('gameover')
        return
      }

      // Draw rabbit body
      ctx.fillStyle = '#FF6B9D'
      ctx.beginPath()
      ctx.arc(50, playerY, 20, 0, Math.PI * 2)
      ctx.fill()

      // Draw eyes (white)
      ctx.fillStyle = '#FFFFFF'
      ctx.beginPath()
      ctx.arc(42, playerY - 5, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(58, playerY - 5, 4, 0, Math.PI * 2)
      ctx.fill()

      // Draw pupils
      ctx.fillStyle = '#000000'
      ctx.beginPath()
      ctx.arc(42, playerY - 5, 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(58, playerY - 5, 2, 0, Math.PI * 2)
      ctx.fill()

      // Draw ears
      ctx.fillStyle = '#FF6B9D'
      ctx.fillRect(35, playerY - 35, 10, 20)
      ctx.fillRect(55, playerY - 35, 10, 20)

      // Draw obstacle
      ctx.fillStyle = '#3B82F6'
      ctx.fillRect(obstacleX, canvas.height - 50, 20, 40)

      // Draw ground line ✅ FIX: computed color
      ctx.strokeStyle = borderColor
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, canvas.height - 30)
      ctx.lineTo(canvas.width, canvas.height - 30)
      ctx.stroke()

      // Draw score ✅ FIX: computed color
      ctx.fillStyle = textColor
      ctx.font = 'bold 16px system-ui'
      ctx.fillText(`🏃 ${gameScore}`, 10, 30)

      // Draw speed indicator
      ctx.fillStyle = textColor
      ctx.font = '10px system-ui'
      ctx.fillText(`⚡ ${obstacleSpeed.toFixed(1)}x`, canvas.width - 60, 30)

      animationFrame = requestAnimationFrame(render)
    }

    render()

    // ===== Input handlers =====
    const handleJump = () => {
      if (!isJumping) {
        playerVelocity = jumpPower
        isJumping = true
      }
    }

    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        handleJump()
      }
    }

    // ✅ FIX: Named function supaya bisa di-remove
    const handleTouchJump = (e) => {
      e.preventDefault()
      handleJump()
    }

    canvas.addEventListener('click', handleJump)
    canvas.addEventListener('touchstart', handleTouchJump)
    window.addEventListener('keydown', handleKeyDown)

    // ✅ FIX: Cleanup semua listener dengan reference yang sama
    return () => {
      gameRunning = false
      cancelAnimationFrame(animationFrame)
      canvas.removeEventListener('click', handleJump)
      canvas.removeEventListener('touchstart', handleTouchJump)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [gameState, highScore])

  const startGame = () => {
    setGameState('playing')
    setScore(0)
    setIsNewRecord(false)
  }

  const resetGame = () => {
    setGameState('menu')
    setScore(0)
    setIsNewRecord(false)
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-black vs-text text-center mb-2">
        Rabbit <span className="vs-gradient-text">Run</span>
      </h1>
      <p className="text-xs vs-text-sub text-center mb-4">
        tap to jump. avoid the blue thing. it's not your friend.
      </p>

      {/* Game Canvas */}
      <div className="relative w-full aspect-video bg-[var(--vs-bg2)] rounded-2xl border vs-border overflow-hidden mb-4">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: gameState === 'playing' ? 'block' : 'none' }}
        />

        {gameState !== 'playing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            {gameState === 'menu' && (
              <>
                <p className="text-4xl mb-3">🐇</p>
                <p className="text-sm font-bold vs-text mb-2">ready to hop?</p>
                <p className="text-xs vs-text-sub mb-4 max-w-xs">
                  high score: {highScore} • tap / space / ↑ to jump
                </p>
                <button
                  onClick={startGame}
                  className="vs-btn px-6 py-2.5 rounded-xl text-sm font-semibold"
                >
                  Start Hopping
                </button>
              </>
            )}

            {gameState === 'gameover' && (
              <>
                <p className="text-4xl mb-3">{isNewRecord ? '🎉' : '💀'}</p>
                <p className="text-sm font-bold vs-text mb-2">
                  {isNewRecord ? 'NEW RECORD!' : 'you got bonked'}
                </p>
                <p className="text-xs vs-text-sub mb-1">score: {score}</p>
                <p className="text-xs vs-text-sub mb-4">
                  {/* ✅ FIX: Pakai isNewRecord flag, bukan compare ulang */}
                  {isNewRecord ? `🏆 new best: ${highScore}` : `best: ${highScore}`}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={startGame}
                    className="vs-btn px-6 py-2.5 rounded-xl text-sm font-semibold"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={resetGame}
                    className="vs-btn-outline px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1"
                  >
                    <RotateCcw size={14} /> Menu
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Controls hint */}
      <p className="text-[9px] vs-text-sub text-center">
        ⚡ tap / spacebar / ↑ to jump • speed increases as you score • high score saved in your browser
      </p>
    </div>
  )
}
