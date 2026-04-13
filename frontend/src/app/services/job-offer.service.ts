import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";

export interface JobOffer {
  id?: number;
  title: string;
  description: string;
  requirements: string;
  benefits: string;
  location: string;
  status: "OPEN" | "CLOSED" | "DRAFT" | "ARCHIVED";
  salaryMin?: number;
  salaryMax?: number;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: "root",
})
export class JobOfferService {
  private readonly API_URL = "http://localhost:8082/api/job-offers";

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set("Authorization", `Bearer ${token}`);
  }

  getJobOffers(): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(this.API_URL, {
      headers: this.getAuthHeaders(),
    });
  }

  getJobOfferById(id: number): Observable<JobOffer> {
    return this.http.get<JobOffer>(`${this.API_URL}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  createJobOffer(jobOffer: JobOffer): Observable<JobOffer> {
    return this.http.post<JobOffer>(this.API_URL, jobOffer, {
      headers: this.getAuthHeaders(),
    });
  }

  updateJobOffer(id: number, jobOffer: JobOffer): Observable<JobOffer> {
    return this.http.put<JobOffer>(`${this.API_URL}/${id}`, jobOffer, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteJobOffer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }
}
