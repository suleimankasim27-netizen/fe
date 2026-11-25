const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

export function getToken() {
  return localStorage.getItem("evaluator_token");
}

export function setToken(token) {
  if (token) localStorage.setItem("evaluator_token", token);
  else localStorage.removeItem("evaluator_token");
}

export async function api(path, { method = "GET", body, token, headers } = {}) {
  const auth = token ?? getToken();
  const res = await fetch(`${API_URL}${path}`, {
    method,
    cache: "no-store",
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("text/csv")) {
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Export failed.");
    }
    return res.blob();
  }

  const data = contentType.includes("application/json") ? await res.json() : null;
  if (!res.ok) {
    const error = new Error(data?.error || "Something went wrong. Please try again.");
    error.code = data?.code;
    error.status = res.status;
    throw error;
  }
  return data;
}

export const authApi = {
  signup: (payload) => api("/api/auth/signup", { method: "POST", body: payload, token: null }),
  login: (payload) => api("/api/auth/login", { method: "POST", body: payload, token: null }),
  me: () => api("/api/auth/me"),
  updateMe: (payload) => api("/api/auth/me", { method: "PUT", body: payload }),
};

export const dashboardApi = () => api("/api/dashboard");

export const eventsApi = {
  list: () => api("/api/events"),
  create: (payload) => api("/api/events", { method: "POST", body: payload }),
  get: (id) => api(`/api/events/${id}`),
  update: (id, payload) => api(`/api/events/${id}`, { method: "PUT", body: payload }),
  remove: (id) => api(`/api/events/${id}`, { method: "DELETE" }),
  teams: (eventId, q) => api(`/api/events/${eventId}/teams${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  createTeam: (eventId, payload) => api(`/api/events/${eventId}/teams`, { method: "POST", body: payload }),
  evaluators: (eventId) => api(`/api/events/${eventId}/evaluators`),
  createEvaluator: (eventId, payload) =>
    api(`/api/events/${eventId}/evaluators`, { method: "POST", body: payload }),
  criteria: (eventId) => api(`/api/events/${eventId}/criteria`),
  createCriterion: (eventId, payload) =>
    api(`/api/events/${eventId}/criteria`, { method: "POST", body: payload }),
  assignments: (eventId) => api(`/api/events/${eventId}/assignments`),
  createAssignments: (eventId, payload) =>
    api(`/api/events/${eventId}/assignments`, { method: "POST", body: payload }),
  replaceAssignments: (eventId, evaluatorId, payload) =>
    api(`/api/events/${eventId}/evaluators/${evaluatorId}/assignments`, {
      method: "PUT",
      body: payload,
    }),
  results: (eventId) => api(`/api/events/${eventId}/results`),
  rankings: (eventId, includeIncomplete) =>
    api(
      `/api/events/${eventId}/rankings${includeIncomplete ? "?includeIncomplete=true" : ""}`
    ),
  teamResults: (eventId, teamId) => api(`/api/events/${eventId}/teams/${teamId}/results`),
  exportUrl: (eventId, detailed) =>
    `${API_URL}/api/events/${eventId}/export${detailed ? "?detailed=true" : ""}`,
};

export async function downloadExport(eventId, detailed) {
  const token = getToken();
  const res = await fetch(eventsApi.exportUrl(eventId, detailed), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Export failed.");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = detailed ? "results-detailed.csv" : "results.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export const teamsApi = {
  update: (id, payload) => api(`/api/teams/${id}`, { method: "PUT", body: payload }),
  remove: (id) => api(`/api/teams/${id}`, { method: "DELETE" }),
  all: () => api("/api/teams"),
};

export const evaluatorsApi = {
  all: () => api("/api/evaluators"),
  update: (id, payload) => api(`/api/evaluators/${id}`, { method: "PUT", body: payload }),
  remove: (id) => api(`/api/evaluators/${id}`, { method: "DELETE" }),
  sendLink: (id) => api(`/api/evaluators/${id}/send-link`, { method: "POST" }),
  resendLink: (id) => api(`/api/evaluators/${id}/resend-link`, { method: "POST" }),
  revokeLink: (id) => api(`/api/evaluators/${id}/revoke-link`, { method: "POST" }),
  regenerateLink: (id) => api(`/api/evaluators/${id}/regenerate-link`, { method: "POST" }),
};

export const criteriaApi = {
  update: (id, payload) => api(`/api/criteria/${id}`, { method: "PUT", body: payload }),
  remove: (id) => api(`/api/criteria/${id}`, { method: "DELETE" }),
};

export const evaluateApi = {
  session: (token) => api(`/api/evaluate/${token}`, { token: null }),
  team: (token, teamId) => api(`/api/evaluate/${token}/teams/${teamId}`, { token: null }),
  submit: (token, teamId, payload) =>
    api(`/api/evaluate/${token}/teams/${teamId}`, { method: "POST", body: payload, token: null }),
};

export const evaluationsApi = {
  all: () => api("/api/evaluations"),
};
