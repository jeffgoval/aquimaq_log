import { useMemo, useState } from 'react'
import dayjs from '@/shared/lib/dayjs'
import { ChevronLeft, ChevronRight, Plus, CalendarDays, List } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { TZ_APP } from '@/app/config/constants'
import { getActionsByResourceType } from '../constants/resource-actions'

interface Booking {
  id: string
  start_date: string
  end_date: string
  status: string
  client: { name: string } | null
  resource: { name: string; type: string } | null
}

interface BookingCalendarProps {
  bookings: Booking[]
  currentDate: dayjs.Dayjs
  onDateChange: (date: dayjs.Dayjs) => void
  onNewBooking?: (date: dayjs.Dayjs) => void
  onBookingClick?: (bookingId: string) => void
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  converted: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  completed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  cancelled: 'bg-red-500/10 text-red-600 border-red-500/20',
}

const STATUS_DOT: Record<string, string> = {
  pending: 'bg-amber-500',
  converted: 'bg-blue-500',
  completed: 'bg-emerald-500',
  cancelled: 'bg-red-500',
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendente',
  converted: 'Iniciado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

// Agenda view for mobile — lists all bookings in the current month sorted by date
function AgendaView({ bookings, currentDate, onNewBooking, onBookingClick }: Omit<BookingCalendarProps, 'onDateChange'>) {
  const todayStr = dayjs().tz(TZ_APP).format('YYYY-MM-DD')
  const startOfMonth = currentDate.startOf('month')
  const endOfMonth = currentDate.endOf('month')

  const daysWithBookings = useMemo(() => {
    const map = new Map<string, Booking[]>()
    let d = startOfMonth
    while (d.isBefore(endOfMonth) || d.isSame(endOfMonth, 'day')) {
      const key = d.format('YYYY-MM-DD')
      const dayBookings = bookings.filter(b => {
        const start = dayjs(b.start_date).tz(TZ_APP).startOf('day')
        const end = dayjs(b.end_date).tz(TZ_APP).endOf('day')
        return d.isBetween(start, end, 'day', '[]')
      })
      if (dayBookings.length > 0 || d.format('YYYY-MM-DD') === todayStr) {
        map.set(key, dayBookings)
      }
      d = d.add(1, 'day')
    }
    return Array.from(map.entries()).map(([key, bks]) => ({ day: dayjs(key).tz(TZ_APP), bookings: bks }))
  }, [bookings, startOfMonth, endOfMonth, todayStr])

  if (daysWithBookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
        <CalendarDays className="w-10 h-10 opacity-30" />
        <p className="text-sm">Nenhuma reserva este mês.</p>
        {onNewBooking && (
          <button
            onClick={() => onNewBooking(dayjs().tz(TZ_APP))}
            className="flex items-center gap-2 mt-1 text-sm font-medium text-primary hover:underline"
          >
            <Plus className="w-4 h-4" /> Nova reserva
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-border overflow-y-auto">
      {daysWithBookings.map(({ day, bookings: dayBks }) => {
        const isToday = day.format('YYYY-MM-DD') === todayStr
        return (
          <div key={day.format('YYYY-MM-DD')} className="flex gap-3 px-4 py-3">
            <div className="flex flex-col items-center min-w-[40px]">
              <span className={cn(
                'text-[11px] font-semibold uppercase tracking-wide',
                isToday ? 'text-primary' : 'text-muted-foreground'
              )}>
                {day.format('ddd')}
              </span>
              <span className={cn(
                'w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold mt-0.5',
                isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'
              )}>
                {day.format('D')}
              </span>
              {onNewBooking && (
                <button
                  onClick={() => onNewBooking(day)}
                  className="mt-1.5 p-1 rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors active:scale-95"
                  aria-label={`Nova reserva em ${day.format('DD/MM')}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex-1 flex flex-col gap-2 pt-0.5">
              {dayBks.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-1">Hoje — sem reservas</p>
              ) : dayBks.map(b => (
                <div
                  key={b.id}
                  className={cn(
                    'flex items-start gap-2 rounded-lg border p-2.5',
                    onBookingClick && 'cursor-pointer active:scale-[0.98] transition-transform',
                    STATUS_COLORS[b.status] || 'bg-secondary text-secondary-foreground'
                  )}
                  onClick={() => onBookingClick?.(b.id)}
                >
                  <span className={cn('mt-1 w-2 h-2 rounded-full flex-shrink-0', STATUS_DOT[b.status] || 'bg-muted')} />
                  <div className="min-w-0">
                    <div className="font-semibold text-sm leading-tight truncate">{b.resource?.name}</div>
                    <div className="text-xs opacity-80 truncate">{b.client?.name}</div>
                    <div className="text-[10px] opacity-60 mt-0.5">
                      {dayjs(b.start_date).tz(TZ_APP).format('HH:mm')} – {dayjs(b.end_date).tz(TZ_APP).format('HH:mm')} · {STATUS_LABEL[b.status] ?? b.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function BookingCalendar({ bookings, currentDate, onDateChange, onNewBooking, onBookingClick }: BookingCalendarProps) {
  const [mobileView, setMobileView] = useState<'grid' | 'agenda'>('agenda')

  const startOfMonth = currentDate.startOf('month')
  const endOfMonth = currentDate.endOf('month')
  const startDate = startOfMonth.startOf('week')
  const endDate = endOfMonth.endOf('week')

  const days = useMemo(() => {
    let date = startDate
    const d = []
    while (date.isBefore(endDate) || date.isSame(endDate, 'day')) {
      d.push(date)
      date = date.add(1, 'day')
    }
    return d
  }, [startDate, endDate])

  const nextMonth = () => onDateChange(currentDate.add(1, 'month'))
  const prevMonth = () => onDateChange(currentDate.subtract(1, 'month'))
  const today = () => onDateChange(dayjs().tz(TZ_APP))

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 sm:p-4 border-b border-border bg-muted/20 gap-2">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <h2 className="text-base sm:text-lg font-semibold capitalize text-foreground truncate">
            {currentDate.format('MMMM YYYY')}
          </h2>
          <button
            onClick={today}
            className="text-xs font-medium px-2.5 py-1 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors whitespace-nowrap"
          >
            Hoje
          </button>
        </div>
        <div className="flex items-center gap-1">
          {/* Mobile view toggle */}
          <div className="flex sm:hidden items-center rounded-md border border-border overflow-hidden mr-1">
            <button
              onClick={() => setMobileView('agenda')}
              className={cn('p-1.5 transition-colors', mobileView === 'agenda' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}
              aria-label="Vista agenda"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileView('grid')}
              className={cn('p-1.5 transition-colors', mobileView === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}
              aria-label="Vista calendário"
            >
              <CalendarDays className="w-4 h-4" />
            </button>
          </div>
          <button onClick={prevMonth} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={nextMonth} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile agenda view */}
      <div className={cn('flex-1 overflow-y-auto sm:hidden', mobileView !== 'agenda' && 'hidden')}>
        <AgendaView
          bookings={bookings}
          currentDate={currentDate}
          onNewBooking={onNewBooking}
          onBookingClick={onBookingClick}
        />
      </div>

      {/* Grid view — always visible on desktop, togglable on mobile */}
      <div className={cn('flex flex-col flex-1 min-h-0', 'hidden sm:flex', mobileView === 'grid' && '!flex')}>
        <div className="grid grid-cols-7 border-b border-border bg-muted/40">
          {(['D', 'S', 'T', 'Q', 'Q', 'S', 'S'] as const).map((d, i) => (
            <div key={i} className="py-2 text-center text-[11px] font-semibold text-muted-foreground sm:hidden">
              {d}
            </div>
          ))}
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
            <div key={d} className="p-3 text-center text-xs font-semibold text-muted-foreground hidden sm:block">
              {d}
            </div>
          ))}
        </div>

        <div className="flex-1 grid grid-cols-7 auto-rows-fr">
          {days.map((day, i) => {
            const isCurrentMonth = day.isSame(currentDate, 'month')
            const isToday = day.isSame(dayjs().tz(TZ_APP), 'day')

            const dayBookings = bookings.filter(b => {
              const start = dayjs(b.start_date).tz(TZ_APP).startOf('day')
              const end = dayjs(b.end_date).tz(TZ_APP).endOf('day')
              return day.isBetween(start, end, 'day', '[]')
            })

            return (
              <div
                key={day.format('YYYY-MM-DD')}
                className={cn(
                  'min-h-[80px] sm:min-h-[110px] p-1 sm:p-2 border-r border-b border-border relative group transition-colors',
                  !isCurrentMonth && 'bg-muted/10 opacity-50',
                  i % 7 === 6 && 'border-r-0'
                )}
              >
                <div className="flex justify-between items-start mb-1 sm:mb-2">
                  <span className={cn(
                    'text-xs sm:text-sm font-medium w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full',
                    isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'
                  )}>
                    {day.format('D')}
                  </span>

                  {onNewBooking && (
                    <button
                      onClick={() => onNewBooking(day)}
                      className="p-0.5 sm:p-1 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded transition-all sm:opacity-0 sm:group-hover:opacity-100 active:scale-95"
                      aria-label={`Nova reserva ${day.format('DD/MM')}`}
                    >
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-1 overflow-y-auto max-h-[55px] sm:max-h-[75px]">
                  {dayBookings.slice(0, 3).map(b => (
                    (() => {
                      const actions = getActionsByResourceType(b.resource?.type)
                      const flowHint = actions.requiresOperatorOnPickup ? 'Retirada com operador' : 'Retirada sem operador'
                      return (
                        <div
                          key={b.id}
                          className={cn(
                            'text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 sm:py-1 rounded border leading-tight',
                            onBookingClick && 'cursor-pointer hover:ring-1 hover:ring-primary/40 active:scale-[0.97] transition-all',
                            STATUS_COLORS[b.status] || 'bg-secondary text-secondary-foreground'
                          )}
                          title={`${b.resource?.name} - ${b.client?.name} • ${flowHint}`}
                          onClick={() => onBookingClick?.(b.id)}
                        >
                          <div className="font-semibold truncate">{b.resource?.name}</div>
                          <div className="truncate opacity-75 hidden sm:block">{b.client?.name}</div>
                        </div>
                      )
                    })()
                  ))}
                  {dayBookings.length > 3 && (
                    <div className="text-[9px] text-muted-foreground px-1">+{dayBookings.length - 3}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
