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
import { MatSelectModule } from "@angular/material/select";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatIconModule } from "@angular/material/icon";
import { AuthService } from "../../services/auth.service";
import { RegisterRequest } from "../../models/auth.model";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  template: `
    <div class="register-container">
      <mat-card class="register-card">
        <mat-card-header>
          <mat-card-title>Register</mat-card-title>
          <mat-card-subtitle>Create your account</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>First Name</mat-label>
                <input
                  matInput
                  formControlName="firstName"
                  placeholder="Enter your first name"
                  required
                />
                <mat-icon matPrefix>person</mat-icon>
                <mat-error
                  *ngIf="registerForm.get('firstName')?.hasError('required')"
                >
                  First name is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Last Name</mat-label>
                <input
                  matInput
                  formControlName="lastName"
                  placeholder="Enter your last name"
                  required
                />
                <mat-icon matPrefix>person</mat-icon>
                <mat-error
                  *ngIf="registerForm.get('lastName')?.hasError('required')"
                >
                  Last name is required
                </mat-error>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Username</mat-label>
              <input
                matInput
                formControlName="username"
                placeholder="Choose a username"
                required
              />
              <mat-icon matPrefix>account_circle</mat-icon>
              <mat-error
                *ngIf="registerForm.get('username')?.hasError('required')"
              >
                Username is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input
                matInput
                type="email"
                formControlName="email"
                placeholder="Enter your email"
                required
              />
              <mat-icon matPrefix>email</mat-icon>
              <mat-error
                *ngIf="registerForm.get('email')?.hasError('required')"
              >
                Email is required
              </mat-error>
              <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
                Please enter a valid email
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input
                matInput
                type="password"
                formControlName="password"
                placeholder="Create a password"
                required
              />
              <mat-icon matPrefix>lock</mat-icon>
              <mat-error
                *ngIf="registerForm.get('password')?.hasError('required')"
              >
                Password is required
              </mat-error>
              <mat-error
                *ngIf="registerForm.get('password')?.hasError('minlength')"
              >
                Password must be at least 6 characters
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Role</mat-label>
              <mat-select formControlName="role" required>
                <mat-option value="RECRUITER">Recruiter</mat-option>
                <mat-option value="ADMIN">Admin</mat-option>
              </mat-select>
              <mat-icon matPrefix>work</mat-icon>
              <mat-error *ngIf="registerForm.get('role')?.hasError('required')">
                Role is required
              </mat-error>
            </mat-form-field>
          </form>
        </mat-card-content>

        <mat-card-actions align="end">
          <button
            mat-raised-button
            color="primary"
            (click)="onSubmit()"
            [disabled]="registerForm.invalid || isLoading"
            class="register-button"
          >
            <span *ngIf="!isLoading">Register</span>
            <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
          </button>
        </mat-card-actions>

        <mat-card-footer>
          <p class="login-link">
            Already have an account?
            <a routerLink="/login">Login here</a>
          </p>
        </mat-card-footer>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .register-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
      }

      .register-card {
        max-width: 600px;
        width: 100%;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      }

      .full-width {
        width: 100%;
        margin-bottom: 20px;
      }

      .form-row {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;
      }

      .half-width {
        width: 50%;
      }

      .register-button {
        width: 100%;
        height: 48px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 16px;
        font-weight: 500;
        border-radius: 8px;
      }

      .login-link {
        text-align: center;
        margin-top: 20px;
        color: #fff;
        font-size: 14px;
      }

      .login-link a {
        color: #fff;
        text-decoration: none;
        font-weight: 500;
        text-decoration: underline;
      }

      .login-link a:hover {
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
        .register-card {
          margin: 10px;
          padding: 20px;
        }

        .form-row {
          flex-direction: column;
          gap: 0;
        }

        .half-width {
          width: 100%;
        }

        mat-card-title {
          font-size: 24px;
        }
      }
    `,
  ],
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
    this.registerForm = this.fb.group({
      firstName: ["", [Validators.required]],
      lastName: ["", [Validators.required]],
      username: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      role: ["RECRUITER", [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;

    const registerRequest: RegisterRequest = {
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      username: this.registerForm.value.username,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      role: this.registerForm.value.role,
    };

    // Store user data temporarily for display after registration
    console.log("Registering user with data:", registerRequest);
    this.authService.storeTempUserData({
      username: registerRequest.username,
      email: registerRequest.email,
      firstName: registerRequest.firstName,
      lastName: registerRequest.lastName,
      role: registerRequest.role,
    });
    console.log("Stored temp user data");

    this.authService.register(registerRequest).subscribe({
      next: (response) => {
        console.log("Registration response:", response);
        this.snackBar.open("Registration successful!", "Close", {
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
