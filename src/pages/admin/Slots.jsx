import { useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { AdminAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useSocket } from '../../context/SocketContext';
import { formatTimeLabel, mediaUrl } from '../../utils/format';
import { normalizeSlotDate } from '../../utils/slotRealtime';

const REASONS = [
  { value: 'walk_in', label: 'Walk-in client' },
  { value: 'hold', label: 'Temporary hold' },
  { value: 'maintenance', label: 'Maintenance / closed' },
  { value: 'other', label: 'Other' },
];

const statusStyles = {
  available: 'border-gold/35 bg-nude/60 text-burgundy hover:border-gold hover:bg-gold/15',
  booked: 'border-white/10 bg-[#1a1a1a] text-champagne',
  blocked: 'border-gold/50 bg-gold/15 text-gold',
  past: 'border-white/5 bg-black/40 text-muted/60 cursor-not-allowed',
  off: 'border-white/5 bg-black/30 text-muted/50 cursor-not-allowed',
};

const fallbackPhoto =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%231a1a1a' width='80' height='80'/%3E%3C/svg%3E";

export default function AdminSlots() {
  const toast = useToast();
  const socket = useSocket();
  const [barbers, setBarbers] = useState([]);
  const [staffId, setStaffId] = useState(null);
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [desk, setDesk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [shiftMode, setShiftMode] = useState('next');
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('');
  const dateRef = useRef(date);
  const staffIdRef = useRef(staffId);
  const refetchTimer = useRef(null);
  const [form, setForm] = useState({
    time: '',
    reason: 'walk_in',
    client_name: '',
    client_phone: '',
    notes: '',
  });

  dateRef.current = date;
  staffIdRef.current = staffId;

  useEffect(() => {
    AdminAPI.staff()
      .then(({ data }) => {
        const list = (data.data || []).filter((s) => s.role === 'barber');
        setBarbers(list);
        if (list.length && !staffId) setStaffId(list[0].id);
      })
      .catch((e) => toast.error(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async (d = date, sid = staffId, { silent = false } = {}) => {
    if (!sid) {
      setDesk(null);
      if (!silent) setLoading(false);
      return;
    }
    if (!silent) setLoading(true);
    try {
      const { data } = await AdminAPI.daySlots({ date: d, staff_id: sid });
      setDesk(data.data);
    } catch (e) {
      if (!silent) toast.error(e.message);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    setForm((f) => ({ ...f, time: '' }));
    setCustomDate('');
    setCustomTime('');
    load(date, staffId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, staffId]);

  useEffect(() => {
    if (!socket) return undefined;
    const onSlotUpdated = (event) => {
      if (normalizeSlotDate(event.date) !== normalizeSlotDate(dateRef.current)) return;
      if (event.staffId != null && Number(event.staffId) !== Number(staffIdRef.current)) return;
      if (refetchTimer.current) clearTimeout(refetchTimer.current);
      refetchTimer.current = setTimeout(() => {
        load(dateRef.current, staffIdRef.current, { silent: true });
      }, 200);
    };
    socket.on('slot:updated', onSlotUpdated);
    return () => {
      socket.off('slot:updated', onSlotUpdated);
      if (refetchTimer.current) clearTimeout(refetchTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const selectedSlot = useMemo(
    () => desk?.slots?.find((s) => s.time === form.time) || null,
    [desk, form.time]
  );

  const availableTargets = useMemo(() => {
    if (!desk?.slots) return [];
    return desk.slots.filter((s) => s.status === 'available');
  }, [desk]);

  const blockSlot = async () => {
    if (!form.time || !staffId) {
      toast.error('Select a barber and time slot first');
      return;
    }
    setBusyKey(`block-${form.time}`);
    try {
      const { data } = await AdminAPI.blockSlot({
        staff_id: staffId,
        block_date: date,
        block_time: form.time.slice(0, 5),
        reason: form.reason,
        client_name: form.client_name || null,
        client_phone: form.client_phone || null,
        notes: form.notes || null,
      });
      toast.success(data.message || 'Slot blocked');
      setForm((f) => ({ ...f, time: '', client_name: '', client_phone: '', notes: '' }));
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusyKey(null);
    }
  };

  const unblock = async (slot) => {
    if (!slot?.block?.id) return;
    setBusyKey(`unblock-${slot.time}`);
    try {
      await AdminAPI.unblockSlot(slot.block.id);
      toast.success('Slot unblocked for this barber');
      if (form.time === slot.time) setForm((f) => ({ ...f, time: '' }));
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusyKey(null);
    }
  };

  const confirmCancel = async () => {
    if (!cancelTarget?.id) return;
    setBusyKey(`cancel-${cancelTarget.id}`);
    try {
      const { data } = await AdminAPI.cancelDeskAppointment(cancelTarget.id);
      toast.success(data.message || 'Appointment cancelled — slot freed');
      setCancelTarget(null);
      setForm((f) => ({ ...f, time: '' }));
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusyKey(null);
    }
  };

  const shiftAppointment = async () => {
    const appt = selectedSlot?.appointment;
    if (!appt) return;
    setBusyKey(`shift-${appt.id}`);
    try {
      const payload =
        shiftMode === 'next'
          ? { appointment_id: appt.id, mode: 'next' }
          : {
              appointment_id: appt.id,
              mode: 'custom',
              appointment_date: customDate || date,
              appointment_time: (customTime || '').slice(0, 5),
            };
      if (shiftMode === 'custom' && !payload.appointment_time) {
        toast.error('Pick a target time for the custom shift');
        return;
      }
      const { data } = await AdminAPI.shiftDeskAppointment(payload);
      toast.success(data.message || 'Appointment shifted');
      setForm((f) => ({ ...f, time: '' }));
      setCustomDate('');
      setCustomTime('');
      // If shifted to another day, jump the calendar
      if (data.next?.date && data.next.date !== date) {
        setDate(data.next.date);
      } else {
        await load();
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusyKey(null);
    }
  };

  const selectedBarber = barbers.find((b) => b.id === staffId);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-gold">Availability</p>
        <h2 className="font-display text-4xl text-burgundy">Slot manager</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Manage each barber’s chair separately — block for walk-ins, cancel to free a slot, or
          shift a booking to the next open time or a custom slot.
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Select barber</p>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {barbers.map((b) => {
            const active = staffId === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setStaffId(b.id)}
                className={`flex min-w-[148px] items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition ${
                  active
                    ? 'border-gold bg-gold/15 ring-1 ring-gold'
                    : 'border-white/10 bg-blush hover:border-gold/40'
                }`}
              >
                <img
                  src={mediaUrl(b.photo) || fallbackPhoto}
                  alt=""
                  className="h-11 w-11 rounded-xl object-cover"
                  onError={(e) => {
                    e.currentTarget.src = fallbackPhoto;
                  }}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-burgundy">{b.name}</p>
                  <p className="truncate text-[10px] uppercase tracking-wider text-gold">
                    {b.title || 'Barber'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-[24px] border border-white/8 bg-blush p-4 sm:p-5">
        <label className="text-sm text-muted">
          Date
          <input
            type="date"
            className="mt-1 block rounded-xl border border-white/10 bg-nude px-3 py-2 text-burgundy"
            value={date}
            min={dayjs().format('YYYY-MM-DD')}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        {selectedBarber ? (
          <p className="text-sm text-champagne">
            Managing <span className="text-gold">{selectedBarber.name}</span>
            {desk && !desk.barberWorks ? (
              <span className="ml-2 text-xs text-muted">(off day)</span>
            ) : null}
          </p>
        ) : null}
        {desk?.summary ? (
          <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wider text-muted">
            <span className="rounded-full border border-gold/30 px-3 py-1.5 text-gold">
              {desk.summary.available} open
            </span>
            <span className="rounded-full border border-white/15 px-3 py-1.5">
              {desk.summary.booked} booked
            </span>
            <span className="rounded-full border border-rose/40 px-3 py-1.5 text-gold">
              {desk.summary.blocked} blocked
            </span>
          </div>
        ) : null}
      </div>

      {!staffId ? (
        <p className="text-sm text-muted">Add a barber in Staff before managing slots.</p>
      ) : loading ? (
        <LoadingSpinner label="Loading barber slots…" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {desk?.slots?.map((slot) => {
              const active = form.time === slot.time;
              const disabled = slot.status === 'past' || slot.status === 'off';
              return (
                <button
                  key={slot.time}
                  type="button"
                  disabled={disabled}
                  onClick={() => setForm((f) => ({ ...f, time: slot.time }))}
                  className={`rounded-2xl border px-3 py-3 text-left transition ${statusStyles[slot.status] || statusStyles.past} ${
                    active ? 'ring-2 ring-gold' : ''
                  }`}
                >
                  <p className="text-sm font-medium">{formatTimeLabel(slot.time)}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider opacity-80">
                    {slot.status === 'blocked'
                      ? slot.block?.reason?.replace('_', ' ') || 'blocked'
                      : slot.status}
                  </p>
                  {slot.appointment ? (
                    <p className="mt-1 truncate text-[11px] opacity-70">{slot.appointment.client_name}</p>
                  ) : null}
                  {slot.block?.client_name ? (
                    <p className="mt-1 truncate text-[11px] opacity-70">{slot.block.client_name}</p>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="rounded-[24px] border border-white/8 bg-blush p-5">
            <h3 className="font-display text-2xl text-burgundy">
              {form.time ? formatTimeLabel(form.time) : 'Select a slot'}
            </h3>

            {selectedSlot?.status === 'blocked' ? (
              <div className="mt-4 space-y-3 text-sm text-muted">
                <p>
                  Blocked for{' '}
                  <span className="text-gold">{selectedSlot.block?.reason?.replace('_', ' ')}</span>
                </p>
                {selectedSlot.block?.client_name ? (
                  <p>Client: {selectedSlot.block.client_name}</p>
                ) : null}
                {selectedSlot.block?.notes ? <p>Notes: {selectedSlot.block.notes}</p> : null}
                {selectedSlot.canUnblock ? (
                  <Button
                    variant="secondary"
                    className="w-full"
                    disabled={busyKey === `unblock-${selectedSlot.time}`}
                    onClick={() => unblock(selectedSlot)}
                  >
                    {busyKey === `unblock-${selectedSlot.time}` ? 'Releasing…' : 'Unblock slot'}
                  </Button>
                ) : (
                  <p className="text-xs">Past blocked slots cannot be changed.</p>
                )}
              </div>
            ) : null}

            {selectedSlot?.status === 'booked' && selectedSlot.appointment ? (
              <div className="mt-4 space-y-4 text-sm text-muted">
                <div className="rounded-xl border border-white/10 bg-nude px-3 py-3">
                  <p className="text-burgundy">{selectedSlot.appointment.client_name}</p>
                  <p className="text-xs">
                    {selectedSlot.appointment.service_name || selectedSlot.appointment.package_name}
                    {' · '}
                    {selectedSlot.appointment.appointment_code}
                    {' · '}
                    {selectedSlot.appointment.status}
                  </p>
                  <p className="mt-1 text-xs">{selectedSlot.appointment.client_phone}</p>
                </div>

                {selectedSlot.canCancel ? (
                  <Button
                    variant="secondary"
                    className="w-full"
                    disabled={!!busyKey}
                    onClick={() => setCancelTarget(selectedSlot.appointment)}
                  >
                    Cancel & free slot
                  </Button>
                ) : (
                  <p className="text-xs">
                    Slot time has passed — cancel from Appointments if you still need to mark it.
                  </p>
                )}

                {selectedSlot.canShift ? (
                  <div className="space-y-3 border-t border-white/10 pt-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-gold">Shift appointment</p>
                    <div className="flex gap-2">
                      {[
                        { id: 'next', label: 'Next available' },
                        { id: 'custom', label: 'Custom time' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setShiftMode(m.id)}
                          className={`rounded-full px-3 py-1.5 text-xs ${
                            shiftMode === m.id ? 'bg-gold text-black' : 'bg-nude text-champagne'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>

                    {shiftMode === 'custom' ? (
                      <div className="grid gap-2 sm:grid-cols-2">
                        <label className="text-xs text-muted">
                          New date
                          <input
                            type="date"
                            className="mt-1 w-full rounded-xl border border-white/10 bg-nude px-3 py-2 text-burgundy"
                            min={dayjs().format('YYYY-MM-DD')}
                            value={customDate || date}
                            onChange={(e) => setCustomDate(e.target.value)}
                          />
                        </label>
                        <label className="text-xs text-muted">
                          New time
                          <select
                            className="mt-1 w-full rounded-xl border border-white/10 bg-nude px-3 py-2 text-burgundy"
                            value={customTime}
                            onChange={(e) => setCustomTime(e.target.value)}
                          >
                            <option value="">Select time</option>
                            {(customDate && customDate !== date
                              ? []
                              : availableTargets
                            ).map((s) => (
                              <option key={s.time} value={s.time.slice(0, 5)}>
                                {formatTimeLabel(s.time)}
                              </option>
                            ))}
                            {/* When shifting to another day, allow typing any valid HH:mm from settings grid via free input fallback */}
                          </select>
                        </label>
                        {customDate && customDate !== date ? (
                          <label className="text-xs text-muted sm:col-span-2">
                            Time (HH:mm) for other day
                            <input
                              type="time"
                              step={desk?.slot_interval_minutes ? desk.slot_interval_minutes * 60 : 1800}
                              className="mt-1 w-full rounded-xl border border-white/10 bg-nude px-3 py-2 text-burgundy"
                              value={customTime}
                              onChange={(e) => setCustomTime(e.target.value)}
                            />
                          </label>
                        ) : null}
                      </div>
                    ) : (
                      <p className="text-xs">
                        Moves this booking to the next free slot for this barber and frees the current
                        time immediately.
                      </p>
                    )}

                    <Button
                      className="w-full"
                      disabled={!!busyKey}
                      onClick={shiftAppointment}
                    >
                      {busyKey?.startsWith('shift')
                        ? 'Shifting…'
                        : shiftMode === 'next'
                          ? 'Shift to next available'
                          : 'Shift to custom slot'}
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : null}

            {selectedSlot?.status === 'available' ? (
              <div className="mt-4 space-y-3">
                <label className="block text-sm text-muted">
                  Reason
                  <select
                    className="mt-1 w-full rounded-xl border border-white/10 bg-nude px-3 py-2 text-burgundy"
                    value={form.reason}
                    onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                  >
                    {REASONS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm text-muted">
                  Walk-in name (optional)
                  <input
                    className="mt-1 w-full rounded-xl border border-white/10 bg-nude px-3 py-2 text-burgundy"
                    value={form.client_name}
                    onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))}
                    placeholder="Walk-in client"
                  />
                </label>
                <label className="block text-sm text-muted">
                  Phone (optional)
                  <input
                    className="mt-1 w-full rounded-xl border border-white/10 bg-nude px-3 py-2 text-burgundy"
                    value={form.client_phone}
                    onChange={(e) => setForm((f) => ({ ...f, client_phone: e.target.value }))}
                  />
                </label>
                <label className="block text-sm text-muted">
                  Notes
                  <textarea
                    rows={2}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-nude px-3 py-2 text-burgundy"
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="e.g. Walk-in at chair"
                  />
                </label>
                <Button
                  className="w-full"
                  disabled={!form.time || busyKey?.startsWith('block')}
                  onClick={blockSlot}
                >
                  {busyKey?.startsWith('block') ? 'Blocking…' : 'Block this barber slot'}
                </Button>
              </div>
            ) : null}

            {!form.time ? (
              <p className="mt-4 text-sm text-muted">
                Pick a slot for {selectedBarber?.name || 'this barber'}. Blocking only affects that
                barber — other barbers stay bookable at the same clock time.
              </p>
            ) : null}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={confirmCancel}
        title="Cancel & free slot?"
        message={
          cancelTarget
            ? `Cancel ${cancelTarget.appointment_code} for ${cancelTarget.client_name} and open this time for ${selectedBarber?.name || 'the barber'} again?`
            : ''
        }
      />
    </div>
  );
}
