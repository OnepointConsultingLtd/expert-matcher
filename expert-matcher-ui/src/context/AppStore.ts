import { create } from 'zustand';
import { QuestionSuggestions } from '../types/question';
import { saveSession } from '../lib/sessionFunctions';
import { SessionStatus } from '../types/session';
import {
  Candidate,
  CandidateWithVotes,
  Question,
  QuestionWithSelectedOptions,
} from '../types/differentiation_questions';

interface AppStoreState {
  errorMessage: string;
  currentIndex: number;
  sessionId: string;
  history: QuestionSuggestions[];
  differentiationQuestions: QuestionWithSelectedOptions[];
  candidates: CandidateWithVotes[];
  connected: boolean;
  sending: boolean;
  selectedSuggestions: string[];
  suggestionFilter: string;
}

interface AppStoreActions {
  setErrorMessage: (errorMessage: string) => void;
  setCurrentIndex: (currentIndex: number) => void;
  setSessionId: (sessionId: string) => void;
  setHistory: (history: QuestionSuggestions[]) => void;
  addDifferentiationQuestion: (differentiationQuestion: Question) => void;
  clearDifferentiationQuestions: () => void;
  addCandidate: (candidate: Candidate) => void;
  selectDifferentiationQuestionOption: (question: string, option: string) => void;
  removeDifferentiationQuestionOption: (question: string, option: string) => void;
  setConnected: (connected: boolean) => void;
  setSending: (sending: boolean) => void;
  addSelectedSuggestions: (selectedSuggestion: string) => void;
  selectAllSuggestions: () => void;
  deselectAllSuggestions: () => void;
  clearAllSuggestions: () => void;
  previousQuestion: () => void;
  nextQuestion: () => void;
  setSuggestionFilter: (suggestionFilter: string) => void;
}

function processVoting(state: AppStoreState, currentQuestion: QuestionWithSelectedOptions, option: string, voteUp: boolean) {
    // Find the option with consultants to vote on candidates
    const optionWithConsultants = currentQuestion.options.find((o) => o.option === option);
    const candidatesWithVotes = [...state.candidates]
    if (optionWithConsultants) {
      // Do candidate voting
      optionWithConsultants.consultants.forEach((email) => {
        const candidateWithVotes = candidatesWithVotes.find((c) => c.email === email);
        if (candidateWithVotes) {
          if (voteUp) {
            candidateWithVotes.votes++;
          } else {
            candidateWithVotes.votes--;
          }
        }
    });
  }
  // End voting
  return candidatesWithVotes;
}

