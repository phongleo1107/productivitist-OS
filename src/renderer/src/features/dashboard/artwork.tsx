// Decorative SVG art standing in for the mockup's raster images.
// Real image assets (and user-provided pictures) arrive with Task 11 customization.

export function AvatarArt(): React.JSX.Element {
  return (
    <svg viewBox="0 0 160 160" role="img" aria-label="Profile picture placeholder">
      <defs>
        <linearGradient id="av-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#241a3a" />
          <stop offset="1" stopColor="#120d1e" />
        </linearGradient>
      </defs>
      <rect width="160" height="160" fill="url(#av-bg)" />
      <circle cx="80" cy="76" r="52" fill="#8b5cf6" opacity="0.08" />
      <g stroke="#6d5aa8" strokeWidth="1" opacity="0.25">
        <path d="M30 12v18" />
        <path d="M70 6v14" />
        <path d="M120 14v20" />
        <path d="M143 34v14" />
        <path d="M48 40v12" />
      </g>
      <g fill="#0b0813">
        <path d="M80 76c-27 0-44 22-48 54l-3 30h102l-3-30c-4-32-21-54-48-54z" />
        <path d="M80 24c-38 6-60 26-66 42h132c-6-16-28-36-66-42z" />
      </g>
      <path d="M16 66h128" stroke="#8b5cf6" strokeWidth="2" opacity="0.55" />
      <path
        d="M46 128 18 150"
        stroke="#6d5aa8"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  )
}

export function RankBadge(): React.JSX.Element {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="Rank badge">
      <defs>
        <linearGradient id="rb-shield" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a2f5a" />
          <stop offset="1" stopColor="#1a1428" />
        </linearGradient>
      </defs>
      <path
        d="M32 6 54 14v16c0 14-9 24-22 28C19 54 10 44 10 30V14z"
        fill="url(#rb-shield)"
        stroke="#7c62c9"
        strokeWidth="2"
      />
      <path d="M32 20 44 32 32 48 20 32z" fill="#a78bfa" />
      <path d="M32 20v28M20 32h24" stroke="#7c62c9" strokeWidth="1.5" opacity="0.7" />
    </svg>
  )
}

export function HeroBackdrop(): React.JSX.Element {
  return (
    <svg
      className="hero-backdrop"
      viewBox="0 0 1200 460"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hb-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#251840" />
          <stop offset="0.6" stopColor="#170f28" />
          <stop offset="1" stopColor="#0d0916" />
        </linearGradient>
        <radialGradient id="hb-glow">
          <stop offset="0" stopColor="#8b5cf6" stopOpacity="0.32" />
          <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
        </radialGradient>
        <pattern id="hb-win" width="16" height="22" patternUnits="userSpaceOnUse">
          <rect x="4" y="5" width="4" height="7" fill="#b391ff" opacity="0.22" />
        </pattern>
        <pattern id="hb-win2" width="20" height="26" patternUnits="userSpaceOnUse">
          <rect x="6" y="7" width="5" height="8" fill="#e879f9" opacity="0.1" />
        </pattern>
      </defs>
      <rect width="1200" height="460" fill="url(#hb-sky)" />
      <ellipse cx="700" cy="240" rx="520" ry="260" fill="url(#hb-glow)" />
      <g fill="#1b1330">
        <g id="hb-city">
          <rect x="0" y="150" width="70" height="310" />
          <rect x="80" y="110" width="55" height="350" />
          <rect x="150" y="180" width="80" height="280" />
          <rect x="240" y="90" width="60" height="370" />
          <rect x="310" y="160" width="70" height="300" />
          <rect x="390" y="120" width="55" height="340" />
          <rect x="460" y="190" width="90" height="270" />
          <rect x="560" y="100" width="65" height="360" />
          <rect x="640" y="150" width="75" height="310" />
          <rect x="730" y="80" width="60" height="380" />
          <rect x="800" y="140" width="85" height="320" />
          <rect x="900" y="110" width="60" height="350" />
          <rect x="970" y="170" width="80" height="290" />
          <rect x="1060" y="120" width="70" height="340" />
          <rect x="1140" y="160" width="60" height="300" />
        </g>
      </g>
      <use href="#hb-city" fill="url(#hb-win)" />
      <g fill="#120c20">
        <g id="hb-city2">
          <rect x="0" y="260" width="120" height="200" />
          <rect x="140" y="300" width="150" height="160" />
          <rect x="300" y="240" width="110" height="220" />
          <rect x="430" y="310" width="160" height="150" />
          <rect x="610" y="270" width="130" height="190" />
          <rect x="760" y="320" width="170" height="140" />
          <rect x="950" y="260" width="120" height="200" />
          <rect x="1080" y="300" width="120" height="160" />
        </g>
      </g>
      <use href="#hb-city2" fill="url(#hb-win2)" />
      <g>
        <rect
          x="872"
          y="60"
          width="52"
          height="238"
          rx="10"
          fill="none"
          stroke="#e879f9"
          strokeWidth="6"
          opacity="0.12"
        />
        <rect
          x="876"
          y="64"
          width="44"
          height="230"
          rx="8"
          fill="#170f28"
          stroke="#e879f9"
          strokeWidth="2"
          opacity="0.9"
        />
        <g stroke="#e879f9" strokeWidth="3" strokeLinecap="round" opacity="0.85">
          <path d="M888 92h20" />
          <path d="M898 86v22" />
          <path d="M890 132h16" />
          <path d="m892 126 12 16" />
          <path d="m904 126-12 16" />
          <path d="M888 172h20" />
          <path d="M898 166v28" />
          <path d="M890 218h16" />
          <path d="M898 212v26" />
          <path d="M890 256h16" />
        </g>
      </g>
      <g>
        <circle cx="660" cy="300" r="110" fill="#8b5cf6" opacity="0.07" />
        <rect x="0" y="430" width="1200" height="30" fill="#0a0712" />
        <g fill="#08060f">
          <circle cx="660" cy="268" r="42" />
          <path d="M660 306c-72 0-108 42-112 78h224c-4-36-40-78-112-78z" />
        </g>
        <path
          d="M620 252c8-30 72-30 80 0"
          stroke="#1b1330"
          strokeWidth="9"
          fill="none"
          strokeLinecap="round"
        />
        <rect x="611" y="248" width="13" height="32" rx="6" fill="#1b1330" />
        <rect x="696" y="248" width="13" height="32" rx="6" fill="#1b1330" />
        <ellipse cx="842" cy="356" rx="44" ry="16" fill="#f0abfc" opacity="0.06" />
        <g>
          <rect
            x="488"
            y="316"
            width="96"
            height="62"
            rx="5"
            fill="#100c1c"
            stroke="#7c62c9"
            strokeWidth="2"
          />
          <rect x="496" y="324" width="80" height="46" fill="#8b5cf6" opacity="0.3" />
          <rect x="528" y="378" width="16" height="8" fill="#0a0712" />
        </g>
        <rect x="400" y="384" width="520" height="14" rx="4" fill="#0c0915" />
        <rect x="420" y="398" width="480" height="32" fill="#0a0712" />
        <rect x="760" y="358" width="20" height="26" rx="3" fill="#0c0915" />
        <path d="m822 384 14-38" stroke="#241a3a" strokeWidth="6" strokeLinecap="round" />
        <circle cx="838" cy="342" r="9" fill="#151022" />
      </g>
    </svg>
  )
}
