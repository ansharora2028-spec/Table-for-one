import { useEffect, useId, useRef, type ReactNode } from 'react'
import { ArrowUpRight, Check, Sparkles, X, type LucideIcon } from 'lucide-react'

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled,
  type = 'button',
  className = '',
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'text' | 'danger'
  disabled?: boolean
  type?: 'button' | 'submit'
  className?: string
}) {
  return (
    <button
      type={type}
      className={`button button-${variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
export function IconLabel({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <span className="icon-label">
      <Icon size={16} aria-hidden="true" />
      {children}
    </span>
  )
}
export function Pill({ children, tone = '' }: { children: ReactNode; tone?: string }) {
  return <span className={`pill ${tone}`}>{children}</span>
}
export function Chip({
  children,
  selected,
  onClick,
}: {
  children: ReactNode
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`chip ${selected ? 'selected' : ''}`}
    >
      {selected && <Check size={14} aria-hidden="true" />}
      {children}
    </button>
  )
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string
  children: ReactNode
  onClose: () => void
  wide?: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const dialog = ref.current
    const previous = document.activeElement as HTMLElement | null
    dialog?.showModal()
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      dialog?.close()
      document.body.style.overflow = oldOverflow
      previous?.focus()
    }
  }, [])
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
      className={`modal ${wide ? 'modal-wide' : ''}`}
    >
      <div className="modal-heading">
        <div>
          <span className="eyebrow">A LITTLE CLOSER TO YOUR PEOPLE</span>
          <h2 id={titleId}>{title}</h2>
        </div>
        <button className="icon-button" aria-label="Close dialog" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  )
}
export function EmptyState({
  icon: Icon = Sparkles,
  title,
  children,
  action,
}: {
  icon?: LucideIcon
  title: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon size={30} strokeWidth={1.4} />
      </span>
      <h2>{title}</h2>
      <p>{children}</p>
      {action}
    </div>
  )
}
export function SectionHeading({
  label,
  title,
  action,
}: {
  label?: string
  title: string
  action?: ReactNode
}) {
  return (
    <div className="section-heading">
      <div>
        {label && <span className="eyebrow">{label}</span>}
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  )
}
export function TextLink({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button className="text-link" onClick={onClick}>
      {children}
      <ArrowUpRight size={16} aria-hidden="true" />
    </button>
  )
}

export function TableArt({ small = false }: { small?: boolean }) {
  return (
    <svg
      className={`table-art ${small ? 'small' : ''}`}
      viewBox="0 0 560 440"
      role="img"
      aria-label="Four colourful place settings around a shared dining table, with one seat waiting for you"
    >
      <defs>
        <pattern id="grain" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r=".5" fill="#fff" opacity=".14" />
        </pattern>
        <filter id="shadow">
          <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#243b2e" floodOpacity=".12" />
        </filter>
      </defs>
      <ellipse cx="280" cy="228" rx="201" ry="172" fill="#36543e" opacity=".2" />
      <g stroke="#d3b896" strokeWidth="9" fill="#d3b896">
        <rect x="232" y="18" width="96" height="53" rx="23" transform="rotate(3 280 44)" />
        <rect x="233" y="369" width="96" height="53" rx="23" transform="rotate(-4 280 390)" />
        <rect x="48" y="167" width="50" height="103" rx="23" transform="rotate(-7 73 218)" />
        <rect x="465" y="167" width="50" height="103" rx="23" transform="rotate(5 490 218)" />
      </g>
      <ellipse cx="280" cy="220" rx="192" ry="161" fill="#f1e3c9" filter="url(#shadow)" />
      <ellipse cx="280" cy="220" rx="183" ry="152" fill="none" stroke="#e2cfad" strokeWidth="1.5" />
      <path
        d="M174 79q-4 139 4 289M384 81q10 140 0 287"
        stroke="#dfcba8"
        strokeWidth="1"
        opacity=".5"
      />
      <g transform="translate(280 118)">
        <rect x="-57" y="-40" width="114" height="79" rx="5" fill="#a6b39a" transform="rotate(5)" />
        <circle r="37" fill="#faf7ed" stroke="#d9d4bd" strokeWidth="2" />
        <circle r="27" fill="none" stroke="#ddd7be" />
        <path d="M-15 7q8-31 28-7q-10 24-28 7" fill="#a6b277" />
        <circle cx="8" cy="-5" r="7" fill="#ce7d54" />
        <circle cx="-5" cy="8" r="5" fill="#dc9f64" />
        <path
          d="M48-22v39m-3-40v9q3 6 6 0v-9"
          stroke="#8e8e71"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </g>
      <g transform="translate(169 225) rotate(-85)">
        <rect x="-57" y="-40" width="114" height="79" rx="5" fill="#c38365" transform="rotate(3)" />
        <circle r="37" fill="#faf7ed" stroke="#d9d4bd" strokeWidth="2" />
        <circle r="27" fill="none" stroke="#ddd7be" />
        <path d="M-16-6q16-13 31 8q-11 18-28 9" fill="#d4a36c" />
        <path d="M-9 1l20 5m-16-13l15 8" stroke="#8f9a61" strokeWidth="4" />
        <path
          d="M48-22v39m-3-40v9q3 6 6 0v-9"
          stroke="#8e8e71"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </g>
      <g transform="translate(391 225) rotate(85)">
        <rect
          x="-57"
          y="-40"
          width="114"
          height="79"
          rx="5"
          fill="#d3b66e"
          transform="rotate(-4)"
        />
        <circle r="37" fill="#faf7ed" stroke="#d9d4bd" strokeWidth="2" />
        <circle r="27" fill="none" stroke="#ddd7be" />
        <path d="M-17 4q3-26 24-19q19 11 5 27q-10 7-29-8" fill="#a9b27d" />
        <circle cx="-6" cy="-2" r="5" fill="#ca744c" />
        <circle cx="10" cy="5" r="5" fill="#ca744c" />
        <path
          d="M48-22v39m-3-40v9q3 6 6 0v-9"
          stroke="#8e8e71"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </g>
      <g transform="translate(280 323) rotate(180)">
        <rect
          x="-57"
          y="-40"
          width="114"
          height="79"
          rx="5"
          fill="#c5baa2"
          transform="rotate(-4)"
        />
        <circle r="37" fill="#faf7ed" stroke="#d9d4bd" strokeWidth="2" />
        <circle r="27" fill="none" stroke="#ddd7be" />
        <path
          d="M48-22v39m-3-40v9q3 6 6 0v-9"
          stroke="#8e8e71"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </g>
      <g transform="translate(280 220)">
        <ellipse rx="33" ry="24" fill="#9a6b4a" />
        <ellipse cy="-4" rx="30" ry="22" fill="#ecd1a5" />
        <path
          d="M-20-6q9-19 17 1m3-8q15-13 22 6m-38 14q11-9 19 2m1-8q17-10 18 4"
          stroke="#c58e50"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
      </g>
      <g fill="#e9e4c4" stroke="#acb09a" strokeWidth="1.2">
        <circle cx="218" cy="161" r="12" />
        <circle cx="346" cy="161" r="12" />
        <circle cx="218" cy="281" r="12" />
        <circle cx="346" cy="281" r="12" />
      </g>
      <path
        d="M313 196l8-21m-6 12q-18-15-3-20q14-5 8 10q14-11 20-2q0 12-20 10"
        fill="#6a8358"
        stroke="#6a8358"
        strokeWidth="2"
      />
      <ellipse cx="241" cy="223" rx="9" ry="14" fill="#f7f2db" />
      <ellipse cx="241" cy="220" rx="8" ry="10" fill="#cfb17b" />
      <path d="M241 208v-9" stroke="#ef9b59" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="280" cy="220" rx="192" ry="161" fill="url(#grain)" pointerEvents="none" />
      <g transform="translate(310 358) rotate(-8)">
        <rect x="-8" y="-16" width="125" height="36" rx="18" fill="#f8f6ed" />
        <text
          x="53"
          y="7"
          textAnchor="middle"
          fill="#435840"
          fontFamily="Georgia, serif"
          fontSize="17"
          fontStyle="italic"
        >
          your seat ♡
        </text>
      </g>
    </svg>
  )
}
