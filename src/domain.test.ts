import { describe, expect, it } from 'vitest'
import {
  AREAS_BY_CITY,
  CITIES,
  buildInvitation,
  createInitialState,
  parseSavedState,
  profileFromAnswers,
  validatePreferences,
  type Preferences,
} from './domain'

const preferences: Preferences = {
  city: 'Gurugram',
  areas: ['Cyber Hub'],
  windows: ['Friday dinner', 'Saturday dinner'],
  cuisines: ['Mediterranean'],
  diet: 'Vegetarian',
  budget: 900,
  tableType: 'Mixed table',
}
const profile = profileFromAnswers(
  'Ananya',
  ['Books', 'Travel', 'Food & cooking'],
  'A little of both',
  'Woman',
)
const now = new Date('2026-10-30T10:00:00Z')

describe('table invitations', () => {
  it('forms a table of 3–5 with two shared interests and at least 48 hours notice', () => {
    const invitation = buildInvitation(profile, preferences, now)
    expect(invitation).not.toBeNull()
    expect(invitation!.guests.length + 1).toBeGreaterThanOrEqual(3)
    expect(invitation!.guests.length + 1).toBeLessThanOrEqual(5)
    expect(invitation!.sharedInterests.length).toBeGreaterThanOrEqual(2)
    expect(new Date(invitation!.date).getTime() - now.getTime()).toBeGreaterThanOrEqual(
      48 * 60 * 60 * 1000,
    )
    expect(invitation!.restaurant.area).toBe('Cyber Hub')
    expect(invitation!.restaurant.city).toBe('Gurugram')
    expect(invitation!.restaurant.cuisine).toBe('Mediterranean')
    expect(invitation!.restaurant.mealPrice).toBeLessThanOrEqual(preferences.budget)
    expect(invitation!.restaurant.diets).toContain('Vegetarian')
  })
  it('never fills a table when interests do not clear the threshold', () => {
    expect(
      buildInvitation({ ...profile, interests: ['Tech & ideas', 'Outdoors'] }, preferences, now),
    ).toBeNull()
  })
  it('respects availability, meal budget and dietary constraints', () => {
    expect(
      buildInvitation(profile, { ...preferences, windows: ['Wednesday dinner'] }, now),
    ).toBeNull()
    expect(buildInvitation(profile, { ...preferences, budget: 500 }, now)).toBeNull()
    const vegan = buildInvitation(profile, { ...preferences, diet: 'Vegan' }, now)
    expect(vegan?.restaurant.diets).toContain('Vegan')
  })
  it('offers a sample table inside every available city chapter', () => {
    for (const city of CITIES) {
      const invitation = buildInvitation(
        profile,
        { ...preferences, city, areas: [AREAS_BY_CITY[city][0]] },
        now,
      )
      expect(invitation?.restaurant.city).toBe(city)
      expect(AREAS_BY_CITY[city]).toContain(invitation?.restaurant.area)
    }
  })
  it('never matches an area from another city chapter', () => {
    expect(
      validatePreferences({ ...preferences, city: 'Bengaluru', areas: ['Cyber Hub'] }, profile),
    ).toMatch(/city/i)
    expect(
      buildInvitation(profile, { ...preferences, city: 'Bengaluru', areas: ['Cyber Hub'] }, now),
    ).toBeNull()
  })
  it('only offers women-only tables to a woman and includes only women guests', () => {
    const women = { ...preferences, tableType: 'Women-only table' as const }
    expect(buildInvitation({ ...profile, gender: 'Prefer not to say' }, women, now)).toBeNull()
    expect(buildInvitation(profile, women, now)?.guests.every((g) => g.gender === 'Woman')).toBe(
      true,
    )
  })
  it('accepts exactly 48 hours notice and moves to the next week just below the cutoff', () => {
    const saturday = { ...preferences, windows: ['Saturday dinner'] as Preferences['windows'] }
    expect(buildInvitation(profile, saturday, new Date('2026-10-29T14:00:00Z'))?.date).toBe(
      '2026-10-31T14:00:00.000Z',
    )
    expect(buildInvitation(profile, saturday, new Date('2026-10-29T14:00:00.001Z'))?.date).toBe(
      '2026-11-07T14:00:00.000Z',
    )
  })
  it('keeps India-local lunch times correct across a year boundary', () => {
    const sunday = { ...preferences, windows: ['Sunday lunch'] as Preferences['windows'] }
    expect(buildInvitation(profile, sunday, new Date('2026-12-30T18:45:00Z'))?.date).toBe(
      '2027-01-03T07:30:00.000Z',
    )
  })
})

describe('local data validation', () => {
  it('requires preferences without silently broadening constraints', () => {
    expect(validatePreferences({ ...preferences, windows: [] }, profile)).toMatch(/time/i)
    expect(validatePreferences({ ...preferences, areas: [] }, profile)).toMatch(/area/i)
    expect(validatePreferences(preferences, profile)).toBeNull()
  })
  it('restores valid state and rejects broken, foreign and incomplete saved data', () => {
    const initial = createInitialState()
    expect(parseSavedState(JSON.stringify(initial))).toEqual(initial)
    expect(parseSavedState('{')).toBeNull()
    expect(parseSavedState(JSON.stringify({ version: 9 }))).toBeNull()
    expect(parseSavedState(JSON.stringify({ ...initial, profile: { name: 12 } }))).toBeNull()
    expect(parseSavedState(JSON.stringify({ ...initial, invitation: { date: 'bad' } }))).toBeNull()
  })
  it('migrates Gurugram-only version 1 data without losing progress', () => {
    const current = createInitialState()
    const legacy = {
      ...current,
      version: 1,
      preferences: Object.fromEntries(
        Object.entries(current.preferences).filter(([key]) => key !== 'city'),
      ),
    }
    expect(parseSavedState(JSON.stringify(legacy))).toEqual(current)
  })
  it('does not derive sensitive matching attributes from conversation text', () => {
    const result = profileFromAnswers(
      'Asha',
      ['Books', 'Music'],
      'More of a listener',
      'Prefer not to say',
    )
    expect(Object.keys(result).sort()).toEqual(['gender', 'interests', 'name', 'style'])
  })
})
