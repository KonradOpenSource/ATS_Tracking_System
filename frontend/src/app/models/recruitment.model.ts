export interface RecruitmentStage {
  id: number;
  name: string;
  description?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface RecruitmentPipeline {
  id: number;
  name: string;
  description?: string;
  jobOfferId: number;
  createdBy: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  stages?: RecruitmentStage[];
}

export interface CandidateStageHistory {
  id: number;
  candidate: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  stage: RecruitmentStage;
  changedBy: {
    id: number;
    firstName: string;
    lastName: string;
  };
  changedAt: string;
  notes?: string;
}

export interface MoveCandidateRequest {
  notes?: string;
  changedById?: number;
}

export interface PipelineData {
  stages: RecruitmentStage[];
  candidates: CandidateStageHistory[];
}
