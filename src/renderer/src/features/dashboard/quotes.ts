export interface Quote {
  lines: string[]
  attribution: string
}

export const quotePool: Quote[] = [
  {
    lines: ['Small daily wins.', 'Big future you.'],
    attribution: '— You, in the future'
  },
  {
    lines: ['Discipline is your edge.', 'Systems are your power.'],
    attribution: '— You, in the future'
  },
  {
    lines: ['You don’t rise to the level of your goals.', 'You fall to the level of your systems.'],
    attribution: '— James Clear'
  },
  {
    lines: ['How we spend our days is, of course,', 'how we spend our lives.'],
    attribution: '— Annie Dillard'
  },
  {
    lines: ['Focus on being productive', 'instead of busy.'],
    attribution: '— Tim Ferriss'
  },
  {
    lines: ['Consistency beats intensity.'],
    attribution: '— You, in the future'
  },
  {
    lines: ['Lock in.', 'Get in the zone.'],
    attribution: '— You, in the future'
  }
]

// Picked once at module load, so the quote changes each time the app is opened.
export const sessionQuote: Quote = quotePool[Math.floor(Math.random() * quotePool.length)]
