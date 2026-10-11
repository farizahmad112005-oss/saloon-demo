import { useOutletContext } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Seo from '../../components/seo/Seo';
import { useToast } from '../../context/ToastContext';
import { FadeUp } from '../../animations/textReveal';

const FALLBACK = {
  salon_name: "Velour Men's Salon",
  address: 'Market Place 204 1st Floor Near Crumble, Canal Road, Faisalabad',
  phone: '03007273029',
  email: 'farizahmad112005@gmail.com',
};

export default function Contact() {
  const { settings } = useOutletContext() || {};
  const toast = useToast();
  const name = settings?.salon_name || FALLBACK.salon_name;
  const address = settings?.address || FALLBACK.address;
  const phone = settings?.phone || FALLBACK.phone;
  const email = settings?.email || FALLBACK.email;

  return (
    <div className="page-shell max-w-5xl">
      <Seo
        title="Contact & Location"
        path="/contact"
        description={`Visit Velour Men's Salon in Faisalabad — ${address}. Call ${phone} or email ${email}. Best men's barber shop on Canal Road.`}
      />
      <FadeUp>
        <p className="text-xs uppercase tracking-[0.28em] text-gold">Contact</p>
        <h1 className="page-title">Visit Velour in Faisalabad.</h1>
        <p className="mt-3 max-w-xl text-sm text-muted">
          Find our men&apos;s salon and barber shop at Canal Road — book online or walk in for cuts, fades, and beard grooming.
        </p>
      </FadeUp>
      <div className="mt-8 grid gap-5 sm:mt-10 sm:gap-8 lg:grid-cols-2">
        <address className="rounded-[24px] border border-gold/25 bg-black p-6 text-burgundy not-italic sm:rounded-[28px] sm:p-8">
          <p className="font-display text-2xl tracking-[0.06em] sm:text-3xl">{name}</p>
          <p className="mt-4 text-sm text-champagne sm:text-base">{address}</p>
          <p className="mt-3">
            <a className="text-champagne hover:text-gold" href={`tel:${phone.replace(/\s/g, '')}`}>
              {phone}
            </a>
          </p>
          <p>
            <a className="text-champagne hover:text-gold" href={`mailto:${email}`}>
              {email}
            </a>
          </p>
          <p className="mt-6 text-sm text-gold">
            Hours: {String(settings?.opening_time || '10:00').slice(0, 5)} –{' '}
            {String(settings?.closing_time || '22:00').slice(0, 5)} (Asia/Karachi)
          </p>
        </address>
        <form
          className="surface space-y-4 rounded-[24px] p-5 sm:rounded-[28px] sm:p-8"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success('Message received. We will contact you shortly.');
            e.currentTarget.reset();
          }}
        >
          <input required placeholder="Your name" className="w-full rounded-2xl border border-white/10 bg-nude px-4 py-3 text-burgundy placeholder:text-muted" />
          <input required type="email" placeholder="Email" className="w-full rounded-2xl border border-white/10 bg-nude px-4 py-3 text-burgundy placeholder:text-muted" />
          <textarea required placeholder="Message" className="min-h-32 w-full rounded-2xl border border-white/10 bg-nude px-4 py-3 text-burgundy placeholder:text-muted" />
          <Button type="submit" className="w-full sm:w-auto">Send message</Button>
        </form>
      </div>
    </div>
  );
}
