export interface DifferentiationQuestions {
  questions: Question[];
  candidates: Candidate[];
  state: Record<string, any>;
}

export interface Question {
  question: string;
  dimension: string;
  options: Option[];
}

export interface QuestionWithSelectedOptions extends Question {
  selectedOptions: Option[];
}

interface Option {
  option: string;
  consultants: string[];
  selected: boolean;
}

export interface Candidate {
  id: number;
  given_name: string;
  surname: string;
  linkedin_profile_url: string;
  email: string;
  cv: string;
  skills: string[];
  experiences: Experience[];
  photo_url_200?: string;
  photo_url_400?: string;
}

export interface CandidateWithVotes extends Candidate {
  votes: number;
}

interface Experience {
  id: number;
  consultant_id: number;
  company_name: string;
  location: string;
  title: string;
  start_date: string;
  end_date: string | null;
}

export interface DifferentiationQuestionVote {
  question: string;
  option: string;
}

export interface DifferentiationQuestionVotes {
  session_id: string;
  votes: DifferentiationQuestionVote[];
}
