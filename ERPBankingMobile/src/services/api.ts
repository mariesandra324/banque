import { API_URL } from "@/constants/config";

let authToken: string | null = null;
let currentClientId: number | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (!token) currentClientId = null;
}

export function getAuthToken(): string | null {
  return authToken;
}

export function setCurrentClientId(clientId: number | null) {
  currentClientId = clientId;
}

export function getCurrentClientId(): number | null {
  return currentClientId;
}

function parseResponse<T>(response: Response): Promise<T> {
  return response.text().then((raw) => {
    const data = raw ? JSON.parse(raw) : null;
    if (!response.ok) {
      throw new Error(data?.message || "Une erreur est survenue.");
    }
    return data as T;
  });
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = authToken;
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    }
  );

  return parseResponse<T>(response);
}

export async function apiMultipartRequest<T>(
  endpoint: string,
  body: FormData
): Promise<T> {
  const token = authToken;
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers,
    body,
  });

  return parseResponse<T>(response);
}