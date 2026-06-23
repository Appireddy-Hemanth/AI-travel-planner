import { APIResponse } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Get the stored auth token from localStorage.
 */
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/**
 * Centralized fetch wrapper with auth headers and error handling.
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> {
  const token = getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data as APIResponse<T>;
}

// ─── Auth API ────────────────────────────────────────────────────────────────

export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  return apiFetch<never>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export async function loginUser(email: string, password: string) {
  return apiFetch<never>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe() {
  return apiFetch<never>('/auth/me');
}

// ─── Trips API ───────────────────────────────────────────────────────────────

export async function getTrips() {
  return apiFetch<never>('/trips');
}

export async function getTrip(id: string) {
  return apiFetch<never>(`/trips/${id}`);
}

export async function createTrip(data: {
  destination: string;
  durationDays: number;
  budgetTier: string;
  interests: string[];
}) {
  return apiFetch<never>('/trips', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTrip(id: string, data: Record<string, unknown>) {
  return apiFetch<never>(`/trips/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteTrip(id: string) {
  return apiFetch<never>(`/trips/${id}`, {
    method: 'DELETE',
  });
}

export async function regenerateDay(
  tripId: string,
  dayNumber: number,
  instructions: string
) {
  return apiFetch<never>(`/trips/${tripId}/regenerate-day`, {
    method: 'POST',
    body: JSON.stringify({ dayNumber, instructions }),
  });
}

export async function addDay(
  tripId: string,
  instructions?: string
) {
  return apiFetch<never>(`/trips/${tripId}/add-day`, {
    method: 'POST',
    body: JSON.stringify({ instructions }),
  });
}

export async function removeDay(tripId: string, dayNumber: number) {
  return apiFetch<never>(`/trips/${tripId}/remove-day`, {
    method: 'POST',
    body: JSON.stringify({ dayNumber }),
  });
}

export async function getPublicTrip(id: string) {
  return apiFetch<never>(`/trips/share/${id}`);
}

export async function addExpense(
  tripId: string,
  data: { category: string; amount: number; description?: string; date?: string }
) {
  return apiFetch<never>(`/trips/${tripId}/expenses`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteExpense(tripId: string, expenseId: string) {
  return apiFetch<never>(`/trips/${tripId}/expenses/${expenseId}`, {
    method: 'DELETE',
  });
}
