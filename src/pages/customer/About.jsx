import { useOutletContext } from 'react-router-dom';
import Seo from '../../components/seo/Seo';
import { FadeUp, MotionText } from '../../animations/textReveal';

const pillars = [
  { title: 'Barber craft', text: 'Cuts and fades built with precision — never rushed, always personal.' },
  { title: 'Skilled team', text: 'Barbers trained in modern fades, classic cuts, and clean finishes.' },
  { title: 'Premium products', text: 'Grooming formulas chosen for hold, shine, and scalp health.' },
  { title: 'Hygiene first', text: 'Sterilized tools and meticulous station standards every visit.' },
];

export default function About() {
  const { settings } = useOutletContext() || {};

  return (
    <div className="page-shell">
      <Seo
        title="About Velour"
        path="/about"
        description="About Velour Men's Salon in Faisalabad — premium barber shop for sharp cuts, fades, and beard grooming on Canal Road. Why clients choose Velour."
      />
      <p className="text-xs uppercase tracking-[0.28em] text-gold">About</p>
      <h1 className="page-title max-w-3xl">Where style meets precision.</h1>
      <FadeUp className="mt-6 max-w-3xl text-base text-muted sm:mt-8 sm:text-lg">
        <MotionText
          text={
            settings?.about_text ||
            "Velour is Faisalabad's premium men's hair salon and barber shop — sharp cuts, precise fades, and grooming that feels intentional at Market Place 204, Canal Road."
          }
        />
      </FadeUp>
      <p className="mt-4 max-w-3xl text-sm text-muted">
        Whether you searched for the best men salon, a trusted barber shop in Faisalabad, or Velour Salon by name —
        you&apos;re in the right chair.
      </p>
      <div className="mt-8 grid gap-4 sm:mt-12 sm:gap-5 md:grid-cols-2">
        {pillars.map((p) => (
          <FadeUp key={p.title} className="surface rounded-[24px] p-5 sm:rounded-[28px] sm:p-7">
            <h2 className="font-display text-2xl text-burgundy sm:text-3xl">{p.title}</h2>
            <p className="mt-2 text-sm text-muted sm:mt-3 sm:text-base">{p.text}</p>
          </FadeUp>
        ))}
      </div>
    </div>
  );
}
