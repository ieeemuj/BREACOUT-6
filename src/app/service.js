const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

function get(path) {
  return fetch(`${BASE_URL}/${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  }).then((response) => response.json())
}

function post(path, data) {

  console.log("BASE_URL:", BASE_URL);
  return fetch(`${BASE_URL}/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(data),
  }).then(async (response) => {
    const text = await response.text();

    console.log("STATUS:", response.status);
    console.log("URL:", response.url);
    console.log("RESPONSE:", text);

    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Backend returned non-JSON: ${text.substring(0, 200)}`);
    }
  });
}

export {get , post}
