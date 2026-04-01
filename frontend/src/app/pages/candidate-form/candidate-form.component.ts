import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
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
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CandidateService } from "../../services/candidate.service";
import {
  Candidate,
  CreateCandidateRequest,
  UpdateCandidateRequest,
} from "../../models/candidate.model";

@Component({
  selector: "app-candidate-form",
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
    <div class="form-container">
      <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>{{
            isEditMode ? "Edit Candidate" : "Add New Candidate"
          }}</mat-card-title>
          <mat-card-subtitle>
            {{
              isEditMode
                ? "Update candidate information"
                : "Fill in the candidate details"
            }}
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="candidateForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>First Name</mat-label>
                <input
                  matInput
                  formControlName="firstName"
                  placeholder="Enter first name"
                  required
                />
                <mat-icon matSuffix>person</mat-icon>
                <mat-error
                  *ngIf="candidateForm.get('firstName')?.hasError('required')"
                >
                  First name is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Last Name</mat-label>
                <input
                  matInput
                  formControlName="lastName"
                  placeholder="Enter last name"
                  required
                />
                <mat-icon matSuffix>person</mat-icon>
                <mat-error
                  *ngIf="candidateForm.get('lastName')?.hasError('required')"
                >
                  Last name is required
                </mat-error>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input
                matInput
                type="email"
                formControlName="email"
                placeholder="Enter email address"
                required
              />
              <mat-icon matSuffix>email</mat-icon>
              <mat-error
                *ngIf="candidateForm.get('email')?.hasError('required')"
              >
                Email is required
              </mat-error>
              <mat-error *ngIf="candidateForm.get('email')?.hasError('email')">
                Please enter a valid email
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Phone</mat-label>
              <input
                matInput
                formControlName="phone"
                placeholder="Enter phone number"
              />
              <mat-icon matSuffix>phone</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Professional Summary</mat-label>
              <textarea
                matInput
                formControlName="summary"
                placeholder="Brief professional summary"
                rows="3"
              >
              </textarea>
              <mat-icon matSuffix>description</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Work Experience</mat-label>
              <textarea
                matInput
                formControlName="experience"
                placeholder="Describe work experience"
                rows="4"
              >
              </textarea>
              <mat-icon matSuffix>work</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Education</mat-label>
              <textarea
                matInput
                formControlName="education"
                placeholder="Educational background"
                rows="3"
              >
              </textarea>
              <mat-icon matSuffix>school</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Technical Skills</mat-label>
              <textarea
                matInput
                formControlName="skills"
                placeholder="List technical skills (comma separated)"
                rows="3"
              >
              </textarea>
              <mat-icon matSuffix>code</mat-icon>
            </mat-form-field>
          </form>
        </mat-card-content>

        <mat-card-actions align="end">
          <button
            mat-button
            routerLink="/dashboard/candidates"
            class="cancel-button"
          >
            Cancel
          </button>
          <button
            mat-raised-button
            color="primary"
            (click)="onSubmit()"
            [disabled]="candidateForm.invalid || isLoading"
            class="submit-button"
          >
            <span *ngIf="!isLoading">{{
              isEditMode ? "Update" : "Create"
            }}</span>
            <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .form-container {
        padding: 20px;
        max-width: 800px;
        margin: 0 auto;
      }

      .form-card {
        padding: 20px;
      }

      .full-width {
        width: 100%;
        margin-bottom: 16px;
      }

      .form-row {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;
      }

      .half-width {
        width: 50%;
      }

      .submit-button {
        width: 120px;
        height: 48px;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .cancel-button {
        margin-right: 8px;
      }

      mat-card-header {
        text-align: center;
        margin-bottom: 20px;
      }

      mat-card-title {
        font-size: 24px;
        font-weight: 500;
        color: #333;
      }

      mat-card-subtitle {
        color: #666;
        margin-top: 8px;
      }

      textarea {
        resize: vertical;
      }

      @media (max-width: 600px) {
        .form-row {
          flex-direction: column;
          gap: 0;
        }

        .half-width {
          width: 100%;
        }

        .submit-button {
          width: 100%;
        }
      }
    `,
  ],
})
export class CandidateFormComponent implements OnInit {
  candidateForm: FormGroup;
  isLoading = false;
  isEditMode = false;
  candidateId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private candidateService: CandidateService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) {
    this.candidateForm = this.fb.group({
      firstName: ["", [Validators.required]],
      lastName: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
      phone: [""],
      summary: [""],
      experience: [""],
      education: [""],
      skills: [""],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.isEditMode = true;
      this.candidateId = Number(id);
      this.loadCandidate(this.candidateId);
    }
  }

  loadCandidate(id: number): void {
    this.isLoading = true;
    this.candidateService.getCandidate(id).subscribe({
      next: (candidate) => {
        this.candidateForm.patchValue({
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          email: candidate.email,
          phone: candidate.phone || "",
          summary: candidate.summary || "",
          experience: candidate.experience || "",
          education: candidate.education || "",
          skills: candidate.skills || "",
        });
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open("Failed to load candidate", "Close", {
          duration: 3000,
          horizontalPosition: "center",
          verticalPosition: "top",
        });
        this.router.navigate(["/dashboard/candidates"]);
        this.isLoading = false;
      },
    });
  }

  onSubmit(): void {
    console.log(
      "onSubmit called",
      this.candidateForm.value,
      this.candidateForm.valid,
    );
    if (this.candidateForm.invalid) {
      console.log("Form is invalid. Errors:", this.candidateForm.errors);
      Object.keys(this.candidateForm.controls).forEach(key => {
        const controlErrors = this.candidateForm.get(key)?.errors;
        if (controlErrors != null) {
          console.log('Key control: ' + key + ', errors: ', controlErrors);
        }
      });
      this.snackBar.open("Please fill all required fields correctly", "Close", {
        duration: 3000,
      });
      return;
    }

    this.isLoading = true;

    const formData = this.candidateForm.value;

    if (this.isEditMode && this.candidateId) {
      const updateRequest: UpdateCandidateRequest = {
        id: this.candidateId,
        ...formData,
      };

      this.candidateService
        .updateCandidate(this.candidateId, updateRequest)
        .subscribe({
          next: () => {
            this.snackBar.open("Candidate updated successfully", "Close", {
              duration: 3000,
              horizontalPosition: "center",
              verticalPosition: "top",
            });
            this.router.navigate(["/dashboard/candidates"]);
          },
          error: () => {
            this.isLoading = false;
          },
        });
    } else {
      const createRequest: CreateCandidateRequest = formData;

      this.candidateService.createCandidate(createRequest).subscribe({
        next: () => {
          this.snackBar.open("Candidate created successfully", "Close", {
            duration: 3000,
            horizontalPosition: "center",
            verticalPosition: "top",
          });
          this.router.navigate(["/dashboard/candidates"]);
        },
        error: (error) => {
          console.error("Failed to create candidate:", error);
          this.snackBar.open("Failed to create candidate. Please try again.", "Close", {
            duration: 3000,
            horizontalPosition: "center",
            verticalPosition: "top",
          });
          this.isLoading = false;
        },
      });
    }
  }
}
