const colors = {
  green: {
    bg: "var(--color-green-background)",
    text: "var(--color-text-green-dark)",
    colour: "var(--color-green)",
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
};

export const colorMap = {
  green: colors.green,
  verified: colors.green,
  red: colors.red,
  flagged: colors.red,
  failed: colors.red,
  brown: colors.brown,
  pending: colors.brown,
};
