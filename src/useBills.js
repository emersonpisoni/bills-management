import { useEffect, useState } from 'react'

const STORAGE_KEY = 'bills-management:v1'

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}
  } catch {
    return {}
  }
}

// Formato salvo: { "2026-10": [{ id, name, amount, dueDay, paid }] }
export function useBills() {
  const [data, setData] = useState(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  const updateMonth = (month, fn) =>
    setData((prev) => ({ ...prev, [month]: fn(prev[month] ?? []) }))

  return {
    getBills: (month) => data[month] ?? [],
    // Adiciona a mesma conta em um ou mais meses
    addBill: (months, bill) =>
      setData((prev) => {
        const next = { ...prev }
        for (const month of months) {
          next[month] = [
            ...(next[month] ?? []),
            { id: crypto.randomUUID(), paid: false, ...bill },
          ]
        }
        return next
      }),
    togglePaid: (month, id) =>
      updateMonth(month, (bills) =>
        bills.map((b) => (b.id === id ? { ...b, paid: !b.paid } : b)),
      ),
    removeBill: (month, id) =>
      updateMonth(month, (bills) => bills.filter((b) => b.id !== id)),
    // Copia as contas de um mês para outro, todas como não pagas
    copyBills: (from, to) =>
      updateMonth(to, (bills) => [
        ...bills,
        ...(data[from] ?? []).map((b) => ({
          ...b,
          id: crypto.randomUUID(),
          paid: false,
        })),
      ]),
  }
}
