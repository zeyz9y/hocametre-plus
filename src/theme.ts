export const colors = {
  primary: "#0A2F5D",
  primaryLight: "#E9F0FF",
  secondary: "#C8102E",
  accent: "#4A6FA5",

  background: "#F5F7FA",
  backgroundAlt: "#FFFFFF",
  card: "#FFFFFF",

  border: "#D8DEE9",
  borderAlt: "#C5CCD6",

  text: "#192434",
  textSecondary: "#4A5568",
  textTertiary: "#718096",
  textInverse: "#FFFFFF",

  error: "#C8102E",
  errorAlt: "#E53E3E",
  success: "#38A169",
  warning: "#ECC94B",
  info: "#E9F0FF",

  disabled: "#EDF2F7",
  shadow: "rgba(10, 47, 93, 0.1)",
  placeholder: "#A0AEC0",
};

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 22,
};

export const fontWeights = {
  regular: "400" as "400",
  medium: "500" as "500",
  semiBold: "600" as "600",
  bold: "700" as "700",
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 32,
  full: 9999,
};

export const elevation = {
  none: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 2,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6.27,
    elevation: 8,
  },
  xl: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10.32,
    elevation: 12,
  },
};

export const typography = {
  fontFamily: {
    regular: "System",
    medium: "System-Medium",
    bold: "System-Bold",
  },
  heading: {
    h1: {
      fontSize: 32,
      lineHeight: 40,
      fontWeight: fontWeights.bold,
    },
    h2: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: fontWeights.bold,
    },
    h3: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: fontWeights.semiBold,
    },
    h4: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: fontWeights.semiBold,
    },
    h5: {
      fontSize: 18,
      lineHeight: 24,
      fontWeight: fontWeights.medium,
    },
  },
  body: {
    large: {
      fontSize: 18,
      lineHeight: 26,
    },
    medium: {
      fontSize: 16,
      lineHeight: 24,
    },
    small: {
      fontSize: 14,
      lineHeight: 20,
    },
    xsmall: {
      fontSize: 12,
      lineHeight: 16,
    },
  },
};

