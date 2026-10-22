/**
 * Centralized API service — the ONLY place endpoint URLs and HTTP details live.
 *
 * Configure via environment variables (e.g. in a `.env` file):
 *   VITE_API_BASE_URL=https://your-backend.example.com
 *   VITE_CHAT_ENDPOINT=/api/chat      (optional, relative to base URL)
 *
 * When VITE_API_BASE_URL is NOT set, the app runs in clearly labeled DEMO MODE
 * using browser-local sample data. Demo data is never mixed with backend data.
 *
 * ⚠ PLACEHOLDERS TO CONFIRM WITH THE BACKEND DEVELOPER are marked "CONFIRM".
 */
import { demoExpenses } from "@/lib/expenses/mock";
import type { Expense, ExpenseInput } from "@/lib/expenses/types";

const BASE_URL = (import.meta.env["VITE_API_BASE_URL"] as string | undefined)?.replace(/\/$/, "") ?? "";

// CONFIRM: endpoint paths
export const ENDPOINTS = {
  expenses: "/api/expenses", // GET list, POST create
  expense: (id: string) => `/api/expenses/${encodeURIComponent(id)}`, // PUT update, DELETE remove
  chat: (import.meta.env["VITE_CHAT_ENDPOINT"] as string | undefined) ?? "/api/chat", // POST { message, history, context }
};

export const isDemoMode = !BASE_URL;

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(BASE_URL + path, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
  } catch {
    throw new ApiError("Cannot reach the backend server. Check that it is running.");
  }
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      msg = body?.message || body?.error || msg;
    } catch {
      /* ignore */
    }
    throw new ApiError(msg, res.status);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/**
 * CONFIRM: response shape. Accepts a raw array or a `{ data: [...] }` / `{ expenses: [...] }` wrapper,
 * and maps `_id` (MongoDB-style) to `id`.
 */
function normalizeExpense(raw: any): Expense {
  return {
    id: String(raw.id ?? raw._id ?? ""),
    amount: Number(raw.amount),
    category: raw.category,
    date: String(raw.date ?? "").slice(0, 10),
    remarks: String(raw.remarks ?? ""),
  };
}
function unwrapList(body: any): any[] {
  if (Array.isArray(body)) return body;
  return body?.data ?? body?.expenses ?? [];
}
function unwrapOne(body: any): any {
  return body?.data ?? body?.expense ?? body;
}

// ---------- Demo store (localStorage) ----------
const DEMO_KEY = "expense-tracker-demo-v1";
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));
function demoRead(): Expense[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(DEMO_KEY);
  if (!raw) {
    const seeded = demoExpenses();
    localStorage.setItem(DEMO_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
const demoWrite = (list: Expense[]) => localStorage.setItem(DEMO_KEY, JSON.stringify(list));

export function resetDemoData(empty = false) {
  demoWrite(empty ? [] : demoExpenses());
}

// ---------- Public API ----------
export const expenseApi = {
  async list(): Promise<Expense[]> {
    if (isDemoMode) {
      await delay();
      return demoRead();
    }
    return unwrapList(await request(ENDPOINTS.expenses)).map(normalizeExpense);
  },
  async create(input: ExpenseInput): Promise<Expense> {
    if (isDemoMode) {
      await delay();
      const e = { ...input, id: `local-${Date.now()}` };
      demoWrite([e, ...demoRead()]);
      return e;
    }
    return normalizeExpense(
      unwrapOne(await request(ENDPOINTS.expenses, { method: "POST", body: JSON.stringify(input) })),
    );
  },
  async update(id: string, input: ExpenseInput): Promise<Expense> {
    if (isDemoMode) {
      await delay();
      const e = { ...input, id };
      demoWrite(demoRead().map((x) => (x.id === id ? e : x)));
      return e;
    }
    // CONFIRM: PUT vs PATCH
    return normalizeExpense(
      unwrapOne(await request(ENDPOINTS.expense(id), { method: "PUT", body: JSON.stringify(input) })),
    );
  },
  async remove(id: string): Promise<void> {
    if (isDemoMode) {
      await delay();
      demoWrite(demoRead().filter((x) => x.id !== id));
      return;
    }
    await request(ENDPOINTS.expense(id), { method: "DELETE" });
  },
};

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * CONFIRM: chat request/response format.
 * Sends: { message, history: ChatMessage[], context: <analytics summary> }
 * Expects: { reply: string } (also accepts { message } or { response }).
 * The backend holds the Gemini/OpenAI key — never put it in the browser.
 */
export const chatApi = {
  async send(message: string, history: ChatMessage[], context: unknown): Promise<string> {
    const body = await request<any>(ENDPOINTS.chat, {
      method: "POST",
      body: JSON.stringify({ message, history, context }),
    });
    const reply = body?.reply ?? body?.message ?? body?.response;
    if (typeof reply !== "string") throw new ApiError("Unexpected response from assistant.");
    return reply;
  },
};
