import React, { useEffect, useRef, useState } from 'react'

type Vec = { x: number; y: number }

export default function Pong() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number | null>(null)

  const [score, setScore] = useState({ left: 0, right: 0 })
  const [running, setRunning] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    const width = 800
    const height = 400
    canvas.width = width
    canvas.height = height

    const paddleWidth = 10
    const paddleHeight = 80

    const leftPaddle = { x: 10, y: (height - paddleHeight) / 2 }
    const rightPaddle = { x: width - paddleWidth - 10, y: (height - paddleHeight) / 2 }

    let ballPos: Vec = { x: width / 2, y: height / 2 }
    let ballVel: Vec = { x: 4, y: 2 }

    const keys: Record<string, boolean> = {}

    function resetBall(direction: number) {
      ballPos = { x: width / 2, y: height / 2 }
      ballVel = { x: 4 * direction, y: (Math.random() * 4 - 2) }
    }

    function draw() {
      ctx.fillStyle = '#0b1221'
      ctx.fillRect(0, 0, width, height)

      // middle line
      ctx.fillStyle = '#ffffff55'
      for (let i = 0; i < height; i += 20) ctx.fillRect(width / 2 - 1, i, 2, 10)

      // paddles
      ctx.fillStyle = 'white'
      ctx.fillRect(leftPaddle.x, leftPaddle.y, paddleWidth, paddleHeight)
      ctx.fillRect(rightPaddle.x, rightPaddle.y, paddleWidth, paddleHeight)

      // ball
      ctx.beginPath()
      ctx.arc(ballPos.x, ballPos.y, 8, 0, Math.PI * 2)
      ctx.fill()

      // scores
      ctx.font = '28px monospace'
      ctx.fillText(String(score.left), width * 0.25, 40)
      ctx.fillText(String(score.right), width * 0.75, 40)
    }

    function step() {
      // controls
      if (keys['w']) leftPaddle.y -= 6
      if (keys['s']) leftPaddle.y += 6
      if (keys['ArrowUp']) rightPaddle.y -= 6
      if (keys['ArrowDown']) rightPaddle.y += 6

      // clamp paddles
      leftPaddle.y = Math.max(0, Math.min(height - paddleHeight, leftPaddle.y))
      rightPaddle.y = Math.max(0, Math.min(height - paddleHeight, rightPaddle.y))

      // ball movement
      ballPos.x += ballVel.x
      ballPos.y += ballVel.y

      // top/bottom collisions
      if (ballPos.y <= 8 || ballPos.y >= height - 8) ballVel.y *= -1

      // left paddle collision
      if (
        ballPos.x - 8 <= leftPaddle.x + paddleWidth &&
        ballPos.y >= leftPaddle.y &&
        ballPos.y <= leftPaddle.y + paddleHeight
      ) {
        ballPos.x = leftPaddle.x + paddleWidth + 8
        ballVel.x *= -1.05
        // add spin depending on where it hit
        const hit = (ballPos.y - (leftPaddle.y + paddleHeight / 2)) / (paddleHeight / 2)
        ballVel.y += hit * 2
      }

      // right paddle collision
      if (
        ballPos.x + 8 >= rightPaddle.x &&
        ballPos.y >= rightPaddle.y &&
        ballPos.y <= rightPaddle.y + paddleHeight
      ) {
        ballPos.x = rightPaddle.x - 8
        ballVel.x *= -1.05
        const hit = (ballPos.y - (rightPaddle.y + paddleHeight / 2)) / (paddleHeight / 2)
        ballVel.y += hit * 2
      }

      // scoring
      if (ballPos.x < 0) {
        setScore(s => ({ ...s, right: s.right + 1 }))
        resetBall(1)
        setRunning(false)
      }
      if (ballPos.x > width) {
        setScore(s => ({ ...s, left: s.left + 1 }))
        resetBall(-1)
        setRunning(false)
      }
    }

    function loop() {
      step()
      draw()
      animationRef.current = requestAnimationFrame(loop)
    }

    function onKeyDown(e: KeyboardEvent) {
      keys[e.key] = true
      if (e.code === 'Space') {
        setRunning(true)
        // if ball is stationary, give it a random direction
        if (Math.abs(ballVel.x) < 0.1) resetBall(Math.random() > 0.5 ? 1 : -1)
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      keys[e.key] = false
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    // AI for right paddle if no user input
    function ai() {
      // simple AI: follow the ball
      const center = rightPaddle.y + paddleHeight / 2
      if (ballPos.y < center - 10) rightPaddle.y -= 4
      else if (ballPos.y > center + 10) rightPaddle.y += 4
      rightPaddle.y = Math.max(0, Math.min(height - paddleHeight, rightPaddle.y))
    }

    // start loop
    let lastTime = performance.now()
    function frame() {
      const now = performance.now()
      const dt = now - lastTime
      lastTime = now
      if (running) {
        // when running, let AI update and run physics multiple times for stability
        ai()
      }
      // always draw so user can position paddles before starting
      draw()
      animationRef.current = requestAnimationFrame(frame)
    }

    frame()

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [running, score])

  return (
    <div className="pong-root">
      <canvas ref={canvasRef} className="pong-canvas" />
      <div className="controls">
        <div>Score: {score.left} — {score.right}</div>
        <div>{running ? 'Running' : 'Paused'}</div>
      </div>
    </div>
  )
}
