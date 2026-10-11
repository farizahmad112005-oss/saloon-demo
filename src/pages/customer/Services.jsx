import { useEffect, useMemo, useState } from 'react';
import ServiceCard from '../../components/customer/ServiceCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { ContentAPI } from '../../services/api';
import { FadeUp } from '../../animations/textReveal';
import Seo from '../../components/seo/Seo';

export default function Services() {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [active, setActive] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([ContentAPI.categories(), ContentAPI.services()])
      .then(([c, s]) => {
        setCategories(c.data.data);
        setServices(s.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (active === 'all') return services;
    return services.filter((s) => String(s.category_id) === String(active));
  }, [services, active]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-shell">
      <Seo
        title="Men's Haircut & Grooming Services"
        path="/services"
        description="Haircuts, skin fades, beard grooming, color & treatments at Velour Men's Salon Faisalabad. Book the best barber shop services on Canal Road."
      />
      <FadeUp>
        <p className="text-xs uppercase tracking-[0.28em] text-gold">Services</p>
        <h1 className="page-title">Cuts, fades, and grooming — done right.</h1>
      </FadeUp>
      <div className="edge-fade-x snap-x-row hide-scrollbar mt-6 -mx-1 px-1 sm:mt-8">
        <button
          type="button"
          onClick={() => setActive('all')}
          className={`min-h-[44px] whitespace-nowrap rounded-full px-4 py-2 text-sm ${
            active === 'all' ? 'bg-gold text-black' : 'bg-nude text-champagne'
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActive(c.id)}
            className={`min-h-[44px] whitespace-nowrap rounded-full px-4 py-2 text-sm ${
              active === c.id ? 'bg-gold text-black' : 'bg-nude text-champagne'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
      {!filtered.length ? (
        <div className="mt-10"><EmptyState title="No services found" description="Try another category." /></div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-6 xl:grid-cols-3">
          {filtered.map((s) => <ServiceCard key={s.id} service={s} />)}
        </div>
      )}
    </div>
  );
}
