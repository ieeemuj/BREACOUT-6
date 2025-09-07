const BASE_URL = 'https://breacout-backend.vercel.app';
// const BASE_URL = 'http://localhost:3000';

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
  return fetch(`${BASE_URL}/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(data),
  }).then((response) => response.json())
}

export {get , post}
