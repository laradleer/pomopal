/**
 * Where the pet looks (#75): with a mouse its eyes follow the pointer anywhere on the page and
 * its head turns a little towards it; on touch screens it glances at each tap and then looks back.
 * After 3 s without movement the eyes return to the centre.
 *
 *   const { eyes, head } = usePointerLook(svgRef, () => props.live)
 *   eyes  pupil offset in drawing units (at most ±3.5)
 *   head  head turn in degrees (at most ±5)
 *
 * One requestAnimationFrame loop eases towards the target and stops once it arrives, so an idle
 * page costs nothing. Off with reduced motion.
 */
const MAX_EYE_OFFSET = 3.5
const MAX_HEAD_TURN_DEG = 5
/** Pointer distance (px) at which the pet looks as far as it can. */
const FULL_LOOK_DISTANCE_PX = 240
const RETURN_AFTER_MS = 3000
const TAP_GLANCE_MS = 1200
/** Share of the remaining distance covered each frame. */
const EASING = 0.15

export function usePointerLook(target: Ref<Element | null>, isEnabled: () => boolean) {
  const eyes = ref({ x: 0, y: 0 })
  const head = ref(0)
  const motion = useMotion()

  let goal = { x: 0, y: 0 }
  const current = { x: 0, y: 0 }
  let frame = 0
  let returnTimer: ReturnType<typeof setTimeout> | undefined

  const isActive = () => isEnabled() && !motion.isReduced.value

  function step() {
    current.x += (goal.x - current.x) * EASING
    current.y += (goal.y - current.y) * EASING
    const arrived = Math.abs(goal.x - current.x) < 0.002 && Math.abs(goal.y - current.y) < 0.002
    if (arrived) {
      current.x = goal.x
      current.y = goal.y
    }
    eyes.value = { x: current.x * MAX_EYE_OFFSET, y: current.y * MAX_EYE_OFFSET * 0.7 }
    head.value = current.x * MAX_HEAD_TURN_DEG
    frame = arrived ? 0 : requestAnimationFrame(step)
  }

  function lookAt(next: { x: number; y: number }) {
    goal = next
    if (!frame) frame = requestAnimationFrame(step)
  }

  function lookBackAfter(ms: number) {
    clearTimeout(returnTimer)
    returnTimer = setTimeout(() => lookAt({ x: 0, y: 0 }), ms)
  }

  function aimAt(clientX: number, clientY: number) {
    const element = target.value
    if (!element) return
    const box = element.getBoundingClientRect()
    // Aim from between the eyes (a little above the middle of the drawing).
    const dx = clientX - (box.left + box.width / 2)
    const dy = clientY - (box.top + box.height * 0.48)
    const distance = Math.hypot(dx, dy) || 1
    const strength = Math.min(1, distance / FULL_LOOK_DISTANCE_PX)
    lookAt({ x: (dx / distance) * strength, y: (dy / distance) * strength })
  }

  function onPointerMove(event: PointerEvent) {
    if (event.pointerType !== 'mouse' || !isActive()) return
    aimAt(event.clientX, event.clientY)
    lookBackAfter(RETURN_AFTER_MS)
  }

  function onPointerDown(event: PointerEvent) {
    if (event.pointerType === 'mouse' || !isActive()) return
    aimAt(event.clientX, event.clientY)
    lookBackAfter(TAP_GLANCE_MS)
  }

  onMounted(() => {
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
  })

  // Turned off (reduced motion, no longer the live pet): look straight ahead.
  watch(isActive, (active) => {
    if (!active) lookAt({ x: 0, y: 0 })
  })

  onBeforeUnmount(() => {
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerdown', onPointerDown)
    cancelAnimationFrame(frame)
    clearTimeout(returnTimer)
  })

  return { eyes: readonly(eyes), head: readonly(head) }
}
