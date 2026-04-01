import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AIService } from '../../services/ai.service';
import { CV, AIAnalysis } from '../../models/ai.model';

@Component({
  selector: 'app-ai-panel',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule
  ],
  template: `
    <div class="ai-panel-container">
      <mat-card class="ai-panel-card">
        <mat-card-header>
          <mat-card-title>AI Recruitment Panel</mat-card-title>
          <mat-card-subtitle>AI-powered CV analysis and candidate matching</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <mat-tab-group>
            <!-- CV Upload Tab -->
            <mat-tab label="CV Upload">
              <div class="upload-section">
                <div class="upload-area" 
                     [class.drag-over]="isDragOver"
                     (dragover)="onDragOver($event)"
                     (dragleave)="onDragLeave($event)"
                     (drop)="onDrop($event)">
                  <input type="file" 
                         #fileInput 
                         (change)="onFileSelected($event)"
                         accept=".pdf,.doc,.docx,.txt"
                         style="display: none;">
                  
                  <div class="upload-content">
                    <mat-icon class="upload-icon">cloud_upload</mat-icon>
                    <h3>Upload CV</h3>
                    <p>Drag and drop CV files here or click to browse</p>
                    <p class="file-types">Supported: PDF, DOC, DOCX, TXT (max 10MB)</p>
                    
                    <button mat-raised-button color="primary" (click)="fileInput.click()">
                      <mat-icon>folder_open</mat-icon>
                      Browse Files
                    </button>
                  </div>
                </div>

                <!-- Upload Progress -->
                <div class="upload-progress" *ngIf="uploadProgress > 0 && uploadProgress < 100">
                  <mat-progress-bar mode="determinate" [value]="uploadProgress"></mat-progress-bar>
                  <p>Uploading: {{ uploadProgress }}%</p>
                </div>

                <!-- Recent CVs -->
                <div class="recent-cvs" *ngIf="recentCVs.length > 0">
                  <h4>Recent CVs</h4>
                  <div class="cv-list">
                    <div class="cv-item" *ngFor="let cv of recentCVs">
                      <mat-icon>{{ getFileIcon(cv.contentType) }}</mat-icon>
                      <div class="cv-info">
                        <div class="cv-name">{{ cv.originalFilename }}</div>
                        <div class="cv-details">
                          {{ cv.candidate.firstName }} {{ cv.candidate.lastName }} • 
                          {{ formatFileSize(cv.fileSize) }}
                        </div>
                      </div>
                      <div class="cv-actions">
                        <button mat-icon-button color="primary" (click)="analyzeCV(cv.id)">
                          <mat-icon>analytics</mat-icon>
                        </button>
                        <button mat-icon-button color="accent" (click)="downloadCV(cv.id)">
                          <mat-icon>download</mat-icon>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </mat-tab>

            <!-- AI Analysis Tab -->
            <mat-tab label="Analysis Results">
              <div class="analysis-section">
                <!-- Loading State -->
                <div class="loading-container" *ngIf="isLoadingAnalysis">
                  <mat-spinner diameter="40"></mat-spinner>
                  <p>Analyzing CV...</p>
                </div>

                <!-- Analysis Results -->
                <div class="analysis-results" *ngIf="currentAnalysis && !isLoadingAnalysis">
                  <div class="score-section">
                    <h3>Match Score: {{ currentAnalysis.matchScore }}%</h3>
                    <mat-progress-bar 
                      mode="determinate" 
                      [value]="currentAnalysis.matchScore"
                      [color]="getScoreColor(currentAnalysis.matchScore)">
                    </mat-progress-bar>
                    <p class="score-text">{{ getScoreDescription(currentAnalysis.matchScore) }}</p>
                  </div>

                  <div class="analysis-details">
                    <mat-card class="detail-card">
                      <mat-card-header>
                        <mat-card-title>Summary</mat-card-title>
                      </mat-card-header>
                      <mat-card-content>
                        <p>{{ currentAnalysis.summary }}</p>
                      </mat-card-content>
                    </mat-card>

                    <div class="skills-grid">
                      <mat-card class="detail-card">
                        <mat-card-header>
                          <mat-card-title>Key Skills</mat-card-title>
                        </mat-card-header>
                        <mat-card-content>
                          <p>{{ currentAnalysis.keySkills || 'No key skills identified' }}</p>
                        </mat-card-content>
                      </mat-card>

                      <mat-card class="detail-card">
                        <mat-card-header>
                          <mat-card-title>Missing Skills</mat-card-title>
                        </mat-card-header>
                        <mat-card-content>
                          <p>{{ currentAnalysis.missingSkills || 'No missing skills identified' }}</p>
                        </mat-card-content>
                      </mat-card>
                    </div>

                    <div class="experience-education-grid">
                      <mat-card class="detail-card">
                        <mat-card-header>
                          <mat-card-title>Experience Match</mat-card-title>
                        </mat-card-header>
                        <mat-card-content>
                          <p>{{ currentAnalysis.experienceMatch }}</p>
                        </mat-card-content>
                      </mat-card>

                      <mat-card class="detail-card">
                        <mat-card-header>
                          <mat-card-title>Education Match</mat-card-title>
                        </mat-card-header>
                        <mat-card-content>
                          <p>{{ currentAnalysis.educationMatch }}</p>
                        </mat-card-content>
                      </mat-card>
                    </div>

                    <mat-card class="detail-card">
                      <mat-card-header>
                        <mat-card-title>Recommendations</mat-card-title>
                      </mat-card-header>
                      <mat-card-content>
                        <p>{{ currentAnalysis.recommendations }}</p>
                      </mat-card-content>
                    </mat-card>

                    <mat-card class="detail-card" *ngIf="showFullAnalysis">
                      <mat-card-header>
                        <mat-card-title>Full Analysis</mat-card-title>
                      </mat-card-header>
                      <mat-card-content>
                        <pre class="full-analysis">{{ currentAnalysis.fullAnalysis }}</pre>
                      </mat-card-content>
                    </mat-card>

                    <div class="analysis-actions">
                      <button 
                        mat-raised-button 
                        color="primary" 
                        (click)="toggleFullAnalysis()">
                        {{ showFullAnalysis ? 'Hide' : 'Show' }} Full Analysis
                      </button>
                    </div>
                  </div>
                </div>

                <!-- No Analysis State -->
                <div class="no-analysis" *ngIf="!currentAnalysis && !isLoadingAnalysis">
                  <mat-icon class="no-analysis-icon">analytics</mat-icon>
                  <h3>No Analysis Available</h3>
                  <p>Upload and analyze a CV to see results here</p>
                </div>
              </div>
            </mat-tab>

            <!-- Top Candidates Tab -->
            <mat-tab label="Top Candidates">
              <div class="top-candidates-section">
                <div class="loading-container" *ngIf="isLoadingTopCandidates">
                  <mat-spinner diameter="40"></mat-spinner>
                  <p>Loading top candidates...</p>
                </div>

                <div class="candidates-table" *ngIf="topCandidates.length > 0 && !isLoadingTopCandidates">
                  <table mat-table [dataSource]="topCandidates" class="candidates-table-content">
                    <!-- Candidate Column -->
                    <ng-container matColumnDef="candidate">
                      <th mat-header-cell *matHeaderCellDef>Candidate</th>
                      <td mat-cell *matCellDef="let analysis">
                        <div class="candidate-cell">
                          <div class="candidate-name">
                            {{ analysis.cv.candidate.firstName }} {{ analysis.cv.candidate.lastName }}
                          </div>
                          <div class="candidate-email">{{ analysis.cv.candidate.email }}</div>
                        </div>
                      </td>
                    </ng-container>

                    <!-- Score Column -->
                    <ng-container matColumnDef="score">
                      <th mat-header-cell *matHeaderCellDef>Match Score</th>
                      <td mat-cell *matCellDef="let analysis">
                        <div class="score-cell">
                          <mat-progress-bar 
                            mode="determinate" 
                            [value]="analysis.matchScore"
                            [color]="getScoreColor(analysis.matchScore)">
                          </mat-progress-bar>
                          <span class="score-text">{{ analysis.matchScore }}%</span>
                        </div>
                      </td>
                    </ng-container>

                    <!-- Job Column -->
                    <ng-container matColumnDef="job">
                      <th mat-header-cell *matHeaderCellDef>Job</th>
                      <td mat-cell *matCellDef="let analysis">
                        {{ analysis.jobOffer.title }}
                      </td>
                    </ng-container>

                    <!-- Actions Column -->
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef>Actions</th>
                      <td mat-cell *matCellDef="let analysis">
                        <button 
                          mat-icon-button 
                          color="primary" 
                          (click)="viewAnalysis(analysis)"
                          matTooltip="View full analysis">
                          <mat-icon>visibility</mat-icon>
                        </button>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                  </table>
                </div>

                <div class="no-candidates" *ngIf="topCandidates.length === 0 && !isLoadingTopCandidates">
                  <mat-icon class="no-candidates-icon">people_outline</mat-icon>
                  <h3>No Candidates Available</h3>
                  <p>Upload and analyze CVs to see top candidates here</p>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .ai-panel-container {
      padding: 20px;
      background-color: #f5f5f5;
      min-height: 100vh;
    }

    .ai-panel-card {
      margin-bottom: 20px;
    }

    /* Upload Section */
    .upload-section {
      padding: 20px;
    }

    .upload-area {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 40px;
      text-align: center;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .upload-area:hover {
      border-color: #3f51b5;
      background-color: #f8f9fa;
    }

    .upload-area.drag-over {
      border-color: #3f51b5;
      background-color: #e3f2fd;
    }

    .upload-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .upload-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #ccc;
    }

    .upload-content h3 {
      margin: 0;
      color: #333;
    }

    .upload-content p {
      margin: 0;
      color: #666;
    }

    .file-types {
      font-size: 12px;
      color: #999;
    }

    .upload-progress {
      margin-top: 20px;
      text-align: center;
    }

    .upload-progress p {
      margin-top: 8px;
      color: #666;
    }

    .recent-cvs {
      margin-top: 40px;
    }

    .recent-cvs h4 {
      margin-bottom: 16px;
      color: #333;
    }

    .cv-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .cv-item {
      display: flex;
      align-items: center;
      padding: 12px;
      background: white;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .cv-item mat-icon {
      margin-right: 12px;
      color: #666;
    }

    .cv-info {
      flex: 1;
    }

    .cv-name {
      font-weight: 500;
      color: #333;
    }

    .cv-details {
      font-size: 12px;
      color: #666;
      margin-top: 2px;
    }

    .cv-actions {
      display: flex;
      gap: 4px;
    }

    /* Analysis Section */
    .analysis-section {
      padding: 20px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #666;
    }

    .loading-container p {
      margin-top: 16px;
      font-size: 16px;
    }

    .score-section {
      text-align: center;
      margin-bottom: 32px;
    }

    .score-section h3 {
      margin: 0 0 16px 0;
      font-size: 24px;
      font-weight: 600;
    }

    .score-text {
      margin-top: 8px;
      font-size: 14px;
      color: #666;
    }

    .analysis-details {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .detail-card {
      margin-bottom: 0;
    }

    .skills-grid,
    .experience-education-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .full-analysis {
      white-space: pre-wrap;
      font-family: monospace;
      font-size: 12px;
      background: #f5f5f5;
      padding: 16px;
      border-radius: 4px;
      overflow-x: auto;
    }

    .analysis-actions {
      text-align: center;
      margin-top: 20px;
    }

    .no-analysis {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      color: #666;
      text-align: center;
    }

    .no-analysis-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 20px;
      color: #ccc;
    }

    .no-analysis h3 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 24px;
    }

    .no-analysis p {
      margin: 0;
      font-size: 16px;
    }

    /* Top Candidates Section */
    .top-candidates-section {
      padding: 20px;
    }

    .candidates-table {
      width: 100%;
      overflow-x: auto;
    }

    .candidates-table-content {
      min-width: 600px;
    }

    .candidate-cell {
      display: flex;
      flex-direction: column;
    }

    .candidate-name {
      font-weight: 500;
      color: #333;
    }

    .candidate-email {
      font-size: 12px;
      color: #666;
      margin-top: 2px;
    }

    .score-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .score-cell .score-text {
      font-size: 12px;
      font-weight: 500;
    }

    .no-candidates {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      color: #666;
      text-align: center;
    }

    .no-candidates-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 20px;
      color: #ccc;
    }

    .no-candidates h3 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 24px;
    }

    .no-candidates p {
      margin: 0;
      font-size: 16px;
    }

    @media (max-width: 768px) {
      .skills-grid,
      .experience-education-grid {
        grid-template-columns: 1fr;
      }

      .upload-area {
        padding: 20px;
      }

      .upload-content {
        gap: 12px;
      }

      .upload-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }
    }
  `]
})
export class AiPanelComponent implements OnInit {
  recentCVs: CV[] = [];
  currentAnalysis: AIAnalysis | null = null;
  topCandidates: AIAnalysis[] = [];
  displayedColumns: string[] = ['candidate', 'score', 'job', 'actions'];
  
