export interface VerseResult {
  id: string;
  verseText: string;
  verseReference: string;
  explanation: string;
  imageUrl: string;
}

export interface VerseSuggestion {
  verseText: string;
  verseReference: string;
}