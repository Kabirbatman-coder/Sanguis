import axios from "axios";

export type SystemMode = "checking" | "online" | "offline";
export type RiskTier = "low" | "medium" | "high" | "critical";
export type InventoryStatus = "stable" | "watch" | "critical";

export interface InventoryItem {
  district: string;
  blood_group: string;
  current_stock_units: number;
  expiring_72h_units: number;
  usable_stock: number;
  status: InventoryStatus;
}

export interface DistrictOverview {
  name: string;
  totalAvailableUnits: number;
  expiringUnits: number;
  mostAtRiskBloodGroup: string;
  status: InventoryStatus;
}

export interface ForecastInput {
  date: string;
  state: string;
  district: string;
  blood_group: string;
  center_type: string;
  current_stock_units: number;
  expiring_72h_units: number;
  issued_last_7d_units: number;
  collected_last_7d_units: number;
  hospital_occupancy_pct: number;
  dengue_season_flag: number;
  holiday_flag: number;
}

export interface ForecastResult {
  demand_next_7d_pred: number;
  usable_stock: number;
  shortage_gap: number;
  shortage_risk_tier: RiskTier;
  model_name: string;
  mae: number;
}

export interface RecommendationAction {
  shortage_risk_tier: RiskTier;
  priority: string;
  title: string;
  description: string;
  recommended_action: string;
}

export interface RecommendationsResponse {
  shortage_risk_tier: RiskTier;
  district?: string | null;
  blood_group?: string | null;
  actions: RecommendationAction[];
}

const LOCAL_API_BASE_URL = "http://127.0.0.1:8000";
const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, "");

function isLocalBrowserHost(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return ["localhost", "127.0.0.1"].includes(window.location.hostname);
}

export const API_BASE_URL = configuredApiBaseUrl || (isLocalBrowserHost() ? LOCAL_API_BASE_URL : "");

function ensureApiBaseUrl(): void {
  if (API_BASE_URL) {
    return;
  }

  throw new Error("API base URL is not configured. Set VITE_API_BASE_URL to your deployed Render backend URL.");
}

const api = axios.create({
  baseURL: API_BASE_URL || undefined,
  timeout: 6000,
});

export async function getSystemHealth(): Promise<boolean> {
  if (!API_BASE_URL) {
    return false;
  }

  try {
    const response = await api.get<{ status: string }>("/health");
    return response.data.status === "ok";
  } catch {
    return false;
  }
}

export async function runForecast(payload: ForecastInput): Promise<ForecastResult> {
  ensureApiBaseUrl();

  try {
    const response = await api.post<ForecastResult>("/forecast", payload);
    return response.data;
  } catch {
    throw new Error("Forecast service is currently unavailable. Check the backend connection and try again.");
  }
}

export async function getRecommendations(params: {
  shortage_risk_tier: RiskTier;
  district: string;
  blood_group: string;
}): Promise<RecommendationsResponse> {
  ensureApiBaseUrl();

  try {
    const response = await api.get<RecommendationsResponse>("/recommendations", { params });
    return response.data;
  } catch {
    throw new Error("Recommendations are currently unavailable. Check the backend connection and try again.");
  }
}
