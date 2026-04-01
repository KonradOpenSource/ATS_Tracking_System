import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, BehaviorSubject } from "rxjs";
import { map, tap } from "rxjs/operators";
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from "../models/auth.model";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly API_URL = "http://localhost:8082/api/auth";
  private readonly TOKEN_KEY = "ats_token";
  private readonly USER_KEY = "ats_user";

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const user = localStorage.getItem(this.USER_KEY);

    if (token && user) {
      this.currentUserSubject.next(JSON.parse(user));
      this.isAuthenticatedSubject.next(true);
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap((response) => {
          this.setSession(response);
        }),
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/register`, userData)
      .pipe(
        tap((response) => {
          this.setSession(response);
        }),
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private setSession(authResponse: AuthResponse): void {
    // Use user data from backend response
    const user: User = {
      id: authResponse.user.id,
      username: authResponse.user.username,
      email: authResponse.user.email,
      firstName: authResponse.user.firstName,
      lastName: authResponse.user.lastName,
      role: authResponse.user.role,
    };

    localStorage.setItem(this.TOKEN_KEY, authResponse.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));

    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  private decodeJWT(token: string): User {
    try {
      // Decode JWT payload (base64)
      const payload = JSON.parse(atob(token.split(".")[1]));

      // Extract user info from JWT payload
      return {
        id: payload.userId || payload.sub || 1,
        username: payload.sub || payload.username || "user",
        email: payload.email || "user@example.com",
        firstName: payload.firstName || payload.given_name || "User",
        lastName: payload.lastName || payload.family_name || "Name",
        role: payload.role || "RECRUITER",
      };
    } catch (error) {
      console.error("Error decoding JWT:", error);
      // Fallback mock user
      return {
        id: 1,
        username: "user",
        email: "user@example.com",
        firstName: "User",
        lastName: "Name",
        role: "RECRUITER",
      };
    }
  }

  // Store temporary user data during login/register
  storeTempUserData(userData: any): void {
    localStorage.setItem("temp_user_data", JSON.stringify(userData));
  }

  // Public method to update user data
  updateUser(userData: Partial<User>): void {
    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
      this.currentUserSubject.next(updatedUser);
    }
  }

  // Update user settings on backend
  updateSettings(settings: any): Observable<any> {
    return this.http.put(`${this.API_URL}/settings`, settings);
  }
}
