import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatCardModule } from "@angular/material/card";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CandidateService } from "../../services/candidate.service";
import { Candidate } from "../../models/candidate.model";

@Component({
  selector: "app-candidates",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="candidates-container">
      <mat-card class="candidates-card">
        <mat-card-header>
          <mat-card-title>Candidates</mat-card-title>
          <mat-card-subtitle>Manage your candidate database</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <!-- Search and Actions -->
          <div class="actions-row">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search candidates</mat-label>
              <input
                matInput
                (keyup)="onSearchChange($event)"
                placeholder="Search by name, email, or skills"
              />
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <button
              mat-raised-button
              color="primary"
              routerLink="/dashboard/candidates/add"
              class="add-button"
            >
              <mat-icon>add</mat-icon>
              Add Candidate
            </button>
          </div>

          <!-- Loading State -->
          <div class="loading-container" *ngIf="isLoading">
            <mat-spinner diameter="40"></mat-spinner>
          </div>

          <!-- Candidates Table -->
          <div class="table-container" *ngIf="!isLoading">
            <table
              mat-table
              [dataSource]="candidates"
              matSort
              class="candidates-table"
            >
              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
                <td mat-cell *matCellDef="let candidate">
                  <div class="candidate-name">
                    <strong
                      >{{ candidate.firstName }}
                      {{ candidate.lastName }}</strong
                    >
                    <div class="candidate-email">{{ candidate.email }}</div>
                  </div>
                </td>
              </ng-container>

              <!-- Phone Column -->
              <ng-container matColumnDef="phone">
                <th mat-header-cell *matHeaderCellDef>Phone</th>
                <td mat-cell *matCellDef="let candidate">
                  {{ candidate.phone || "N/A" }}
                </td>
              </ng-container>

              <!-- Skills Column -->
              <ng-container matColumnDef="skills">
                <th mat-header-cell *matHeaderCellDef>Skills</th>
                <td mat-cell *matCellDef="let candidate">
                  <div class="skills-container">
                    <span *ngIf="candidate.skills" class="skills-text">
                      {{ candidate.skills | slice: 0 : 50
                      }}{{ candidate.skills.length > 50 ? "..." : "" }}
                    </span>
                    <span *ngIf="!candidate.skills" class="no-skills"
                      >No skills listed</span
                    >
                  </div>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let candidate">
                  <button
                    mat-icon-button
                    color="primary"
                    [routerLink]="['/dashboard/candidates/edit', candidate.id]"
                    matTooltip="Edit candidate"
                  >
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    color="warn"
                    (click)="deleteCandidate(candidate.id)"
                    matTooltip="Delete candidate"
                  >
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>

            <!-- No Data State -->
            <div class="no-data" *ngIf="candidates.length === 0 && !isLoading">
              <mat-icon>people_outline</mat-icon>
              <p>No candidates found</p>
              <button
                mat-raised-button
                color="primary"
                routerLink="/dashboard/candidates/add"
              >
                Add your first candidate
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .candidates-container {
        padding: 20px;
      }

      .candidates-card {
        margin-bottom: 20px;
      }

      .actions-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        gap: 16px;
      }

      .search-field {
        flex: 1;
        max-width: 400px;
      }

      .add-button {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .loading-container {
        display: flex;
        justify-content: center;
        padding: 40px;
      }

      .table-container {
        overflow-x: auto;
      }

      .candidates-table {
        width: 100%;
        min-width: 600px;
      }

      .candidate-name {
        display: flex;
        flex-direction: column;
      }

      .candidate-email {
        font-size: 12px;
        color: #666;
        margin-top: 2px;
      }

      .skills-container {
        max-width: 200px;
      }

      .skills-text {
        display: block;
        font-size: 12px;
        line-height: 1.4;
      }

      .no-skills {
        color: #999;
        font-style: italic;
        font-size: 12px;
      }

      .no-data {
        text-align: center;
        padding: 60px 20px;
        color: #666;
      }

      .no-data mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
        color: #ccc;
      }

      .no-data p {
        margin: 0 0 20px 0;
        font-size: 16px;
      }

      @media (max-width: 768px) {
        .actions-row {
          flex-direction: column;
          align-items: stretch;
        }

        .search-field {
          max-width: none;
        }

        .add-button {
          justify-content: center;
        }
      }
    `,
  ],
})
export class CandidatesComponent implements OnInit {
  candidates: Candidate[] = [];
  displayedColumns: string[] = ["name", "phone", "skills", "actions"];
  isLoading = false;
  searchQuery = "";

  constructor(
    private candidateService: CandidateService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadCandidates();
  }

  loadCandidates(): void {
    this.isLoading = true;
    console.log("Loading candidates...");

    if (this.searchQuery) {
      this.candidateService.searchCandidates(this.searchQuery).subscribe({
        next: (candidates) => {
          console.log("Search candidates response:", candidates);
          this.candidates = candidates;
          this.isLoading = false;
        },
        error: (error) => {
          console.error("Error searching candidates:", error);
          this.isLoading = false;
        },
      });
    } else {
      this.candidateService.getCandidates().subscribe({
        next: (candidates) => {
          console.log("Candidates response:", candidates);
          this.candidates = candidates;
          this.isLoading = false;
        },
        error: (error) => {
          console.error("Error loading candidates:", error);
          this.isLoading = false;
        },
      });
    }
  }

  onSearchChange(event: any): void {
    this.searchQuery = event.target.value;
    this.loadCandidates();
  }

  deleteCandidate(id: number): void {
    if (confirm("Are you sure you want to delete this candidate?")) {
      this.candidateService.deleteCandidate(id).subscribe({
        next: () => {
          this.snackBar.open("Candidate deleted successfully", "Close", {
            duration: 3000,
            horizontalPosition: "center",
            verticalPosition: "top",
          });
          this.loadCandidates();
        },
        error: () => {
          this.snackBar.open("Failed to delete candidate", "Close", {
            duration: 3000,
            horizontalPosition: "center",
            verticalPosition: "top",
          });
        },
      });
    }
  }
}
