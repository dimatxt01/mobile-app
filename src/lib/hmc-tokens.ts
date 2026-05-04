export const scale = {
  xs: 4, sm: 8, md: 12, lg: 16,
  xl: 20, xl2: 24, xl3: 32, xl4: 40,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  full: 999,
} as const;

export const typo = {
  d1: { fontSize: 28, lineHeight: 34, letterSpacing: -0.4 },
  d2: { fontSize: 22, lineHeight: 28, letterSpacing: -0.2 },
  d3: { fontSize: 18, lineHeight: 24, letterSpacing: -0.1 },
  b1: { fontSize: 17, lineHeight: 24 },
  b2: { fontSize: 15, lineHeight: 22 },
  b3: { fontSize: 13, lineHeight: 18 },
  m1: { fontSize: 14, letterSpacing: 1.2 },
  m2: { fontSize: 11, letterSpacing: 1.5 },
  m3: { fontSize: 10, letterSpacing: 1.5 },
  m4: { fontSize: 9, letterSpacing: 1.8 },
} as const;

export const elevation = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.30,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.40,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.50,
    shadowRadius: 16,
    elevation: 8,
  },
  amber: {
    shadowColor: '#FFB020',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 20,
    elevation: 8,
  },
} as const;
