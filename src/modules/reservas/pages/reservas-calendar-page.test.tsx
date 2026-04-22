import { MemoryRouter } from 'react-router-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import dayjs from '@/shared/lib/dayjs'
import { ReservasCalendarPage } from './reservas-calendar-page'

const mockRefetch = vi.fn()
const mockMutateAsync = vi.fn()

vi.mock('../hooks/use-booking-queries', () => ({
  useBookings: () => ({
    data: [],
    isLoading: false,
    isError: false,
    error: null,
    refetch: mockRefetch,
  }),
  useCreateBooking: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
  useResources: () => ({
    data: [
      { id: 'resource-1', name: 'Trator 01', type: 'tractor', status: 'available' },
      { id: 'resource-2', name: 'Guincho 01', type: 'truck', status: 'available' },
    ],
  }),
}))

vi.mock('@/modules/clientes/hooks/use-client-queries', () => ({
  useClientOptions: () => ({
    data: [{ id: 'client-1', name: 'Cliente Teste' }],
  }),
}))

vi.mock('../components/booking-calendar', () => ({
  BookingCalendar: ({ onNewBooking }: { onNewBooking?: (date: dayjs.Dayjs) => void }) => (
    <button type="button" onClick={() => onNewBooking?.(dayjs('2026-04-22T00:00:00'))}>
      Abrir modal rapido
    </button>
  ),
}))

describe('ReservasCalendarPage - modal rapido', () => {
  beforeEach(() => {
    mockRefetch.mockReset()
    mockMutateAsync.mockReset()
    mockMutateAsync.mockResolvedValue({ id: 'booking-1' })
  })

  it('abre modal ao acionar novo agendamento no calendario', async () => {
    render(
      <MemoryRouter>
        <ReservasCalendarPage />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Abrir modal rapido' }))

    expect(await screen.findByText('Nova reserva')).toBeInTheDocument()
    expect(screen.getByText('Cliente *')).toBeInTheDocument()
    expect(screen.getByText('Recurso *')).toBeInTheDocument()
  })

  it('salva reserva pelo modal e recarrega calendario', async () => {
    render(
      <MemoryRouter>
        <ReservasCalendarPage />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Abrir modal rapido' }))

    const [clientSelect, resourceSelect] = screen.getAllByRole('combobox')
    fireEvent.change(clientSelect, { target: { value: 'client-1' } })
    fireEvent.change(resourceSelect, { target: { value: 'resource-1' } })
    fireEvent.click(screen.getByRole('button', { name: /Salvar Reserva/i }))

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          client_id: 'client-1',
          resource_id: 'resource-1',
          status: 'pending',
        }),
      )
    })

    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled()
    })
  })
})
