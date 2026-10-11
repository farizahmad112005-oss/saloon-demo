import Modal from '../ui/Modal';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import DateSelector from './DateSelector';
import TimeSlotSelector from './TimeSlotSelector';
import BarberCard from './BarberCard';
import { formatPKR, formatTimeLabel, mediaUrl } from '../../utils/format';

const fallback =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23141414' width='400' height='400'/%3E%3C/svg%3E";

export default function BookingSlotModal({
  open,
  onClose,
  item,
  bookingType,
  barbers,
  loadingBarbers,
  selectedBarber,
  onSelectBarber,
  availability,
  loadingSlots,
  date,
  time,
  onSelectDate,
  onSelectTime,
  client,
  onClientChange,
  discountCode,
  onDiscountCodeChange,
  onApplyDiscount,
  discountInfo,
  finalPrice,
  originalPrice,
  submitting,
  onConfirm,
}) {
  if (!item) return null;

  const daySlots = availability?.days?.find((d) => d.date === date)?.slots || [];
  const detailsOk = Boolean(
    client.client_name?.trim() && client.client_phone?.trim() && client.client_email?.trim()
  );
  const missingHint = !selectedBarber
    ? 'Select a barber to continue'
    : !date || !time
      ? 'Select a day and time slot'
      : !detailsOk
        ? 'Enter your name, phone, and email'
        : null;

  const footer = (
    <div className="rounded-[18px] border border-gold/30 bg-black p-3 text-burgundy sm:rounded-[22px] sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 text-sm">
          <p className="truncate font-medium">{item.name}</p>
          <p className="text-champagne">
            {selectedBarber ? selectedBarber.name : 'Choose a barber'}
            {date && time ? ` · ${date} · ${formatTimeLabel(time)}` : ''} · {formatPKR(finalPrice)}
          </p>
          {missingHint && !submitting ? (
            <p className="mt-1 text-xs text-gold">{missingHint}</p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="gold"
          disabled={submitting}
          onClick={onConfirm}
          className="w-full shrink-0 sm:w-auto disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? 'Booking…' : 'Confirm Appointment'}
        </Button>
      </div>
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title="Book appointment" wide footer={footer}>
      <div className="space-y-5 sm:space-y-6">
        <div className="flex gap-3 rounded-[18px] bg-nude p-3 ring-1 ring-white/10 sm:rounded-[22px]">
          <img
            src={mediaUrl(item.image) || fallback}
            alt={item.name}
            className="h-16 w-16 shrink-0 rounded-2xl object-cover sm:h-24 sm:w-24"
            onError={(e) => {
              e.currentTarget.src = fallback;
            }}
          />
          <div className="min-w-0">
            <p className="font-display text-xl text-burgundy sm:text-3xl">{item.name}</p>
            <p className="mt-1 line-clamp-2 text-xs text-muted sm:text-sm">{item.description}</p>
            <p className="mt-1.5 text-sm font-medium text-burgundy">
              {formatPKR(originalPrice)}
              {discountInfo?.discount_amount ? (
                <span className="ml-2 text-gold">→ {formatPKR(finalPrice)}</span>
              ) : null}
            </p>
          </div>
        </div>

        <section>
          <h4 className="font-display text-lg text-burgundy sm:text-xl">Your details</h4>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-sm sm:col-span-2">
              <span className="text-muted">Name *</span>
              <input
                className="mt-1 w-full rounded-2xl border border-white/10 bg-nude px-3 py-2.5 text-burgundy outline-none focus:border-gold"
                value={client.client_name}
                onChange={(e) => onClientChange({ ...client, client_name: e.target.value })}
              />
            </label>
            <label className="text-sm">
              <span className="text-muted">Age</span>
              <input
                type="number"
                className="mt-1 w-full rounded-2xl border border-white/10 bg-nude px-3 py-2.5 text-burgundy outline-none focus:border-gold"
                value={client.client_age}
                onChange={(e) => onClientChange({ ...client, client_age: e.target.value })}
              />
            </label>
            <label className="text-sm">
              <span className="text-muted">Phone *</span>
              <input
                className="mt-1 w-full rounded-2xl border border-white/10 bg-nude px-3 py-2.5 text-burgundy outline-none focus:border-gold"
                value={client.client_phone}
                onChange={(e) => onClientChange({ ...client, client_phone: e.target.value })}
              />
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="text-muted">Email * (for confirmation)</span>
              <input
                type="email"
                required
                className="mt-1 w-full rounded-2xl border border-white/10 bg-nude px-3 py-2.5 text-burgundy outline-none focus:border-gold"
                value={client.client_email}
                onChange={(e) => onClientChange({ ...client, client_email: e.target.value })}
                placeholder="you@email.com"
              />
            </label>
          </div>
        </section>

        <section>
          <h4 className="font-display text-lg text-burgundy sm:text-xl">Choose your barber</h4>
          <p className="mt-1 text-xs text-muted">
            {bookingType === 'service'
              ? 'Only barbers who offer this service are shown'
              : 'Pick who will take your package appointment'}
          </p>
          {loadingBarbers ? (
            <LoadingSpinner label="Loading barbers…" />
          ) : !barbers?.length ? (
            <p className="mt-3 rounded-2xl bg-nude px-4 py-3 text-sm text-muted">
              No barbers available for this booking right now.
            </p>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {barbers.map((b) => (
                <BarberCard
                  key={b.id}
                  barber={b}
                  selected={selectedBarber?.id === b.id}
                  onSelect={onSelectBarber}
                />
              ))}
            </div>
          )}
        </section>

        {selectedBarber ? (
          <section>
            <h4 className="font-display text-lg text-burgundy sm:text-xl">
              Available days with {selectedBarber.name}
            </h4>
            <p className="mt-1 text-xs text-muted">Swipe and tap a day</p>
            {loadingSlots ? (
              <LoadingSpinner label="Loading availability…" />
            ) : (
              <div className="mt-3">
                <DateSelector days={availability?.days || []} selected={date} onSelect={onSelectDate} />
              </div>
            )}
          </section>
        ) : null}

        {selectedBarber && date ? (
          <section>
            <h4 className="font-display text-lg text-burgundy sm:text-xl">Time slots</h4>
            <p className="mt-1 text-xs text-muted">
              {availability?.days?.find((d) => d.date === date)?.displayDate || date}
              {time ? ` · Selected ${formatTimeLabel(time)}` : ''}
            </p>
            <div className="mt-3">
              <TimeSlotSelector slots={daySlots} selected={time} onSelect={onSelectTime} />
            </div>
          </section>
        ) : null}

        {bookingType === 'service' ? (
          <section>
            <h4 className="font-display text-lg text-burgundy sm:text-xl">Discount</h4>
            <div className="mt-3 flex gap-2">
              <input
                value={discountCode}
                onChange={(e) => onDiscountCodeChange(e.target.value.toUpperCase())}
                placeholder="Code e.g. FADE15"
                className="w-full rounded-full border border-white/10 bg-nude px-4 py-3 text-sm text-burgundy outline-none focus:border-gold"
              />
              <Button variant="secondary" onClick={onApplyDiscount} className="shrink-0">
                Apply
              </Button>
            </div>
            {discountInfo?.discount_amount ? (
              <p className="mt-2 text-sm text-gold">
                Saved {formatPKR(discountInfo.discount_amount)} with {discountInfo.discount_code}
              </p>
            ) : null}
          </section>
        ) : null}
      </div>
    </Modal>
  );
}
