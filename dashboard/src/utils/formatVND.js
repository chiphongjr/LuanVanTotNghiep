export function formatVND(number) {
  if (typeof number !== "number") return (number = 0);
  return number.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}