  isDragOver = false;
  uploadProgress = 0;
  isLoadingAnalysis = false;
  isLoadingTopCandidates = false;
  showFullAnalysis = false;

  constructor(
    private aiService: AIService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadRecentCVs();
    this.loadTopCandidates();
  }

  loadRecentCVs(): void {
    // In a real implementation, this would fetch recent CVs
    this.recentCVs = [];
  }

  loadTopCandidates(): void {
    this.isLoadingTopCandidates = true;
    
    // Mock data for demonstration
    setTimeout(() => {
      this.topCandidates = [];
      this.isLoadingTopCandidates = false;
    }, 1000);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileUpload(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    
    if (files && files.length > 0) {
      this.handleFileUpload(files[0]);
    }
  }

  handleFileUpload(file: File): void {
    const validation = this.aiService.validateCVFile(file);
    
    if (!validation.valid) {
      this.snackBar.open(validation.error!, 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }

    // In a real implementation, you would get the candidate ID from the current context
    const candidateId = 1; // Mock candidate ID
    
    this.aiService.uploadCVWithProgress(file, candidateId).subscribe({
      next: (response) => {
        this.uploadProgress = response.progress;
        
        if (response.cv) {
          this.snackBar.open('CV uploaded successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          this.loadRecentCVs();
          this.uploadProgress = 0;
        }
      },
      error: () => {
        this.snackBar.open('Failed to upload CV', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.uploadProgress = 0;
      }
    });
  }

  analyzeCV(cvId: number): void {
    // In a real implementation, you would get the job offer ID from the current context
    const jobOfferId = 1; // Mock job offer ID
    
    this.isLoadingAnalysis = true;
    
    this.aiService.analyzeCV(cvId, jobOfferId).subscribe({
      next: (analysis) => {
        this.currentAnalysis = analysis;
        this.isLoadingAnalysis = false;
        
        this.snackBar.open('Analysis completed successfully', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      },
      error: () => {
        this.snackBar.open('Failed to analyze CV', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.isLoadingAnalysis = false;
      }
    });
  }

  downloadCV(cvId: number): void {
    this.aiService.downloadCV(cvId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cv.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.snackBar.open('Failed to download CV', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  viewAnalysis(analysis: AIAnalysis): void {
    this.currentAnalysis = analysis;
    // Switch to analysis tab
  }

  toggleFullAnalysis(): void {
    this.showFullAnalysis = !this.showFullAnalysis;
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'primary';
    if (score >= 60) return 'accent';
    if (score >= 40) return 'warn';
    return '';
  }

  getScoreDescription(score: number): string {
    if (score >= 80) return 'Excellent match';
    if (score >= 60) return 'Good match';
    if (score >= 40) return 'Moderate match';
    return 'Weak match';
  }

  getFileIcon(contentType: string): string {
    return this.aiService.getFileIcon(contentType);
  }

  formatFileSize(bytes: number): string {
    return this.aiService.formatFileSize(bytes);
  }
}
