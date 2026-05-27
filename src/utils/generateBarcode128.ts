export const generateBarcode128 = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");
  return `${timestamp}${random}`.slice(-13);
};
