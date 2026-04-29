export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://machine-backend-production.up.railway.app/";

export type SummaryPoint = {
  name: string;
  value: number;
};

export type DashboardSummary = {
  total_reviews: number;
  high_churn_intent: number;
  likely_retention: number;
  by_category: SummaryPoint[];
  by_subcategory: SummaryPoint[];
  trend: SummaryPoint[];
};

export type Review = {
  id: number;
  year: number | null;
  quarter: string | null;
  date: string | null;
  month: string | null;
  source: string | null;
  external_id: string | null;
  comment: string | null;
  sentiment: string | null;
  category: string | null;
  subcategory: string | null;
  product: string | null;
  detail: string | null;
  original_classification: string | null;
  predicted_classification: string | null;
  prediction_confidence: number | null;
  created_at: string;
};

export type CategoryOptions = {
  categories: string[];
  subcategories: string[];
  sentiments: string[];
  products: string[];
  classifications: string[];
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    ...init,
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Error de comunicacion con el backend");
  }
  return response.json() as Promise<T>;
}

export const api = {
  summary: () => request<DashboardSummary>("/dashboard-summary"),
  reviews: (query = "") => request<Review[]>(`/reviews${query}`),
  categories: () => request<CategoryOptions>("/categories"),
  predict: (payload: Record<string, string>) =>
    request<{
      predicted_classification: string;
      prediction_confidence: number | null;
      recommendation: string;
    }>("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  uploadCsv: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<{
      inserted: number;
      skipped: number;
      errors: number;
      error_details: string[];
      prediction_warnings: string[];
    }>("/upload-csv", {
      method: "POST",
      body: form,
    });
  },
};
