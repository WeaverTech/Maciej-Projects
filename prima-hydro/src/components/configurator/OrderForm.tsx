import { useState } from 'react'
import type { FormEvent } from 'react'
import { Send } from 'lucide-react'
import type { Customer } from '../../store/orderStore'

interface OrderFormProps {
  onSubmit: (customer: Customer) => void
}

interface FieldErrors {
  firstName?: string
  lastName?: string
  phone?: string
  nip?: string
}

function validate(values: Customer): FieldErrors {
  const errors: FieldErrors = {}
  if (!values.firstName.trim()) errors.firstName = 'Podaj imię'
  if (!values.lastName.trim()) errors.lastName = 'Podaj nazwisko'
  const phoneDigits = values.phone.replace(/[\s\-+]/g, '')
  if (!/^\d{9,11}$/.test(phoneDigits)) errors.phone = 'Podaj poprawny numer telefonu'
  if (values.nip && !/^\d{10}$/.test(values.nip.replace(/[\s-]/g, ''))) {
    errors.nip = 'NIP musi mieć 10 cyfr'
  }
  return errors
}

const inputClass = (hasError: boolean) =>
  `w-full border bg-steel-950 px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-steel-600 focus:border-brand-500 ${
    hasError ? 'border-red-500' : 'border-steel-600'
  }`

export default function OrderForm({ onSubmit }: OrderFormProps) {
  const [values, setValues] = useState<Customer>({
    firstName: '',
    lastName: '',
    phone: '',
    nip: '',
  })
  const [errors, setErrors] = useState<FieldErrors>({})

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) {
      onSubmit({ ...values, nip: values.nip?.trim() || undefined })
    }
  }

  const set = (field: keyof Customer) => (value: string) =>
    setValues((prev) => ({ ...prev, [field]: value }))

  return (
    <form onSubmit={handleSubmit} noValidate className="border border-steel-700 bg-steel-900 p-5">
      <h3 className="mb-1 text-sm font-bold uppercase tracking-widest text-white">
        Dane do zamówienia
      </h3>
      <p className="mb-5 text-xs text-steel-500">
        Oddzwonimy w celu potwierdzenia specyfikacji i terminu odbioru.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="of-firstname" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-steel-400">
            Imię *
          </label>
          <input
            id="of-firstname"
            type="text"
            autoComplete="given-name"
            placeholder="Jan"
            value={values.firstName}
            onChange={(e) => set('firstName')(e.target.value)}
            className={inputClass(!!errors.firstName)}
          />
          {errors.firstName && <p className="mt-1 text-xs text-red-400">{errors.firstName}</p>}
        </div>

        <div>
          <label htmlFor="of-lastname" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-steel-400">
            Nazwisko *
          </label>
          <input
            id="of-lastname"
            type="text"
            autoComplete="family-name"
            placeholder="Kowalski"
            value={values.lastName}
            onChange={(e) => set('lastName')(e.target.value)}
            className={inputClass(!!errors.lastName)}
          />
          {errors.lastName && <p className="mt-1 text-xs text-red-400">{errors.lastName}</p>}
        </div>

        <div>
          <label htmlFor="of-phone" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-steel-400">
            Telefon *
          </label>
          <input
            id="of-phone"
            type="tel"
            autoComplete="tel"
            placeholder="601 234 567"
            value={values.phone}
            onChange={(e) => set('phone')(e.target.value)}
            className={inputClass(!!errors.phone)}
          />
          {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="of-nip" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-steel-400">
            NIP <span className="normal-case text-steel-600">(opcjonalnie, do faktury)</span>
          </label>
          <input
            id="of-nip"
            type="text"
            inputMode="numeric"
            placeholder="6222334455"
            value={values.nip}
            onChange={(e) => set('nip')(e.target.value)}
            className={inputClass(!!errors.nip)}
          />
          {errors.nip && <p className="mt-1 text-xs text-red-400">{errors.nip}</p>}
        </div>
      </div>

      <button
        type="submit"
        className="mt-6 flex w-full items-center justify-center gap-2 bg-brand-500 px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-steel-950 transition-colors hover:bg-brand-400"
      >
        <Send className="h-4 w-4" />
        Wyślij zamówienie
      </button>
      <p className="mt-3 text-center text-[11px] text-steel-600">
        Wysłanie zamówienia nie zobowiązuje do zakupu – potwierdzimy je telefonicznie.
      </p>
    </form>
  )
}
