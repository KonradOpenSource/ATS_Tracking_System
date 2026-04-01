export interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  summary?: string;
  experience?: string;
  education?: string;
  skills?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCandidateRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  summary?: string;
  experience?: string;
  education?: string;
  skills?: string;
}

export interface UpdateCandidateRequest extends CreateCandidateRequest {
  id: number;
}
