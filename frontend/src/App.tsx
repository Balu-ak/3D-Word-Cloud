import { useState } from "react";

import { analyzeArticle } from "./api/analyze";
import InsightPanel from "./components/InsightPanel";
import UrlForm from "./components/UrlForm";
import WordCloudStage from "./components/WordCloudStage";
import type { AnalysisResponse } from "./types";

const SAMPLE_ARTICLES = [
  {
    label: "Low Earth Orbit",
    url: "https://www.nasa.gov/news-release/nasa-finalizes-strategy-for-sustaining-human-presence-in-low-earth-orbit/",
  },
  {
    label: "Starliner Report",
    url: "https://www.nasa.gov/news-release/nasa-releases-report-on-starliner-crewed-flight-test-investigation/",
  },
  {
    label: "Spinoff 2025",
    url: "https://www.nasa.gov/news-release/nasas-advancements-in-space-continue-generating-products-on-earth/",
  },
];

export default function App() {
  const [url, setUrl] = useState(SAMPLE_ARTICLES[0].url);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleAnalyze() {
    setIsLoading(true);
    setError(null);

    try {
      const result = await analyzeArticle(url);
      setAnalysis(result);
    } catch (requestError) {
      setAnalysis(null);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong while analyzing that article."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <div className="backdrop halo-left" />
      <div className="backdrop halo-right" />

      <UrlForm
        url={url}
        isLoading={isLoading}
        sampleArticles={SAMPLE_ARTICLES}
        onUrlChange={setUrl}
        onSampleSelect={setUrl}
        onSubmit={handleAnalyze}
      />

      <main className="workspace">
        <WordCloudStage analysis={analysis} isLoading={isLoading} />
        <InsightPanel analysis={analysis} error={error} isLoading={isLoading} />
      </main>
    </div>
  );
}
