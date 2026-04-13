import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { JobOfferService, JobOffer } from '../../services/job-offer.service';

@Component({
  selector: 'app-job-offers',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  template: `
    <div class="job-offers-container">
      <div class="header-section">
        <div class="title-group">
          <h1>Job Offers</h1>
          <p>Create and manage your organization's job postings</p>
        </div>
        <button mat-raised-button color="primary" (click)="toggleForm()" *ngIf="!showForm">
          <mat-icon>add</mat-icon>
          Create New Offer
        </button>
        <button mat-stroked-button color="warn" (click)="toggleForm()" *ngIf="showForm">
          <mat-icon>close</mat-icon>
          Cancel
        </button>
      </div>

      <!-- Job Offer Form -->
      <mat-card class="form-card" *ngIf="showForm">
        <mat-card-header>
          <mat-card-title>{{ editingOffer ? 'Edit' : 'Create' }} Job Offer</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="jobForm" (ngSubmit)="onSubmit()" class="job-form">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Job Title</mat-label>
                <input matInput formControlName="title" placeholder="e.g. Senior Java Developer">
                <mat-error *ngIf="jobForm.get('title')?.hasError('required')">Title is required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Location</mat-label>
                <input matInput formControlName="location" placeholder="e.g. Warsaw/Remote">
                <mat-error *ngIf="jobForm.get('location')?.hasError('required')">Location is required</mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Minimum Salary</mat-label>
                <input matInput type="number" formControlName="salaryMin">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Maximum Salary</mat-label>
                <input matInput type="number" formControlName="salaryMax">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Status</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="OPEN">Open</mat-option>
                  <mat-option value="DRAFT">Draft</mat-option>
                  <mat-option value="CLOSED">Closed</mat-option>
                  <mat-option value="ARCHIVED">Archived</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="4" placeholder="Describe the role..."></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Requirements</mat-label>
              <textarea matInput formControlName="requirements" rows="4" placeholder="List technology stack, experience needed..."></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Benefits</mat-label>
              <textarea matInput formControlName="benefits" rows="2" placeholder="Perks, insurance, etc."></textarea>
            </mat-form-field>

            <div class="form-actions">
              <button mat-flat-button color="primary" type="submit" [disabled]="jobForm.invalid || isSubmitting">
                <mat-spinner diameter="20" *ngIf="isSubmitting"></mat-spinner>
                <span *ngIf="!isSubmitting">{{ editingOffer ? 'Update' : 'Publish' }} Offer</span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Job Offers List -->
      <mat-card class="list-card" *ngIf="!isLoading">
        <mat-table [dataSource]="jobOffers" class="job-table">
          <ng-container matColumnDef="title">
            <mat-header-cell *matHeaderCellDef> Title </mat-header-cell>
            <mat-cell *matCellDef="let offer"> 
              <div class="job-title-cell">
                <span class="job-name">{{offer.title}}</span>
                <span class="job-location">{{offer.location}}</span>
              </div>
            </mat-cell>
          </ng-container>

          <ng-container matColumnDef="salary">
            <mat-header-cell *matHeaderCellDef> Salary Range </mat-header-cell>
            <mat-cell *matCellDef="let offer"> 
              {{offer.salaryMin | currency:'PLN':'symbol':'1.0-0'}} - {{offer.salaryMax | currency:'PLN':'symbol':'1.0-0'}}
            </mat-cell>
          </ng-container>

          <ng-container matColumnDef="status">
            <mat-header-cell *matHeaderCellDef> Status </mat-header-cell>
            <mat-cell *matCellDef="let offer"> 
              <span class="status-badge" [ngClass]="offer.status.toLowerCase()">{{offer.status}}</span>
            </mat-cell>
          </ng-container>

          <ng-container matColumnDef="actions">
            <mat-header-cell *matHeaderCellDef> Actions </mat-header-cell>
            <mat-cell *matCellDef="let offer">
              <button mat-icon-button color="primary" (click)="editOffer(offer)" matTooltip="Edit">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteOffer(offer.id)" matTooltip="Delete">
                <mat-icon>delete</mat-icon>
              </button>
            </mat-cell>
          </ng-container>

          <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
          <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
        </mat-table>

        <div class="empty-state" *ngIf="jobOffers.length === 0">
          <mat-icon>work_off</mat-icon>
          <p>No job offers found. Create your first one!</p>
        </div>
      </mat-card>

      <div class="loading-overlay" *ngIf="isLoading">
        <mat-spinner></mat-spinner>
      </div>
    </div>
  `,
  styles: [`
    .job-offers-container {
      padding: 30px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .title-group h1 {
      margin: 0;
      font-size: 2.5rem;
      font-weight: 700;
      color: #1a1a1a;
    }

    .title-group p {
      margin: 5px 0 0 0;
      color: #666;
      font-size: 1.1rem;
    }

    .form-card {
      margin-bottom: 30px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }

    .job-form {
      display: flex;
      flex-direction: column;
      gap: 15px;
      padding: 20px 0;
    }

    .form-row {
      display: flex;
      gap: 20px;
    }

    .form-row mat-form-field {
      flex: 1;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .list-card {
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      overflow: hidden;
    }

    .job-table {
      width: 100%;
    }

    .job-title-cell {
      display: flex;
      flex-direction: column;
    }

    .job-name {
      font-weight: 600;
      color: #333;
      font-size: 1rem;
    }

    .job-location {
      font-size: 0.85rem;
      color: #777;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.open { background: #e6f7ed; color: #2e7d32; }
    .status-badge.draft { background: #fef9c3; color: #854d0e; }
    .status-badge.closed { background: #fee2e2; color: #b91c1c; }
    .status-badge.archived { background: #f3f4f6; color: #4b5563; }

    .empty-state {
      text-align: center;
      padding: 60px;
      color: #999;
    }

    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 15px;
    }

    .loading-overlay {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 300px;
    }

    mat-flat-button {
      padding: 0 30px;
      height: 48px;
      font-weight: 600;
    }
  `]
})
export class JobOffersComponent implements OnInit {
  jobOffers: JobOffer[] = [];
  displayedColumns: string[] = ['title', 'salary', 'status', 'actions'];
  isLoading = true;
  showForm = false;
  isSubmitting = false;
  jobForm: FormGroup;
  editingOffer: JobOffer | null = null;

