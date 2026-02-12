const colors = {
  green: {
    bg: "var(--color-green-background)",
    text: "var(--color-text-green-dark)",
    colour: "var(--color-green)",
  },
  blue: {
    bg: "var(--color-green-background)",
    text: "var(--color-text-blue)",
    colour: "var(--color-primary)",
  },
  red: {
    bg: "var(--color-red-background)",
    text: "var(--color-text-red)",
    colour: "var(--color-red)",
  },
  brown: {
    bg: "var(--color-brown-background)",
    text: "var(--color-text-brown)",
    colour: "var(--color-brown)",
  },
  purple: {
    bg: "var(--color-purple-background)",
    text: "var(--color-text-blue)",
    colour: "var(--color-purple)",
  },
};

export const colorMap = {
  green: colors.green,
  verified: colors.green,
  blue: colors.blue,
  red: colors.red,
  flagged: colors.red,
  failed: colors.red,
  brown: colors.brown,
  pending: colors.brown,
  purple: colors.purple,
};
