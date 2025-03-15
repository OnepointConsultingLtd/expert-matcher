import { create } from "zustand";
import { QuestionSuggestions } from '../types/question';
import { saveSession } from "../lib/sessionFunctions";
import { SessionStatus } from "../types/session";

interface AppStoreState {
    errorMessage: string;
    currentIndex: number;
    sessionId: string;
    history: QuestionSuggestions[];
    connected: boolean;
    sending: boolean;
    selectedSuggestions: string[];
}

interface AppStoreActions {
    setErrorMessage: (errorMessage: string) => void;
    setCurrentIndex: (currentIndex: number) => void;
    setSessionId: (sessionId: string) => void;
    setHistory: (history: QuestionSuggestions[]) => void;
    setConnected: (connected: boolean) => void;
    setSending: (sending: boolean) => void;
    addSelectedSuggestions: (selectedSuggestion: string) => void;
    selectAllSuggestions: () => void;
    deselectAllSuggestions: () => void;
    previousQuestion: () => void;
    nextQuestion: () => void;
}

export const useAppStore = create<AppStoreState & AppStoreActions>((set) => ({
    errorMessage: "",
    currentIndex: 0,
    sessionId: "",
    history: [],
    connected: false,
    sending: false,
    selectedSuggestions: [],
    setSessionId: (sessionId: string) => set((state) => {
        saveSession({ id: sessionId, createdAt: new Date(), updatedAt: new Date(), status: SessionStatus.IN_PROGRESS });
        return { ...state, sessionId }
    }),
    setHistory: (history: QuestionSuggestions[]) => set((state) => 
        {
            const currentIndex = history.length - 1;
            return { ...state, history, currentIndex }
        }),
    setConnected: (connected: boolean) => set({ connected }),
    setCurrentIndex: (currentIndex: number) => set((state) => {
        return { ...state, currentIndex }
    }),
    addSelectedSuggestions: (selectedSuggestion: string) => set((state) => {
        if(state.selectedSuggestions.includes(selectedSuggestion)) {
            state.selectedSuggestions.splice(state.selectedSuggestions.indexOf(selectedSuggestion), 1);
            return {...state, selectedSuggestions: [...state.selectedSuggestions]}
        }
        return { ...state, selectedSuggestions: [...state.selectedSuggestions, selectedSuggestion] }
    }),
    selectAllSuggestions: () => set((state) => {
        const allSuggestions = state.history[state.currentIndex].suggestions;
        return { ...state, selectedSuggestions: [...allSuggestions] }
    }),
    deselectAllSuggestions: () => set((state) => {
        return { ...state, selectedSuggestions: [] }
    }),
    setSending: (sending: boolean) => set({ sending }),
    setErrorMessage: (errorMessage: string) => set({ errorMessage }),
    previousQuestion: () => set((state) => {
        if(state.currentIndex > 0) {
            return { ...state, currentIndex: state.currentIndex - 1 }
        }
        return { ...state }
    }),
    nextQuestion: () => set((state) => {
        if(state.currentIndex < state.history.length - 1) {
            return { ...state, currentIndex: state.currentIndex + 1 }
        }
        return { ...state }
    })
}));

