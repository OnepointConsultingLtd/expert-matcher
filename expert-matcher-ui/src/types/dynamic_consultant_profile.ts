import { Candidate } from './differentiation_questions';

export interface MatchingItem {
  question: string;
  answer: string;
  reasoning: string;
}

export interface DynamicConsultantProfile {
  profile: string;
  matching_items: MatchingItem[];
}

export interface QuestionAnswer {
  question: string;
  answer: string;
}

export interface DynamicConsultantProfileResponse {
  question_answers: QuestionAnswer[];
  differentiation_question_answers: QuestionAnswer[];
  consultant: Candidate;
}
