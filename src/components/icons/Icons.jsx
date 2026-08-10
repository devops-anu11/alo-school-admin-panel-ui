const svg = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export const GridIcon = (props) => (
  <svg {...svg} {...props}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
  </svg>
)

export const UserIcon = (props) => (
  <svg {...svg} {...props}>
    <circle cx="12" cy="8" r="3.4" />
    <path d="M4.8 20c.7-3.6 3.6-5.6 7.2-5.6s6.5 2 7.2 5.6" />
  </svg>
)

export const UsersIcon = (props) => (
  <svg {...svg} {...props}>
    <circle cx="9" cy="8.5" r="3" />
    <path d="M2.8 19.5c.6-3.1 3.1-4.9 6.2-4.9s5.6 1.8 6.2 4.9" />
    <path d="M15.5 5.9a3 3 0 0 1 0 5.2" />
    <path d="M17.8 14.9c1.8.6 3 2 3.4 4" />
  </svg>
)

export const CardIcon = (props) => (
  <svg {...svg} {...props}>
    <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
    <path d="M3 10h18" />
    <path d="M6.5 14.5h4" />
  </svg>
)

export const CalendarCheckIcon = (props) => (
  <svg {...svg} {...props}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M8 3v4M16 3v4M3.5 9.5h17" />
    <path d="m9.5 14.8 1.8 1.8 3.4-3.4" />
  </svg>
)

export const CalendarIcon = (props) => (
  <svg {...svg} {...props}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M8 3v4M16 3v4M3.5 9.5h17" />
  </svg>
)

export const BookIcon = (props) => (
  <svg {...svg} {...props}>
    <path d="M12 6.5c-1.7-1.4-4-2-8-2v13.6c4 0 6.3.6 8 2 1.7-1.4 4-2 8-2V4.5c-4 0-6.3.6-8 2Z" />
    <path d="M12 6.5v13.6" />
  </svg>
)

export const CapIcon = (props) => (
  <svg {...svg} {...props}>
    <path d="M12 4 2.5 9 12 14l9.5-5L12 4Z" />
    <path d="M6 11.2V16c0 1.4 2.7 2.6 6 2.6s6-1.2 6-2.6v-4.8" />
  </svg>
)

export const ChatIcon = (props) => (
  <svg {...svg} {...props}>
    <path d="M21 11.6c0 4-4 7.2-9 7.2-1 0-2-.1-2.9-.4L4 20l1.2-3.5C3.8 15.2 3 13.5 3 11.6c0-4 4-7.2 9-7.2s9 3.2 9 7.2Z" />
    <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" />
  </svg>
)

export const AlertIcon = (props) => (
  <svg {...svg} {...props}>
    <circle cx="12" cy="12" r="8.8" />
    <path d="M12 7.8v5" />
    <path d="M12 16.2h.01" />
  </svg>
)

export const HelpIcon = (props) => (
  <svg {...svg} {...props}>
    <circle cx="12" cy="12" r="8.8" />
    <path d="M9.6 9.3a2.5 2.5 0 0 1 4.9.7c0 1.7-2.5 2.1-2.5 3.5" />
    <path d="M12 16.6h.01" />
  </svg>
)

export const FileIcon = (props) => (
  <svg {...svg} {...props}>
    <path d="M13.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5L13.5 3Z" />
    <path d="M13.5 3v5.5H19" />
    <path d="M9 13h6M9 16.5h4" />
  </svg>
)

