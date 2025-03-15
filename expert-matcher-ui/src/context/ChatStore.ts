import { create } from "zustand";
import { Socket } from "socket.io-client";
import { RefObject } from "react";

interface ChatStore {
    readonly websocketUrl: string;
    readonly reportUrl: string;
    readonly socket: RefObject<Socket | null>;
}

export const useChatStore = create<ChatStore>(() => ({
    websocketUrl: window.expertMatcherConfig.websocketUrl,
    reportUrl: window.expertMatcherConfig.reportUrl,
    socket: { current: null }
}))
