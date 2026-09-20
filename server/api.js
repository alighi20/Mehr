const API_URL = "http://localhost:3001/api";

export async function checkServer() {
  const response = await fetch(`${API_URL}/health`);

  if (!response.ok) {
    throw new Error(`خطای سرور: ${response.status}`);
  }

  return response.json();
}
