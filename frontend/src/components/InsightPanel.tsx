import type { AnalysisResponse } from "../types";

type InsightPanelProps = {
  analysis: AnalysisResponse | null;
  error: string | null;
  isLoading: boolean;
};

export default function InsightPanel({
  analysis,
  error,
  isLoading,
}: InsightPanelProps) {
  return (
    <aside className="insight-panel">
      <div className="panel-heading">
        <p className="eyebrow">Insight Panel</p>
        <h2>Article snapshot</h2>
      </div>

      {isLoading ? (
        <div className="status-card">Fetching article and preparing terms...</div>
      ) : null}

      {!isLoading && error ? <div className="status-card error">{error}</div> : null}

      {!isLoading && !error && !analysis ? (
        <div className="status-card">
          Run an analysis to see article metadata and the strongest extracted
          topics.
        </div>
      ) : null}

      {analysis ? (
        <div className="insight-grid">
          <section className="insight-card">
            <p className="card-label">Title</p>
            <h3>{analysis.title}</h3>
            <a href={analysis.source_url} target="_blank" rel="noreferrer">
              Open source article
            </a>
          </section>

          <section className="insight-card">
            <p className="card-label">Source</p>
            <strong>{analysis.source_domain}</strong>
            <span>{analysis.estimated_reading_time_minutes} min read</span>
          </section>

          <section className="insight-card">
            <p className="card-label">Top Phrases</p>
            <div className="phrase-list">
              {analysis.top_phrases.map((phrase) => (
                <span key={phrase} className="phrase-chip">
                  {phrase}
                </span>
              ))}
            </div>
          </section>

          <section className="insight-card">
            <p className="card-label">Word Cloud Terms</p>
            <ul className="word-list">
              {analysis.word_cloud.map((entry) => (
                <li key={entry.word} className="word-list-item">
                  <span>{entry.word}</span>
                  <strong>{entry.weight.toFixed(2)}</strong>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}
    </aside>
  );
}
