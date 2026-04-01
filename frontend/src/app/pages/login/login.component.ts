import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatIconModule } from "@angular/material/icon";
import { AuthService } from "../../services/auth.service";
import { LoginRequest } from "../../models/auth.model";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Login</mat-card-title>
          <mat-card-subtitle>Sign in to your account</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Username</mat-label>
              <input
                matInput
                formControlName="username"
                placeholder="Enter your username"
                required
              />
              <mat-icon matPrefix>person</mat-icon>
              <mat-error
                *ngIf="loginForm.get('username')?.hasError('required')"
              >
                Username is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input
                matInput
                [type]="hidePassword ? 'password' : 'text'"
                formControlName="password"
                placeholder="Enter your password"
                required
              />
              <mat-icon matPrefix>lock</mat-icon>
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="togglePasswordVisibility()"
                aria-label="Toggle password visibility"
              >
                <mat-icon>{{
                  hidePassword ? "visibility_off" : "visibility"
                }}</mat-icon>
              </button>
              <mat-error
                *ngIf="loginForm.get('password')?.hasError('required')"
              >
                Password is required
              </mat-error>
            </mat-form-field>
          </form>
        </mat-card-content>

        <mat-card-actions class="button-actions">
          <div class="button-row">
            <button
              mat-raised-button
              color="accent"
              routerLink="/register"
              class="register-button"
            >
              Register
            </button>
            <button
              mat-raised-button
              color="primary"
              (click)="onSubmit()"
              [disabled]="loginForm.invalid || isLoading"
              class="login-button"
            >
              <span *ngIf="!isLoading">Login</span>
              <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
            </button>
          </div>
        </mat-card-actions>

        <mat-card-footer>
          <p class="register-link">
            Don't have an account?
            <a routerLink="/register">Register here</a>
          </p>
        </mat-card-footer>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
      }

      .login-card {
        max-width: 450px;
        width: 100%;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      }

      .full-width {
        width: 100%;
        margin-bottom: 20px;
      }

      .button-actions {
        padding: 20px 0;
      }

      .button-row {
        display: flex;
        gap: 12px;
        width: 100%;
      }

      .login-button {
        flex: 1;
        height: 48px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 16px;
        font-weight: 500;
        border-radius: 8px;
      }

      .register-button {
        flex: 1;
        height: 48px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 16px;
        font-weight: 500;
        border-radius: 8px;
      }

      .register-link {
        text-align: center;
        margin-top: 20px;
        color: #fff;
        font-size: 14px;
      }

      .register-link a {
        color: #fff;
        text-decoration: none;
        font-weight: 500;
        text-decoration: underline;
      }

      .register-link a:hover {
        opacity: 0.8;
      }

      mat-card-header {
        text-align: center;
        margin-bottom: 30px;
      }

      mat-card-title {
        font-size: 28px;
        font-weight: 600;
        color: #333;
        margin-bottom: 8px;
      }

      mat-card-subtitle {
        color: #666;
        font-size: 14px;
        margin-top: 4px;
      }

      mat-form-field {
        font-size: 14px;
      }

      mat-form-field .mat-mdc-form-field-flex {
        border-radius: 8px;
      }

      mat-icon {
        color: #667eea;
        font-size: 20px;
      }

      @media (max-width: 768px) {
        .login-card {
          margin: 10px;
          padding: 20px;
        }

        mat-card-title {
          font-size: 24px;
        }
      }
    `,
  ],
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

  hidePassword = true;

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
    this.loginForm = this.fb.group({
      username: ["", [Validators.required]],
      password: ["", [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;

    const loginRequest: LoginRequest = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password,
    };

    // Store user data temporarily for display after login
    this.authService.storeTempUserData({
      username: loginRequest.username,
      email: loginRequest.username, // For now, use username as email
      firstName: loginRequest.username === "admin@ats.com" ? "Admin" : "John",
      lastName:
        loginRequest.username === "admin@ats.com" ? "User" : "Recruiter",
      role: loginRequest.username === "admin@ats.com" ? "ADMIN" : "RECRUITER",
    });

    this.authService.login(loginRequest).subscribe({
      next: () => {
        this.snackBar.open("Login successful!", "Close", {
          duration: 3000,
          horizontalPosition: "center",
          verticalPosition: "top",
        });
        this.router.navigate(["/dashboard"]);
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }
}
