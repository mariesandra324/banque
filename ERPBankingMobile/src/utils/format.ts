export function formatMoney(amount: number, currency = "MGA"): string {
  return `${amount.toLocaleString("fr-FR")} ${currency}`;
}

export function formatAr(amount: number): string {
  return `${amount.toLocaleString("fr-FR")} Ar`;
}

export function formatCompactAr(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} M`;
  if (amount >= 1_000) return `${Math.round(amount / 1_000)} k`;
  return `${amount}`;
}

export function maskNumber(value: string): string {
  const clean = value.replace(/\s/g, "");
  if (clean.length < 4) return value;
  return `•••• ${clean.slice(-4)}`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return `${date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })} à ${date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
}

export function formatRelativeDay(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Hier";
  return formatDate(iso);
}