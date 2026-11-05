import { Icon } from "./Icon";

export type Ad = { id: string; advertiser: string; headline: string; detail: string; cta: string; href: string; image?: string };

// An outside ad uses the same card shell, photo ratio and body height as a listing, so it never breaks the grid.
export function AdCard({ ad }: { ad: Ad }) {
  const external = /^https?:/.test(ad.href);
  const ext = external ? { target: "_blank", rel: "noopener noreferrer sponsored" } : {};
  return (
    <article className="card ad">
      <div className="card-photo">
        {ad.image
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={ad.image} alt="" loading="lazy" />
          : <div className="ad-art" aria-hidden="true">{ad.advertiser.slice(0, 1)}</div>}
        <a href={ad.href} {...ext} className="card-link" aria-label={`${ad.headline} (ad${external ? ", opens in a new tab" : ""})`} />
        <span className="pill pill-top pill-ad">Ad</span>
      </div>
      <div className="card-body">
        <h2 className="ctitle">{ad.headline}</h2>
        <p className="cfact">{ad.detail}</p>
        <div className="card-row">
          <a href={ad.href} {...ext} className="act" aria-label={`${ad.cta}: ${ad.headline}${external ? " (opens in a new tab)" : ""}`}>
            <span><Icon name="nav" size={16} color="#fff" />{ad.cta}</span>
          </a>
        </div>
        <div className="place"><span><b>{ad.advertiser}</b> · Ad</span></div>
      </div>
    </article>
  );
}
