import { HeroBackdrop } from './artwork'
import { ArrowRightIcon } from './icons'
import { sessionQuote } from './quotes'

interface HeroBannerProps {
  profileName: string
}

function HeroBanner({ profileName }: HeroBannerProps): React.JSX.Element {
  return (
    <section className="hero" aria-label="Welcome banner">
      <HeroBackdrop />
      <div className="hero-content">
        <h2 className="hero-title">Welcome back, {profileName}.</h2>
        <button type="button" className="cta-button">
          Open Today’s Plan <ArrowRightIcon size={15} />
        </button>
        <figure className="hero-quote">
          <span className="hero-quote-mark" aria-hidden="true">
            “
          </span>
          <blockquote>
            {sessionQuote.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </blockquote>
          <figcaption>{sessionQuote.attribution}</figcaption>
        </figure>
      </div>
    </section>
  )
}

export default HeroBanner
