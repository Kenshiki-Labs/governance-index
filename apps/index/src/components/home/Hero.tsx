interface HeroProps {
  badge?: string;
  title: string;
  tagline: string;
}

export function Hero({ badge, title, tagline }: HeroProps) {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-3xl">
          {badge ? <div className="badge badge-outline mb-6">{badge}</div> : null}
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">{title}</h1>
          <p className="text-xl md:text-2xl opacity-80 leading-relaxed">{tagline}</p>
        </div>
      </div>
    </section>
  );
}
