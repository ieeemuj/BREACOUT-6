const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://breacout-6-1.onrender.com";

export async function get(endpoint) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${BASE_URL}/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Backend returned non-JSON: ${text.substring(0, 200)}`);
  }
}

export async function post(endpoint, data) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${BASE_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  });

  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Backend returned non-JSON: ${text.substring(0, 200)}`);
  }
}