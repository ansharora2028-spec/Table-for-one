export const INTERESTS = [
  'Food & cooking',
  'Books',
  'Travel',
  'Art & design',
  'Music',
  'Outdoors',
  'Film',
  'Tech & ideas',
] as const
export const AREAS = ['Cyber Hub', 'Golf Course Road'] as const
export const WINDOWS = [
  'Wednesday dinner',
  'Thursday dinner',
  'Friday dinner',
  'Saturday dinner',
  'Sunday lunch',
] as const
export const CUISINES = ['Mediterranean', 'Indian', 'Asian', 'Italian'] as const
export const DIETS = ['Vegetarian', 'Vegan', 'No preference'] as const
export const STYLES = ['More of a listener', 'A little of both', 'Usually the storyteller'] as const
export const GENDERS = ['Woman', 'Man', 'Non-binary', 'Prefer not to say'] as const
export type Interest = (typeof INTERESTS)[number]
export type Area = (typeof AREAS)[number]
export type Window = (typeof WINDOWS)[number]
export type Cuisine = (typeof CUISINES)[number]
export type Diet = (typeof DIETS)[number]
export type Style = (typeof STYLES)[number]
export type Gender = (typeof GENDERS)[number]
export type Profile = { name: string; interests: Interest[]; style: Style; gender: Gender }
export type Preferences = {
  areas: Area[]
  windows: Window[]
  cuisines: Cuisine[]
  diet: Diet
  budget: number
  tableType: 'Mixed table' | 'Women-only table'
}
export type Guest = {
  id: string
  name: string
  role: string
  interests: Interest[]
  gender: Gender
  color: string
}
export type Restaurant = {
  name: string
  area: Area
  cuisine: Cuisine
  mealPrice: number
  diets: Diet[]
  description: string
}
export type Invitation = {
  id: string
  date: string
  restaurant: Restaurant
  guests: Guest[]
  sharedInterests: Interest[]
  status: 'invited' | 'reserved'
}
export type Reflection = {
  id: string
  restaurant: string
  date: string
  rating: number
  note: string
  regulars: string[]
}
export type AppState = {
  version: 1
  profile: Profile | null
  preferences: Preferences
  queuedAt: string | null
  invitation: Invitation | null
  reflections: Reflection[]
  reports: { id: string; category: string; note: string; date: string }[]
}
export const STORAGE_KEY = 'table-for-one:v1'
export const BOOKING_FEE = 199

export function createInitialState(): AppState {
  return {
    version: 1,
    profile: null,
    preferences: {
      areas: ['Cyber Hub'],
      windows: ['Friday dinner', 'Saturday dinner'],
      cuisines: ['Mediterranean', 'Indian'],
      diet: 'Vegetarian',
      budget: 900,
      tableType: 'Mixed table',
    },
    queuedAt: null,
    invitation: null,
    reflections: [],
    reports: [],
  }
}

export function profileFromAnswers(
  name: string,
  interests: Interest[],
  style: Style,
  gender: Gender,
): Profile {
  return { name: name.trim().slice(0, 40), interests: [...new Set(interests)], style, gender }
}

export function validatePreferences(p: Preferences, profile: Profile): string | null {
  if (!p.areas.length) return 'Choose at least one area.'
  if (!p.windows.length) return 'Choose at least one free time.'
  if (!p.cuisines.length) return 'Choose at least one cuisine.'
  if (p.budget < 500 || p.budget > 2000) return 'Choose a meal budget between ₹500 and ₹2,000.'
  if (p.tableType === 'Women-only table' && profile.gender !== 'Woman')
    return 'Women-only tables are for women. Update your profile or choose a mixed table.'
  return null
}

