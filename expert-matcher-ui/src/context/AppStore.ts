import { create } from 'zustand';
import { QuestionSuggestions } from '../types/question';
import { getSessionId, saveSession } from '../lib/sessionFunctions';
import { SessionStatus } from '../types/session';
import {
  Candidate,
  CandidateWithVotes,
  DifferentiationQuestionVote,
  DifferentiationQuestionVotes,
  Question,
  QuestionWithSelectedOptions,
} from '../types/differentiation_questions';
import { subscribeWithSelector } from 'zustand/middleware'
import { sendDifferentiationQuestionVotesWs } from '../lib/websocketFunctions';
import { Socket } from 'socket.io-client';
import { RefObject } from 'react';

interface AppStoreState {
  errorMessage: string;
  successMessage: string;
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

interface MarkdownOverlayProps {
  overlayIsOpen: boolean;
  overlayContent: string;
  overlayTitle?: string;
  overlayEmail?: string;
  overlayError?: string;
}

interface MarkdownOverlayActions {
  overlaySetTitle: (title: string) => void;
  overlaySetContent: (content: string) => void;
  overlaySetEmail: (email: string) => void;
  overlaySetOpen: () => void;
  overlaySetClose: () => void;
  overlaySetError: (error: string) => void;
}

interface AppStoreActions {
  setErrorMessage: (errorMessage: string) => void;
  setSuccessMessage: (successMessage: string) => void;
  setCurrentIndex: (currentIndex: number) => void;
  setSessionId: (sessionId: string) => void;
  setHistory: (history: QuestionSuggestions[]) => void;
  addDifferentiationQuestion: (differentiationQuestion: Question) => void;
  clearDifferentiationQuestions: () => void;
  addCandidate: (candidate: Candidate) => void;
  selectDifferentiationQuestionOption: (question: string, option: string, socket: RefObject<Socket | null>) => void;
  removeDifferentiationQuestionOption: (question: string, option: string, socket: RefObject<Socket | null>) => void;
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

interface DarkModeStoreState {
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
}

function processVoting(
  state: AppStoreState,
  currentQuestion: QuestionWithSelectedOptions,
  option: string,
  voteUp: boolean
) {
  // Find the option with consultants to vote on candidates
  const optionWithConsultants = currentQuestion.options.find((o) => o.option === option);
  const candidatesWithVotes = [...state.candidates];
  if (optionWithConsultants) {
    // Do candidate voting
    optionWithConsultants.consultants.forEach((email) => {
      const candidateWithVotes = candidatesWithVotes.find((c) => c.email === email);
      if (candidateWithVotes) {
        if (voteUp) {
          candidateWithVotes.votes++;
        } else {
          if (candidateWithVotes.votes > 0) {
            candidateWithVotes.votes--;
          }
        }
      }
    });
  }
  // End voting
  return candidatesWithVotes;
}

function processDifferentiationQuestionVotes(differentiationQuestions: QuestionWithSelectedOptions[], socket: RefObject<Socket | null>) {
  const sessionId = getSessionId();
  if (sessionId) {
    const votes: DifferentiationQuestionVote[] = differentiationQuestions.flatMap((dq) => {
      return dq.selectedOptions.map((so) => {
        return {
          question: dq.question,
          option: so.option,
        };
      });
    });
    const differentiationQuestionVotes: DifferentiationQuestionVotes = {
      session_id: sessionId,
      votes,
    };
    sendDifferentiationQuestionVotesWs(socket.current, differentiationQuestionVotes);
  }
}

export const useAppStore = create<AppStoreState & AppStoreActions & MarkdownOverlayProps & MarkdownOverlayActions & DarkModeStoreState>()(
  subscribeWithSelector((set) => ({
    errorMessage: '',
    successMessage: '',
    currentIndex: 0,
    sessionId: '',
    history: [],
    differentiationQuestions: [],
    candidates: [],
    connected: false,
    sending: false,
    selectedSuggestions: [],
    suggestionFilter: '',
    
    overlayIsOpen: false,
    overlayContent: '',
    overlayTitle: '',
    overlayEmail: '',
    overlayError: '',
    darkMode: true,
    overlaySetOpen: () => set({ overlayIsOpen: true }),
    overlaySetClose: () => set({ overlayIsOpen: false, overlayContent: '', overlayTitle: '', overlayEmail: '', overlayError: '' }),
    overlaySetTitle: (title: string) => set({ overlayTitle: title }),
    overlaySetContent: (content: string) => set({ overlayContent: content }),
    overlaySetEmail: (email: string) => set({ overlayEmail: email }),
    overlaySetError: (error: string) => set({ overlayError: error }),
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
        const currentIndex = history.length - 1 + (state.differentiationQuestions.length > 0 ? 1 : 0);
        return { ...state, history, currentIndex, suggestionFilter: '' };
      }),
    addDifferentiationQuestion: (differentiationQuestion: Question) =>
      set((state) => {
        const questionWithSelectedOptions = {
          ...differentiationQuestion,
          selectedOptions: differentiationQuestion.options.filter((o) => o.selected),
        };
        if (
          state.differentiationQuestions.some(
            (dq) => dq.question === differentiationQuestion.question
          )
        ) {
          return { ...state };
        }
        return {
          ...state,
          differentiationQuestions: [...state.differentiationQuestions, questionWithSelectedOptions],
        };
      }),
    clearDifferentiationQuestions: () =>
      set({ differentiationQuestions: [], candidates: [], suggestionFilter: '' }),
    addCandidate: (candidate: Candidate) =>
      set((state) => {
        const { email } = candidate;
        if (state.candidates.some((c) => c.email === email)) {
          return { ...state };
        }
        const candidateWithVotes = { ...candidate, votes: 0 };
        const differentiationQuestions = state.differentiationQuestions;
        for (const question of differentiationQuestions) {
          for (const option of question.options) {
            if (option.selected) {
              if (option.consultants.some((email) => email === candidate.email)) {
                candidateWithVotes.votes += 1;
              }
            }
          }
        }
        return { ...state, candidates: [...state.candidates, candidateWithVotes] };
      }),
    selectDifferentiationQuestionOption: (question: string, option: string, socket: RefObject<Socket | null>) =>
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
          { option, consultants: [], selected: false },
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
        processDifferentiationQuestionVotes(updatedQuestions, socket)
        return {
          ...state,
          differentiationQuestions: updatedQuestions,
          candidates: candidatesWithVotes,
        };
      }),
    removeDifferentiationQuestionOption: (question: string, option: string, socket: RefObject<Socket | null>) =>
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
        processDifferentiationQuestionVotes(updatedQuestions, socket)
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
      });
    },
    selectAllSuggestions: () =>
      set((state) => {
        const allSuggestions = filterSuggestions(
          state.history[state.currentIndex].suggestions,
          state.suggestionFilter
        );
        return { ...state, selectedSuggestions: [...allSuggestions] };
      }),
    deselectAllSuggestions: () =>
      set((state) => {
        return { ...state, selectedSuggestions: [], suggestionFilter: '' };
      }),
    setSending: (sending: boolean) => set({ sending }),
    setErrorMessage: (errorMessage: string) => set({ errorMessage }),
    setSuccessMessage: (successMessage: string) => set({ successMessage }),
    previousQuestion: () =>
      set((state) => {
        if (state.currentIndex > 0) {
          return {
            ...state,
            currentIndex: state.currentIndex - 1,
            selectedSuggestions: [],
            suggestionFilter: '',
            successMessage: '',
            errorMessage: '',
          };
        }
        return { ...state };
      }),
    nextQuestion: () =>
      set((state) => {
        if (state.differentiationQuestions.length === 0 ? 
          state.currentIndex < state.history.length - 1 : state.currentIndex < state.history.length) {
          return {
            ...state,
            currentIndex: state.currentIndex + 1,
            selectedSuggestions: [],
            suggestionFilter: '',
            successMessage: '',
            errorMessage: '',
          };
        }
        return { ...state };
      }),
    setSuggestionFilter: (suggestionFilter: string) => set({ suggestionFilter }),
    setDarkMode: (darkMode: boolean) => set({ darkMode }),
  }))
);

function filterSuggestions(suggestions: string[], suggestionFilter: string) {
  return suggestions.filter(
    (s) => s.length === 0 || s.toLowerCase().includes(suggestionFilter.toLowerCase())
  );
}
