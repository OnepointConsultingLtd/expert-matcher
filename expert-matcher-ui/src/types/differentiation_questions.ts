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

interface Experience {
  id: number;
  consultant_id: number;
  company_name: string;
  location: string;
  title: string;
  start_date: string;
  end_date: string | null;
}
