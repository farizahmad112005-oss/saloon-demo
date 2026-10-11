import { Link } from 'react-router-dom';
import { Clock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatPKR, mediaUrl } from '../../utils/format';
import Button from '../ui/Button';

export default function ServiceCard({ service }) {
  const inactive = !service.is_active;
  const discounted = service.discount
    ? Number(service.price) - Number(service.discount.amount)
    : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      className={`group flex h-full flex-col overflow-hidden rounded-[18px] border border-white/8 bg-nude/90 shadow-[0_20px_50px_rgba(0,0,0,0.35)] sm:rounded-[28px] ${inactive ? 'opacity-70' : ''}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={mediaUrl(service.image)}
          alt={service.name}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%23141414' width='800' height='600'/%3E%3C/svg%3E";
          }}
        />
        <span className="absolute left-2 top-2 max-w-[85%] truncate rounded-full bg-ivory/90 px-2 py-0.5 text-[10px] tracking-wide text-burgundy sm:left-4 sm:top-4 sm:px-3 sm:py-1 sm:text-xs">
          {service.category_name}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col space-y-2 p-3 sm:space-y-3 sm:p-5">
        <div className="min-w-0 space-y-1">
          <h3 className="break-words font-display text-base leading-snug text-burgundy sm:text-2xl">
            {service.name}
          </h3>
          {discounted != null ? (
            <p className="text-sm font-medium text-burgundy sm:text-base">
              <span className="mr-1.5 text-[11px] text-muted line-through sm:text-xs">
                {formatPKR(service.price)}
              </span>
              {formatPKR(discounted)}
            </p>
          ) : (
            <p className="text-sm font-medium text-burgundy sm:text-base">{formatPKR(service.price)}</p>
          )}
        </div>
        <p className="line-clamp-2 hidden text-sm text-muted sm:block">{service.description}</p>
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted sm:gap-4 sm:text-xs">
          <span className="inline-flex items-center gap-1">
            <Clock size={12} className="sm:hidden" />
            <Clock size={14} className="hidden sm:inline" />
            {service.duration_minutes} min
          </span>
          {service.discount ? (
            <span className="inline-flex items-center gap-1 text-gold">
              <Sparkles size={12} />
              <span className="hidden sm:inline">{service.discount.code}</span>
            </span>
          ) : null}
        </div>
        <div className="mt-auto pt-1">
          {inactive ? (
            <p className="rounded-xl bg-blush/40 px-2 py-1.5 text-[11px] text-burgundy sm:rounded-2xl sm:px-3 sm:py-2 sm:text-sm">
              Unavailable
            </p>
          ) : (
            <Button as={Link} to={`/booking?service=${service.id}`} className="w-full !px-3 !py-2 text-xs sm:!px-6 sm:!py-3 sm:text-sm">
              Book Now
            </Button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
