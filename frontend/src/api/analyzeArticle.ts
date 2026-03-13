import type { AnalysisResponse } from "../types/analysis";

const API_BASE_URL = "http://127.0.0.1:8000";

export async function analyzeArticle(url: string): Promise<AnalysisResponse> {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new Error(message);
  }

  return (await response.json()) as AnalysisResponse;
}

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { detail?: string };
    if (data.detail) {
      return data.detail;
    }
  } catch {
    return "The backend could not analyze that article.";
  }

  return "The backend could not analyze that article.";
}
