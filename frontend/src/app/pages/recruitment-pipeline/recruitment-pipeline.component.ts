import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { RecruitmentService } from '../../services/recruitment.service';
import { RecruitmentStage, CandidateStageHistory, MoveCandidateRequest } from '../../models/recruitment.model';

@Component({
  selector: 'app-recruitment-pipeline',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    CdkDropList,
    CdkDrag
  ],
  template: `
    <div class="pipeline-container">
      <mat-card class="pipeline-card">
        <mat-card-header>
          <mat-card-title>Recruitment Pipeline</mat-card-title>
          <mat-card-subtitle>Drag and drop candidates between stages</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <!-- Actions -->
          <div class="actions-row">
            <button 
              mat-raised-button 
              color="primary" 
              (click)="initializeStages()"
              class="init-button">
              <mat-icon>refresh</mat-icon>
              Initialize Default Stages
            </button>
            
            <button 
              mat-raised-button 
              color="accent"
              (click)="loadPipelineData()"
              class="refresh-button">
              <mat-icon>sync</mat-icon>
              Refresh
            </button>
          </div>

          <!-- Loading State -->
          <div class="loading-container" *ngIf="isLoading">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Loading pipeline data...</p>
          </div>

          <!-- Pipeline Kanban Board -->
          <div class="kanban-board" *ngIf="!isLoading">
            <div class="stages-container" cdkDropListGroup>
              <div 
                *ngFor="let stage of stages; let i = index"
                class="stage-column"
                cdkDropList
                [cdkDropListData]="getCandidatesForStage(stage.id)"
                (cdkDropListDropped)="drop($event, stage.id)"
                [cdkDropListConnectedTo]="getConnectedDropLists()">
                
                <div class="stage-header">
                  <h3>{{ stage.name }}</h3>
                  <span class="candidate-count">{{ getCandidatesForStage(stage.id).length }}</span>
                </div>

                <div class="candidates-list">
                  <div 
                    *ngFor="let candidate of getCandidatesForStage(stage.id)"
                    class="candidate-card"
                    cdkDrag
                    [cdkDragData]="candidate">
                    
                    <div class="candidate-info">
                      <div class="candidate-name">
                        {{ candidate.candidate.firstName }} {{ candidate.candidate.lastName }}
                      </div>
                      <div class="candidate-email">{{ candidate.candidate.email }}</div>
                      <div class="candidate-notes" *ngIf="candidate.notes">
                        {{ candidate.notes }}
                      </div>
                    </div>

                    <div class="candidate-actions">
                      <button 
                        mat-icon-button 
                        color="primary"
                        (click)="viewCandidateHistory(candidate.candidate.id)"
                        matTooltip="View history">
                        <mat-icon>history</mat-icon>
                      </button>
                    </div>
                  </div>

                  <!-- Empty state -->
                  <div class="empty-state" *ngIf="getCandidatesForStage(stage.id).length === 0">
                    <mat-icon>person_outline</mat-icon>
                    <p>No candidates</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- No stages state -->
          <div class="no-stages" *ngIf="!isLoading && stages.length === 0">
            <mat-icon class="no-stages-icon">view_kanban</mat-icon>
            <h3>No Recruitment Stages</h3>
            <p>Initialize default stages to get started</p>
            <button 
              mat-raised-button 
              color="primary"
              (click)="initializeStages()">
              <mat-icon>add</mat-icon>
              Initialize Stages
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .pipeline-container {
      padding: 20px;
      background-color: #f5f5f5;
      min-height: 100vh;
    }

    .pipeline-card {
      margin-bottom: 20px;
    }

    .actions-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      gap: 16px;
    }

    .init-button, .refresh-button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 60px 20px;
      color: #666;
    }

    .loading-container p {
      margin-top: 16px;
      font-size: 16px;
    }

    .kanban-board {
      overflow-x: auto;
      padding-bottom: 20px;
    }

    .stages-container {
      display: flex;
      gap: 16px;
      min-height: 500px;
    }

    .stage-column {
      flex: 0 0 300px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .stage-header {
      padding: 16px;
      background: #f8f9fa;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stage-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .candidate-count {
      background: #e3f2fd;
      color: #1976d2;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .candidates-list {
      flex: 1;
      padding: 12px;
      overflow-y: auto;
      min-height: 200px;
    }

    .candidate-card {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 8px;
      cursor: move;
      transition: all 0.2s ease;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .candidate-card:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      transform: translateY(-1px);
    }

    .candidate-card.cdk-drag-preview {
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      transform: rotate(2deg);
    }

    .candidate-info {
      flex: 1;
    }

    .candidate-name {
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }

    .candidate-email {
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    }

    .candidate-notes {
      font-size: 11px;
      color: #888;
      font-style: italic;
      background: #f5f5f5;
      padding: 4px 6px;
      border-radius: 4px;
      margin-top: 4px;
    }

    .candidate-actions {
      display: flex;
      gap: 4px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      color: #999;
      text-align: center;
    }

    .empty-state mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      margin-bottom: 8px;
    }

    .empty-state p {
      margin: 0;
      font-size: 14px;
    }

    .no-stages {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      color: #666;
      text-align: center;
    }

    .no-stages-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 20px;
      color: #ccc;
    }

    .no-stages h3 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 24px;
    }

    .no-stages p {
      margin: 0 0 24px 0;
      font-size: 16px;
    }

    @media (max-width: 1200px) {
      .stage-column {
        flex: 0 0 280px;
      }
    }

    @media (max-width: 768px) {
      .actions-row {
        flex-direction: column;
        align-items: stretch;
      }

      .stages-container {
        flex-direction: column;
      }

      .stage-column {
        flex: 1;
        width: 100%;
      }
    }

    .cdk-drop-list-dragging .candidate-card:not(.cdk-drag-placeholder) {
      opacity: 0.5;
    }

    .cdk-drag-placeholder {
      background: #e3f2fd;
      border: 2px dashed #1976d2;
      border-radius: 6px;
      margin-bottom: 8px;
      min-height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #1976d2;
      font-size: 14px;
    }
  `]
})
export class RecruitmentPipelineComponent implements OnInit {
  stages: RecruitmentStage[] = [];
  allCandidates: CandidateStageHistory[] = [];
  isLoading = false;

