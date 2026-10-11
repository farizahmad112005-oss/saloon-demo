import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import BookingServiceCard from '../../components/booking/BookingServiceCard';
import BookingSlotModal from '../../components/booking/BookingSlotModal';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ContentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import { formatTimeLabel } from '../../utils/format';
import { FadeUp, Stagger, easeLuxury } from '../../animations/textReveal';
import Seo from '../../components/seo/Seo';
import { saveGuestAppointment } from '../../utils/guestAppointments';
import {
  applySlotEventToAvailability,
  normalizeSlotTime,
  slotEventAffectsResource,
} from '../../utils/slotRealtime';

const emptyClient = { client_name: '', client_age: '', client_phone: '', client_email: '' };

export default function Booking() {
  const [params] = useSearchParams();
  const { user, isCustomer } = useAuth();
  const toast = useToast();
  const socket = useSocket();

  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bookingType, setBookingType] = useState(params.get('package') ? 'package' : 'service');
  const [selectedId, setSelectedId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [barbers, setBarbers] = useState([]);
  const [loadingBarbers, setLoadingBarbers] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [discountCode, setDiscountCode] = useState('');
  const [discountInfo, setDiscountInfo] = useState(null);
  const [client, setClient] = useState(emptyClient);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  const selectedIdRef = useRef(selectedId);
  const bookingTypeRef = useRef(bookingType);
  const modalOpenRef = useRef(modalOpen);
  const selectedBarberRef = useRef(selectedBarber);
  const dateRef = useRef(date);
  const timeRef = useRef(time);
  const refetchTimer = useRef(null);

  selectedIdRef.current = selectedId;
  bookingTypeRef.current = bookingType;
  modalOpenRef.current = modalOpen;
  selectedBarberRef.current = selectedBarber;
  dateRef.current = date;
  timeRef.current = time;

  useEffect(() => {
    Promise.all([ContentAPI.services(), ContentAPI.packages(), ContentAPI.categories()])
      .then(([s, p, c]) => {
        setServices(s.data.data);
        setPackages(p.data.data);
        setCategories(c.data.data);

        const preService = Number(params.get('service'));
        const prePackage = Number(params.get('package'));
        if (prePackage) {
          setBookingType('package');
          setSelectedId(prePackage);
          setModalOpen(true);
        } else if (preService) {
          setBookingType('service');
          setSelectedId(preService);
          setModalOpen(true);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (isCustomer && user?.role === 'customer') {
      setClient({
        client_name: user.name || '',
        client_age: user.age || '',
        client_phone: user.phone || '',
        client_email: user.email || '',
      });
    } else {
      setClient(emptyClient);
    }
  }, [isCustomer, user]);

  const loadBarbers = (id, type) => {
    if (!id) return Promise.resolve();
    setLoadingBarbers(true);
    const params =
      type === 'service' ? { service_id: id } : undefined;
    return ContentAPI.staff(params)
      .then((r) => setBarbers(r.data.data || []))
      .catch((e) => {
        toast.error(e.message);
        setBarbers([]);
      })
      .finally(() => setLoadingBarbers(false));
  };

  const loadAvailability = (staffId, resourceId, type, { silent = false } = {}) => {
    if (!staffId || !resourceId) return Promise.resolve();
    if (!silent) setLoadingSlots(true);
    const params =
      type === 'package' ? { package_id: resourceId } : { service_id: resourceId };
    return ContentAPI.staffAvailability(staffId, params)
      .then((r) => setAvailability(r.data.data))
      .catch((e) => {
        if (!silent) toast.error(e.message);
        setAvailability(null);
      })
      .finally(() => {
        if (!silent) setLoadingSlots(false);
      });
  };

  useEffect(() => {
    if (!selectedId || !modalOpen) {
      if (!modalOpen) {
        setBarbers([]);
        setSelectedBarber(null);
        setAvailability(null);
      }
      return;
    }
    setSelectedBarber(null);
    setDate(null);
    setTime(null);
    setDiscountInfo(null);
    setAvailability(null);
    loadBarbers(selectedId, bookingType);
  }, [selectedId, bookingType, modalOpen]);

  useEffect(() => {
    if (!selectedBarber || !selectedId || !modalOpen) {
      setAvailability(null);
      return;
    }
    setDate(null);
    setTime(null);
    loadAvailability(selectedBarber.id, selectedId, bookingType);
  }, [selectedBarber?.id, selectedId, bookingType, modalOpen]);

  useEffect(() => {
    if (!socket) return undefined;

    const onSlotUpdated = (event) => {
      if (!modalOpenRef.current || !selectedIdRef.current || !selectedBarberRef.current) return;

      const resourceType = bookingTypeRef.current === 'package' ? 'package' : 'service';
      const resourceId = selectedIdRef.current;
      const staffId = selectedBarberRef.current.id;
      if (!slotEventAffectsResource(event, resourceType, resourceId, staffId)) return;

      setAvailability((prev) =>
        applySlotEventToAvailability(prev, event, resourceType, resourceId, staffId)
      );

      const eventTime = normalizeSlotTime(event.time);
      const selectedTime = normalizeSlotTime(timeRef.current);
      if (
        dateRef.current &&
        String(dateRef.current).slice(0, 10) === String(event.date).slice(0, 10) &&
        selectedTime &&
        selectedTime === eventTime &&
        (event.type === 'booked' || event.type === 'blocked')
      ) {
        setTime(null);
        toast.info(
          event.type === 'blocked'
            ? 'That time was just held by the salon. Please pick another slot.'
            : 'That time was just booked. Please pick another slot.'
        );
      }

      if (refetchTimer.current) clearTimeout(refetchTimer.current);
      refetchTimer.current = setTimeout(() => {
        loadAvailability(staffId, resourceId, bookingTypeRef.current, { silent: true });
      }, 280);
    };

    socket.on('slot:updated', onSlotUpdated);
    return () => {
      socket.off('slot:updated', onSlotUpdated);
      if (refetchTimer.current) clearTimeout(refetchTimer.current);
    };
  }, [socket, toast]);

  const selectedItem = useMemo(() => {
    if (bookingType === 'package') return packages.find((p) => p.id === selectedId);
    return services.find((s) => s.id === selectedId);
  }, [bookingType, packages, services, selectedId]);

  const originalPrice = bookingType === 'package'
    ? Number(selectedItem?.package_price || 0)
    : Number(selectedItem?.price || 0);

  const servicesByCategory = useMemo(() => {
    return categories
      .map((c) => ({
        ...c,
        items: services.filter((s) => s.category_id === c.id),
      }))
      .filter((c) => c.items.length);
  }, [categories, services]);

  const openBooking = (id) => {
    setSelectedId(id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedId(null);
    setSelectedBarber(null);
    setBarbers([]);
    setDate(null);
    setTime(null);
    setDiscountCode('');
    setDiscountInfo(null);
    setAvailability(null);
  };

  const applyDiscount = async () => {
    if (!discountCode || bookingType !== 'service' || !selectedId) return;
    try {
      const { data } = await ContentAPI.validateDiscount({
        code: discountCode,
        booking_type: 'service',
        service_id: selectedId,
        original_price: originalPrice,
      });
      setDiscountInfo(data.data);
      toast.success('Discount applied');
    } catch (e) {
      setDiscountInfo(null);
      toast.error(e.message);
    }
  };

  const finalPrice = discountInfo ? discountInfo.final_price : originalPrice;

  const confirm = async () => {
    if (!selectedBarber) {
      toast.error('Please select a barber.');
      return;
    }
    if (!selectedId || !date || !time) {
      toast.error('Please select a day and time slot.');
      return;
    }
    if (!client.client_name?.trim() || !client.client_phone?.trim()) {
      toast.error('Please enter your name and phone.');
      return;
    }
    const email = client.client_email?.trim() || '';
    if (!email) {
      toast.error('Please enter your email for confirmation.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload = {
        booking_type: bookingType,
        staff_id: Number(selectedBarber.id),
        appointment_date: date,
        appointment_time: String(time).length === 5 ? time : String(time).slice(0, 5),
        client_name: client.client_name.trim(),
        client_phone: client.client_phone.trim(),
        client_email: email,
        client_age: client.client_age ? Number(client.client_age) : undefined,
        discount_code: discountInfo?.discount_code || discountCode || undefined,
      };
      if (bookingType === 'service') payload.service_id = Number(selectedId);
      else payload.package_id = Number(selectedId);

      const { data } = await ContentAPI.createAppointment(payload);
      if (!isCustomer) {
        saveGuestAppointment(data.data);
      }
      setSuccess(data.data);
      closeModal();
      toast.success('Appointment booked successfully');
    } catch (e) {
      const msg =
        e?.details?.map?.((d) => d.msg || d.message).filter(Boolean).join(' ') ||
        e.message ||
        'Booking failed. Please try again.';
      toast.error(msg);
      if (selectedBarber && selectedId) {
        loadAvailability(selectedBarber.id, selectedId, bookingType, { silent: true });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (success) {
    return (
      <div className="page-shell flex min-h-[60vh] max-w-lg flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.55, ease: easeLuxury }}
          className="w-full rounded-[32px] bg-blush p-8 shadow-xl sm:p-10"
        >
          <p className="text-xs uppercase tracking-[0.28em] text-gold">Confirmed</p>
          <h1 className="mt-3 font-display text-[clamp(2.5rem,8vw,3.5rem)] text-burgundy">You’re booked.</h1>
          <p className="mt-3 text-muted">Appointment ID: {success.appointment_code}</p>
          <p className="mt-1 text-sm text-muted">
            {success.service_name || success.package_name}
            {success.staff_name ? ` · ${success.staff_name}` : ''}
            {' · '}
            {success.appointment_date} · {formatTimeLabel(success.appointment_time)}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button as={Link} to="/appointments">View history</Button>
            <Button as={Link} to="/" variant="secondary">Home</Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-shell pb-24 lg:pb-10">
      <Seo
        title="Book Appointment"
        path="/booking"
        description="Book a haircut, fade, or grooming package at Velour Men's Salon Faisalabad. Online booking for Canal Road's top barber shop."
      />
      <FadeUp>
        <p className="text-xs uppercase tracking-[0.28em] text-gold">Booking</p>
        <h1 className="page-title">Reserve your chair.</h1>
        <p className="mt-3 max-w-xl text-sm text-muted">
          Choose a service or package, pick your barber, then lock in a day and time that works for you.
        </p>
      </FadeUp>

      <FadeUp delay={0.1} className="mt-6 flex gap-2">
        {['service', 'package'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setBookingType(t);
              closeModal();
            }}
            className={`min-h-[44px] rounded-full px-5 py-2 text-sm capitalize transition ${
              bookingType === t ? 'bg-gold text-black' : 'bg-nude text-champagne active:bg-gold/20'
            }`}
          >
            {t}s
          </button>
        ))}
      </FadeUp>

      <div className="mt-6 space-y-8">
        {bookingType === 'service' ? (
          servicesByCategory.map((cat, catIndex) => (
            <FadeUp key={cat.id} delay={Math.min(catIndex * 0.04, 0.2)}>
              <h3 className="section-title">{cat.name}</h3>
              <Stagger className="mt-4 grid gap-3 md:grid-cols-2">
                {cat.items.map((s) => (
                  <BookingServiceCard
                    key={s.id}
                    item={s}
                    selected={false}
                    onSelect={openBooking}
                    subtitle={s.category_name}
                    price={s.price}
                    duration={s.duration_minutes}
                    inactive={!s.is_active}
                    discount={s.discount}
                  />
                ))}
              </Stagger>
            </FadeUp>
          ))
        ) : (
          <Stagger className="grid gap-3 md:grid-cols-2">
            {packages.map((p) => (
              <BookingServiceCard
                key={p.id}
                item={p}
                selected={false}
                onSelect={openBooking}
                subtitle={`${p.services?.length || 0} services included`}
                price={p.package_price}
                inactive={!p.is_active}
              />
            ))}
          </Stagger>
        )}
      </div>

      <BookingSlotModal
        open={modalOpen && !!selectedItem}
        onClose={closeModal}
        item={selectedItem}
        bookingType={bookingType}
        barbers={barbers}
        loadingBarbers={loadingBarbers}
        selectedBarber={selectedBarber}
        onSelectBarber={setSelectedBarber}
        availability={availability}
        loadingSlots={loadingSlots}
        date={date}
        time={time}
        onSelectDate={(d) => {
          setDate(d);
          setTime(null);
        }}
        onSelectTime={setTime}
        client={client}
        onClientChange={setClient}
        discountCode={discountCode}
        onDiscountCodeChange={setDiscountCode}
        onApplyDiscount={applyDiscount}
        discountInfo={discountInfo}
        finalPrice={finalPrice}
        originalPrice={originalPrice}
        submitting={submitting}
        onConfirm={confirm}
      />
    </div>
  );
}
