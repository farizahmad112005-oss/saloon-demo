import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ContentAPI } from '../../services/api';
import { formatPKR, mediaUrl } from '../../utils/format';
import { FadeUp } from '../../animations/textReveal';
import Seo from '../../components/seo/Seo';

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ContentAPI.packages()
      .then((r) => setPackages(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-shell">
      <Seo
        title="Grooming Packages"
        path="/packages"
        description="Complete men's grooming packages at Velour Salon Faisalabad — save on cuts, fades, and beard work. Book online."
      />
      <FadeUp>
        <p className="text-xs uppercase tracking-[0.28em] text-gold">Packages</p>
        <h1 className="page-title">Complete grooming looks.</h1>
      </FadeUp>
      <div className="mt-8 grid gap-5 sm:mt-10 sm:gap-8">
        {packages.map((pkg) => (
          <FadeUp key={pkg.id}>
            <article className="grid overflow-hidden rounded-[24px] bg-blush shadow-lg sm:rounded-[32px] lg:grid-cols-2">
              <img
                src={mediaUrl(pkg.image)}
                alt={pkg.name}
                className="h-48 w-full object-cover sm:h-64 lg:h-full lg:min-h-[280px]"
                onError={(e) => {
                  e.currentTarget.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%23141414' width='800' height='600'/%3E%3C/svg%3E";
                }}
              />
              <div className="p-5 sm:p-8">
                <h2 className="font-display text-[clamp(1.75rem,5vw,2.5rem)] text-burgundy">{pkg.name}</h2>
                <p className="mt-2 text-sm text-muted sm:mt-3 sm:text-base">{pkg.description}</p>
                <ul className="mt-4 space-y-2 text-sm text-ink sm:mt-5">
                  {pkg.services?.map((s) => (
                    <li key={s.id} className="flex justify-between gap-3 border-b border-blush/40 py-2">
                      <span>{s.name}</span>
                      <span className="shrink-0 text-muted">{formatPKR(s.price)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap items-end justify-between gap-4 sm:mt-6">
                  <div>
                    <p className="text-sm text-muted line-through">{formatPKR(pkg.original_price)}</p>
                    <p className="text-2xl font-medium text-burgundy">{formatPKR(pkg.package_price)}</p>
                    <p className="text-sm text-gold">You save {formatPKR(pkg.savings)}</p>
                  </div>
                  <Button as={Link} to={`/booking?package=${pkg.id}`} className="w-full sm:w-auto">Book Package</Button>
                </div>
              </div>
            </article>
          </FadeUp>
        ))}
      </div>
    </div>
  );
}
