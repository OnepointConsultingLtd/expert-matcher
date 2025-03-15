export interface QuestionSuggestions {
    id: number;
    category: string;
    question: string;
    suggestions: string[];
    suggestions_count: number[];
    selected_suggestions: string[];
} 