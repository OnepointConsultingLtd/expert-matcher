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

interface Option {
  option: string;
  consultants: string[];
}

interface Candidate {
  id: number;
  given_name: string;
  surname: string;
  linkedin_profile_url: string;
  email: string;
  cv: string;
  skills: string[];
  experiences: Experience[];
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
