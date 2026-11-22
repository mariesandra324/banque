import { Operation, OperationType } from "@/constants/types";

export type Period = "7j" | "mois" | "annee";

export interface ExpensePoint {
  label: string;
  value: number;
}

export interface CategorySlice {
  key: string;
  label: string;
  value: number;
  pct: number;
}

const DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

const MONTHS = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Août",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
];

const CATEGORY_LABELS: Record<OperationType, string> = {
  virement: "Virements",
  retrait: "Retraits",
  versement: "Dépôts",
  paiement: "Paiements",
};

function isExpense(o: Operation): boolean {
  return o.direction === "sortant";
}

function toTimestamp(o: Operation): number {
  return new Date(o.date).getTime();
}

function totalOf(operations: Operation[], start: number, end: number): number {
  return operations
    .filter((o) => {
      const t = toTimestamp(o);
      return t >= start && t < end;
    })
    .reduce((sum, o) => sum + o.amount, 0);
}

/** Bornes temporelles d'une période, alignées sur les buckets de `computeExpenseSeries`. */
function periodRange(period: Period, now = new Date()): { start: number; end: number } {
  if (period === "7j") {
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return { start: start.getTime(), end: start.getTime() + 7 * 86_400_000 };
  }

  if (period === "mois") {
    const year = now.getFullYear();
    const month = now.getMonth();
    return {
      start: new Date(year, month, 1).getTime(),
      end: new Date(year, month + 1, 1).getTime(),
    };
  }

  const year = now.getFullYear();
  return { start: new Date(year, 0, 1).getTime(), end: new Date(year + 1, 0, 1).getTime() };
}

export function computeExpenseSeries(
  operations: Operation[],
  period: Period,
  now = new Date()
): ExpensePoint[] {
  const expenses = operations.filter(isExpense);

  if (period === "7j") {
    const points: ExpensePoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const start = d.getTime();
      points.push({ label: DAYS[d.getDay()], value: totalOf(expenses, start, start + 86_400_000) });
    }
    return points;
  }

  if (period === "mois") {
    const year = now.getFullYear();
    const month = now.getMonth();
    const startMonth = new Date(year, month, 1).getTime();
    const startNext = new Date(year, month + 1, 1).getTime();
    const weeks = Math.ceil((startNext - startMonth) / (7 * 86_400_000));
    const points: ExpensePoint[] = [];
    for (let w = 1; w <= weeks; w++) {
      const start = startMonth + (w - 1) * 7 * 86_400_000;
      const end = Math.min(startMonth + w * 7 * 86_400_000, startNext);
      points.push({ label: `S${w}`, value: totalOf(expenses, start, end) });
    }
    return points;
  }

  // année : dépenses par mois
  const year = now.getFullYear();
  const points: ExpensePoint[] = [];
  for (let m = 0; m < 12; m++) {
    const start = new Date(year, m, 1).getTime();
    const end = new Date(year, m + 1, 1).getTime();
    points.push({ label: MONTHS[m], value: totalOf(expenses, start, end) });
  }
  return points;
}

export function computeCategoryTotals(
  operations: Operation[],
  period: Period,
  now = new Date()
): CategorySlice[] {
  const { start, end } = periodRange(period, now);
  const totals = new Map<string, number>();
  for (const o of operations) {
    if (!isExpense(o)) continue;
    const t = toTimestamp(o);
    if (t < start || t >= end) continue;
    totals.set(o.type, (totals.get(o.type) ?? 0) + o.amount);
  }
  const total = [...totals.values()].reduce((a, b) => a + b, 0);
  if (total <= 0) return [];

  return [...totals.entries()]
    .map(([key, value]) => ({
      key,
      label: CATEGORY_LABELS[key as OperationType] ?? "Autres",
      value,
      pct: Math.round((value / total) * 100),
    }))
    .sort((a, b) => b.value - a.value);
}

export function filterByAccount(
  operations: Operation[],
  accountId: string | null
): Operation[] {
  if (!accountId) return operations;
  return operations.filter((o) => o.accountId === accountId);
}