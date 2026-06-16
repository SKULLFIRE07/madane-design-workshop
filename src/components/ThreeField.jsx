import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Light "blueprint topography" · a low-poly displaced point grid.
 * Performance-hardened: ~2.1k points, normal blending, dpr<=1.1,
 * rendered on-demand and throttled to ~26fps, paused when offscreen.
 * Strictly an optional flourish · the CSS hero stands on its own.
 */

const vertex = /* glsl */ `
  uniform float uTime;
  uniform vec2 uPointer;
  varying float vE;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
  float noise(vec2 p){
    vec2 i=floor(p), f=fract(p);
    float a=hash(i), b=hash(i+vec2(1.,0.)), c=hash(i+vec2(0.,1.)), d=hash(i+vec2(1.,1.));
    vec2 u=f*f*(3.-2.*f);
    return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;
  }
  void main(){
    vec3 pos = position;
    float t = uTime * 0.22;
    // layered flowing terrain — taller, more dramatic
    float n = noise(pos.xy * 0.30 + t) * 2.1;
    n += noise(pos.xy * 0.85 - t * 0.6) * 0.9;
    n += sin(pos.x * 0.5 + uTime * 0.6) * 0.35;
    // mouse ripple — wider + stronger
    float d = distance(pos.xy, uPointer * 6.5);
    n += sin(d * 1.0 - uTime * 1.8) * exp(-d * 0.30) * 1.3;
    pos.z += n;
    vE = n;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = (2.6 + n * 0.7) * (320.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`
const fragment = /* glsl */ `
  precision mediump float;
  varying float vE;
  uniform vec3 uLow; uniform vec3 uHigh;
  void main(){
    float c = smoothstep(-1.2, 2.6, vE);
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.12, d) * (0.10 + c * 0.42);
    gl_FragColor = vec4(mix(uLow, uHigh, c), a);
  }
`

function Grid({ pausedRef }) {
  const { invalidate } = useThree()
  const ptr = useRef(new THREE.Vector2(0, 0))
  // Coarser grid: ~2.1k pts (61x34) vs the old 96x56 (~5.5k). The shader
  // displacement is smooth/low-frequency, so the silhouette barely changes
  // while vertex + point-fill cost drops by ~60%.
  const geometry = useMemo(() => new THREE.PlaneGeometry(28, 16, 60, 34), [])
  useEffect(() => () => geometry.dispose(), [geometry])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uLow: { value: new THREE.Color('#070707') },
      uHigh: { value: new THREE.Color('#454545') },
    }),
    []
  )

  useFrame((state, delta) => {
    uniforms.uTime.value += Math.min(delta, 0.05)
    ptr.current.lerp({ x: state.pointer.x || 0, y: state.pointer.y || 0 }, 0.06)
    uniforms.uPointer.value.copy(ptr.current)
  })

  // throttled on-demand driver (~26fps), pauses when offscreen / tab hidden
  useEffect(() => {
    let raf
    let last = 0
    const loop = (t) => {
      raf = requestAnimationFrame(loop)
      if (pausedRef.current || document.hidden) return
      if (t - last < 38) return
      last = t
      invalidate()
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [invalidate, pausedRef])

  return (
    <points geometry={geometry} rotation={[-Math.PI / 2.3, 0, 0]} position={[0, -1, 0]}>
      <shaderMaterial uniforms={uniforms} vertexShader={vertex} fragmentShader={fragment} transparent depthWrite={false} />
    </points>
  )
}

export function ThreeField({ pausedRef }) {
  return (
    <div className="three-field" aria-hidden>
      <Canvas
        frameloop="demand"
        dpr={[1, 1.1]}
        camera={{ position: [0, 2.4, 8.5], fov: 42 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'low-power', failIfMajorPerformanceCaveat: false }}
      >
        <Grid pausedRef={pausedRef} />
      </Canvas>
    </div>
  )
}