const shared: Interest[] = ['Food & cooking', 'Books', 'Travel', 'Music']
export const SAMPLE_GUESTS: Guest[] = [
  {
    id: 'meera',
    name: 'Meera',
    role: 'Designer · enthusiastic home cook',
    interests: shared,
    gender: 'Woman',
    color: 'peach',
  },
  {
    id: 'kabir',
    name: 'Kabir',
    role: 'Architect · always planning a trip',
    interests: shared,
    gender: 'Man',
    color: 'sage',
  },
  {
    id: 'isha',
    name: 'Isha',
    role: 'Writer · one more chapter person',
    interests: shared,
    gender: 'Woman',
    color: 'lavender',
  },
  {
    id: 'tara',
    name: 'Tara',
    role: 'Researcher · weekend explorer',
    interests: shared,
    gender: 'Woman',
    color: 'sand',
  },
]
const RESTAURANTS: Restaurant[] = [
  {
    name: 'The Olive Room',
    area: 'Cyber Hub',
    cuisine: 'Mediterranean',
    mealPrice: 750,
    diets: ['Vegetarian', 'Vegan', 'No preference'],
    description: 'Warm light, sharing plates, and a corner made for long conversations.',
  },
  {
    name: 'Saanjh Social Kitchen',
    area: 'Golf Course Road',
    cuisine: 'Indian',
    mealPrice: 650,
    diets: ['Vegetarian', 'Vegan', 'No preference'],
    description: 'Familiar flavours, a generous table, and a slower kind of evening.',
  },
  {
    name: 'Little Basil',
    area: 'Cyber Hub',
    cuisine: 'Italian',
    mealPrice: 850,
    diets: ['Vegetarian', 'No preference'],
    description: 'Wood-fired comfort and the kind of pasta worth talking about.',
  },
  {
    name: 'Miso & More',
    area: 'Golf Course Road',
    cuisine: 'Asian',
    mealPrice: 800,
    diets: ['Vegetarian', 'Vegan', 'No preference'],
    description: 'Small plates and big flavours, with plenty to pass around.',
  },
]

// Synthetic fixtures deliberately have explicit availability. Never broaden a user's constraints.
const SAMPLE_WINDOWS: Window[] = ['Friday dinner', 'Saturday dinner', 'Sunday lunch']
function nextWindow(windows: Window[], now: Date): Date | null {
  const dayNumbers: Record<Window, number> = {
    'Wednesday dinner': 3,
    'Thursday dinner': 4,
    'Friday dinner': 5,
    'Saturday dinner': 6,
    'Sunday lunch': 0,
  }
  const indiaNow = new Date(now.getTime() + 330 * 60000)
  const possibilities: Date[] = []
  for (let offset = 0; offset <= 14; offset++) {
    const day = new Date(
      Date.UTC(indiaNow.getUTCFullYear(), indiaNow.getUTCMonth(), indiaNow.getUTCDate() + offset),
    )
    for (const window of windows) {
      if (day.getUTCDay() !== dayNumbers[window]) continue
      const date = new Date(day.getTime() + (window === 'Sunday lunch' ? 7.5 : 14) * 3600000)
      if (date.getTime() - now.getTime() >= 48 * 3600000) possibilities.push(date)
    }
  }
  return possibilities.sort((a, b) => a.getTime() - b.getTime())[0] ?? null
}

export function buildInvitation(
  profile: Profile,
  preferences: Preferences,
  now = new Date(),
): Invitation | null {
  if (validatePreferences(preferences, profile)) return null
  const guests =
    preferences.tableType === 'Women-only table'
      ? SAMPLE_GUESTS.filter((g) => g.gender === 'Woman')
      : SAMPLE_GUESTS.slice(0, 3)
  const sharedInterests = profile.interests.filter((i) =>
    guests.every((g) => g.interests.includes(i)),
  )
  if (sharedInterests.length < 2 || guests.length < 2 || guests.length > 4) return null
  const restaurant = RESTAURANTS.find(
    (r) =>
      preferences.areas.includes(r.area) &&
      preferences.cuisines.includes(r.cuisine) &&
      r.mealPrice <= preferences.budget &&
      r.diets.includes(preferences.diet),
  )
  const date = nextWindow(
    preferences.windows.filter((w) => SAMPLE_WINDOWS.includes(w)),
    now,
  )
  if (!restaurant || !date) return null
  return {
    id: `sample-${date.getTime()}`,
    date: date.toISOString(),
    restaurant,
    guests,
    sharedInterests,
    status: 'invited',
  }
}

export function formatDate(date: string, withTime = true): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    ...(withTime ? ({ hour: 'numeric', minute: '2-digit' } as const) : {}),
  }).format(new Date(date))
}

