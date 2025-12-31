// Helper: last N months as { month, date }
export const getLastNMonths = (n) => {
  const months = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      date: d,
      label: d.toLocaleString("vi-VN", { month: "short", year: "numeric" }),
    });
  }
  return months;
};