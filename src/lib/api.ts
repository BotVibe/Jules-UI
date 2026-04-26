import type {
  ListSourcesResponse,
  ListSessionsResponse,
  Session,
  CreateSessionRequest,
  ListActivitiesResponse
} from '../types/jules';

// Configurable constants. Defaults to official endpoints but could be overridden.
export const JULES_API_BASE_URL = import.meta.env.VITE_JULES_API_BASE_URL || 'https://jules.googleapis.com/v1alpha';

export class JulesApiError extends Error {
  public status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "JulesApiError";
  }
}

const getHeaders = (apiKey: string) => ({
  'x-goog-api-key': apiKey,
  'Content-Type': 'application/json',
});

async function fetchWithHandler<T>(url: string, options: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    throw new Error('Network error occurred while contacting Jules API.');
  }

  if (!response.ok) {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { error: { message: response.statusText } };
    }
    throw new JulesApiError(response.status, errorData?.error?.message || response.statusText);
  }

  // Some endpoints return empty 200 (like delete, approvePlan)
  if (response.status === 204) return {} as T;
  const text = await response.text();
  if (!text) return {} as T;

  return JSON.parse(text) as T;
}

export const getSources = async (apiKey: string, pageSize = 50, pageToken?: string): Promise<ListSourcesResponse> => {
  const url = new URL(`${JULES_API_BASE_URL}/sources`);
  url.searchParams.append('pageSize', pageSize.toString());
  if (pageToken) url.searchParams.append('pageToken', pageToken);

  return fetchWithHandler<ListSourcesResponse>(url.toString(), {
    method: 'GET',
    headers: getHeaders(apiKey),
  });
};

export const getSessions = async (apiKey: string, pageSize = 30, pageToken?: string): Promise<ListSessionsResponse> => {
  const url = new URL(`${JULES_API_BASE_URL}/sessions`);
  url.searchParams.append('pageSize', pageSize.toString());
  if (pageToken) url.searchParams.append('pageToken', pageToken);

  return fetchWithHandler<ListSessionsResponse>(url.toString(), {
    method: 'GET',
    headers: getHeaders(apiKey),
  });
};

export const createSession = async (apiKey: string, request: CreateSessionRequest): Promise<Session> => {
  return fetchWithHandler<Session>(`${JULES_API_BASE_URL}/sessions`, {
    method: 'POST',
    headers: getHeaders(apiKey),
    body: JSON.stringify(request),
  });
};

export const getSession = async (apiKey: string, sessionId: string): Promise<Session> => {
  return fetchWithHandler<Session>(`${JULES_API_BASE_URL}/sessions/${sessionId}`, {
    method: 'GET',
    headers: getHeaders(apiKey),
  });
};

export const getActivities = async (apiKey: string, sessionId: string, pageSize = 50, pageToken?: string): Promise<ListActivitiesResponse> => {
  const url = new URL(`${JULES_API_BASE_URL}/sessions/${sessionId}/activities`);
  url.searchParams.append('pageSize', pageSize.toString());
  if (pageToken) url.searchParams.append('pageToken', pageToken);

  return fetchWithHandler<ListActivitiesResponse>(url.toString(), {
    method: 'GET',
    headers: getHeaders(apiKey),
  });
};

export const sendMessage = async (apiKey: string, sessionId: string, prompt: string): Promise<void> => {
  await fetchWithHandler<void>(`${JULES_API_BASE_URL}/sessions/${sessionId}:sendMessage`, {
    method: "POST",
    headers: getHeaders(apiKey),
    body: JSON.stringify({ prompt }),
  });
};
