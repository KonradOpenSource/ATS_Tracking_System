import { Injectable } from "@angular/core";
import { HttpClient, HttpEventType } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import {
  CV,
  AIAnalysis,
  CVAnalysisRequest,
  CVAnalysisResponse,
  AIStats,
} from "../models/ai.model";

@Injectable({
  providedIn: "root",
})
export class AIService {
  private readonly API_URL = "http://localhost:8082/api/ai";

  constructor(private http: HttpClient) {}

  // CV Management
  uploadCV(file: File, candidateId: number): Observable<CV> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("candidateId", candidateId.toString());

    return this.http.post<CV>(`${this.API_URL}/cv/upload`, formData);
  }

  getCVById(id: number): Observable<CV> {
    return this.http.get<CV>(`${this.API_URL}/cv/${id}`);
  }

  getCVsByCandidate(candidateId: number): Observable<CV[]> {
    return this.http.get<CV[]>(`${this.API_URL}/cv/candidate/${candidateId}`);
  }

  downloadCV(id: number): Observable<Blob> {
    return this.http.get(`${this.API_URL}/cv/${id}/download`, {
      responseType: "blob",
    });
  }

  deleteCV(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/cv/${id}`);
  }

  // AI Analysis
  analyzeCV(cvId: number, jobOfferId: number): Observable<AIAnalysis> {
    return this.http.post<AIAnalysis>(
      `${this.API_URL}/analyze/${cvId}/${jobOfferId}`,
      {},
    );
  }

  getAnalysisById(id: number): Observable<AIAnalysis> {
    return this.http.get<AIAnalysis>(`${this.API_URL}/analysis/${id}`);
  }

  getLatestAnalysisForCV(cvId: number): Observable<AIAnalysis> {
    return this.http.get<AIAnalysis>(
      `${this.API_URL}/analysis/cv/${cvId}/latest`,
    );
  }

  getTopAnalysesForJobOffer(jobOfferId: number): Observable<AIAnalysis[]> {
    return this.http.get<AIAnalysis[]>(
      `${this.API_URL}/analysis/job-offer/${jobOfferId}/top`,
    );
  }

  getAnalysesByMinScore(minScore: number): Observable<AIAnalysis[]> {
    return this.http.get<AIAnalysis[]>(
      `${this.API_URL}/analysis/min-score/${minScore}`,
    );
  }

  // Statistics
  getAverageScoreForJobOffer(jobOfferId: number): Observable<number> {
    return this.http.get<number>(
      `${this.API_URL}/stats/job-offer/${jobOfferId}/average-score`,
    );
  }

  getAnalysisCountForJobOffer(jobOfferId: number): Observable<number> {
    return this.http.get<number>(
      `${this.API_URL}/stats/job-offer/${jobOfferId}/count`,
    );
  }

  // File upload progress tracking
  uploadCVWithProgress(
    file: File,
    candidateId: number,
  ): Observable<{ progress: number; cv?: CV }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("candidateId", candidateId.toString());

    return this.http
      .post<CV>(`${this.API_URL}/cv/upload`, formData, {
        reportProgress: true,
        observe: "events",
      })
      .pipe(
        map((event) => {
          if (event.type === HttpEventType.UploadProgress) {
            return {
              progress: Math.round((100 * event.loaded) / event.total!),
            };
          } else if (event.type === HttpEventType.Response) {
            return {
              progress: 100,
              cv: event.body!,
            };
          }
          return { progress: 0 };
        }),
      );
  }

  // Get AI stats for dashboard
  getAIStats(jobOfferId?: number): Observable<AIStats> {
    const url = jobOfferId
      ? `${this.API_URL}/stats/job-offer/${jobOfferId}`
      : `${this.API_URL}/stats`;

    return this.http.get<AIStats>(url);
  }

  // File validation
  validateCVFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: "Only PDF, DOC, DOCX, and TXT files are allowed",
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: "File size must be less than 10MB",
      };
    }

    return { valid: true };
  }

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // Get file icon based on type
  getFileIcon(contentType: string): string {
    switch (contentType) {
      case "application/pdf":
        return "picture_as_pdf";
      case "application/msword":
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return "description";
      case "text/plain":
        return "text_snippet";
      default:
        return "insert_drive_file";
    }
  }
}
