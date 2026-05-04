export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export function monthLabel(month: string): string {
  const [year, m] = month.split("-");
  return `Tháng ${m}/${year}`;
}
