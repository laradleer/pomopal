import type { SessionRewards } from '#shared/types/session'

type Point = { x: number; y: number }

/** Coins on their way between the coin chip and something on the page (drawn by <RewardCoinFlight>). */
export type CoinFlight = {
  id: number
  from: Point
  to: Point
  /** How many coin stickers fly. */
  count: number
  /** earn: towards the chip, which counts up as they land · spend: away from the chip */
  kind: 'earn' | 'spend'
  /** For earn: the balance before, and how many coins arrive in total. */
  start: number
  amount: number
}

const COIN_CHIP = '[data-chip="coins"]'
/**
 * A flight normally lands in about 1.3 s. If the tab is hidden or throttled meanwhile, it is
 * settled after this long anyway, so the coin chip never keeps showing an old balance.
 */
const FLIGHT_SAFETY_MS = 3000
const LIVE_PET = '[data-pet="live"]'
let nextFlightId = 0

function centerOf(element: Element): Point {
  const box = element.getBoundingClientRect()
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 }
}

/**
 * Turns rewards into a moment (docs/04-design-system.md → Motion):
 *   - coins fly from the pet to the coin chip, which counts up as each one lands
 *   - the reward toast ("+10 coins · +25 XP")
 *   - on a level-up, the pet celebrates and the full-screen <RewardLevelUp> opens after the coins
 * With reduced motion the numbers just change and the level-up opens at once.
 */
export function useRewardFeedback() {
  const toast = useToast()
  const motion = useMotion()
  const profile = useProfileStore()
  const petAnimator = usePetAnimator()

  /** The new level while the celebration is open, else null. */
  const levelUp = useState<number | null>('reward:levelUp', () => null)
  const flights = useState<CoinFlight[]>('reward:flights', () => [])
  /** While coins fly to the chip, the chip shows this instead of the real balance. */
  const heldCoins = useState<number | null>('reward:heldCoins', () => null)

  function fly(kind: CoinFlight['kind'], from: Element | null, to: Element | null, amount: number) {
    if (import.meta.server || motion.isReduced.value || !from || !to || amount <= 0) return false
    const count = Math.min(10, Math.max(5, Math.round(amount / 10) + 4))
    const id = ++nextFlightId
    flights.value = [
      ...flights.value,
      {
        id,
        from: centerOf(from),
        to: centerOf(to),
        count,
        kind,
        start: profile.coins - amount,
        amount,
      },
    ]
    setTimeout(() => settle(id), FLIGHT_SAFETY_MS)
    return true
  }

  /** Ends a flight at once: its coins vanish and the chip shows the real balance. */
  function settle(id: number) {
    if (!flights.value.some((flight) => flight.id === id)) return
    flights.value = flights.value.filter((flight) => flight.id !== id)
    if (flights.value.every((flight) => flight.kind !== 'earn')) heldCoins.value = null
  }

  /** Coins earned: they fly from the live pet (or `from`) into the chip. */
  function earnCoins(amount: number, from?: Element | null): boolean {
    const source = from ?? document.querySelector(LIVE_PET)
    const isFlying = fly('earn', source, document.querySelector(COIN_CHIP), amount)
    if (isFlying) heldCoins.value = profile.coins - amount
    return isFlying
  }

  /** Coins spent: a few fly out of the chip to `to` (e.g. the Buy button). */
  function spendCoins(amount: number, to: Element | null) {
    fly('spend', document.querySelector(COIN_CHIP), to, amount)
  }

  /** Called by <RewardCoinFlight> as each coin lands. */
  function coinLanded(flight: CoinFlight, index: number) {
    // Already settled by the safety timeout: a late coin changes nothing.
    if (!flights.value.some((item) => item.id === flight.id)) return
    const isLast = index === flight.count - 1
    if (isLast) flights.value = flights.value.filter((item) => item.id !== flight.id)
    if (flight.kind !== 'earn') return
    heldCoins.value = isLast
      ? null
      : flight.start + Math.round((flight.amount * (index + 1)) / flight.count)
  }

  function celebrate(rewards: SessionRewards) {
    if (rewards.xp > 0 || rewards.coins > 0) {
      toast.show(`+${rewards.coins} coins · +${rewards.xp} XP`, { tone: 'reward' })
    }
    const isFlying = earnCoins(rewards.coins)
    if (rewards.levelUp) {
      petAnimator.send('celebrate')
      // Let the coins land first, so the celebration doesn't cover them.
      const open = () => (levelUp.value = rewards.newLevel)
      if (isFlying) setTimeout(open, 1100)
      else open()
    }
  }

  function dismissLevelUp() {
    levelUp.value = null
  }

  return {
    levelUp: readonly(levelUp),
    flights: readonly(flights),
    heldCoins: readonly(heldCoins),
    celebrate,
    earnCoins,
    spendCoins,
    coinLanded,
    dismissLevelUp,
  }
}
