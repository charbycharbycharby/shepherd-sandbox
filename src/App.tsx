import React from 'react'
import Pong from './Pong'

export default function App() {
  return (
    <div className="app">
      <h1>Pong — Shepherd Sandbox</h1>
      <Pong />
      <p className="hint">Left: W/S, Right: ↑/↓ — Press Space to (re)start</p>
    </div>
  )
}