function record(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}
function text(v: unknown, max = 1000): v is string {
  return typeof v === 'string' && v.length <= max
}
function oneOf<T extends string>(v: unknown, options: readonly T[]): v is T {
  return typeof v === 'string' && options.includes(v as T)
}
function listOf<T extends string>(v: unknown, options: readonly T[]): v is T[] {
  return (
    Array.isArray(v) &&
    v.length <= options.length &&
    v.every((item) => oneOf(item, options)) &&
    new Set(v).size === v.length
  )
}
function date(v: unknown): v is string {
  return text(v, 40) && Number.isFinite(Date.parse(v))
}
function validProfile(v: unknown): v is Profile {
  return (
    record(v) &&
    text(v.name, 40) &&
    v.name.trim().length > 0 &&
    listOf(v.interests, INTERESTS) &&
    v.interests.length >= 2 &&
    oneOf(v.style, STYLES) &&
    oneOf(v.gender, GENDERS)
  )
}
function validPreferences(v: unknown): v is Preferences {
  return (
    record(v) &&
    listOf(v.areas, AREAS) &&
    listOf(v.windows, WINDOWS) &&
    listOf(v.cuisines, CUISINES) &&
    oneOf(v.diet, DIETS) &&
    typeof v.budget === 'number' &&
    Number.isFinite(v.budget) &&
    v.budget >= 500 &&
    v.budget <= 2000 &&
    oneOf(v.tableType, ['Mixed table', 'Women-only table'])
  )
}
function validInvitation(v: unknown): v is Invitation {
  if (
    !record(v) ||
    !text(v.id, 100) ||
    !date(v.date) ||
    !oneOf(v.status, ['invited', 'reserved']) ||
    !listOf(v.sharedInterests, INTERESTS) ||
    v.sharedInterests.length < 2 ||
    !Array.isArray(v.guests) ||
    v.guests.length < 2 ||
    v.guests.length > 4 ||
    !record(v.restaurant)
  )
    return false
  const r = v.restaurant
  return (
    text(r.name, 100) &&
    oneOf(r.area, AREAS) &&
    oneOf(r.cuisine, CUISINES) &&
    typeof r.mealPrice === 'number' &&
    r.mealPrice >= 0 &&
    r.mealPrice <= 2000 &&
    listOf(r.diets, DIETS) &&
    text(r.description) &&
    v.guests.every(
      (g) =>
        record(g) &&
        text(g.id, 100) &&
        text(g.name, 40) &&
        text(g.role, 100) &&
        listOf(g.interests, INTERESTS) &&
        oneOf(g.gender, GENDERS) &&
        oneOf(g.color, ['peach', 'sage', 'lavender', 'sand']),
    )
  )
}

// localStorage is untrusted input, not authentication. Reject invalid shapes before rendering them.
export function parseSavedState(raw: string | null): AppState | null {
  if (!raw) return null
  try {
    const v: unknown = JSON.parse(raw)
    if (
      !record(v) ||
      v.version !== 1 ||
      !(v.profile === null || validProfile(v.profile)) ||
      !validPreferences(v.preferences) ||
      !(v.queuedAt === null || date(v.queuedAt)) ||
      !(v.invitation === null || validInvitation(v.invitation)) ||
      !Array.isArray(v.reflections) ||
      !Array.isArray(v.reports)
    )
      return null
    if (v.profile === null && (v.queuedAt !== null || v.invitation !== null)) return null
    if (
      !v.reflections.every(
        (r) =>
          record(r) &&
          text(r.id, 100) &&
          text(r.restaurant, 100) &&
          date(r.date) &&
          Number.isInteger(r.rating) &&
          Number(r.rating) >= 1 &&
          Number(r.rating) <= 5 &&
          text(r.note, 500) &&
          Array.isArray(r.regulars) &&
          r.regulars.length <= 4 &&
          r.regulars.every((id: unknown) => text(id, 100)),
      )
    )
      return null
    if (
      !v.reports.every(
        (r) =>
          record(r) &&
          text(r.id, 100) &&
          text(r.category, 100) &&
          text(r.note, 1000) &&
          date(r.date),
      )
    )
      return null
    return v as AppState
  } catch {
    return null
  }
}
