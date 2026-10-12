import { useState } from 'react'
import { useBills } from './useBills'
import MonthPicker from './MonthPicker'
import DayPicker from './DayPicker'

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const toKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

const fromKey = (key) => {
  const [year, month] = key.split('-').map(Number)
  return new Date(year, month - 1, 1)
}

const shiftMonth = (key, delta) => {
  const date = fromKey(key)
  date.setMonth(date.getMonth() + delta)
  return toKey(date)
}

const monthLabel = (key) =>
  fromKey(key).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

const shortMonthLabel = (key) =>
  fromKey(key)
    .toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
    .replace('.', '')
    .replace(' de ', '/')

const REPEAT_OPTIONS = [
  { value: '1', label: 'Só este mês' },
  { value: '2', label: 'Por 2 meses' },
  { value: '3', label: 'Por 3 meses' },
  { value: '6', label: 'Por 6 meses' },
  { value: '12', label: 'Por 12 meses' },
  { value: 'year', label: 'Até dezembro' },
  { value: 'custom', label: 'Outro…' },
]

export default function App() {
  const [month, setMonth] = useState(() => toKey(new Date()))
  const { getBills, addBill, togglePaid, removeBill, copyBills } = useBills()

  const [name, setName] = useState('')
  // Valor em centavos, só dígitos (ex: "15090" = R$ 150,90)
  const [amount, setAmount] = useState('')
  const [dueDay, setDueDay] = useState('')
  const [repeat, setRepeat] = useState('1')
  const [customRepeat, setCustomRepeat] = useState('')

  const bills = [...getBills(month)].sort(
    (a, b) => a.paid - b.paid || (a.dueDay || 99) - (b.dueDay || 99),
  )
  const previousMonth = shiftMonth(month, -1)
  const previousBills = getBills(previousMonth)

  const total = bills.reduce((sum, b) => sum + b.amount, 0)
  const paid = bills.filter((b) => b.paid).reduce((sum, b) => sum + b.amount, 0)

  const today = new Date()
  const isCurrentMonth = month === toKey(today)
  const isPast = month < toKey(today)
  const isOverdue = (bill) =>
    !bill.paid && bill.dueDay && (isPast || (isCurrentMonth && bill.dueDay < today.getDate()))

  const repeatCount =
    repeat === 'year'
      ? 12 - fromKey(month).getMonth()
      : repeat === 'custom'
        ? Math.min(Math.max(Number(customRepeat) || 1, 1), 120)
        : Number(repeat)
  const repeatMonths = Array.from({ length: repeatCount }, (_, i) => shiftMonth(month, i))

  const handleSubmit = (e) => {
    e.preventDefault()
    const value = Number(amount) / 100
    if (!name.trim() || !value) return
    addBill(repeatMonths, {
      name: name.trim(),
      amount: value,
      dueDay: dueDay ? Number(dueDay) : null,
    })
    setName('')
    setAmount('')
    setDueDay('')
    setRepeat('1')
    setCustomRepeat('')
  }

  return (
    <main className="container">
      <h1>Minhas Contas</h1>

      <nav className="month-nav">
        <button onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Mês anterior">
          ‹
        </button>
        <MonthPicker
          value={month}
          currentMonth={toKey(today)}
          label={monthLabel(month)}
          onChange={setMonth}
          getBills={getBills}
        />
        <button onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Próximo mês">
          ›
        </button>
      </nav>
      {!isCurrentMonth && (
        <button className="link" onClick={() => setMonth(toKey(today))}>
          Voltar para o mês atual
        </button>
      )}

      <section className="summary">
        <div>
          <span>Total</span>
          <strong>{currency.format(total)}</strong>
        </div>
        <div className="paid">
          <span>Pago</span>
          <strong>{currency.format(paid)}</strong>
        </div>
        <div className="pending">
          <span>Falta pagar</span>
          <strong>{currency.format(total - paid)}</strong>
        </div>
      </section>

      <form className="add-form" onSubmit={handleSubmit}>
        <input
          placeholder="Nome da conta (ex: Luz)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          placeholder="R$ 0,00"
          inputMode="numeric"
          value={amount ? currency.format(Number(amount) / 100) : ''}
          onChange={(e) => setAmount(e.target.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 11))}
          required
        />
        <DayPicker month={month} value={dueDay} onChange={setDueDay} />
        <button type="submit">Adicionar</button>

        <div className="repeat">
          <label>
            Repetir:
            <select value={repeat} onChange={(e) => setRepeat(e.target.value)}>
              {REPEAT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          {repeat === 'custom' && (
            <label>
              <input
                type="number"
                min="1"
                max="120"
                value={customRepeat}
                onChange={(e) => setCustomRepeat(e.target.value)}
                placeholder="Qtd."
              />
              meses
            </label>
          )}
          {repeatCount > 1 && (
            <span className="repeat-hint">
              de {shortMonthLabel(month)} até {shortMonthLabel(repeatMonths.at(-1))}
            </span>
          )}
        </div>
      </form>

      {bills.length === 0 ? (
        <div className="empty">
          <p>Nenhuma conta neste mês.</p>
          {previousBills.length > 0 && (
            <button onClick={() => copyBills(previousMonth, month)}>
              Copiar {previousBills.length} conta(s) de {monthLabel(previousMonth)}
            </button>
          )}
        </div>
      ) : (
        <ul className="bills">
          {bills.map((bill) => (
            <li
              key={bill.id}
              className={`${bill.paid ? 'is-paid' : ''} ${isOverdue(bill) ? 'is-overdue' : ''}`}
            >
              <label>
                <input
                  type="checkbox"
                  checked={bill.paid}
                  onChange={() => togglePaid(month, bill.id)}
                />
                <span className="bill-name">{bill.name}</span>
              </label>
              <span className="bill-due">
                {bill.dueDay ? `dia ${bill.dueDay}` : ''}
                {isOverdue(bill) && ' · atrasada'}
              </span>
              <span className="bill-amount">{currency.format(bill.amount)}</span>
              <button
                className="remove"
                onClick={() => removeBill(month, bill.id)}
                aria-label={`Remover ${bill.name}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