  constructor(
    private recruitmentService: RecruitmentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPipelineData();
  }

  loadPipelineData(): void {
    this.isLoading = true;
    
    // Load stages
    this.recruitmentService.getStages().subscribe({
      next: (stages) => {
        this.stages = stages;
        this.loadCandidatesInStages();
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Failed to load recruitment stages', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  loadCandidatesInStages(): void {
    // Load candidates for each stage
    this.allCandidates = [];
    
    this.stages.forEach(stage => {
      this.recruitmentService.getCandidatesInStage(stage.id).subscribe({
        next: (candidates) => {
          this.allCandidates.push(...candidates);
          if (this.allCandidates.length === this.getTotalCandidatesCount()) {
            this.isLoading = false;
          }
        },
        error: () => {
          this.isLoading = false;
        }
      });
    });

    // If no stages, still stop loading
    if (this.stages.length === 0) {
      this.isLoading = false;
    }
  }

  getTotalCandidatesCount(): number {
    return this.stages.reduce((total, stage) => total + this.getCandidatesForStage(stage.id).length, 0);
  }

  getCandidatesForStage(stageId: number): CandidateStageHistory[] {
    return this.allCandidates.filter(candidate => candidate.stage.id === stageId);
  }

  drop(event: CdkDragDrop<CandidateStageHistory[]>, targetStageId: number): void {
    if (event.previousContainer === event.container) {
      // Reordering within the same stage
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      // Moving to a different stage
      const candidate = event.previousContainer.data[event.previousIndex];
      
      // Remove from previous stage
      event.previousContainer.data.splice(event.previousIndex, 1);
      
      // Add to new stage
      event.container.data.splice(event.currentIndex, 0, candidate);
      
      // Update backend
      this.moveCandidateToStage(candidate.candidate.id, targetStageId);
    }
  }

  moveCandidateToStage(candidateId: number, stageId: number): void {
    const request: MoveCandidateRequest = {
      notes: `Moved via drag and drop`,
      changedById: 1 // TODO: Get from auth service
    };

    this.recruitmentService.moveCandidateToStage(candidateId, stageId, request).subscribe({
      next: () => {
        this.snackBar.open('Candidate moved successfully', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        // Refresh data to get updated timestamps
        this.loadCandidatesInStages();
      },
      error: () => {
        this.snackBar.open('Failed to move candidate', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        // Refresh to restore correct state
        this.loadCandidatesInStages();
      }
    });
  }

  getConnectedDropLists(): string[] {
    return this.stages.map((_, index) => `cdk-drop-list-${index}`);
  }

  initializeStages(): void {
    this.recruitmentService.initializeDefaultStages().subscribe({
      next: () => {
        this.snackBar.open('Default stages initialized successfully', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.loadPipelineData();
      },
      error: () => {
        this.snackBar.open('Failed to initialize default stages', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  viewCandidateHistory(candidateId: number): void {
    // TODO: Open dialog or navigate to candidate history
    console.log('View history for candidate:', candidateId);
    this.snackBar.open('Candidate history feature coming soon', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}
