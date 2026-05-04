import { useState } from 'react'
import type { EnrichedEntityCard } from '../lib/enrichEntities'

type Props = {
  card: EnrichedEntityCard
  formatTimeRange: (a: number, b: number) => string
}

export function EntitySourceCard({ card, formatTimeRange }: Props) {
  const [wikiImgOk, setWikiImgOk] = useState(true)
  const [unsplashImgOk, setUnsplashImgOk] = useState(true)
  const showMap = card.type === 'PLACE' && card.location

  return (
    <article className="entity-source-card">
      <header className="entity-source-card__head">
        <span className="entity-source-card__badge" data-entity-type={card.type}>
          {card.type}
        </span>
        <time className="entity-source-card__time">{formatTimeRange(card.start_sec, card.end_sec)}</time>
      </header>
      <h3 className="entity-source-card__title">{card.text}</h3>

      <div className="entity-source-card__cols">
        {card.wikipedia && (
          <section className="entity-source-card__block">
            <h4 className="entity-source-card__label">Wikipedia</h4>
            <div className="entity-source-card__wiki">
              {card.wikipedia.thumbnail && wikiImgOk ? (
                <img
                  src={card.wikipedia.thumbnail}
                  alt=""
                  className="entity-source-card__thumb"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() => setWikiImgOk(false)}
                />
              ) : null}
              <p className="entity-source-card__extract">{card.wikipedia.extract}</p>
              <a
                href={card.wikipedia.url}
                target="_blank"
                rel="noopener noreferrer"
                className="entity-source-card__link"
              >
                Open article →
              </a>
            </div>
          </section>
        )}

        {card.unsplash ? (
          <section className="entity-source-card__block">
            <h4 className="entity-source-card__label">Photo</h4>
            <div className="entity-source-card__unsplash">
              {unsplashImgOk ? (
                <img
                  src={card.unsplash.thumb_url || card.unsplash.image_url}
                  alt={card.unsplash.alt || `Photo related to ${card.text}`}
                  className="entity-source-card__thumb entity-source-card__thumb--unsplash"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() => setUnsplashImgOk(false)}
                />
              ) : null}
              <p className="entity-source-card__unsplash-credit">
                {card.unsplash.photographer_name ? (
                  <>
                    Photo by{' '}
                    {card.unsplash.photographer_url ? (
                      <a
                        href={card.unsplash.photographer_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {card.unsplash.photographer_name}
                      </a>
                    ) : (
                      card.unsplash.photographer_name
                    )}{' '}
                    on{' '}
                  </>
                ) : (
                  'Photo on '
                )}
                {card.unsplash.unsplash_url ? (
                  <a href={card.unsplash.unsplash_url} target="_blank" rel="noopener noreferrer">
                    Unsplash
                  </a>
                ) : (
                  'Unsplash'
                )}
              </p>
            </div>
          </section>
        ) : null}

        {showMap && card.location ? (
          <section className="entity-source-card__block">
            <h4 className="entity-source-card__label">Map</h4>
            <p className="entity-source-card__geo">{card.location.display_name}</p>
            <iframe
              title={`Map: ${card.text}`}
              className="entity-source-card__map"
              src={card.location.map_embed_url}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a
              href={card.location.openstreetmap_url}
              target="_blank"
              rel="noopener noreferrer"
              className="entity-source-card__link"
            >
              OpenStreetMap →
            </a>
          </section>
        ) : null}
      </div>

      {!card.wikipedia && !showMap && !card.unsplash && (
        <p className="entity-source-card__empty">No external matches for this tag.</p>
      )}
    </article>
  )
}
