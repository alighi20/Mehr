const API_BASE_URL = "http://localhost:3001/api";

export async function checkServer() {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error("خطا در ارتباط با سرور");
  }

  return response.json();
}
