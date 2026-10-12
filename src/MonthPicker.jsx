import { useRef, useState } from 'react'
import { useDismiss } from './useDismiss'

const MONTHS = Array.from({ length: 12 }, (_, i) =>
  new Date(2000, i, 1).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
)

const pad = (n) => String(n).padStart(2, '0')

// Seletor de mês: abre um calendário com os 12 meses do ano
export default function MonthPicker({ value, currentMonth, label, onChange, getBills }) {
  const [open, setOpen] = useState(false)
  const [year, setYear] = useState(() => Number(value.slice(0, 4)))
  const ref = useRef(null)

  useDismiss(ref, open, () => setOpen(false))

  const toggle = () => {
    setYear(Number(value.slice(0, 4)))
    setOpen(!open)
  }

  const select = (key) => {
    onChange(key)
    setOpen(false)
  }

  return (
    <div className="month-picker" ref={ref}>
      <button className="month-picker-trigger" onClick={toggle} aria-expanded={open}>
        {label} <span className="caret">▾</span>
      </button>

      {open && (
        <div className="month-picker-popover">
          <div className="month-picker-year">
            <button onClick={() => setYear(year - 1)} aria-label="Ano anterior">
              ‹
            </button>
            <strong>{year}</strong>
            <button onClick={() => setYear(year + 1)} aria-label="Próximo ano">
              ›
            </button>
          </div>

          <div className="month-picker-grid">
            {MONTHS.map((name, i) => {
              const key = `${year}-${pad(i + 1)}`
              const bills = getBills(key)
              const pending = bills.some((b) => !b.paid)
              const classes = [
                key === value && 'is-selected',
                key === currentMonth && 'is-current',
              ]
                .filter(Boolean)
                .join(' ')

              return (
                <button key={key} className={classes} onClick={() => select(key)}>
                  {name}
                  {bills.length > 0 && (
                    <span
                      className={`dot ${pending ? 'dot-pending' : 'dot-done'}`}
                      title={pending ? 'Contas pendentes' : 'Tudo pago'}
                    />
                  )}
                </button>
              )
            })}
          </div>

          <div className="month-picker-legend">
            <span><span className="dot dot-pending" /> pendente</span>
            <span><span className="dot dot-done" /> tudo pago</span>
          </div>
        </div>
      )}
    </div>
  )
}
