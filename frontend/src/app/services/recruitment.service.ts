import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AuthService } from "./auth.service";
import {
  RecruitmentStage,
  RecruitmentPipeline,
  CandidateStageHistory,
  MoveCandidateRequest,
  PipelineData,
} from "../models/recruitment.model";

@Injectable({
  providedIn: "root",
})
export class RecruitmentService {
  private readonly API_URL = "http://localhost:8082/api/recruitment";

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set("Authorization", `Bearer ${token}`);
  }

  // Pipeline Management
  getPipelines(): Observable<RecruitmentPipeline[]> {
    return this.http.get<RecruitmentPipeline[]>(`${this.API_URL}/pipelines`, { headers: this.getAuthHeaders() });
  }

  getActivePipelines(): Observable<RecruitmentPipeline[]> {
    return this.http.get<RecruitmentPipeline[]>(
      `${this.API_URL}/pipelines/active`,
      { headers: this.getAuthHeaders() }
    );
  }

  getPipelineById(id: number): Observable<RecruitmentPipeline> {
    return this.http.get<RecruitmentPipeline>(
      `${this.API_URL}/pipelines/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  createPipeline(
    pipeline: RecruitmentPipeline,
  ): Observable<RecruitmentPipeline> {
    return this.http.post<RecruitmentPipeline>(
      `${this.API_URL}/pipelines`,
      pipeline,
      { headers: this.getAuthHeaders() }
    );
  }

  updatePipeline(
    id: number,
    pipeline: RecruitmentPipeline,
  ): Observable<RecruitmentPipeline> {
    return this.http.put<RecruitmentPipeline>(
      `${this.API_URL}/pipelines/${id}`,
      pipeline,
      { headers: this.getAuthHeaders() }
    );
  }

  deletePipeline(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/pipelines/${id}`, { headers: this.getAuthHeaders() });
  }

  // Stage Management
  getStages(): Observable<RecruitmentStage[]> {
    return this.http.get<RecruitmentStage[]>(`${this.API_URL}/stages`, { headers: this.getAuthHeaders() });
  }

  getStageById(id: number): Observable<RecruitmentStage> {
    return this.http.get<RecruitmentStage>(`${this.API_URL}/stages/${id}`);
  }

  createStage(stage: RecruitmentStage): Observable<RecruitmentStage> {
    return this.http.post<RecruitmentStage>(`${this.API_URL}/stages`, stage);
  }

  updateStage(
    id: number,
    stage: RecruitmentStage,
  ): Observable<RecruitmentStage> {
    return this.http.put<RecruitmentStage>(
      `${this.API_URL}/stages/${id}`,
      stage,
    );
  }

  deleteStage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/stages/${id}`);
  }

  // Candidate Stage Management
  moveCandidateToStage(
    candidateId: number,
    stageId: number,
    request?: MoveCandidateRequest,
  ): Observable<CandidateStageHistory> {
    return this.http.post<CandidateStageHistory>(
      `${this.API_URL}/candidates/${candidateId}/move-to-stage/${stageId}`,
      request,
    );
  }

  getCandidateHistory(
    candidateId: number,
  ): Observable<CandidateStageHistory[]> {
    return this.http.get<CandidateStageHistory[]>(
      `${this.API_URL}/candidates/${candidateId}/history`,
    );
  }

  getStageHistory(stageId: number): Observable<CandidateStageHistory[]> {
    return this.http.get<CandidateStageHistory[]>(
      `${this.API_URL}/stages/${stageId}/history`,
    );
  }

  getLatestCandidateStage(
    candidateId: number,
  ): Observable<CandidateStageHistory> {
    return this.http.get<CandidateStageHistory>(
      `${this.API_URL}/candidates/${candidateId}/latest-stage`,
    );
  }

  getCandidatesInStage(stageId: number): Observable<CandidateStageHistory[]> {
    return this.http.get<CandidateStageHistory[]>(
      `${this.API_URL}/stages/${stageId}/candidates`,
    );
  }

  getPipelineStages(pipelineId: number): Observable<RecruitmentStage[]> {
    return this.http.get<RecruitmentStage[]>(
      `${this.API_URL}/pipelines/${pipelineId}/stages`,
    );
  }

  initializeDefaultStages(): Observable<void> {
    return this.http.post<void>(
      `${this.API_URL}/initialize-default-stages`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  // Combined methods for Kanban view
  getPipelineData(): Observable<PipelineData> {
    return this.http.get<RecruitmentStage[]>(`${this.API_URL}/stages`, { headers: this.getAuthHeaders() }).pipe(
      map((stages) => {
        // For now, return empty candidates array - in real implementation,
        // we would fetch candidates for each stage
        return {
          stages,
          candidates: [],
        };
      }),
    );
  }

  // Get all candidates with their latest stage
  getAllCandidatesWithStages(): Observable<CandidateStageHistory[]> {
    // This would typically be a custom endpoint, for now we'll simulate
    return this.http.get<RecruitmentStage[]>(`${this.API_URL}/stages`).pipe(
      map((stages) => {
        // In real implementation, this would be a single API call
        // For now, return empty array
        return [];
      }),
    );
  }
}
