const KEY = 'velour_guest_appointments';
const LEGACY_KEY = 'luxe_belle_guest_appointments';

function readList(key) {
  try {
    const raw = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function getGuestAppointments() {
  const current = readList(KEY);
  if (current.length) return current;
  const legacy = readList(LEGACY_KEY);
  if (legacy.length) {
    localStorage.setItem(KEY, JSON.stringify(legacy));
    localStorage.removeItem(LEGACY_KEY);
  }
  return legacy;
}

export function saveGuestAppointment(appointment) {
  if (!appointment?.id) return;
  const list = getGuestAppointments().filter((a) => a.id !== appointment.id);
  list.unshift(appointment);
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 50)));
}

export function setGuestAppointments(appointments) {
  localStorage.setItem(KEY, JSON.stringify(Array.isArray(appointments) ? appointments.slice(0, 50) : []));
}
