import { useMemo, useState } from 'react'
import dayjs from '@/shared/lib/dayjs'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
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

export function BookingCalendar({ bookings, currentDate, onDateChange, onNewBooking, onBookingClick }: BookingCalendarProps) {
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
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold capitalize text-foreground">
            {currentDate.format('MMMM YYYY')}
          </h2>
          <button onClick={today} className="text-xs font-medium px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors">
            Hoje
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={nextMonth} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-border bg-muted/40">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
          <div key={d} className="p-3 text-center text-xs font-semibold text-muted-foreground">
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
                "min-h-[120px] p-2 border-r border-b border-border relative group transition-colors",
                !isCurrentMonth && "bg-muted/10 opacity-50",
                i % 7 === 6 && "border-r-0"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={cn(
                  "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                  isToday ? "bg-primary text-primary-foreground" : "text-foreground"
                )}>
                  {day.format('D')}
                </span>
                
                {onNewBooking && (
                  <button 
                    onClick={() => onNewBooking(day)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[80px] custom-scrollbar">
                {dayBookings.map(b => (
                  (() => {
                    const actions = getActionsByResourceType(b.resource?.type)
                    const flowHint = actions.requiresOperatorOnPickup
                      ? 'Retirada com operador'
                      : 'Retirada sem operador'

                    return (
                      <div
                        key={b.id}
                        className={cn(
                          "text-[10px] sm:text-xs p-1.5 rounded border leading-tight truncate",
                          onBookingClick && "cursor-pointer hover:ring-1 hover:ring-primary/40 transition-all",
                          STATUS_COLORS[b.status] || "bg-secondary text-secondary-foreground"
                        )}
                        title={`${b.resource?.name} - ${b.client?.name} • ${flowHint}`}
                        onClick={() => onBookingClick?.(b.id)}
                      >
                        <div className="font-semibold truncate">{b.resource?.name}</div>
                        <div className="truncate opacity-80">{b.client?.name}</div>
                      </div>
                    )
                  })()
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
