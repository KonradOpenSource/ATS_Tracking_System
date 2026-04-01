import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-job-offers',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="job-offers-container">
      <mat-card class="job-offers-card">
        <mat-card-header>
          <mat-card-title>Job Offers</mat-card-title>
          <mat-card-subtitle>Manage job postings and recruitment</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div class="coming-soon">
            <mat-icon class="coming-soon-icon">work_outline</mat-icon>
            <h3>Job Offers Management</h3>
            <p>This feature is coming soon!</p>
            <p>Here you'll be able to:</p>
            <ul>
              <li>Create and manage job postings</li>
              <li>Track application status</li>
              <li>Manage interview schedules</li>
              <li>Generate recruitment reports</li>
            </ul>
            <button mat-raised-button color="primary" disabled>
              Coming Soon
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .job-offers-container {
      padding: 20px;
    }

    .job-offers-card {
      margin-bottom: 20px;
    }

    .coming-soon {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .coming-soon-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 20px;
      color: #ccc;
    }

    .coming-soon h3 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 24px;
    }

    .coming-soon p {
      margin: 0 0 16px 0;
      font-size: 16px;
    }

    .coming-soon ul {
      text-align: left;
      max-width: 400px;
      margin: 0 auto 30px auto;
      padding-left: 20px;
    }

    .coming-soon li {
      margin-bottom: 8px;
    }
  `]
})
export class JobOffersComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
