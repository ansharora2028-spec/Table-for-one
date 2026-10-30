import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Coffee,
  Compass,
  Download,
  Heart,
  Home,
  Info,
  Leaf,
  MapPin,
  Menu,
  MessageCircleHeart,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sprout,
  Star,
  Trash2,
  UserRound,
  UsersRound,
  Utensils,
  X,
} from 'lucide-react'
import {
  BOOKING_FEE,
  SAMPLE_GUESTS,
  STORAGE_KEY,
  buildInvitation,
  createInitialState,
  formatDate,
  parseSavedState,
  validatePreferences,
  type AppState,
  type Preferences,
  type Profile,
  type Reflection,
} from './domain'
import {
  Button,
  EmptyState,
  IconLabel,
  Modal,
  Pill,
  SectionHeading,
  TableArt,
  TextLink,
} from './components'
import { Onboarding, PreferencesForm, ReflectionForm } from './flows'

const pages = ['home', 'table', 'preferences', 'memories', 'profile', 'how', 'safety'] as const
type Page = (typeof pages)[number]
type Dialog = 'onboarding' | 'delete' | 'leave' | 'reflection' | 'report' | 'reserve' | null
const nav = [
  { id: 'home', label: 'Your corner', icon: Home },
  { id: 'table', label: 'Your table', icon: Utensils },
  { id: 'preferences', label: 'Dining preferences', icon: SlidersHorizontal },
  { id: 'memories', label: 'Good memories', icon: Heart },
] as const
const steps = [
  {
    title: 'A conversation, not a quiz.',
    text: 'A few things you love. The way you see the world. Let’s start with you.',
    icon: MessageCircleHeart,
  },
  {
    title: 'The right people. No rush.',
    text: 'A small table, shared interests, and a time that works for everyone.',
    icon: UsersRound,
  },
  {
    title: 'Show up as yourself.',
    text: 'A good meal. A little curiosity. We’ll take care of the first icebreaker.',
    icon: Coffee,
  },
]
function readInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const saved = parseSavedState(raw)
    return {
      state: saved ?? createInitialState(),
      raw,
      recovery: raw !== null && saved === null ? ('saved' as const) : ('current' as const),
      error:
        raw !== null && saved === null
          ? 'We couldn’t read your saved data. It has not been overwritten. You can download it or reset it below.'
          : '',
    }
  } catch {
    return {
      state: createInitialState(),
      raw: undefined,
      recovery: 'current' as const,
      error:
        'Browser storage is unavailable. You can explore, but your progress will not survive a refresh.',
    }
  }
}
function currentPage(): Page {
  const hash = window.location.hash.slice(1)
  return pages.includes(hash as Page) ? (hash as Page) : 'home'
}

