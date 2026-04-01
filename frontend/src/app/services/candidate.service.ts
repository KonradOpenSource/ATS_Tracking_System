import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import {
  Candidate,
  CreateCandidateRequest,
  UpdateCandidateRequest,
} from "../models/candidate.model";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: "root",
})
export class CandidateService {
  private readonly API_URL = "http://localhost:8082/api/candidates";

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    console.log("Token from authService:", token);
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    });
    console.log("Headers:", headers);
    return headers;
  }

  getCandidates(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(this.API_URL, {
      headers: this.getAuthHeaders(),
    });
  }

  getCandidate(id: number): Observable<Candidate> {
    return this.http.get<Candidate>(`${this.API_URL}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  createCandidate(candidate: CreateCandidateRequest): Observable<Candidate> {
    return this.http.post<Candidate>(this.API_URL, candidate, {
      headers: this.getAuthHeaders(),
    });
  }

  updateCandidate(
    id: number,
    candidate: UpdateCandidateRequest,
  ): Observable<Candidate> {
    return this.http.put<Candidate>(`${this.API_URL}/${id}`, candidate, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteCandidate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  searchCandidates(query: string): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(
      `${this.API_URL}/search?query=${encodeURIComponent(query)}`,
      { headers: this.getAuthHeaders() },
    );
  }
}
