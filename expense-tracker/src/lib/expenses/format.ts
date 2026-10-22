const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

export const formatINR = (n: number) => inr.format(Number.isFinite(n) ? n : 0);

export const formatINRCompact = (n: number) => {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(1)}k`;
  return `₹${Math.round(n)}`;
};

export const formatDate = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return "Invalid date";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export const pct = (n: number) => `${n.toFixed(1)}%`;
