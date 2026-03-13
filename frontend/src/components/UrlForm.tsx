type SampleArticle = {
  label: string;
  url: string;
};

type UrlFormProps = {
  url: string;
  isLoading: boolean;
  sampleArticles: SampleArticle[];
  onUrlChange: (value: string) => void;
  onSampleSelect: (url: string) => void;
  onSubmit: () => void;
};

export default function UrlForm({
  url,
  isLoading,
  sampleArticles,
  onUrlChange,
  onSampleSelect,
  onSubmit,
}: UrlFormProps) {
  return (
    <section className="control-panel">
      <div className="panel-heading">
        <p className="eyebrow">Phase 4A</p>
        <h1>Turn any article into a topic field.</h1>
        <p className="panel-copy">
          Submit a news article URL, inspect the extracted metadata, and review
          the extracted phrases and weighted terms before the 3D scene arrives
          in Phase 4B.
        </p>
      </div>

      <div className="sample-list">
        {sampleArticles.map((sample) => (
          <button
            key={sample.url}
            className="sample-pill"
            type="button"
            onClick={() => onSampleSelect(sample.url)}
          >
            <span>{sample.label}</span>
            <small>{sample.url}</small>
          </button>
        ))}
      </div>

      <form
        className="analyze-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <label className="field-group">
          <span>Article URL</span>
          <input
            type="url"
            value={url}
            onChange={(event) => onUrlChange(event.target.value)}
            placeholder="https://example.com/article"
          />
        </label>

        <button
          className="analyze-button"
          type="submit"
          disabled={isLoading || url.trim().length === 0}
        >
          {isLoading ? "Analyzing..." : "Analyze Article"}
        </button>
      </form>
    </section>
  );
}
