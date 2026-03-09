function playTone(frequency: number, duration: number, volume = 0.3) {
  if (typeof window === "undefined") return
  const AudioContext = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext
  if (!AudioContext) return

  const ctx = new AudioContext()
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()

  oscillator.connect(gain)
  gain.connect(ctx.destination)

  oscillator.frequency.value = frequency
  oscillator.type = "sine"
  gain.gain.setValueAtTime(volume, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + duration)
}

export const sounds = {
  workComplete: () => playTone(880, 0.6),
  breakEnd: () => playTone(660, 0.4),
  taskDone: () => playTone(1046, 0.3),
}