  constructor(
    private jobOfferService: JobOfferService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.jobForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      requirements: [''],
      benefits: [''],
      location: ['', Validators.required],
      status: ['OPEN', Validators.required],
      salaryMin: [null],
      salaryMax: [null]
    });
  }

  ngOnInit(): void {
    this.loadJobOffers();
  }

  loadJobOffers(): void {
    this.isLoading = true;
    this.jobOfferService.getJobOffers().subscribe({
      next: (offers) => {
        this.jobOffers = offers;
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Error loading job offers', 'Close');
        this.isLoading = false;
      }
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.editingOffer = null;
    this.jobForm.reset({ status: 'OPEN' });
  }

  onSubmit(): void {
    if (this.jobForm.invalid) return;

    this.isSubmitting = true;
    const jobData: JobOffer = this.jobForm.value;

    if (this.editingOffer && this.editingOffer.id) {
      this.jobOfferService.updateJobOffer(this.editingOffer.id, jobData).subscribe({
        next: () => {
          this.snackBar.open('Job offer updated successfully', 'Close');
          this.completeSubmission();
        },
        error: () => {
          this.snackBar.open('Error updating job offer', 'Close');
          this.isSubmitting = false;
        }
      });
    } else {
      this.jobOfferService.createJobOffer(jobData).subscribe({
        next: () => {
          this.snackBar.open('Job offer created successfully', 'Close');
          this.completeSubmission();
        },
        error: () => {
          this.snackBar.open('Error creating job offer', 'Close');
          this.isSubmitting = false;
        }
      });
    }
  }

  completeSubmission(): void {
    this.isSubmitting = false;
    this.showForm = false;
    this.resetForm();
    this.loadJobOffers();
  }

  editOffer(offer: JobOffer): void {
    this.editingOffer = offer;
    this.jobForm.patchValue(offer);
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteOffer(id: number): void {
    if (confirm('Are you sure you want to delete this job offer?')) {
      this.jobOfferService.deleteJobOffer(id).subscribe({
        next: () => {
          this.snackBar.open('Job offer deleted successfully', 'Close');
          this.loadJobOffers();
        },
        error: () => {
          this.snackBar.open('Error deleting job offer', 'Close');
        }
      });
    }
  }
}
