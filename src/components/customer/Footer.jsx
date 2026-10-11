import { Link } from 'react-router-dom';
import BrandMark from './BrandMark';

const FALLBACK = {
  address: 'Market Place 204 1st Floor Near Crumble, Canal Road, Faisalabad',
  phone: '03007273029',
  email: 'farizahmad112005@gmail.com',
};

export default function Footer({ settings }) {
  const address = settings?.address || FALLBACK.address;
  const phone = settings?.phone || FALLBACK.phone;
  const email = settings?.email || FALLBACK.email;

  return (
    <footer className="mt-12 border-t border-white/10 bg-black text-burgundy sm:mt-20">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:gap-10 sm:py-14 md:grid-cols-3 md:px-6">
        <div>
          <BrandMark to="/" size="lg" className="!items-start" />
          <p className="mt-4 max-w-sm text-sm text-muted">
            {settings?.about_text?.slice(0, 150) ||
              "Premium men's hair salon in Faisalabad — sharp cuts, precise fades, and grooming that feels intentional."}
            …
          </p>
        </div>
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-gold">Explore</p>
          <div className="flex flex-col gap-2 text-sm text-champagne">
            <Link to="/services" className="hover:text-gold">Services</Link>
            <Link to="/packages" className="hover:text-gold">Packages</Link>
            <Link to="/booking" className="hover:text-gold">Book Appointment</Link>
            <Link to="/reviews" className="hover:text-gold">Reviews</Link>
            <Link to="/about" className="hover:text-gold">About</Link>
            <Link to="/contact" className="hover:text-gold">Contact</Link>
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-gold">Visit</p>
          <p className="text-sm text-champagne">{address}</p>
          <p className="mt-2 text-sm text-champagne">
            <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-gold">{phone}</a>
          </p>
          <p className="text-sm text-champagne">
            <a href={`mailto:${email}`} className="hover:text-gold">{email}</a>
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} Velour Men&apos;s Salon · Faisalabad. All rights reserved.
      </div>
    </footer>
  );
}
