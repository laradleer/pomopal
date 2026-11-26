// POST /api/inventory/:id/equip and /unequip (#28): one item per slot, only your own items.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import type { InventoryDto } from '../../shared/types/inventory'
import type { BuyResult } from '../../shared/types/shop'
import { closeDb, db, deleteStudents, shopItemIds, signUp } from './client'
import type { Student } from './client'

let student: Student
let otherStudent: Student
let items: Record<string, number>
/** Inventory row ids of the student's items, by asset key. */
let owned: Record<string, number>

beforeAll(async () => {
  student = await signUp()
  otherStudent = await signUp()
  items = await shopItemIds()
})

// Every test starts with two hats, round glasses and a bandana, none of them worn.
beforeEach(async () => {
  await db().query('delete from inventory_item where user_id = $1', [student.id])
  await student.setProgress({ level: 2, coins: 1000 })
  owned = {}
  for (const key of ['party-hat', 'beanie', 'round-glasses', 'bandana']) {
    const response = await student.post<BuyResult>(`/api/shop/${items[key]}/buy`)
    owned[key] = response.body.inventoryItemId
  }
})

afterAll(async () => {
  await deleteStudents(student, otherStudent)
  await closeDb()
})

const equip = (id: number | undefined, as: Student = student) =>
  as.post<InventoryDto>(`/api/inventory/${id}/equip`)
const unequip = (id: number | undefined) =>
  student.post<InventoryDto>(`/api/inventory/${id}/unequip`)

/** Asset keys of the items the pet wears, as the API reports them. */
function worn(inventory: InventoryDto) {
  return Object.values(inventory)
    .flat()
    .filter((item) => item.equipped)
    .map((item) => item.assetKey)
    .sort()
}

describe('equipping items', () => {
  it('puts an owned item on the pet', async () => {
    const response = await equip(owned['party-hat'])

    expect(response.status).toBe(200)
    expect(worn(response.body)).toEqual(['party-hat'])
  })

  it('keeps one item per slot: a second hat takes the first one off', async () => {
    await equip(owned['party-hat'])
    const response = await equip(owned['beanie'])

    expect(worn(response.body)).toEqual(['beanie'])
    expect(response.body.head.map((item) => [item.assetKey, item.equipped])).toEqual([
      ['party-hat', false],
      ['beanie', true],
    ])
  })

  it('lets items in different slots be worn together', async () => {
    await equip(owned['party-hat'])
    await equip(owned['round-glasses'])
    const response = await equip(owned['bandana'])

    expect(worn(response.body)).toEqual(['bandana', 'party-hat', 'round-glasses'])
  })

  it('ends with one hat when two hats are equipped at the same time', async () => {
    await Promise.all([equip(owned['party-hat']), equip(owned['beanie'])])

    const inventory = (await student.get<InventoryDto>('/api/inventory')).body
    expect(inventory.head.filter((item) => item.equipped)).toHaveLength(1)
  })

  it('changes nothing when the same item is equipped twice', async () => {
    await equip(owned['party-hat'])
    const response = await equip(owned['party-hat'])

    expect(response.status).toBe(200)
    expect(worn(response.body)).toEqual(['party-hat'])
  })

  it('takes an item off again', async () => {
    await equip(owned['party-hat'])
    const response = await unequip(owned['party-hat'])

    expect(response.status).toBe(200)
    expect(worn(response.body)).toEqual([])
  })

  it("answers 404 NOT_FOUND for another student's item, and changes nothing", async () => {
    const response = await equip(owned['party-hat'], otherStudent)

    expect(response.status).toBe(404)
    expect(response.code).toBe('NOT_FOUND')
    expect(worn((await student.get<InventoryDto>('/api/inventory')).body)).toEqual([])
  })

  it('answers 400 VALIDATION_FAILED for an id that is not a number', async () => {
    const response = await student.post('/api/inventory/abc/equip')

    expect(response.status).toBe(400)
    expect(response.code).toBe('VALIDATION_FAILED')
  })
})
