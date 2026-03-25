/**
 * Formats a number with thousand separators.
 * Example: 1000 -> 1,000
 */
export const formatNumber = (value: number | string | undefined | null): string => {
  if (value === undefined || value === null || value === "") return "0";
  const num = typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
  if (isNaN(num)) return "0";
  return new Intl.NumberFormat("en-US").format(num);
};

/**
 * Parses a formatted string back to a number.
 * Example: "1,000" -> 1000
 */
export const parseNumber = (value: string): number => {
  if (!value) return 0;
  const num = parseFloat(value.replace(/,/g, ""));
  return isNaN(num) ? 0 : num;
};
