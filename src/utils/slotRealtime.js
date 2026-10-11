/** Normalize MySQL / API times to HH:mm:ss for comparisons */
export function normalizeSlotTime(time) {
  const raw = String(time || '');
  if (!raw) return '';
  return raw.length === 5 ? `${raw}:00` : raw.slice(0, 8);
}

export function normalizeSlotDate(date) {
  return String(date || '').slice(0, 10);
}

/**
 * Live events affect the open booking modal when:
 * - the same barber's slot was booked/freed/blocked/unblocked
 */
export function slotEventAffectsResource(event, resourceType, resourceId, staffId = null) {
  if (!event) return false;

  if (staffId != null && event.staffId != null) {
    return Number(event.staffId) === Number(staffId);
  }

  // Legacy salon-wide events (no staffId) only affect when no barber is selected yet
  if (event.salonWide) return true;

  return (
    event.resourceType === resourceType &&
    Number(event.resourceId) === Number(resourceId)
  );
}

/**
 * Optimistic local patch so the UI updates before a refetch completes.
 * Returns a new availability object (or the same reference if unchanged).
 */
export function applySlotEventToAvailability(availability, event, resourceType, resourceId, staffId = null) {
  if (!availability?.days || !slotEventAffectsResource(event, resourceType, resourceId, staffId)) {
    return availability;
  }

  const date = normalizeSlotDate(event.date);
  const time = normalizeSlotTime(event.time);
  let changed = false;

  const days = availability.days.map((day) => {
    if (normalizeSlotDate(day.date) !== date) return day;

    const slots = day.slots.map((slot) => {
      if (normalizeSlotTime(slot.time) !== time) return slot;

      if (event.type === 'booked' || event.type === 'blocked') {
        const reason = event.type === 'blocked' ? 'blocked' : 'booked';
        if (!slot.available && slot.reason === reason) return slot;
        changed = true;
        return { ...slot, available: false, reason };
      }

      if (event.type === 'freed' || event.type === 'unblocked') {
        // Only clear if this reason matches — refetch will reconcile mixed states
        if (event.type === 'unblocked' && slot.reason === 'blocked') {
          changed = true;
          return { ...slot, available: true, reason: null };
        }
        if (event.type === 'freed' && slot.reason === 'booked') {
          changed = true;
          return { ...slot, available: true, reason: null };
        }
      }

      return slot;
    });

    return slots === day.slots ? day : { ...day, slots };
  });

  return changed ? { ...availability, days } : availability;
}
