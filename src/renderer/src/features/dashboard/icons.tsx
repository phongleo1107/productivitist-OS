interface IconProps {
  size?: number
}

function IconBase({
  size = 20,
  children
}: IconProps & { children: React.ReactNode }): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function TargetIcon(props: IconProps): React.JSX.Element {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="1.5" />
      <path d="M12 4V2" />
      <path d="M12 22v-2" />
      <path d="M4 12H2" />
      <path d="M22 12h-2" />
    </IconBase>
  )
}

export function HabitIcon(props: IconProps): React.JSX.Element {
  return (
    <IconBase {...props}>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="m8.5 12 2.5 2.5 5-5" />
    </IconBase>
  )
}

export function BrainIcon(props: IconProps): React.JSX.Element {
  return (
    <IconBase {...props}>
      <path d="M12 4c-1.5-1.6-4-1.3-5 .4-2-.4-3.6 1.1-3.3 3.1-1.6 1-1.6 3.6 0 4.6-.3 2 1.3 3.5 3.3 3.6.3 1.8 2.4 2.8 4 2z" />
      <path d="M12 4c1.5-1.6 4-1.3 5 .4 2-.4 3.6 1.1 3.3 3.1 1.6 1 1.6 3.6 0 4.6.3 2-1.3 3.5-3.3 3.6-.3 1.8-2.4 2.8-4 2z" />
      <path d="M12 4v14" />
    </IconBase>
  )
}

export function SettingsIcon(props: IconProps): React.JSX.Element {
  return (
    <IconBase {...props}>
      <path d="M4 7h9" />
      <circle cx="17" cy="7" r="2.5" />
      <path d="M20 17h-9" />
      <circle cx="7" cy="17" r="2.5" />
    </IconBase>
  )
}

export function PencilIcon(props: IconProps): React.JSX.Element {
  return (
    <IconBase {...props}>
      <path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
    </IconBase>
  )
}

export function ClockIcon(props: IconProps): React.JSX.Element {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </IconBase>
  )
}

export function ArrowRightIcon(props: IconProps): React.JSX.Element {
  return (
    <IconBase {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </IconBase>
  )
}

export function TrendUpIcon(props: IconProps): React.JSX.Element {
  return (
    <IconBase {...props}>
      <path d="m3 17 6-6 4 4 8-8" />
      <path d="M14 7h7v7" />
    </IconBase>
  )
}

export function BellIcon(props: IconProps): React.JSX.Element {
  return (
    <IconBase {...props}>
      <path d="M18 9a6 6 0 0 0-12 0c0 6-2 7-2 7h16s-2-1-2-7" />
      <path d="M10 20a2.2 2.2 0 0 0 4 0" />
    </IconBase>
  )
}

export function PaletteIcon(props: IconProps): React.JSX.Element {
  return (
    <IconBase {...props}>
      <path d="M12 3a9 9 0 1 0 0 18h1.5a2.5 2.5 0 0 0 0-5H12a2 2 0 0 1-1.4-3.4A9 9 0 0 0 12 3z" />
      <circle cx="8" cy="10" r="0.5" />
      <circle cx="12" cy="7.5" r="0.5" />
      <circle cx="16" cy="10" r="0.5" />
    </IconBase>
  )
}

export function ChartIcon(props: IconProps): React.JSX.Element {
  return (
    <IconBase {...props}>
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-8" />
      <path d="M22 20H2" />
    </IconBase>
  )
}

export function ExitIcon(props: IconProps): React.JSX.Element {
  return (
    <IconBase {...props}>
      <path d="M14 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8" />
      <path d="M20 12H9" />
      <path d="m16 8 4 4-4 4" />
    </IconBase>
  )
}
