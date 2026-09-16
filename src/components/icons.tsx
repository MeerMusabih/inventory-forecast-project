import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function Base({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={18}
      height={18}
      {...props}
    >
      {children}
    </svg>
  )
}

export const IconDashboard = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="3" width="7.5" height="9" rx="2" />
    <rect x="13.5" y="3" width="7.5" height="5.5" rx="2" />
    <rect x="13.5" y="12" width="7.5" height="9" rx="2" />
    <rect x="3" y="15.5" width="7.5" height="5.5" rx="2" />
  </Base>
)

export const IconInventory = (p: IconProps) => (
  <Base {...p}>
    <path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z" />
    <path d="M3.5 7.5 12 12l8.5-4.5M12 12v9" />
  </Base>
)

export const IconForecast = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 17.5 8.5 12l3.5 3.5L21 6.5" />
    <path d="M15.5 6.5H21v5.5" />
  </Base>
)

export const IconTransfers = (p: IconProps) => (
  <Base {...p}>
    <path d="M2.5 7.5h10v8h-10z" />
    <path d="M12.5 10.5H17l3 3v2h-7.5" />
    <circle cx="6" cy="18" r="1.8" />
    <circle cx="16.5" cy="18" r="1.8" />
  </Base>
)

export const IconROP = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 12a8 8 0 1 1-2.34-5.66" />
    <path d="M20 3.5V8h-4.5" />
    <path d="M12 8v4.5l3 1.8" />
  </Base>
)

export const IconUpload = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 16V4" />
    <path d="m7 9 5-5 5 5" />
    <path d="M4 20h16" />
  </Base>
)

export const IconDownload = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 4v12" />
    <path d="m7 11 5 5 5-5" />
    <path d="M4 20h16" />
  </Base>
)

export const IconSearch = (p: IconProps) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </Base>
)

export const IconChevronDown = (p: IconProps) => (
  <Base {...p}>
    <path d="m6 9 6 6 6-6" />
  </Base>
)

export const IconCheck = (p: IconProps) => (
  <Base {...p}>
    <path d="m4.5 12.5 5 5 10-11" />
  </Base>
)

export const IconAlert = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3 2.5 20h19z" />
    <path d="M12 10v4.5M12 17.5h.01" />
  </Base>
)

export const IconSparkle = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3.5 13.8 9l5.5 1.8-5.5 1.8L12 18l-1.8-5.4L4.7 10.8 10.2 9z" />
  </Base>
)

export const IconBranch = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 21V6a1.5 1.5 0 0 1 1.5-1.5h9A1.5 1.5 0 0 1 16 6v15" />
    <path d="M16 10h2.5A1.5 1.5 0 0 1 20 11.5V21M2.5 21h19" />
    <path d="M7.5 8.5h4M7.5 12.5h4M7.5 16.5h4" />
  </Base>
)

export const IconPlus = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
)

export const IconClose = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Base>
)

export const IconCalendar = (p: IconProps) => (
  <Base {...p}>
    <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </Base>
)
