export const getRemainingDays = (endDate?: string | null) => {
  if (!endDate) return 0;
  const diffTime = new Date(endDate).getTime() - Date.now();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};
