import { BookOpen, Car, Clapperboard, HeartPulse, MoreHorizontal, Receipt, ShoppingBag, UtensilsCrossed, type LucideIcon } from "lucide-react";
import type { Category } from "./types";

export const CATEGORY_META: Record<Category, { icon: LucideIcon; color: string }> = {
  Food: { icon: UtensilsCrossed, color: "var(--chart-1)" },
  Travel: { icon: Car, color: "var(--chart-2)" },
  Shopping: { icon: ShoppingBag, color: "var(--chart-3)" },
  Bills: { icon: Receipt, color: "var(--chart-4)" },
  Education: { icon: BookOpen, color: "var(--chart-6)" },
  Entertainment: { icon: Clapperboard, color: "var(--chart-7)" },
  Healthcare: { icon: HeartPulse, color: "var(--chart-5)" },
  Others: { icon: MoreHorizontal, color: "var(--chart-8)" },
};
