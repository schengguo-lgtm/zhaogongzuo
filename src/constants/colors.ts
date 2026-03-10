export const Colors = {
  primary: '#1E3A8A',       // deep blue
  primaryLight: '#3B5FC0',
  primaryDark: '#0F1F4D',
  secondary: '#F59E0B',     // amber (construction theme)
  secondaryLight: '#FCD34D',
  accent: '#10B981',        // green for success / available
  danger: '#EF4444',        // red for danger / rejected
  warning: '#F97316',       // orange for pending
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  border: '#E2E8F0',
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    disabled: '#94A3B8',
    inverse: '#FFFFFF',
  },
  map: {
    available: '#10B981',
    limited: '#F59E0B',
    full: '#EF4444',
    cluster: '#1E3A8A',
  },
} as const;
