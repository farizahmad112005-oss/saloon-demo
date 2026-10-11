import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BannerSlider from '../../components/customer/BannerSlider';
import ServiceCard from '../../components/customer/ServiceCard';
import ReviewCard from '../../components/customer/ReviewCard';
import HeroVisual from '../../components/customer/HeroVisual';
import Button from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/LoadingSpinner';
import Seo, { localBusinessJsonLd } from '../../components/seo/Seo';
import { RevealHeading, FadeUp, Stagger, RiseItem, MotionText } from '../../animations/textReveal';
import { ContentAPI } from '../../services/api';
import { formatPKR } from '../../utils/format';

export default function Home() {
  const [banners, setBanners] = useState([]);
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ContentAPI.banners(),
      ContentAPI.services({ featured: 1 }),
      ContentAPI.packages(),
      ContentAPI.reviews({ top: 5 }),
      ContentAPI.settings(),
    ])
      .then(([b, s, p, r, st]) => {
        setBanners(b.data.data);
        setServices(s.data.data);
        setPackages(p.data.data.slice(0, 3));
        setReviews(r.data.data);
        setSettings(st.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-shell space-y-8 md:space-y-12">
      <Seo
        path="/"
        jsonLd={localBusinessJsonLd(settings)}
        description="Velour Men's Salon — top men's salon & barber shop in Faisalabad. Haircuts, skin fades, beard grooming & packages. Market Place 204, Canal Road. Book online or call 03007273029."
      />
      <section className="relative overflow-hidden rounded-[28px] border border-white/8 bg-gradient-to-br from-[#161616] via-ivory to-[#1a1814] px-5 py-8 sm:rounded-[40px] sm:px-8 sm:py-12 md:px-12 md:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(197,160,89,0.14),transparent_45%)]" />
        <div className="relative grid items-center gap-6 lg:grid-cols-2 lg:gap-8">
          <div>
            <MotionText
              text="Velour Men's Salon · Faisalabad"
              className="mb-3 text-xs uppercase tracking-[0.35em] text-gold sm:mb-4"
              mode="chars"
            />
            <RevealHeading className="font-display text-[clamp(2.6rem,9vw,4.8rem)] leading-[0.95] text-burgundy">
              Sharp cuts. Quiet confidence.
            </RevealHeading>
            <FadeUp delay={0.15}>
              <p className="mt-4 max-w-md text-sm text-muted sm:mt-5 sm:text-base">
                Best men&apos;s salon and barber shop on Canal Road, Faisalabad — book fades, classic cuts,
                beard work, and grooming packages online or walk in.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button as={Link} to="/booking">Book Appointment</Button>
                <Button as={Link} to="/services" variant="secondary">Explore services</Button>
              </div>
            </FadeUp>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 rounded-full bg-gold/10 blur-3xl" />
            <HeroVisual />
          </div>
        </div>
      </section>

      <FadeUp>
        {loading ? <Skeleton className="h-[280px] w-full sm:h-[320px]" /> : <BannerSlider banners={banners} />}
      </FadeUp>

      <section className="surface rounded-[28px] p-5 sm:rounded-[36px] sm:p-8 md:p-10">
        <FadeUp>
          <p className="text-xs uppercase tracking-[0.28em] text-gold">About Velour</p>
          <h2 className="section-title mt-2">Faisalabad&apos;s premium men&apos;s barber shop.</h2>
          <MotionText
            text={
              settings?.about_text ||
              "Velour is a top men's salon in Faisalabad for sharp cuts, precise fades, and grooming that feels intentional. Clean lines, skilled barbers, Canal Road convenience."
            }
            className="mt-4 max-w-3xl text-sm text-muted sm:text-base"
            delay={0.1}
          />
        </FadeUp>
      </section>

      <section className="surface rounded-[28px] p-5 sm:rounded-[36px] sm:p-8 md:p-10" aria-labelledby="featured-services">
        <div className="mb-6 flex items-end justify-between gap-3 sm:mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-gold">Featured services</p>
            <h2 id="featured-services" className="section-title">Signature cuts &amp; fades</h2>
          </div>
          <Button as={Link} to="/services" variant="ghost" className="hidden sm:inline-flex">View all</Button>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 xl:grid-cols-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-56 sm:h-80" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 xl:grid-cols-3">
            {services.map((s) => <ServiceCard key={s.id} service={s} />)}
          </div>
        )}
        <Button as={Link} to="/services" variant="secondary" className="mt-5 w-full sm:hidden">View all services</Button>
      </section>

      <section className="surface rounded-[28px] p-5 sm:rounded-[36px] sm:p-8 md:p-10">
        <div className="mb-6 sm:mb-8">
          <p className="text-xs uppercase tracking-[0.28em] text-gold">Packages</p>
          <h2 className="section-title">Complete looks</h2>
        </div>
        <Stagger className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {packages.map((pkg) => (
            <RiseItem key={pkg.id}>
              <article className="h-full rounded-[24px] border border-white/8 bg-nude/80 p-5 sm:rounded-[28px] sm:p-6">
                <h3 className="font-display text-2xl text-burgundy sm:text-3xl">{pkg.name}</h3>
                <p className="mt-2 text-sm text-muted">{pkg.description}</p>
                <p className="mt-4 text-sm text-muted line-through">{formatPKR(pkg.original_price)}</p>
                <p className="text-xl font-medium text-burgundy">{formatPKR(pkg.package_price)}</p>
                <p className="mt-1 text-sm text-gold">Save {formatPKR(pkg.savings)}</p>
                <Button as={Link} to={`/booking?package=${pkg.id}`} className="mt-5 w-full">Book Package</Button>
              </article>
            </RiseItem>
          ))}
        </Stagger>
      </section>

      <section className="surface rounded-[28px] p-5 sm:rounded-[36px] sm:p-8 md:p-10">
        <div className="mb-6 flex items-end justify-between gap-3 sm:mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-gold">Why clients choose Velour</p>
            <h2 className="section-title">Top feedback</h2>
          </div>
          <Button as={Link} to="/reviews" variant="ghost" className="hidden sm:inline-flex">All reviews</Button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
          {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
        </div>
        <Button as={Link} to="/reviews" variant="secondary" className="mt-5 w-full sm:hidden">All reviews</Button>
      </section>

      <section className="sr-only">
        <h2>Men&apos;s salon and barber shop in Faisalabad</h2>
        <p>
          Looking for the best men salon, men saloon, or top barber shops in Faisalabad and Pakistan?
          Velour Men&apos;s Salon at Market Place 204, Canal Road near Crumble offers professional haircuts,
          fades, beard trims, and grooming packages. Book Velour Salon online or call 03007273029.
          Email farizahmad112005@gmail.com.
        </p>
      </section>
    </div>
  );
}
