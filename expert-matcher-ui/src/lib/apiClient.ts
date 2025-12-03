import { getSessionId } from "./sessionFunctions";
import { DynamicConsultantProfile } from "../types/dynamic_consultant_profile";

export async function getExpertMatcherProfile(email: string): Promise<DynamicConsultantProfile> {
    // const reportUrl = window.expertMatcherConfig.reportUrl;
    const sessionId = getSessionId();
    debugger
    const url = `${window.expertMatcherConfig.reportUrl}/api/dynamic-profile/${sessionId}?email=${email}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
}