export const PlusIcon = (props) => (
  <svg {...svg} {...props}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const PowerIcon = (props) => (
  <svg {...svg} {...props}>
    <path d="M12 3.5v8" />
    <path d="M7 6.2a8 8 0 1 0 10 0" />
  </svg>
)

export const MenuIcon = (props) => (
  <svg {...svg} {...props}>
    <path d="M4 7h16M4 12h11M4 17h16" />
  </svg>
)

export const SearchIcon = (props) => (
  <svg {...svg} {...props}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-3.8-3.8" />
  </svg>
)

export const SunIcon = (props) => (
  <svg {...svg} {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
  </svg>
)

export const BellIcon = (props) => (
  <svg {...svg} {...props}>
    <path d="M18 10a6 6 0 1 0-12 0c0 4.5-1.8 6-1.8 6h15.6S18 14.5 18 10Z" />
    <path d="M10.2 19.5a2 2 0 0 0 3.6 0" />
  </svg>
)

export const ChevronDownIcon = (props) => (
  <svg {...svg} {...props}>
    <path d="m6 9.5 6 6 6-6" />
  </svg>
)

export const ChevronRightIcon = (props) => (
  <svg {...svg} {...props}>
    <path d="m9.5 6 6 6-6 6" />
  </svg>
)

export const ChevronLeftIcon = (props) => (
  <svg {...svg} {...props}>
    <path d="m14.5 6-6 6 6 6" />
  </svg>
)

export const ArrowLeftIcon = (props) => (
  <svg {...svg} {...props}>
    <path d="M19.5 12h-15" />
    <path d="m10.5 6-6 6 6 6" />
  </svg>
)

export const EyeIcon = (props) => (
  <svg {...svg} {...props}>
    <path d="M2.5 12S5.9 5.8 12 5.8 21.5 12 21.5 12 18.1 18.2 12 18.2 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3.2" />
  </svg>
)

export const ArrowRightIcon = (props) => (
  <svg {...svg} {...props}>
    <path d="M4.5 12h15" />
    <path d="m13.5 6 6 6-6 6" />
  </svg>
)

export const TrendIcon = (props) => (
  <svg {...svg} {...props}>
    <path d="M3 17.5 9.5 11l3.5 3.5L21 6.5" />
    <path d="M15.5 6.5H21v5.5" />
  </svg>
)

export const BarChartIcon = (props) => (
  <svg {...svg} {...props}>
    <path d="M5 20V12M12 20V5M19 20v-5" />
  </svg>
)

export const DownloadIcon = (props) => (
  <svg {...svg} {...props}>
    <path d="M12 3.5v11" />
    <path d="m7.5 10 4.5 4.5L16.5 10" />
    <path d="M4.5 20.5h15" />
  </svg>
)

export const LayersIcon = (props) => (
  <svg {...svg} {...props}>
    <path d="m12 3.5 9 4.5-9 4.5L3 8l9-4.5Z" />
    <path d="m3 12.5 9 4.5 9-4.5" />
    <path d="m3 17 9 4.5L21 17" />
  </svg>
)

export const EditIcon = (props) => (
  <svg {...svg} {...props}>
    <path d="M4 20h4.5L20 8.5a2.1 2.1 0 0 0-3-3L5.5 17 4 20Z" />
    <path d="m14.5 8 3 3" />
  </svg>
)

export const StarIcon = (props) => (
  <svg {...svg} {...props}>
    <path d="m12 3.5 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17.4l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3.5Z" />
  </svg>
)

export const CloseIcon = (props) => (
  <svg {...svg} {...props}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
)

export const TrashIcon = (props) => (
  <svg {...svg} {...props}>
    <path d="M4 7h16" />
    <path d="M9.5 7V4.8c0-.7.6-1.3 1.3-1.3h2.4c.7 0 1.3.6 1.3 1.3V7" />
    <path d="M6.2 7l.8 12c.1 1 .9 1.7 1.9 1.7h6.2c1 0 1.8-.7 1.9-1.7l.8-12" />
    <path d="M10 11.5v5M14 11.5v5" />
  </svg>
)

export const ClockIcon = (props) => (
  <svg {...svg} {...props}>
    <circle cx="12" cy="12" r="8.8" />
    <path d="M12 7.5V12l3 2.2" />
  </svg>
)

export const MoreVerticalIcon = (props) => (
  <svg {...svg} {...props}>
    <circle cx="12" cy="5.5" r="0.9" fill="currentColor" />
    <circle cx="12" cy="12" r="0.9" fill="currentColor" />
    <circle cx="12" cy="18.5" r="0.9" fill="currentColor" />
  </svg>
)

export const PhoneIcon = (props) => (
  <svg {...svg} {...props}>
    <path d="M5.5 4.5h3l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4 1.5v3c0 1-.9 1.8-1.9 1.6a17 17 0 0 1-13.1-13.1c-.2-1 .6-1.9 1.6-1.9Z" />
  </svg>
)

export const MailIcon = (props) => (
  <svg {...svg} {...props}>
    <rect x="3" y="5.5" width="18" height="13" rx="2.2" />
    <path d="m4 7 8 6 8-6" />
  </svg>
)

export const DropletIcon = (props) => (
  <svg {...svg} {...props}>
    <path d="M12 3s6.5 7 6.5 11.5a6.5 6.5 0 0 1-13 0C5.5 10 12 3 12 3Z" />
  </svg>
)

export const CalendarXIcon = (props) => (
  <svg {...svg} {...props}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M8 3v4M16 3v4M3.5 9.5h17" />
    <path d="m9.8 13.8 4.4 4.4M14.2 13.8l-4.4 4.4" />
  </svg>
)

export const PercentIcon = (props) => (
  <svg {...svg} {...props}>
    <circle cx="12" cy="12" r="8.8" />
    <path d="m8.5 15.5 7-7" />
    <circle cx="9.5" cy="9.5" r="0.6" fill="currentColor" />
    <circle cx="14.5" cy="14.5" r="0.6" fill="currentColor" />
  </svg>
)

export const FileSearchIcon = (props) => (
  <svg {...svg} {...props}>
    <path d="M13.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" />
    <path d="M13.5 3v5.5H19" />
    <circle cx="15.2" cy="16" r="3" />
    <path d="m19 19.8-1.8-1.8" />
  </svg>
)

export const CheckCircleIcon = (props) => (
  <svg {...svg} {...props}>
    <circle cx="12" cy="12" r="8.8" />
    <path d="m8.2 12.3 2.6 2.6 5-5.4" />
  </svg>
)

export const XCircleIcon = (props) => (
  <svg {...svg} {...props}>
    <circle cx="12" cy="12" r="8.8" />
    <path d="m9 9 6 6M15 9l-6 6" />
  </svg>
)

export const ShieldIcon = (props) => (
  <svg {...svg} {...props}>
    <path d="M12 2.8 4.8 5.9v5.6c0 4.3 3 8.2 7.2 9.7 4.2-1.5 7.2-5.4 7.2-9.7V5.9L12 2.8Z" />
  </svg>
)

export const InboxIcon = (props) => (
  <svg {...svg} {...props}>
    <path d="M4 12.5h4.3l1.4 2.4h4.6l1.4-2.4H20" />
    <path d="M5.4 5.5h13.2L20 12.5v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5L5.4 5.5Z" />
  </svg>
)

export const ExpandIcon = (props) => (
  <svg {...svg} {...props}>
    <path d="M14.5 3.5H20.5V9.5" />
    <path d="M9.5 20.5H3.5V14.5" />
    <path d="m20.5 3.5-6.5 6.5" />
    <path d="m3.5 20.5 6.5-6.5" />
  </svg>
)
