export type WordCloudEntry = {
  word: string;
  weight: number;
};

export type AnalysisResponse = {
  title: string;
  source_url: string;
  source_domain: string;
  estimated_reading_time_minutes: number;
  top_phrases: string[];
  word_cloud: WordCloudEntry[];
};
