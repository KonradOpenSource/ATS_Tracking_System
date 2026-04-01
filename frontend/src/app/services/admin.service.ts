import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, AuditLog, DashboardStats, PageResponse } from '../models/admin.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly API_URL = 'http://localhost:8081/api/admin';

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.API_URL}/dashboard/stats`);
  }

  getUsers(page: number = 0, size: number = 10): Observable<PageResponse<User>> {
    return this.http.get<PageResponse<User>>(`${this.API_URL}/users?page=${page}&size=${size}`);
  }

  getAuditLogs(page: number = 0, size: number = 10, action?: string, resourceType?: string): Observable<PageResponse<AuditLog>> {
    let url = `${this.API_URL}/audit-logs?page=${page}&size=${size}`;
    if (action) url += `&action=${action}`;
    if (resourceType) url += `&resourceType=${resourceType}`;
    return this.http.get<PageResponse<AuditLog>>(url);
  }

  getDistinctActions(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_URL}/audit-logs/actions`);
  }

  getDistinctResourceTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_URL}/audit-logs/resource-types`);
  }

  cleanupSystem(): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/system/cleanup`, {});
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/users/${userId}`);
  }

  getSystemHealth(): Observable<any> {
    return this.http.get(`${this.API_URL}/system/health`);
  }

  getUserActivityReport(): Observable<any> {
    return this.http.get(`${this.API_URL}/reports/activity`);
  }
}
