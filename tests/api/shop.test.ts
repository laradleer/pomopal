// POST /api/shop/:itemId/buy (#28): the rules from rules/shop.ts, enforced by the real API.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import type { InventoryDto } from '../../shared/types/inventory'
import type { BuyResult, ShopItemDto } from '../../shared/types/shop'
import { closeDb, db, deleteStudents, shopItemIds, signedOut, signUp } from './client'
import type { Student } from './client'

// From server/db/shop-items.ts: party hat 30 coins at level 1, wizard hat 150 coins at level 5.
const PARTY_HAT_PRICE = 30
const WIZARD_HAT_LEVEL = 5

let student: Student
let items: Record<string, number>

beforeAll(async () => {
  student = await signUp()
  items = await shopItemIds()
})

beforeEach(async () => {
  await db().query('delete from inventory_item where user_id = $1', [student.id])
})

afterAll(async () => {
  await deleteStudents(student)
  await closeDb()
})

const buy = (itemId: number | undefined) => student.post<BuyResult>(`/api/shop/${itemId}/buy`)

async function ownedItemIds() {
  const inventory = (await student.get<InventoryDto>('/api/inventory')).body
  return Object.values(inventory)
    .flat()
    .map((item) => item.itemId)
}

describe('buying an item', () => {
  it('pays the price and adds the item to the inventory', async () => {
    await student.setProgress({ level: 1, coins: 100 })

    const response = await buy(items['party-hat'])

    expect(response.status).toBe(200)
    expect(response.body.coins).toBe(100 - PARTY_HAT_PRICE)
    expect(await student.coins()).toBe(100 - PARTY_HAT_PRICE)
    expect(await ownedItemIds()).toEqual([items['party-hat']])
  })

  it('works with exactly enough coins', async () => {
    await student.setProgress({ level: 1, coins: PARTY_HAT_PRICE })

    expect((await buy(items['party-hat'])).status).toBe(200)
    expect(await student.coins()).toBe(0)
  })

  it('refuses with NOT_ENOUGH_COINS when one coin is missing, and takes nothing', async () => {
    await student.setProgress({ level: 1, coins: PARTY_HAT_PRICE - 1 })

    const response = await buy(items['party-hat'])

    expect(response.status).toBe(422)
    expect(response.code).toBe('NOT_ENOUGH_COINS')
    expect(await student.coins()).toBe(PARTY_HAT_PRICE - 1)
    expect(await ownedItemIds()).toEqual([])
  })

  it('refuses with LEVEL_TOO_LOW below the required level, even with coins to spare', async () => {
    await student.setProgress({ level: WIZARD_HAT_LEVEL - 1, coins: 1000 })

    const response = await buy(items['wizard-hat'])

    expect(response.status).toBe(422)
    expect(response.code).toBe('LEVEL_TOO_LOW')
    expect(await student.coins()).toBe(1000)
  })

  it('sells a locked item once the student reaches its level', async () => {
    await student.setProgress({ level: WIZARD_HAT_LEVEL, coins: 1000 })

    expect((await buy(items['wizard-hat'])).status).toBe(200)
  })

  it('refuses with ALREADY_OWNED the second time, and charges only once', async () => {
    await student.setProgress({ level: 1, coins: 100 })

    expect((await buy(items['party-hat'])).status).toBe(200)
    const again = await buy(items['party-hat'])

    expect(again.status).toBe(409)
    expect(again.code).toBe('ALREADY_OWNED')
    expect(await student.coins()).toBe(100 - PARTY_HAT_PRICE)
  })

  it('charges once for a double click (two requests at the same time)', async () => {
    await student.setProgress({ level: 1, coins: 100 })

    const results = await Promise.all([buy(items['party-hat']), buy(items['party-hat'])])

    expect(results.map((result) => result.status).sort()).toEqual([200, 409])
    expect(await student.coins()).toBe(100 - PARTY_HAT_PRICE)
    expect(await ownedItemIds()).toEqual([items['party-hat']])
  })

  it('shows the new state in the shop list', async () => {
    await student.setProgress({ level: 1, coins: 100 })
    await buy(items['party-hat'])

    const shop = (await student.get<ShopItemDto[]>('/api/shop')).body

    expect(shop.find((item) => item.assetKey === 'party-hat')).toMatchObject({
      owned: true,
      locked: false,
    })
    expect(shop.find((item) => item.assetKey === 'wizard-hat')).toMatchObject({
      owned: false,
      locked: true,
    })
  })

  it('answers 404 NOT_FOUND for an item that does not exist', async () => {
    const response = await buy(999_999)

    expect(response.status).toBe(404)
    expect(response.code).toBe('NOT_FOUND')
  })

  it('answers 401 UNAUTHORIZED when signed out', async () => {
    const response = await signedOut.post(`/api/shop/${items['party-hat']}/buy`)

    expect(response.status).toBe(401)
    expect(response.code).toBe('UNAUTHORIZED')
  })
})
