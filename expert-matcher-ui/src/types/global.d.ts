export interface ExpertMatcherConfig {
    websocketUrl: string;
    reportUrl: string;
}

declare global {
    interface Window {
        expertMatcherConfig: ExpertMatcherConfig;
    }
} 