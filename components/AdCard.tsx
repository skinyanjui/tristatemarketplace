export type Ad = { id: string; advertiser: string; headline: string; detail: string; cta: string; href: string; image?: string };

// An outside ad only shares the listing card's outer shape; inside it is one full-bleed creative.
export function AdCard({ ad }: { ad: Ad }) {
  const external = /^https?:/.test(ad.href);
  const ext = external ? { target: "_blank", rel: "noopener noreferrer sponsored" } : {};
  return (
    <article className="card ad">
      <a href={ad.href} {...ext} className="ad-bleed" aria-label={`${ad.headline}. Ad from ${ad.advertiser}${external ? " (opens in a new tab)" : ""}`}>
        {ad.image
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={ad.image} alt="" loading="lazy" />
          : <span className="ad-art" aria-hidden="true">{ad.advertiser.slice(0, 1)}</span>}
        <span className="pill pill-tiny">Ad</span>
        <span className="ad-copy">
          <small>{ad.advertiser}</small>
          <strong>{ad.headline}</strong>
          <span className="ad-cta">{ad.cta}</span>
        </span>
      </a>
    </article>
  );
}
