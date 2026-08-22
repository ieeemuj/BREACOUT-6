const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://breacout-6-1.onrender.com";

function buildUrl(endpoint) {
  const cleanEndpoint = endpoint.replace(/^\/+/, "");
  return `${BASE_URL}/${cleanEndpoint}`;
}

async function handleResponse(response) {
  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      `Backend returned non-JSON (${response.status}): ${text.substring(0, 200)}`
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed with status ${response.status}`
    );
  }

  return data;
}

export async function get(endpoint) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(endpoint), {
    method: "GET",
    headers,
  });

  return handleResponse(response);
}

export async function post(endpoint, data = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(endpoint), {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}