export default function App() {
  const [initial] = useState(readInitial)
  const [state, setState] = useState<AppState>(initial.state)
  const [storageError, setStorageError] = useState(initial.error)
  const [storageRecovery, setStorageRecovery] = useState(initial.recovery)
  const [preserveStorage, setPreserveStorage] = useState(Boolean(initial.error))
  const [storageRevision, setStorageRevision] = useState(0)
  const [page, setPage] = useState<Page>(currentPage)
  const [dialog, setDialog] = useState<Dialog>(null)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [toast, setToast] = useState('')
  const [matching, setMatching] = useState(false)
  const [noMatch, setNoMatch] = useState(false)
  const matchingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const storageSnapshot = useRef(initial.raw)
  const mainRef = useRef<HTMLElement>(null)
  useEffect(() => {
    if (preserveStorage) return
    try {
      const current = localStorage.getItem(STORAGE_KEY)
      // An external change wins over this tab's stale whole-state update, even before its event runs.
      if (current !== storageSnapshot.current) {
        adoptStoredValue(current)
        return
      }
      const serialized = JSON.stringify(state)
      if (serialized !== current) localStorage.setItem(STORAGE_KEY, serialized)
      storageSnapshot.current = serialized
      setStorageError('')
    } catch {
      setStorageRecovery('current')
      setStorageError(
        'Your browser couldn’t save this change. Keep this tab open; progress may be lost on refresh.',
      )
    }
  }, [state, preserveStorage])
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY && event.key !== null) return
      try {
        if (event.storageArea !== localStorage) return
        // Read the latest record: queued storage events may already have been superseded.
        adoptStoredValue(localStorage.getItem(STORAGE_KEY))
      } catch {
        setPreserveStorage(true)
        setStorageRecovery('current')
        setStorageError(
          'Browser storage is unavailable. Download your current progress before leaving this tab.',
        )
      }
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])
  useEffect(() => {
    const sync = () => setPage(currentPage())
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 5000)
    return () => clearTimeout(timer)
  }, [toast])
  useEffect(
    () => () => {
      if (matchingTimer.current) clearTimeout(matchingTimer.current)
    },
    [],
  )
  useEffect(() => {
    if (!mobileMenu) return
    const previous = document.activeElement as HTMLElement | null
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusable = () =>
      Array.from(
        document.querySelectorAll<HTMLElement>('.mobile-header button, #sidebar button'),
      ).filter((el) => el.getClientRects().length > 0)
    document.querySelector<HTMLElement>('#sidebar .nav-item')?.focus()
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenu(false)
        return
      }
      if (event.key !== 'Tab') return
      const elements = focusable()
      const first = elements[0],
        last = elements[elements.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    const handleResize = () => {
      if (window.innerWidth > 760) setMobileMenu(false)
    }
    window.addEventListener('keydown', handleKey)
    window.addEventListener('resize', handleResize)
    return () => {
      document.body.style.overflow = oldOverflow
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('resize', handleResize)
      previous?.focus()
    }
  }, [mobileMenu])
  function navigate(next: Page) {
    setPage(next)
    window.location.hash = next
    setMobileMenu(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
    requestAnimationFrame(() => mainRef.current?.focus())
  }
  function adoptStoredValue(raw: string | null) {
    if (raw === storageSnapshot.current) return
    storageSnapshot.current = raw
    cancelMatching()
    setDialog(null)
    setNoMatch(false)
    setStorageRevision((revision) => revision + 1)
    const saved = parseSavedState(raw)
    if (raw !== null && saved === null) {
      setPreserveStorage(true)
      setStorageRecovery('saved')
      setStorageError(
        'Saved data changed in another tab and could not be read. It has not been overwritten. Download it or reset local data to continue saving.',
      )
      return
    }
    setPreserveStorage(false)
    setStorageRecovery('current')
    setStorageError('')
    setState(saved ?? createInitialState())
    setToast('Your local data changed in another tab. This view is now up to date.')
  }
  function announce(message: string) {
    setToast(message)
  }
  function updateProfile(profile: Profile) {
    cancelMatching()
    setState((s) => ({ ...s, profile, invitation: null, queuedAt: null }))
    setDialog(null)
    setNoMatch(false)
    navigate('preferences')
    announce('Your profile is saved. Let’s make the evening work for you.')
  }
  function savePreferences(preferences: Preferences) {
    cancelMatching()
    setState((s) => ({ ...s, preferences, invitation: null, queuedAt: new Date().toISOString() }))
    setNoMatch(false)
    navigate('table')
    announce('Preferences saved on this device. You’re ready to explore a sample match.')
  }
  function cancelMatching() {
    if (matchingTimer.current) clearTimeout(matchingTimer.current)
    matchingTimer.current = null
    setMatching(false)
  }
  function findSample() {
    if (!state.profile) {
      setDialog('onboarding')
      return
    }
    const invalid = validatePreferences(state.preferences, state.profile)
    if (invalid) {
      announce(invalid)
      navigate('preferences')
      return
    }
    setMatching(true)
    setNoMatch(false)
    matchingTimer.current = setTimeout(() => {
      const invitation = buildInvitation(state.profile!, state.preferences)
      setState((s) => ({ ...s, invitation, queuedAt: s.queuedAt ?? new Date().toISOString() }))
      setMatching(false)
      setNoMatch(!invitation)
      matchingTimer.current = null
      if (invitation) announce('A sample table fits your preferences. Take a look around.')
    }, 650)
  }
  function start() {
    if (!state.profile) setDialog('onboarding')
    else navigate(state.queuedAt || state.invitation ? 'table' : 'preferences')
  }
  function saveReflection(reflection: Reflection) {
    setState((s) => ({
      ...s,
      reflections: [reflection, ...s.reflections],
      invitation: null,
      queuedAt: null,
    }))
    setDialog(null)
    navigate('memories')
    announce('A little memory, saved. Your choices stay private on this device.')
  }
  function deleteData() {
    cancelMatching()
    try {
      localStorage.removeItem(STORAGE_KEY)
      storageSnapshot.current = null
      setStorageRecovery('current')
      setStorageError('')
      setPreserveStorage(false)
    } catch {
      setStorageError(
        'Browser storage could not be cleared. Clear site data in your browser settings to remove it.',
      )
      setPreserveStorage(true)
    }
    setState(createInitialState())
    setDialog(null)
    setNoMatch(false)
    navigate('home')
    announce('Your in-app profile, preferences, and memories have been reset.')
  }
  function downloadData(raw = false) {
    try {
      const data = raw
        ? (localStorage.getItem(STORAGE_KEY) ?? '{}')
        : JSON.stringify(state, null, 2)
      const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }))
      const a = document.createElement('a')
      a.href = url
      a.download = 'table-for-one-my-data.json'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      announce('Your browser could not export data. Try allowing downloads for this site.')
    }
  }
  const invitation = state.invitation
  const longWait = state.queuedAt && Date.now() - Date.parse(state.queuedAt) > 21 * 86400000
  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault()
          mainRef.current?.focus()
        }}
      >
        Skip to content
      </a>
      <header className="mobile-header">
        <Brand onClick={() => navigate('home')} />
        <button
          className="icon-button"
          aria-label={mobileMenu ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenu}
          aria-controls="sidebar"
          onClick={() => setMobileMenu(!mobileMenu)}
        >
          {mobileMenu ? <X /> : <Menu />}
        </button>
      </header>
      {mobileMenu && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileMenu(false)}
        />
      )}
      <aside id="sidebar" className={`sidebar ${mobileMenu ? 'open' : ''}`}>
        <Brand onClick={() => navigate('home')} />
        <div className="chapter">
          <span className="location-dot" />
          {state.preferences.city.toUpperCase()} CHAPTER
          <ChevronDown size={13} aria-hidden="true" />
        </div>
        <span className="nav-heading">A PLACE FOR YOU</span>
        <nav aria-label="Main navigation">
          {nav.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => navigate(id)}
              className={`nav-item ${page === id ? 'active' : ''}`}
              aria-current={page === id ? 'page' : undefined}
            >
              <Icon size={19} strokeWidth={1.6} />
              {label}
              {id === 'table' && invitation && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="note-flower">✳︎</span>
          <p>
            Come for the food.
            <br />
            <em>Stay for the people.</em>
          </p>
          <span>Small tables. Real possibilities.</span>
        </div>
        <nav className="secondary-nav" aria-label="More">
          <button
            className={`nav-item ${page === 'how' ? 'active' : ''}`}
            onClick={() => navigate('how')}
          >
            <Compass size={18} strokeWidth={1.6} />
            How it works
            <ArrowUpRight size={14} />
          </button>
          <button
            className={`nav-item ${page === 'safety' ? 'active' : ''}`}
            onClick={() => navigate('safety')}
          >
            <ShieldCheck size={18} strokeWidth={1.6} />A safer table
          </button>
        </nav>
        <button
          className="profile-nav"
          aria-label="Your profile"
          onClick={() => navigate('profile')}
        >
          <span className="avatar peach">
            {state.profile?.name[0]?.toUpperCase() ?? <UserRound size={19} />}
          </span>
          <span>
            <strong>{state.profile?.name ?? 'Your next chapter'}</strong>
            <small>{state.profile ? 'View your profile' : 'Make yourself at home'}</small>
          </span>
          <ArrowUpRight size={16} />
        </button>
      </aside>
      <div className="main-shell" inert={mobileMenu || undefined}>
        <div className="topbar">
          <span>
            <span className="tiny-sparkle">✧</span> A little less scrolling. A little more living.
          </span>
          <button className="pilot-badge" onClick={() => navigate('how')}>
            <span className="location-dot" />
            {state.preferences.city} chapter
            <ArrowUpRight size={13} />
          </button>
        </div>
        <main id="main-content" ref={mainRef} tabIndex={-1}>
          {storageError && (
            <div className="storage-warning" role="alert">
              <Info size={18} />
              <div>
                <p>{storageError}</p>
                <button onClick={() => downloadData(storageRecovery === 'saved')}>
                  {storageRecovery === 'saved'
                    ? 'Download saved data'
                    : 'Download current progress'}
                </button>
                <button onClick={() => setDialog('delete')}>Reset local data</button>
              </div>
            </div>
          )}
          {page === 'home' && (
            <>
              <div className="page-intro">
                <div>
                  <span className="eyebrow">YOUR NEXT CHAPTER STARTS AT A TABLE</span>
                  <h1>
                    {state.profile
                      ? `Make room for good company, ${state.profile.name}.`
                      : 'A table for one. A little more possibility.'}
                  </h1>
                </div>
                <span className="handwritten welcome-note">
                  but not alone.
                  <Heart size={16} />
                </span>
              </div>
              <section className="hero" aria-labelledby="hero-title">
                <div className="hero-copy">
                  <span className="hero-kicker">
                    <span />
                    REAL PEOPLE. SHARED TABLES.
                  </span>
                  <h2 id="hero-title">
                    Good food.
                    <br />
                    <em>Better company.</em>
                  </h2>
                  <p>
                    You don’t need another group chat.
                    <br />
                    Just a seat with the right people.
                  </p>
                  <Button onClick={start}>
                    {state.profile ? 'Find my next table' : 'Let’s find your people'}
                    <ArrowRight size={17} />
                  </Button>
                  <div className="hero-footnote">
                    <span className="mini-avatars">
                      <i>M</i>
                      <i>K</i>
                      <i>I</i>
                    </span>
                    <span>3–5 people. One good evening.</span>
                  </div>
                </div>
                <div className="hero-visual">
                  <span className="handwritten visual-note">
                    a little room for
                    <br />
                    someone new <ArrowDown size={25} />
                  </span>
                  <TableArt />
                  <span className="visual-caption">THE BEST THINGS HAPPEN OFFLINE.</span>
                </div>
              </section>
              <div className="promise-strip">
                <IconLabel icon={UsersRound}>Small tables, never a crowd</IconLabel>
                <span />
                <IconLabel icon={Sparkles}>Connection over coincidence</IconLabel>
                <span />
                <IconLabel icon={ShieldCheck}>Your comfort comes first</IconLabel>
              </div>
              <section className="next-section">
                <SectionHeading
                  label="YOUR SEAT IS WAITING"
                  title={
                    invitation
                      ? 'Something good is on the table.'
                      : state.profile
                        ? 'A little closer to your people.'
                        : 'First, a little about you.'
                  }
                  action={
                    <span className="step-label">
                      {invitation
                        ? 'READY TO EXPLORE'
                        : state.profile
                          ? 'STEP 02 / 03'
                          : 'STEP 01 / 03'}
                    </span>
                  }
                />
                <div className="next-card">
                  <span className="next-icon">
                    {invitation ? (
                      <Utensils size={28} strokeWidth={1.4} />
                    ) : (
                      <MessageCircleHeart size={30} strokeWidth={1.4} />
                    )}
                  </span>
                  <div>
                    <h3>
                      {invitation
                        ? `Your sample evening at ${invitation.restaurant.name}`
                        : state.profile
                          ? 'An evening that fits your life.'
                          : 'More than your job title.'}
                    </h3>
                    <p>
                      {invitation
                        ? `${formatDate(invitation.date)} IST · ${invitation.guests.length + 1} seats · fictional guests`
                        : state.profile
                          ? 'Your time, your neighbourhood, your kind of food. Make it yours.'
                          : 'What lights you up? What could you talk about for hours? Start with a little conversation.'}
                    </p>
                    <div className="next-meta">
                      <IconLabel icon={Clock3}>
                        {invitation ? 'At least 48 hours to plan' : 'About 2 minutes'}
                      </IconLabel>
                      <IconLabel icon={Heart}>No perfect answers needed</IconLabel>
                    </div>
                  </div>
                  <Button variant="secondary" onClick={start}>
                    {invitation ? 'Meet your table' : state.profile ? 'Make it yours' : 'Say hello'}
                    <ArrowUpRight size={17} />
                  </Button>
                </div>
              </section>
              <section className="how-section">
                <SectionHeading
                  label="A LITTLE DIFFERENT, IN A GOOD WAY"
                  title="Less awkward. More authentic."
                  action={<TextLink onClick={() => navigate('how')}>The whole story</TextLink>}
                />
                <div className="how-grid">
                  {steps.map((s, i) => (
                    <article className="how-card" key={s.title}>
                      <div className="how-card-top">
                        <s.icon size={25} strokeWidth={1.4} />
                        <span>0{i + 1}</span>
                      </div>
                      <h3>{s.title}</h3>
                      <p>{s.text}</p>
                    </article>
                  ))}
                </div>
              </section>
              <div className="manifesto">
                <Sprout size={30} strokeWidth={1.3} />
                <p>
                  “No one in a new city should eat alone.
                  <br />
                  <em>Unless they want to.</em>”
                </p>
                <span>THE THOUGHT THAT STARTED IT ALL</span>
              </div>
            </>
          )}
          {page === 'table' && (
            <>
              <PageHeader
                eyebrow="GOOD THINGS TAKE A LITTLE TIME"
                title="Your next shared story."
                description="Not a table every Wednesday. The right table, when it comes together."
              />
              <DemoNote />
              {!state.profile ? (
                <EmptyState
                  title="Your people start with you."
                  icon={MessageCircleHeart}
                  action={
                    <Button onClick={() => setDialog('onboarding')}>
                      Let’s get to know you
                      <ArrowRight size={16} />
                    </Button>
                  }
                >
                  A few things you love, a time that works, and a small table of people who might
                  just click.
                </EmptyState>
              ) : invitation ? (
                <>
                  <section className="invitation-card">
                    <div className="invitation-art">
                      <TableArt small />
                      <Pill tone="cream">FICTIONAL VENUE & GUESTS</Pill>
                    </div>
                    <div className="invitation-copy">
                      <Pill tone="sage">
                        <Sparkles size={13} />
                        {invitation.status === 'reserved'
                          ? 'Your sample seat is saved'
                          : 'A little common ground'}
                      </Pill>
                      <h2>{invitation.restaurant.name}</h2>
                      <p>{invitation.restaurant.description}</p>
                      <div className="invitation-meta">
                        <IconLabel icon={CalendarDays}>{formatDate(invitation.date)} IST</IconLabel>
                        <IconLabel icon={MapPin}>
                          {invitation.restaurant.area}, {invitation.restaurant.city}
                        </IconLabel>
                        <IconLabel icon={Leaf}>
                          {invitation.restaurant.cuisine} · {state.preferences.diet}
                        </IconLabel>
                        <IconLabel icon={UsersRound}>
                          {invitation.guests.length + 1} people · {state.preferences.tableType}
                        </IconLabel>
                      </div>
                      <div className="price-row">
                        <div>
                          <strong>₹{invitation.restaurant.mealPrice + BOOKING_FEE}</strong>
                          <span>estimated per person</span>
                        </div>
                        <small>
                          ₹{invitation.restaurant.mealPrice} meal + ₹{BOOKING_FEE} seat fee
                          <br />
                          Demo only. You won’t be charged.
                        </small>
                      </div>
                      {invitation.status === 'invited' ? (
                        <Button onClick={() => setDialog('reserve')}>
                          Save my sample seat
                          <ArrowRight size={17} />
                        </Button>
                      ) : (
                        <div className="reserved-note">
                          <CheckCircle2 size={20} />
                          <span>
                            Saved on this device. No restaurant reservation has been made.
                          </span>
                        </div>
                      )}
                    </div>
                  </section>
                  <section className="table-people">
                    <SectionHeading
                      label="A SMALL TABLE, A FEW NEW FACES"
                      title="Meet the sample company."
                    />
                    <p className="section-description">
                      Fictional profiles to explore the experience. No identity checks have been
                      performed.
                    </p>
                    <div className="guest-grid">
                      <article className="guest-card you">
                        <span className="avatar sage large">
                          {state.profile.name[0].toUpperCase()}
                        </span>
                        <h3>
                          {state.profile.name} <small>you</small>
                        </h3>
                        <p>Bringing a little curiosity.</p>
                      </article>
                      {invitation.guests.map((g) => (
                        <article className="guest-card" key={g.id}>
                          <span className={`avatar ${g.color} large`}>{g.name[0]}</span>
                          <h3>{g.name}</h3>
                          <p>{g.role}</p>
                        </article>
                      ))}
                    </div>
                  </section>
                  <div className="two-column">
                    <section className="content-card shared-card">
                      <span className="eyebrow">WHY THIS SAMPLE TABLE?</span>
                      <h3>A few things you all love.</h3>
                      <div className="chips">
                        {invitation.sharedInterests.map((i) => (
                          <Pill key={i}>{i}</Pill>
                        ))}
                      </div>
                      <p>
                        Shared interests, plus an area, time, cuisine, diet, and meal estimate that
                        fit your preferences. It’s a starting point, never a promise of chemistry.
                      </p>
                    </section>
                    <section className="content-card icebreaker">
                      <span className="eyebrow">
                        <Sparkles size={13} />A LITTLE ICEBREAKER
                      </span>
                      <h3>
                        “What’s a place, a meal, or a book that stayed with you longer than you
                        expected?”
                      </h3>
                      <p>No scripts. Just somewhere to begin.</p>
                    </section>
                  </div>
                  <div className="table-actions">
                    <Button variant="text" onClick={() => setDialog('leave')}>
                      Release this sample table
                    </Button>
                    {invitation.status === 'reserved' && (
                      <Button variant="secondary" onClick={() => setDialog('reflection')}>
                        Try post-meal reflection
                        <Heart size={16} />
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <section className="waiting-card">
                  <div className="waiting-art">
                    <div className="orbit">
                      <UsersRound size={42} strokeWidth={1} />
                      <span />
                      <span />
                      <span />
                    </div>
                    <span className="handwritten">worth waiting for.</span>
                  </div>
                  <div>
                    <Pill tone="sage">
                      {matching
                        ? 'Checking sample preferences'
                        : noMatch
                          ? 'No sample table fits yet'
                          : 'YOUR NEXT TABLE'}
                    </Pill>
                    <h2>
                      {matching
                        ? 'Looking for a little overlap…'
                        : noMatch
                          ? 'We won’t force a fit.'
                          : 'Good company can’t be rushed.'}
                    </h2>
                    <p>
                      {matching
                        ? 'Checking time, area, food, budget, and common ground.'
                        : noMatch
                          ? 'The small fictional guest pool doesn’t meet all your choices. Your preferences are unchanged. You can edit them or leave them just as they are.'
                          : 'Your profile is ready. Try the fictional guest pool to see how an invitation would work. No real matching or background search is running.'}
                    </p>
                    {(longWait || noMatch) && (
                      <div className="inline-note">
                        {longWait ? 'It’s been over 21 days. ' : ''}A wider area or another cuisine
                        may create more possibilities. Only change what feels comfortable.
                      </div>
                    )}
                    <div className="waiting-actions">
                      <Button onClick={findSample} disabled={matching}>
                        {matching ? <span className="spinner" /> : <Sparkles size={16} />}
                        {matching ? 'Checking sample tables…' : 'Explore a sample match'}
                      </Button>
                      {matching ? (
                        <Button variant="text" onClick={cancelMatching}>
                          Cancel
                        </Button>
                      ) : (
                        <Button variant="text" onClick={() => navigate('preferences')}>
                          Edit preferences
                          <ArrowUpRight size={15} />
                        </Button>
                      )}
                    </div>
                  </div>
                </section>
              )}
              <div className="safety-footnote">
                <ShieldCheck size={20} />
                <p>
                  Real tables will require phone and ID verification before invitations.{' '}
                  <button onClick={() => navigate('safety')}>
                    Read our approach to safety
                    <ArrowUpRight size={13} />
                  </button>
                </p>
              </div>
            </>
          )}
          {page === 'preferences' && (
            <>
              <PageHeader
                eyebrow="THE LITTLE DETAILS MATTER"
                title="Your evening. Your way."
                description="A few practical things, so all you have to think about is showing up."
              />
              {state.profile ? (
                <PreferencesForm
                  key={JSON.stringify(state.preferences) + state.profile.gender + storageRevision}
                  initial={state.preferences}
                  profile={state.profile}
                  onSave={savePreferences}
                  hasInvitation={Boolean(invitation)}
                />
              ) : (
                <EmptyState
                  title="Let’s start with you."
                  icon={SlidersHorizontal}
                  action={
                    <Button onClick={() => setDialog('onboarding')}>
                      Create my profile
                      <ArrowRight size={16} />
                    </Button>
                  }
                >
                  A little introduction helps us make your dining preferences personal.
                </EmptyState>
              )}
            </>
          )}
          {page === 'memories' && (
            <>
              <PageHeader
                eyebrow="SOME EVENINGS STAY WITH YOU"
                title="A little collection of good."
                description="Your reflections, favourite company, and beginnings worth remembering."
              />
              {!state.reflections.length ? (
                <EmptyState
                  title="Your first story is still to come."
                  icon={Heart}
                  action={
                    <Button onClick={() => navigate('table')}>
                      Find your next table
                      <ArrowRight size={16} />
                    </Button>
                  }
                >
                  After a sample reservation, try a post-meal reflection. Real meals will eventually
                  live here, too.
                </EmptyState>
              ) : (
                <div className="memory-grid">
                  {state.reflections.map((r) => (
                    <article className="content-card memory-card" key={r.id}>
                      <div className="memory-top">
                        <span className="memory-icon">
                          <Coffee size={26} />
                        </span>
                        <Pill tone="sand">Sample memory</Pill>
                      </div>
                      <div
                        className="memory-stars"
                        role="img"
                        aria-label={`${r.rating} out of 5 stars`}
                      >
                        {Array.from({ length: r.rating }, (_, i) => (
                          <Star key={i} size={16} fill="currentColor" />
                        ))}
                      </div>
                      <h2>{r.restaurant}</h2>
                      <IconLabel icon={CalendarDays}>{formatDate(r.date, false)}</IconLabel>
                      {r.note && <p className="memory-note">“{r.note}”</p>}
                      {r.regulars.length > 0 && (
                        <div className="regulars">
                          <Heart size={15} />
                          Eat again with{' '}
                          {r.regulars
                            .map(
                              (id) =>
                                SAMPLE_GUESTS.find((guest) => guest.id === id)?.name ??
                                'a tablemate',
                            )
                            .join(', ')}
                        </div>
                      )}
                      <small>Private to this device. No messages sent.</small>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
          {page === 'profile' && (
            <>
              <PageHeader
                eyebrow="MORE THAN AN INTRODUCTION"
                title="A little about you."
                description="Your profile belongs to you. Change it as you change, or take it with you."
              />
              {state.profile ? (
                <div className="profile-layout">
                  <section className="content-card profile-card">
                    <span className="avatar peach extra-large">
                      {state.profile.name[0].toUpperCase()}
                    </span>
                    <h2>{state.profile.name}</h2>
                    <IconLabel icon={MapPin}>{state.preferences.city}</IconLabel>
                    <div className="profile-divider" />
                    <span className="eyebrow">A FEW THINGS I LOVE</span>
                    <div className="chips centered">
                      {state.profile.interests.map((i) => (
                        <Pill key={i}>{i}</Pill>
                      ))}
                    </div>
                    <span className="eyebrow">AT A DINNER TABLE</span>
                    <p>{state.profile.style}</p>
                    <span className="eyebrow">GENDER</span>
                    <p>{state.profile.gender}</p>
                    <Button variant="secondary" onClick={() => setDialog('onboarding')}>
                      Edit my profile
                      <ArrowUpRight size={16} />
                    </Button>
                  </section>
                  <div>
                    <section className="content-card verification-card">
                      <ShieldCheck size={28} strokeWidth={1.4} />
                      <h3>A familiar face starts with trust.</h3>
                      <p>
                        Phone and ID verification are not connected in this local release. Your
                        profile is <strong>not verified</strong> and cannot book a real table.
                      </p>
                      <Pill tone="sand">Verification not connected</Pill>
                      <p className="field-hint">
                        Please don’t upload an ID or enter sensitive documents here.
                      </p>
                    </section>
                    <section className="content-card privacy-card">
                      <h3>Your story, your control.</h3>
                      <p>
                        Your information stays in this browser. It isn’t uploaded or shared with
                        other people. Don’t use a shared device for private details.
                      </p>
                      <Button variant="text" onClick={() => downloadData()}>
                        <Download size={16} />
                        Download my data
                      </Button>
                      <Button variant="text" onClick={() => setDialog('delete')}>
                        <Trash2 size={16} />
                        Delete all local data
                      </Button>
                    </section>
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="A place to be yourself."
                  icon={UserRound}
                  action={
                    <Button onClick={() => setDialog('onboarding')}>
                      Make my introduction
                      <ArrowRight size={16} />
                    </Button>
                  }
                >
                  Start with your name and the things you love. No résumé needed.
                </EmptyState>
              )}
            </>
          )}
          {page === 'how' && (
            <>
              <PageHeader
                eyebrow="BUT NOT ALONE"
                title="Strangers. Then, maybe, regulars."
                description="Food is the reason to meet. Finding a little belonging is why we’re here."
              />
              <section className="about-intro">
                <div>
                  <Pill tone="sage">
                    <MapPin size={13} />
                    Nine city chapters across India
                  </Pill>
                  <h2>
                    Not more connections.
                    <br />
                    <em>More connection.</em>
                  </h2>
                  <p>
                    New city. Familiar routine. A lot of people around, and not always someone to
                    share a meal with. Table for One makes a little room for something different.
                  </p>
                  <p>
                    Choose a chapter in Delhi, Gurugram, Mumbai, Bengaluru, Hyderabad, Chennai,
                    Kolkata, Pune, or Ahmedabad, then pick neighbourhoods that work for you. Three
                    to five people. A reason to put your phone away.
                  </p>
                </div>
                <div className="about-doodle">
                  <Utensils size={100} strokeWidth={0.8} />
                  <span className="handwritten">
                    pass the bread.
                    <br />
                    and a good story.
                  </span>
                </div>
              </section>
              <div className="how-detailed">
                {[
                  ...steps,
                  {
                    title: 'Take a little of it with you.',
                    text: 'Reflect on your meal. Remember the people you’d like to eat with again. Let one good evening become a familiar ritual.',
                    icon: Heart,
                  },
                ].map((s, i) => (
                  <article key={s.title}>
                    <span className="detail-step">0{i + 1}</span>
                    <s.icon size={26} strokeWidth={1.4} />
                    <div>
                      <h3>{s.title}</h3>
                      <p>{s.text}</p>
                    </div>
                  </article>
                ))}
              </div>
              <section className="content-card honest-card">
                <Info size={25} />
                <div>
                  <h3>Where we are, honestly.</h3>
                  <p>
                    This is a working local demonstration of the pilot experience, based on the
                    PM101 brief. Onboarding is guided, not a live AI conversation. All tablemates
                    and venues shown are fictional. No real matching, notifications, payments,
                    phone/ID checks, or reservations take place.
                  </p>
                  <p>
                    The live pilot is designed for human-assisted matching first, with AI analysis
                    later. When live, a seat would cost ₹199 plus your meal, and invitations would
                    arrive at least 48 hours ahead.
                  </p>
                  <p>
                    Our matching approach uses interests and practical preferences. Never religion,
                    caste, or politics. There’s no dating, social feed, or large event calendar.
                  </p>
                </div>
              </section>
              <div className="centered-action">
                <Button onClick={start}>
                  Pull up a chair
                  <ArrowRight size={16} />
                </Button>
              </div>
            </>
          )}
          {page === 'safety' && (
            <>
              <PageHeader
                eyebrow="COMFORT ISN’T AN EXTRA"
                title="A safer seat at the table."
                description="Good company begins with clear boundaries, respect, and a little care."
              />
              <div className="two-column safety-grid">
                {[
                  {
                    icon: ShieldCheck,
                    title: 'Trust before the table.',
                    text: 'The live service must verify phone and identity before a real invitation. This demo does not collect documents or verify anyone.',
                  },
                  {
                    icon: UsersRound,
                    title: 'Small, public, considered.',
                    text: 'Tables of 3–5 at public restaurants. Women-only preferences are available to women. You never have to accept a table that feels wrong.',
                  },
                  {
                    icon: Heart,
                    title: 'People, not profiles to judge.',
                    text: 'No dating expectations, unwanted contact, discrimination, or pressure to share personal information. Respect a no, leave room to listen, and ask before taking photos.',
                  },
                  {
                    icon: Leaf,
                    title: 'Food comfort matters, too.',
                    text: 'Diet is a hard preference in the sample matching flow. For severe allergies, contact the real venue directly before attending; a cuisine or diet label is not an allergy guarantee.',
                  },
                ].map((s) => (
                  <section key={s.title} className="content-card">
                    <s.icon size={26} strokeWidth={1.4} />
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </section>
                ))}
              </div>
              <section className="content-card help-card">
                <div>
                  <span className="eyebrow">SOMETHING DOESN’T FEEL RIGHT?</span>
                  <h2>You can always step away.</h2>
                  <p>
                    If you’re in immediate danger in India, call <a href="tel:112">112</a> and ask
                    venue staff for help. This app does not monitor reports or provide emergency
                    support.
                  </p>
                  <p>
                    You can save a private safety note for yourself. It stays on this device and{' '}
                    <strong>is not sent to a support team</strong>.
                  </p>
                </div>
                <Button variant="secondary" onClick={() => setDialog('report')}>
                  Save a private safety note
                  <ArrowUpRight size={16} />
                </Button>
              </section>
              {state.reports.length > 0 && (
                <section>
                  <SectionHeading title="Your private safety notes" />
                  <div className="notes-list">
                    {state.reports.map((r) => (
                      <article className="content-card" key={r.id}>
                        <Pill tone="sand">Local only · not submitted</Pill>
                        <h3>{r.category}</h3>
                        <small>{formatDate(r.date)} IST</small>
                        <p className="preserve-lines">{r.note}</p>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
        <footer className="footer">
          <span>Made for a little more togetherness.</span>
          <span>
            Table for One <span className="footer-star">✳︎</span> but not alone.
          </span>
          <button onClick={() => navigate('how')}>
            Local demo · your data stays here
            <ArrowUpRight size={12} />
          </button>
        </footer>
      </div>
      <div className="toast" role="status" aria-live="polite">
        {toast && (
          <>
            <CheckCircle2 size={18} />
            {toast}
            <button
              className="icon-button"
              aria-label="Dismiss notification"
              onClick={() => setToast('')}
            >
              <X size={15} />
            </button>
          </>
        )}
      </div>
      {dialog === 'onboarding' && (
        <Onboarding
          profile={state.profile}
          onClose={() => setDialog(null)}
          onComplete={updateProfile}
        />
      )}
      {dialog === 'reflection' && invitation && (
        <ReflectionForm
          invitation={invitation}
          onClose={() => setDialog(null)}
          onSave={saveReflection}
        />
      )}
      {dialog === 'delete' && (
        <Modal title="Leave no crumbs behind?" onClose={() => setDialog(null)}>
          <p className="body-copy">
            This deletes your local profile, dining preferences, sample invitation, reflections, and
            private safety notes from this browser. It can’t be undone.
          </p>
          <div className="flow-actions">
            <Button variant="text" onClick={() => setDialog(null)}>
              Keep my data
            </Button>
            <Button variant="danger" onClick={deleteData}>
              <Trash2 size={16} />
              Delete all local data
            </Button>
          </div>
        </Modal>
      )}
      {dialog === 'leave' && (
        <Modal title="A different evening, perhaps." onClose={() => setDialog(null)}>
          <p className="body-copy">
            Release this sample table? Your profile and preferences will stay, so you can explore
            another match whenever you like. No venue or guest will be notified.
          </p>
          <div className="flow-actions">
            <Button variant="text" onClick={() => setDialog(null)}>
              Keep my seat
            </Button>
            <Button
              onClick={() => {
                setState((s) => ({ ...s, invitation: null, queuedAt: null }))
                setDialog(null)
                announce('Your sample seat has been released.')
              }}
            >
              Release sample table
            </Button>
          </div>
        </Modal>
      )}
      {dialog === 'reserve' && invitation && (
        <Modal title="A seat with your name on it." onClose={() => setDialog(null)}>
          <Pill tone="sand">Sample reservation only</Pill>
          <h3 className="reservation-name">{invitation.restaurant.name}</h3>
          <p className="body-copy">
            {formatDate(invitation.date)} IST · {invitation.guests.length + 1} people
            <br />₹{invitation.restaurant.mealPrice} estimated meal + ₹{BOOKING_FEE} seat fee = ₹
            {invitation.restaurant.mealPrice + BOOKING_FEE} per person.
          </p>
          <div className="inline-note">
            This saves a sample seat on your device. No money is collected, no real restaurant is
            booked, and no notifications are sent. Live booking requires verification and connected
            services.
          </div>
          <div className="flow-actions">
            <Button variant="text" onClick={() => setDialog(null)}>
              A little more time
            </Button>
            <Button
              onClick={() => {
                setState((s) => ({
                  ...s,
                  invitation: s.invitation ? { ...s.invitation, status: 'reserved' } : null,
                }))
                setDialog(null)
                announce('Sample seat saved. No payment or restaurant booking was made.')
              }}
            >
              Confirm sample seat
              <Check size={16} />
            </Button>
          </div>
        </Modal>
      )}
      {dialog === 'report' && (
        <SafetyNote
          onClose={() => setDialog(null)}
          onSave={(category, note) => {
            setState((s) => ({
              ...s,
              reports: [
                { id: crypto.randomUUID(), category, note, date: new Date().toISOString() },
                ...s.reports,
              ],
            }))
            setDialog(null)
            announce('Note saved privately on this device. It has not been submitted or sent.')
          }}
        />
      )}
    </div>
  )
}

function Brand({ onClick }: { onClick: () => void }) {
  return (
    <button className="brand" onClick={onClick} aria-label="Table for One home">
      <span className="brand-mark">
        <Utensils size={22} strokeWidth={1.35} />
      </span>
      <span>
        table for one<span className="brand-period">.</span>
        <small>but not alone.</small>
      </span>
    </button>
  )
}
function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="page-header">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  )
}
function DemoNote() {
  return (
    <div className="demo-note">
      <Info size={17} />
      <p>
        <strong>A little preview of what’s possible.</strong> Sample tables use fictional people and
        venues. Nothing is booked or charged.
      </p>
    </div>
  )
}
function SafetyNote({
  onClose,
  onSave,
}: {
  onClose: () => void
  onSave: (category: string, note: string) => void
}) {
  const [category, setCategory] = useState('Personal comfort')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  function submit(e: FormEvent) {
    e.preventDefault()
    if (!note.trim()) {
      setError('Add a note before saving.')
      return
    }
    onSave(category, note.trim())
  }
  return (
    <Modal title="A private note, just for you." onClose={onClose}>
      <div className="inline-note warning">
        Not a support report. No one monitors this note. If there is immediate danger, call 112 or
        ask venue staff for help.
      </div>
      <form onSubmit={submit}>
        <label className="field-label" htmlFor="safety-category">
          What is this about?
        </label>
        <select id="safety-category" value={category} onChange={(e) => setCategory(e.target.value)}>
          {[
            'Personal comfort',
            'Unwanted contact',
            'Food or allergy concern',
            'Something else',
          ].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <label className="field-label" htmlFor="safety-note">
          What would you like to record?
        </label>
        <textarea
          id="safety-note"
          maxLength={1000}
          rows={5}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Avoid sensitive identity details. This is stored only in your browser."
        />
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <div className="flow-actions">
          <Button variant="text" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Save locally
            <Check size={16} />
          </Button>
        </div>
      </form>
    </Modal>
  )
}
