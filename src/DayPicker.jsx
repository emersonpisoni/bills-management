import { useRef, useState } from 'react'
import { useDismiss } from './useDismiss'

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

// Seletor do dia de vencimento: mostra o calendário do mês selecionado
export default function DayPicker({ month, value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useDismiss(ref, open, () => setOpen(false))

  const [year, monthIndex] = month.split('-').map(Number)
  const firstWeekday = new Date(year, monthIndex - 1, 1).getDay()
  const daysInMonth = new Date(year, monthIndex, 0).getDate()
  const today = new Date()
  const todayDay =
    today.getFullYear() === year && today.getMonth() === monthIndex - 1
      ? today.getDate()
      : null

  const select = (day) => {
    onChange(day)
    setOpen(false)
  }

  return (
    <div className="day-picker" ref={ref}>
      <button
        type="button"
        className={`day-picker-trigger ${value ? '' : 'is-empty'}`}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {value ? `Dia ${value}` : 'Vencimento'}
      </button>

      {open && (
        <div className="day-picker-popover">
          <div className="day-picker-grid">
            {WEEKDAYS.map((d, i) => (
              <span key={i} className="weekday">
                {d}
              </span>
            ))}
            {Array.from({ length: firstWeekday }, (_, i) => (
              <span key={`blank-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1
              const classes = [
                String(day) === String(value) && 'is-selected',
                day === todayDay && 'is-current',
              ]
                .filter(Boolean)
                .join(' ')
              return (
                <button
                  type="button"
                  key={day}
                  className={classes}
                  onClick={() => select(String(day))}
                >
                  {day}
                </button>
              )
            })}
          </div>
          {value && (
            <button type="button" className="link" onClick={() => select('')}>
              Sem vencimento
            </button>
          )}
        </div>
      )}
    </div>
  )
}
