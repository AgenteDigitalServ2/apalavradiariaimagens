
export interface VerseResult {
  id: string;
  verseText: string;
  verseReference: string;
  explanation: string;
  imageUrl: string;
  isFavorite: boolean;
  createdAt: number;
}

export interface VerseSuggestion {
  verseText: string;
  verseReference: string;
}
