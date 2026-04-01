export interface CV {
  id: number;
  filename: string;
  originalFilename: string;
  filePath: string;
  contentType: string;
  fileSize: number;
  extractedText?: string;
  createdAt: string;
  updatedAt: string;
  candidate: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface AIAnalysis {
  id: number;
  cv: CV;
  jobOffer: {
    id: number;
    title: string;
    description: string;
  };
  matchScore: number;
  summary: string;
  keySkills: string;
  missingSkills: string;
  experienceMatch: string;
  educationMatch: string;
  recommendations: string;
  fullAnalysis: string;
  aiModel: string;
  createdAt: string;
}

export interface SkillMatch {
  skill: string;
  found: boolean;
  confidence: number;
}

export interface CVAnalysisRequest {
  cvText: string;
  jobDescription: string;
  jobRequirements: string;
}

export interface CVAnalysisResponse {
  matchScore: number;
  summary: string;
  keySkills: string;
  missingSkills: string;
  experienceMatch: string;
  educationMatch: string;
  recommendations: string;
  fullAnalysis: string;
  model: string;
  skillMatches: SkillMatch[];
}

export interface AIStats {
  totalAnalyses: number;
  averageScore: number;
  topCandidates: AIAnalysis[];
}
