import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { MatSnackBar } from "@angular/material/snack-bar";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Subscription } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { User } from "../../models/auth.model";

@Component({
  selector: "app-settings",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  template: `
    <div class="settings-container">
      <mat-card class="settings-card">
        <mat-card-header>
          <mat-card-title>Settings</mat-card-title>
          <mat-card-subtitle>Manage your account settings</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="settingsForm" (ngSubmit)="saveSettings()">
            <div class="user-info">
              <h3>User Information</h3>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Username</mat-label>
                <input
                  matInput
                  formControlName="username"
                  placeholder="Enter username"
                  required
                />
                <mat-icon matPrefix>person</mat-icon>
                <mat-error
                  *ngIf="settingsForm.get('username')?.hasError('required')"
                >
                  Username is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input
                  matInput
                  formControlName="email"
                  type="email"
                  placeholder="Enter email"
                  required
                />
                <mat-icon matPrefix>email</mat-icon>
                <mat-error
                  *ngIf="settingsForm.get('email')?.hasError('required')"
                >
                  Email is required
                </mat-error>
                <mat-error *ngIf="settingsForm.get('email')?.hasError('email')">
                  Please enter a valid email
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>First Name</mat-label>
                <input
                  matInput
                  formControlName="firstName"
                  placeholder="Enter first name"
                  required
                />
                <mat-icon matPrefix>person</mat-icon>
                <mat-error
                  *ngIf="settingsForm.get('firstName')?.hasError('required')"
                >
                  First name is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Last Name</mat-label>
                <input
                  matInput
                  formControlName="lastName"
                  placeholder="Enter last name"
                  required
                />
                <mat-icon matPrefix>person</mat-icon>
                <mat-error
                  *ngIf="settingsForm.get('lastName')?.hasError('required')"
                >
                  Last name is required
                </mat-error>
              </mat-form-field>

              <p><strong>Role:</strong> {{ currentUser?.role }}</p>
            </div>

            <div class="settings-section">
              <h3>Preferences</h3>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email Notifications</mat-label>
                <input
                  matInput
                  formControlName="notificationEmail"
                  type="email"
                  placeholder="Enter email for notifications"
                />
                <mat-icon matPrefix>notifications</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Theme</mat-label>
                <mat-select
                  formControlName="theme"
                  (selectionChange)="onThemeChange($event.value)"
                >
                  <mat-option value="light">Light</mat-option>
                  <mat-option value="dark">Dark</mat-option>
                  <mat-option value="auto">Auto</mat-option>
                </mat-select>
                <mat-icon matPrefix>palette</mat-icon>
              </mat-form-field>
            </div>

            <mat-card-actions align="end">
              <button
                mat-raised-button
                color="primary"
                type="submit"
                (click)="saveSettings()"
                [disabled]="settingsForm.invalid || isLoading"
              >
                <mat-icon>save</mat-icon>
                <span *ngIf="!isLoading">Save Settings</span>
                <span *ngIf="isLoading">Saving...</span>
              </button>
            </mat-card-actions>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .settings-container {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        min-height: calc(100vh - 64px);
        background-color: #fafafa;
        padding: 20px;
      }

      .settings-card {
        max-width: 600px;
        width: 100%;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      }

      .full-width {
        width: 100%;
        margin-bottom: 20px;
      }

      .user-info {
        margin-bottom: 30px;
        padding: 20px;
        background-color: #f5f5f5;
        border-radius: 8px;
      }

      .user-info h3 {
        margin-top: 0;
        margin-bottom: 15px;
        color: #333;
      }

      .user-info p {
        margin: 8px 0;
        font-size: 14px;
      }

      .settings-section {
        margin-bottom: 20px;
      }

      .settings-section h3 {
        margin-bottom: 20px;
        color: #333;
      }

      mat-card-header {
        text-align: center;
        margin-bottom: 30px;
      }

      mat-card-title {
        font-size: 24px;
        font-weight: 600;
        color: #333;
        margin-bottom: 8px;
      }

      mat-card-subtitle {
        color: #666;
        font-size: 14px;
        margin-top: 4px;
      }

      mat-icon {
        color: #667eea;
        font-size: 20px;
      }

      @media (max-width: 768px) {
        .settings-card {
          margin: 10px;
          padding: 20px;
        }

        mat-card-title {
          font-size: 20px;
        }
      }

      /* Theme styles */
      :host-context(.light-theme) .settings-container {
        background-color: #fafafa;
      }

      :host-context(.dark-theme) .settings-container {
        background-color: #121212;
      }

      :host-context(.dark-theme) .settings-card {
        background-color: #1e1e1e;
        color: #ffffff;
      }

      :host-context(.dark-theme) .user-info {
        background-color: #2d2d2d;
      }

      :host-context(.dark-theme) .user-info h3,
      :host-context(.dark-theme) .settings-section h3,
      :host-context(.dark-theme) mat-card-title {
        color: #ffffff;
      }

      :host-context(.dark-theme) mat-form-field {
        --mat-form-field-fill-input-text-color: #ffffff;
        --mat-form-field-label-text-color: rgba(255, 255, 255, 0.7);
      }
    `,
  ],
})
export class SettingsComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  settingsForm: FormGroup;
  isLoading = false;
  private userSubscription: Subscription | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {
    this.settingsForm = this.fb.group({
      username: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
      firstName: ["", [Validators.required]],
      lastName: ["", [Validators.required]],
      notificationEmail: ["", [Validators.email]],
      theme: ["light", [Validators.required]],
    });
  }

  ngOnInit(): void {
    // Subscribe to user changes
    this.userSubscription = this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.currentUser = user;
        this.updateFormWithUserData(user);
      }
    });

    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem("user_settings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      this.settingsForm.patchValue(settings);
    }

    // Apply saved theme
    this.applyTheme(this.settingsForm.get("theme")?.value || "light");
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  private updateFormWithUserData(user: User): void {
    this.settingsForm.patchValue({
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  }

  onThemeChange(theme: string): void {
    this.applyTheme(theme);
  }

  private applyTheme(theme: string): void {
    const body = document.body;

    // Remove all theme classes
    body.classList.remove("light-theme", "dark-theme");

    // Apply new theme
    if (theme === "dark") {
      body.classList.add("dark-theme");
    } else {
      body.classList.add("light-theme");
    }

    // Save theme preference
    localStorage.setItem("selected_theme", theme);
  }

  saveSettings(): void {
    if (this.settingsForm.invalid) {
      this.snackBar.open("Please fill in all required fields", "Close", {
        duration: 3000,
        horizontalPosition: "center",
        verticalPosition: "top",
      });
      return;
    }

    this.isLoading = true;

    const settings = this.settingsForm.value;

    // Update user through AuthService
    this.authService.updateUser({
      username: settings.username,
      email: settings.email,
      firstName: settings.firstName,
      lastName: settings.lastName,
    });

    // Save settings to localStorage
    localStorage.setItem("user_settings", JSON.stringify(settings));

    this.snackBar.open("Settings saved successfully!", "Close", {
      duration: 3000,
      horizontalPosition: "center",
      verticalPosition: "top",
    });

    this.isLoading = false;
  }
}
