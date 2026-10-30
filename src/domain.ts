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
export type Window = (typeof WINDOWS)[number]
export type Cuisine = (typeof CUISINES)[number]
export type Diet = (typeof DIETS)[number]
export type Style = (typeof STYLES)[number]
export type Gender = (typeof GENDERS)[number]
type Chapter = {
  areas: readonly [string, string]
  restaurants: Record<Cuisine, { name: string; areaIndex: 0 | 1 }>
}
const CITY_CHAPTERS = {
  Delhi: {
    areas: ['Connaught Place', 'Hauz Khas'],
    restaurants: {
      Mediterranean: { name: 'Juniper Room', areaIndex: 0 },
      Indian: { name: 'Dilli Saanjh', areaIndex: 1 },
      Asian: { name: 'Kumo Table', areaIndex: 0 },
      Italian: { name: 'Little Basil Delhi', areaIndex: 1 },
    },
  },
  Gurugram: {
    areas: ['Cyber Hub', 'Golf Course Road'],
    restaurants: {
      Mediterranean: { name: 'The Olive Room', areaIndex: 0 },
      Indian: { name: 'Saanjh Social Kitchen', areaIndex: 1 },
      Asian: { name: 'Miso & More', areaIndex: 1 },
      Italian: { name: 'Little Basil', areaIndex: 0 },
    },
  },
  Mumbai: {
    areas: ['Bandra West', 'Lower Parel'],
    restaurants: {
      Mediterranean: { name: 'Sea & Olive', areaIndex: 0 },
      Indian: { name: 'Bombay Saanjh', areaIndex: 1 },
      Asian: { name: 'Monsoon Table', areaIndex: 0 },
      Italian: { name: 'Little Basil Bombay', areaIndex: 1 },
    },
  },
  Bengaluru: {
    areas: ['Indiranagar', 'Koramangala'],
    restaurants: {
      Mediterranean: { name: 'Garden Olive', areaIndex: 0 },
      Indian: { name: 'Oota Saanjh', areaIndex: 1 },
      Asian: { name: 'Bamboo Table', areaIndex: 0 },
      Italian: { name: 'Little Basil Bengaluru', areaIndex: 1 },
    },
  },
  Hyderabad: {
    areas: ['Jubilee Hills', 'HITEC City'],
    restaurants: {
      Mediterranean: { name: 'Deccan Olive', areaIndex: 0 },
      Indian: { name: 'Saanjh Deccan Kitchen', areaIndex: 1 },
      Asian: { name: 'Nori Table', areaIndex: 0 },
      Italian: { name: 'Little Basil Hyderabad', areaIndex: 1 },
    },
  },
  Chennai: {
    areas: ['Nungambakkam', 'Adyar'],
    restaurants: {
      Mediterranean: { name: 'Coast & Olive', areaIndex: 0 },
      Indian: { name: 'Madras Saanjh', areaIndex: 1 },
      Asian: { name: 'Lotus Table', areaIndex: 0 },
      Italian: { name: 'Little Basil Chennai', areaIndex: 1 },
    },
  },
  Kolkata: {
    areas: ['Park Street', 'Salt Lake'],
    restaurants: {
      Mediterranean: { name: 'Olive Adda', areaIndex: 0 },
      Indian: { name: 'Saanjh Bengal Kitchen', areaIndex: 1 },
      Asian: { name: 'Lantern Table', areaIndex: 0 },
      Italian: { name: 'Little Basil Kolkata', areaIndex: 1 },
    },
  },
  Pune: {
    areas: ['Koregaon Park', 'Baner'],
    restaurants: {
      Mediterranean: { name: 'Olive Courtyard', areaIndex: 0 },
      Indian: { name: 'Saanjh Pune Kitchen', areaIndex: 1 },
      Asian: { name: 'Mori Table', areaIndex: 0 },
      Italian: { name: 'Little Basil Pune', areaIndex: 1 },
    },
  },
  Ahmedabad: {
    areas: ['SG Highway', 'Prahlad Nagar'],
    restaurants: {
      Mediterranean: { name: 'Olive Pol', areaIndex: 0 },
      Indian: { name: 'Saanjh Ahmedabad', areaIndex: 1 },
      Asian: { name: 'Kite Table', areaIndex: 0 },
      Italian: { name: 'Little Basil Ahmedabad', areaIndex: 1 },
    },
  },
} as const satisfies Record<string, Chapter>
export type City = keyof typeof CITY_CHAPTERS
export type Area = (typeof CITY_CHAPTERS)[City]['areas'][number]
export const CITIES = Object.keys(CITY_CHAPTERS) as City[]
export const AREAS_BY_CITY = Object.fromEntries(
  CITIES.map((city) => [city, CITY_CHAPTERS[city].areas]),
) as unknown as Record<City, readonly Area[]>
export const AREAS = Object.values(AREAS_BY_CITY).flat()
export type Profile = { name: string; interests: Interest[]; style: Style; gender: Gender }
export type Preferences = {
  city: City
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
  city: City
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
  version: 2
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
    version: 2,
    profile: null,
    preferences: {
      city: 'Gurugram',
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
  if (!CITIES.includes(p.city)) return 'Choose a city chapter.'
  if (!p.areas.length) return 'Choose at least one area.'
  if (p.areas.some((area) => !AREAS_BY_CITY[p.city].includes(area)))
    return 'Choose areas inside your selected city chapter.'
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
const CUISINE_DETAILS: Record<Cuisine, { price: number; diets: Diet[]; description: string }> = {
  Mediterranean: {
    price: 750,
    diets: [...DIETS],
    description: 'Warm light, sharing plates, and a corner made for long conversations.',
  },
  Indian: {
    price: 650,
    diets: [...DIETS],
    description: 'Familiar flavours, a generous table, and a slower kind of evening.',
  },
  Asian: {
    price: 800,
    diets: [...DIETS],
    description: 'Small plates and big flavours, with plenty to pass around.',
  },
  Italian: {
    price: 850,
    diets: ['Vegetarian', 'No preference'],
    description: 'Wood-fired comfort and the kind of pasta worth talking about.',
  },
}
const RESTAURANTS: Restaurant[] = CITIES.flatMap((city) =>
  CUISINES.map((cuisine) => ({
    name: CITY_CHAPTERS[city].restaurants[cuisine].name,
    city,
    area: AREAS_BY_CITY[city][CITY_CHAPTERS[city].restaurants[cuisine].areaIndex],
    cuisine,
    mealPrice: CUISINE_DETAILS[cuisine].price,
    diets: CUISINE_DETAILS[cuisine].diets,
    description: CUISINE_DETAILS[cuisine].description,
  })),
)

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
      preferences.city === r.city &&
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
    oneOf(v.city, CITIES) &&
    listOf(v.areas, AREAS) &&
    v.areas.every((area) => AREAS_BY_CITY[v.city as City].includes(area)) &&
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
    oneOf(r.city, CITIES) &&
    oneOf(r.area, AREAS) &&
    AREAS_BY_CITY[r.city as City].includes(r.area as Area) &&
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

function migrateSavedState(value: unknown): unknown {
  if (!record(value) || value.version !== 1 || !record(value.preferences)) return value
  const invitation = value.invitation
  const migratedInvitation =
    record(invitation) && record(invitation.restaurant)
      ? { ...invitation, restaurant: { ...invitation.restaurant, city: 'Gurugram' } }
      : invitation
  return {
    ...value,
    version: 2,
    preferences: { ...value.preferences, city: 'Gurugram' },
    invitation: migratedInvitation,
  }
}

// localStorage is untrusted input, not authentication. Reject invalid shapes before rendering them.
export function parseSavedState(raw: string | null): AppState | null {
  if (!raw) return null
  try {
    const v: unknown = migrateSavedState(JSON.parse(raw))
    if (
      !record(v) ||
      v.version !== 2 ||
      !(v.profile === null || validProfile(v.profile)) ||
      !validPreferences(v.preferences) ||
      !(v.queuedAt === null || date(v.queuedAt)) ||
      !(v.invitation === null || validInvitation(v.invitation)) ||
      !Array.isArray(v.reflections) ||
      !Array.isArray(v.reports)
    )
      return null
    if (v.profile === null && (v.queuedAt !== null || v.invitation !== null)) return null
    if (v.invitation !== null) {
      const preferences = v.preferences as Preferences
      const invitation = v.invitation as Invitation
      if (
        invitation.restaurant.city !== preferences.city ||
        !preferences.areas.includes(invitation.restaurant.area)
      )
        return null
    }
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
