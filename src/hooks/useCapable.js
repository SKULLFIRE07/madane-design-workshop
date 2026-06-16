import { useEffect, useState } from 'react'

let cached = null

/** True only on hardware that can comfortably run the optional WebGL layer.
 *  Conservative on purpose: weak laptops get the (gorgeous, cheap) CSS hero. */
export function detectCapable() {
  if (cached !== null) return cached
  if (typeof window === 'undefined') return false
  try {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarse = window.matchMedia('(pointer: coarse)').matches
    const cores = navigator.hardwareConcurrency || 4
    const mem = navigator.deviceMemory // may be undefined (Safari/FF)
    const smallScreen = Math.min(window.innerWidth, window.innerHeight) < 700

    // WebGL availability
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl')
    const hasWebGL = !!gl
    if (gl && gl.getExtension) gl.getExtension('WEBGL_lose_context')?.loseContext?.()

    cached = hasWebGL && !reduce && !coarse && !smallScreen && cores >= 6 && (mem === undefined || mem >= 4)
  } catch {
    cached = false
  }
  return cached
}

export function useCapable() {
  const [ok, setOk] = useState(false)
  useEffect(() => { setOk(detectCapable()) }, [])
  return ok
}