export const useAppStore = create<AppStoreState & AppStoreActions>((set) => ({
  errorMessage: '',
  currentIndex: 0,
  sessionId: '',
  history: [],
  differentiationQuestions: [],
  candidates: [],
  connected: false,
  sending: false,
  selectedSuggestions: [],
  suggestionFilter: '',
  setSessionId: (sessionId: string) =>
    set((state) => {
      saveSession({
        id: sessionId,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: SessionStatus.IN_PROGRESS,
      });
      return { ...state, sessionId };
    }),
  setHistory: (history: QuestionSuggestions[]) =>
    set((state) => {
      const currentIndex = history.length - 1;
      return { ...state, history, currentIndex, suggestionFilter: '' };
    }),
  addDifferentiationQuestion: (differentiationQuestion: Question) =>
    set((state) => {
      const questionWithSelectedOptions = {
        ...differentiationQuestion,
        selectedOptions: [],
      };
      return {
        ...state,
        differentiationQuestions: [...state.differentiationQuestions, questionWithSelectedOptions],
      };
    }),
  clearDifferentiationQuestions: () => set({ differentiationQuestions: [], candidates: [], suggestionFilter: '' }),
  addCandidate: (candidate: Candidate) =>
    set((state) => {
      const candidateWithVotes = { ...candidate, votes: 0 };
      return { ...state, candidates: [...state.candidates, candidateWithVotes] };
    }),
  selectDifferentiationQuestionOption: (question: string, option: string) =>
    set((state) => {
      const questionWithSelectedOptionsIndex = state.differentiationQuestions.findIndex(
        (q) => q.question === question
      );
      if (questionWithSelectedOptionsIndex === -1) {
        return { ...state };
      }
      const currentQuestion = state.differentiationQuestions[questionWithSelectedOptionsIndex];
      const selectedOptions = [
        ...currentQuestion.selectedOptions,
        { option, consultants: [] },
      ];
      const modifiedQuestion = {
        ...currentQuestion,
        selectedOptions,
      };
      
      const candidatesWithVotes = processVoting(state, currentQuestion, option, true);

      // End voting
      const updatedQuestions = [
        ...state.differentiationQuestions.slice(0, questionWithSelectedOptionsIndex),
        modifiedQuestion,
        ...state.differentiationQuestions.slice(questionWithSelectedOptionsIndex + 1),
      ];
      return {
        ...state,
        differentiationQuestions: updatedQuestions,
        candidates: candidatesWithVotes,
      };
    }),
  removeDifferentiationQuestionOption: (question: string, option: string) =>
    set((state) => {
      const questionWithSelectedOptionsIndex = state.differentiationQuestions.findIndex(
        (q) => q.question === question
      );
      if (questionWithSelectedOptionsIndex === -1) {
        return { ...state };
      }
      const selectedOptions = state.differentiationQuestions[
        questionWithSelectedOptionsIndex
      ].selectedOptions.filter((o) => o.option != option);
      const currentQuestion = state.differentiationQuestions[questionWithSelectedOptionsIndex];
      const modifiedQuestion = {
        ...currentQuestion,
        selectedOptions,
      };

      const candidatesWithVotes = processVoting(state, currentQuestion, option, false);

      const updatedQuestions = [
        ...state.differentiationQuestions.slice(0, questionWithSelectedOptionsIndex),
        modifiedQuestion,
        ...state.differentiationQuestions.slice(questionWithSelectedOptionsIndex + 1),
      ];
      return {
        ...state,
        differentiationQuestions: updatedQuestions,
        candidates: candidatesWithVotes,
      };
    }),
  setConnected: (connected: boolean) => set({ connected }),
  setCurrentIndex: (currentIndex: number) =>
    set((state) => {
      return { ...state, currentIndex, suggestionFilter: '' };
    }),
  addSelectedSuggestions: (selectedSuggestion: string) =>
    set((state) => {
      if (state.selectedSuggestions.includes(selectedSuggestion)) {
        state.selectedSuggestions.splice(state.selectedSuggestions.indexOf(selectedSuggestion), 1);
        return {
          ...state,
          selectedSuggestions: [...state.selectedSuggestions],
        };
      }
      return {
        ...state,
        selectedSuggestions: [...state.selectedSuggestions, selectedSuggestion],
      };
    }),
  clearAllSuggestions: () => {
    return set((state) => {
      return { ...state, selectedSuggestions: [], suggestionFilter: '' };
    })
  },
  selectAllSuggestions: () =>
    set((state) => {
      const allSuggestions = filterSuggestions(state.history[state.currentIndex].suggestions, state.suggestionFilter);
      return { ...state, selectedSuggestions: [...allSuggestions] };
    }),
  deselectAllSuggestions: () =>
    set((state) => {
      return { ...state, selectedSuggestions: [], suggestionFilter: '' };
    }),
  setSending: (sending: boolean) => set({ sending }),
  setErrorMessage: (errorMessage: string) => set({ errorMessage }),
  previousQuestion: () =>
    set((state) => {
      if (state.currentIndex > 0) {
        return {
          ...state,
          currentIndex: state.currentIndex - 1,
          selectedSuggestions: [],
          suggestionFilter: ''
        };
      }
      return { ...state };
    }),
  nextQuestion: () =>
    set((state) => {
      if (state.currentIndex < state.history.length - 1) {
        return {
          ...state,
          currentIndex: state.currentIndex + 1,
          selectedSuggestions: [],
          suggestionFilter: ''
        };
      }
      return { ...state };
    }),
  setSuggestionFilter: (suggestionFilter: string) => set({ suggestionFilter }),
}));

function filterSuggestions(suggestions: string[], suggestionFilter: string) {
  return suggestions.filter(s => s.length === 0 || s.toLowerCase().includes(suggestionFilter.toLowerCase()));
}
