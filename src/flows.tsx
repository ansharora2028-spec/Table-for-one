import { useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Heart,
  Leaf,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react'
import {
  AREAS,
  CUISINES,
  DIETS,
  GENDERS,
  INTERESTS,
  STYLES,
  WINDOWS,
  profileFromAnswers,
  validatePreferences,
  type Gender,
  type Interest,
  type Invitation,
  type Preferences,
  type Profile,
  type Reflection,
  type Style,
} from './domain'
import { Button, Chip, IconLabel, Modal, Pill } from './components'

export function Onboarding({
  profile,
  onClose,
  onComplete,
}: {
  profile: Profile | null
  onClose: () => void
  onComplete: (profile: Profile) => void
}) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState(profile?.name ?? '')
  const [interests, setInterests] = useState<Interest[]>(profile?.interests ?? [])
  const [style, setStyle] = useState<Style>(profile?.style ?? 'A little of both')
  const [gender, setGender] = useState<Gender>(profile?.gender ?? 'Prefer not to say')
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState('')
  const prompts = [
    'First things first. What should we call you?',
    'What could you talk about for hours?',
    "And at a dinner table, you're usually…",
    'One last thing, for your comfort.',
    'This sounds like the start of something good.',
  ]
  function next(e: FormEvent) {
    e.preventDefault()
    if (step === 0 && !name.trim()) {
      setError('Tell us your first name to continue.')
      return
    }
    if (step === 1 && interests.length < 2) {
      setError('Choose at least two things you love.')
      return
    }
    if (step === 4) {
      if (!consent) {
        setError('Please confirm you are 18 or older and agree to local storage.')
        return
      }
      onComplete(profileFromAnswers(name, interests, style, gender))
      return
    }
    setError('')
    setStep(step + 1)
  }
  return (
    <Modal title={profile ? 'A little more you.' : 'Hello, future regular.'} onClose={onClose}>
      <div
        className="flow-progress"
        role="progressbar"
        aria-label="Onboarding progress"
        aria-valuenow={step + 1}
        aria-valuemin={1}
        aria-valuemax={5}
      >
        {[0, 1, 2, 3, 4].map((n) => (
          <span key={n} className={n <= step ? 'active' : ''} />
        ))}
      </div>
      <p className="helper-note">
        <Sparkles size={15} /> Guided onboarding · no live AI is connected
      </p>
      <div className="chat-prompt">
        <span className="host-avatar">
          <Sparkles size={20} />
        </span>
        <div>
          <span className="eyebrow">YOUR TABLE HOST</span>
          <p aria-live="polite">{prompts[step]}</p>
        </div>
      </div>
      <form onSubmit={next}>
        <div className="flow-content" key={step}>
          {step === 0 && (
            <>
              <label className="field-label" htmlFor="first-name">
                Your first name
              </label>
              <input
                autoFocus
                id="first-name"
                autoComplete="given-name"
                maxLength={40}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="A name to save your seat under"
              />
              <p className="field-hint">
                Just your first name. We can skip the formal introductions.
              </p>
            </>
          )}
          {step === 1 && (
            <>
              <p className="field-hint">
                Pick at least two. There are no impressive answers, only yours.
              </p>
              <div className="chips">
                {INTERESTS.map((i) => (
                  <Chip
                    key={i}
                    selected={interests.includes(i)}
                    onClick={() =>
                      setInterests(
                        interests.includes(i)
                          ? interests.filter((v) => v !== i)
                          : [...interests, i],
                      )
                    }
                  >
                    {i}
                  </Chip>
                ))}
              </div>
            </>
          )}
          {step === 2 && (
            <div className="option-stack">
              {STYLES.map((s, i) => (
                <label className={`option-card ${style === s ? 'chosen' : ''}`} key={s}>
                  <input
                    type="radio"
                    name="style"
                    value={s}
                    checked={style === s}
                    onChange={() => setStyle(s)}
                  />
                  <div>
                    <strong>{s}</strong>
                    <span>
                      {
                        [
                          'Taking it all in, then asking the good questions.',
                          'Happy to share a story and make room for another.',
                          'A story for every occasion. An audience is optional.',
                        ][i]
                      }
                    </span>
                  </div>
                </label>
              ))}
            </div>
          )}
          {step === 3 && (
            <>
              <p className="field-hint">
                Gender is optional. Selecting “Woman” makes women-only tables available. It is never
                inferred from your name or interests.
              </p>
              <div className="option-stack">
                {GENDERS.map((g) => (
                  <label className={`option-card compact ${gender === g ? 'chosen' : ''}`} key={g}>
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={gender === g}
                      onChange={() => setGender(g)}
                    />
                    <strong>{g}</strong>
                  </label>
                ))}
              </div>
            </>
          )}
          {step === 4 && (
            <>
              <div className="profile-preview">
                <div className="avatar sage large">{name.trim().slice(0, 1).toUpperCase()}</div>
                <h3>{name.trim()}</h3>
                <p>{style}</p>
                <div className="chips centered">
                  {interests.map((i) => (
                    <Pill key={i}>{i}</Pill>
                  ))}
                </div>
              </div>
              <label className="consent">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <span>
                  I’m 18 or older. I agree to keep this profile on this browser for the local demo.
                  I can edit or delete it anytime.
                </span>
              </label>
              <p className="field-hint">
                No chat transcript, phone number, or identity document is collected. Updating a
                profile clears any existing sample invitation.
              </p>
            </>
          )}
        </div>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <div className="flow-actions">
          {step > 0 ? (
            <Button
              variant="text"
              onClick={() => {
                setStep(step - 1)
                setError('')
              }}
            >
              <ArrowLeft size={16} />
              Back
            </Button>
          ) : (
            <span>About 2 minutes. All you.</span>
          )}
          <Button type="submit">
            {step === 4 ? 'That’s me' : 'Continue'}
            <ArrowRight size={16} />
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export function PreferencesForm({
  initial,
  profile,
  onSave,
  hasInvitation,
}: {
  initial: Preferences
  profile: Profile
  onSave: (p: Preferences) => void
  hasInvitation: boolean
}) {
  const [p, setP] = useState<Preferences>(initial)
  const [error, setError] = useState('')
  function toggle<T extends string>(key: 'areas' | 'windows' | 'cuisines', value: T) {
    setP((previous) => {
      const selected = previous[key] as string[]
      return {
        ...previous,
        [key]: selected.includes(value)
          ? selected.filter((v) => v !== value)
          : [...selected, value],
      }
    })
  }
  function submit(e: FormEvent) {
    e.preventDefault()
    const error = validatePreferences(p, profile)
    if (error) {
      setError(error)
      return
    }
    onSave(p)
  }
  return (
    <form className="preferences-form" onSubmit={submit}>
      <div className="form-section">
        <div className="form-section-heading">
          <span className="number">01</span>
          <div>
            <h3>Somewhere close to you</h3>
            <p>Good company shouldn’t come with a long commute.</p>
          </div>
        </div>
        <fieldset>
          <legend className="sr-only">Preferred areas</legend>
          <div className="chips">
            {AREAS.map((a) => (
              <Chip key={a} selected={p.areas.includes(a)} onClick={() => toggle('areas', a)}>
                <MapPin size={15} />
                {a}
              </Chip>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="form-section">
        <div className="form-section-heading">
          <span className="number">02</span>
          <div>
            <h3>When you have a little time</h3>
            <p>Recurring weekly windows, in India Standard Time.</p>
          </div>
        </div>
        <fieldset>
          <legend className="sr-only">Free times</legend>
          <div className="chips">
            {WINDOWS.map((w) => (
              <Chip key={w} selected={p.windows.includes(w)} onClick={() => toggle('windows', w)}>
                {w}
                <small>{w.endsWith('lunch') ? '1:00 pm' : '7:30 pm'}</small>
              </Chip>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="form-section">
        <div className="form-section-heading">
          <span className="number">03</span>
          <div>
            <h3>What’s on the menu?</h3>
            <p>We’ll only suggest a table that works for your diet.</p>
          </div>
        </div>
        <fieldset>
          <legend className="field-label">Cuisines you enjoy</legend>
          <div className="chips">
            {CUISINES.map((c) => (
              <Chip key={c} selected={p.cuisines.includes(c)} onClick={() => toggle('cuisines', c)}>
                {c}
              </Chip>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="field-label">Dietary preference</legend>
          <div className="chips">
            {DIETS.map((d) => (
              <Chip key={d} selected={p.diet === d} onClick={() => setP({ ...p, diet: d })}>
                <Leaf size={14} />
                {d}
              </Chip>
            ))}
          </div>
        </fieldset>
        <div className="inline-note">
          Severe allergies need direct confirmation with the venue. This demo cannot confirm food
          preparation or cross-contamination controls.
        </div>
      </div>
      <div className="form-section">
        <div className="form-section-heading">
          <span className="number">04</span>
          <div>
            <h3>Comfort, on your terms</h3>
            <p>A good evening starts with feeling at ease.</p>
          </div>
        </div>
        <label className="field-label" htmlFor="budget">
          Meal budget per person{' '}
          <strong className="budget-value">₹{p.budget.toLocaleString('en-IN')}</strong>
        </label>
        <input
          id="budget"
          type="range"
          min="500"
          max="2000"
          step="50"
          value={p.budget}
          onChange={(e) => setP({ ...p, budget: Number(e.target.value) })}
        />
        <div className="range-labels">
          <span>₹500</span>
          <span>₹2,000</span>
        </div>
        <p className="field-hint">
          Food estimate only. A ₹199 per-seat booking fee would be additional in the live service.
          No charges in this demo.
        </p>
        <fieldset>
          <legend className="field-label">Your kind of table</legend>
          <div className="chips">
            {(['Mixed table', 'Women-only table'] as const).map((t) => (
              <Chip
                key={t}
                selected={p.tableType === t}
                onClick={() => setP({ ...p, tableType: t })}
              >
                {t === 'Women-only table' && <ShieldCheck size={14} />}
                {t}
              </Chip>
            ))}
          </div>
        </fieldset>
        {profile.gender !== 'Woman' && (
          <p className="field-hint">
            Women-only tables require “Woman” in your profile. Verification will be required before
            real invitations.
          </p>
        )}
      </div>
      {hasInvitation && (
        <div className="inline-note warning">
          Saving new preferences will release your sample table so the next match respects your
          choices.
        </div>
      )}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <div className="form-footer">
        <IconLabel icon={CheckCircle2}>You can change these anytime.</IconLabel>
        <Button type="submit">
          Save my preferences
          <Check size={17} />
        </Button>
      </div>
    </form>
  )
}

export function ReflectionForm({
  invitation,
  onClose,
  onSave,
}: {
  invitation: Invitation
  onClose: () => void
  onSave: (r: Reflection) => void
}) {
  const [rating, setRating] = useState(0)
  const [note, setNote] = useState('')
  const [regulars, setRegulars] = useState<string[]>([])
  const [error, setError] = useState('')
  function submit(e: FormEvent) {
    e.preventDefault()
    if (!rating) {
      setError('Choose a rating from 1 to 5.')
      return
    }
    onSave({
      id: crypto.randomUUID(),
      restaurant: invitation.restaurant.name,
      date: new Date().toISOString(),
      rating,
      note: note.trim(),
      regulars,
    })
  }
  return (
    <Modal title="How did the table feel?" onClose={onClose}>
      <Pill tone="sand">Sample reflection · no real meal has occurred</Pill>
      <form onSubmit={submit}>
        <p className="body-copy">
          Some tables feel like a good beginning. Your feedback helps us understand what made it
          click.
        </p>
        <fieldset>
          <legend className="field-label">Your table rating</legend>
          <div className="rating-group">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`${n} ${n === 1 ? 'star' : 'stars'}`}
                aria-pressed={rating === n}
                className={`star ${rating >= n ? 'filled' : ''}`}
                onClick={() => {
                  setRating(n)
                  setError('')
                }}
              >
                <Star size={32} />
              </button>
            ))}
          </div>
        </fieldset>
        <label className="field-label" htmlFor="reflection-note">
          Anything you’d like to remember? <span className="optional">Optional</span>
        </label>
        <textarea
          id="reflection-note"
          maxLength={500}
          rows={3}
          placeholder="The conversation, the food, a little moment…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <fieldset>
          <legend className="field-label">Who would you eat with again?</legend>
          <div className="chips">
            {invitation.guests.map((g) => (
              <Chip
                key={g.id}
                selected={regulars.includes(g.id)}
                onClick={() =>
                  setRegulars(
                    regulars.includes(g.id)
                      ? regulars.filter((id) => id !== g.id)
                      : [...regulars, g.id],
                  )
                }
              >
                <Heart size={14} />
                {g.name}
              </Chip>
            ))}
          </div>
        </fieldset>
        <p className="field-hint">
          Saved privately on this device. No invitations or messages are sent.
        </p>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="flow-actions">
          <Button variant="text" onClick={onClose}>
            Maybe later
          </Button>
          <Button type="submit">
            Save reflection
            <Check size={16} />
          </Button>
        </div>
      </form>
    </Modal>
  )
}
