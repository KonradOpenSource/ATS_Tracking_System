import { Component, OnInit, ViewChild } from '@angular/core';
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
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../../services/admin.service';
import { User, AuditLog, DashboardStats } from '../../models/admin.model';

@Component({
  selector: 'app-admin-panel',
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
    MatPaginatorModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="admin-panel-container">
      <mat-card class="admin-panel-card">
        <mat-card-header>
          <mat-card-title>Admin Panel</mat-card-title>
          <mat-card-subtitle>System administration and management</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <mat-tab-group>
            <!-- Dashboard Tab -->
            <mat-tab label="Dashboard">
              <div class="dashboard-section">
                <div class="loading-container" *ngIf="isLoadingStats">
                  <mat-spinner diameter="40"></mat-spinner>
                  <p>Loading dashboard statistics...</p>
                </div>

                <div class="stats-grid" *ngIf="!isLoadingStats">
                  <mat-card class="stat-card">
                    <mat-card-content>
                      <div class="stat-number">{{ dashboardStats.totalUsers }}</div>
                      <div class="stat-label">Total Users</div>
                      <mat-icon class="stat-icon">people</mat-icon>
                    </mat-card-content>
                  </mat-card>

                  <mat-card class="stat-card">
                    <mat-card-content>
                      <div class="stat-number">{{ dashboardStats.totalCandidates }}</div>
                      <div class="stat-label">Candidates</div>
                      <mat-icon class="stat-icon">person_search</mat-icon>
                    </mat-card-content>
                  </mat-card>

                  <mat-card class="stat-card">
                    <mat-card-content>
                      <div class="stat-number">{{ dashboardStats.totalPipelines }}</div>
                      <div class="stat-label">Pipelines</div>
                      <mat-icon class="stat-icon">view_kanban</mat-icon>
                    </mat-card-content>
                  </mat-card>

                  <mat-card class="stat-card">
                    <mat-card-content>
                      <div class="stat-number">{{ dashboardStats.totalAnalyses }}</div>
                      <div class="stat-label">AI Analyses</div>
                      <mat-icon class="stat-icon">psychology</mat-icon>
                    </mat-card-content>
                  </mat-card>

                  <mat-card class="stat-card">
                    <mat-card-content>
                      <div class="stat-number">{{ dashboardStats.weeklyActions }}</div>
                      <div class="stat-label">Weekly Actions</div>
                      <mat-icon class="stat-icon">trending_up</mat-icon>
                    </mat-card-content>
                  </mat-card>

                  <mat-card class="stat-card">
                    <mat-card-content>
                      <div class="stat-number">{{ dashboardStats.activeTokens }}</div>
                      <div class="stat-label">Active Tokens</div>
                      <mat-icon class="stat-icon">vpn_key</mat-icon>
                    </mat-card-content>
                  </mat-card>
                </div>

                <div class="dashboard-actions">
                  <button mat-raised-button color="primary" (click)="refreshStats()">
                    <mat-icon>refresh</mat-icon>
                    Refresh Stats
                  </button>
                  <button mat-raised-button color="accent" (click)="cleanupSystem()">
                    <mat-icon>cleaning_services</mat-icon>
                    Cleanup System
                  </button>
                </div>
              </div>
            </mat-tab>

            <!-- Users Tab -->
            <mat-tab label="Users">
              <div class="users-section">
                <div class="users-header">
                  <h3>User Management</h3>
                  <div class="users-actions">
                    <mat-form-field appearance="outline" class="search-field">
                      <mat-label>Search users</mat-label>
                      <input matInput (keyup)="onUserSearch($event)" placeholder="Search by username or email">
                      <mat-icon matSuffix>search</mat-icon>
                    </mat-form-field>
                  </div>
                </div>

                <div class="loading-container" *ngIf="isLoadingUsers">
                  <mat-spinner diameter="40"></mat-spinner>
                  <p>Loading users...</p>
                </div>

                <div class="users-table" *ngIf="!isLoadingUsers">
                  <table mat-table [dataSource]="users" class="users-table-content">
                    <!-- ID Column -->
                    <ng-container matColumnDef="id">
                      <th mat-header-cell *matHeaderCellDef>ID</th>
                      <td mat-cell *matCellDef="let user">{{ user.id }}</td>
                    </ng-container>

                    <!-- Username Column -->
                    <ng-container matColumnDef="username">
                      <th mat-header-cell *matHeaderCellDef>Username</th>
                      <td mat-cell *matCellDef="let user">{{ user.username }}</td>
                    </ng-container>

                    <!-- Email Column -->
                    <ng-container matColumnDef="email">
                      <th mat-header-cell *matHeaderCellDef>Email</th>
                      <td mat-cell *matCellDef="let user">{{ user.email }}</td>
                    </ng-container>

                    <!-- Role Column -->
                    <ng-container matColumnDef="role">
                      <th mat-header-cell *matHeaderCellDef>Role</th>
                      <td mat-cell *matCellDef="let user">
                        <span class="role-badge" [class]="'role-' + user.role.toLowerCase()">
                          {{ user.role }}
                        </span>
                      </td>
                    </ng-container>

                    <!-- Actions Column -->
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef>Actions</th>
                      <td mat-cell *matCellDef="let user">
                        <button mat-icon-button color="primary" (click)="editUserRole(user)" matTooltip="Edit role">
                          <mat-icon>edit</mat-icon>
                        </button>
                        <button mat-icon-button color="warn" (click)="deleteUser(user.id)" matTooltip="Delete user">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="displayedUserColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: displayedUserColumns;"></tr>
                  </table>

                  <mat-paginator
                    #userPaginator
                    [length]="totalUsers"
                    [pageSize]="pageSize"
                    [pageSizeOptions]="[5, 10, 25, 100]"
                    (page)="onUserPageChange($event)"
                    class="users-paginator">
                  </mat-paginator>
                </div>
              </div>
            </mat-tab>

            <!-- Audit Logs Tab -->
            <mat-tab label="Audit Logs">
              <div class="audit-section">
                <div class="audit-header">
                  <h3>Audit Logs</h3>
                  <div class="audit-filters">
                    <mat-form-field appearance="outline">
                      <mat-label>Action</mat-label>
                      <mat-select (selectionChange)="onFilterChange()" [(value)]="filters.action">
                        <mat-option value="">All Actions</mat-option>
                        <mat-option *ngFor="let action of distinctActions" [value]="action">
                          {{ action }}
                        </mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Resource Type</mat-label>
                      <mat-select (selectionChange)="onFilterChange()" [(value)]="filters.resourceType">
                        <mat-option value="">All Resources</mat-option>
                        <mat-option *ngFor="let type of distinctResourceTypes" [value]="type">
                          {{ type }}
                        </mat-option>
                      </mat-select>
                    </mat-form-field>

                    <button mat-raised-button color="primary" (click)="onFilterChange()">
                      <mat-icon>filter_list</mat-icon>
                      Apply Filters
                    </button>
                  </div>
                </div>

                <div class="loading-container" *ngIf="isLoadingLogs">
                  <mat-spinner diameter="40"></mat-spinner>
                  <p>Loading audit logs...</p>
                </div>

                <div class="audit-table" *ngIf="!isLoadingLogs">
                  <table mat-table [dataSource]="auditLogs" class="audit-table-content">
                    <!-- Timestamp Column -->
                    <ng-container matColumnDef="timestamp">
                      <th mat-header-cell *matHeaderCellDef>Timestamp</th>
                      <td mat-cell *matCellDef="let log">{{ log.createdAt | date:'short' }}</td>
                    </ng-container>

                    <!-- User Column -->
                    <ng-container matColumnDef="user">
                      <th mat-header-cell *matHeaderCellDef>User</th>
                      <td mat-cell *matCellDef="let log">{{ log.user?.username || 'System' }}</td>
                    </ng-container>

                    <!-- Action Column -->
                    <ng-container matColumnDef="action">
                      <th mat-header-cell *matHeaderCellDef>Action</th>
                      <td mat-cell *matCellDef="let log">
                        <span class="action-badge" [class]="'action-' + log.action.toLowerCase()">
                          {{ log.action }}
                        </span>
                      </td>
                    </ng-container>

                    <!-- Description Column -->
                    <ng-container matColumnDef="description">
                      <th mat-header-cell *matHeaderCellDef>Description</th>
                      <td mat-cell *matCellDef="let log">{{ log.description }}</td>
                    </ng-container>

                    <!-- Resource Column -->
                    <ng-container matColumnDef="resource">
                      <th mat-header-cell *matHeaderCellDef>Resource</th>
                      <td mat-cell *matCellDef="let log">
                        {{ log.resourceType }}{{ log.resourceId ? ' #' + log.resourceId : '' }}
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="displayedLogColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: displayedLogColumns;"></tr>
                  </table>

                  <mat-paginator
                    #logPaginator
                    [length]="totalLogs"
                    [pageSize]="pageSize"
                    [pageSizeOptions]="[10, 25, 50, 100]"
                    (page)="onLogPageChange($event)"
                    class="audit-paginator">
                  </mat-paginator>
                </div>
              </div>
            </mat-tab>

            <!-- System Tab -->
            <mat-tab label="System">
              <div class="system-section">
                <div class="system-header">
                  <h3>System Management</h3>
                  <div class="system-actions">
                    <button mat-raised-button color="primary" (click)="getSystemHealth()">
                      <mat-icon>health_and_safety</mat-icon>
                      Check Health
                    </button>
                    <button mat-raised-button color="accent" (click)="getUserActivityReport()">
                      <mat-icon>assessment</mat-icon>
                      Activity Report
                    </button>
                  </div>
                </div>

                <div class="system-content">
                  <mat-card class="system-card" *ngIf="systemHealth">
                    <mat-card-header>
                      <mat-card-title>System Health</mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="health-item">
                        <span class="health-label">Database:</span>
                        <span class="health-value" [class]="'health-' + systemHealth.database.toLowerCase()">
                          {{ systemHealth.database }}
                        </span>
                      </div>
                      <div class="health-item">
                        <span class="health-label">AI Service:</span>
                        <span class="health-value" [class]="'health-' + systemHealth.aiService.toLowerCase()">
                          {{ systemHealth.aiService }}
                        </span>
                      </div>
                      <div class="health-item">
                        <span class="health-label">Memory Usage:</span>
                        <span class="health-value">
                          {{ systemHealth.memory.usagePercentage | number:'1.1' }}%
                        </span>
                      </div>
                      <div class="health-item">
                        <span class="health-label">Active Tokens:</span>
                        <span class="health-value">{{ systemHealth.activeTokens }}</span>
                      </div>
                    </mat-card-content>
                  </mat-card>

                  <mat-card class="system-card" *ngIf="activityReport">
                    <mat-card-header>
                      <mat-card-title>User Activity Report</mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                      <div class="report-item">
                        <span class="report-label">Weekly Actions:</span>
                        <span class="report-value">{{ activityReport.weeklyActions }}</span>
                      </div>
                      <div class="report-item">
                        <span class="report-label">Weekly Logins:</span>
                        <span class="report-value">{{ activityReport.weeklyLogins }}</span>
                      </div>
                      <div class="report-item">
                        <span class="report-label">Weekly Registrations:</span>
                        <span class="report-value">{{ activityReport.weeklyRegistrations }}</span>
                      </div>
                    </mat-card-content>
                  </mat-card>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-panel-container {
      padding: 20px;
      background-color: #f5f5f5;
      min-height: 100vh;
    }

    .admin-panel-card {
      margin-bottom: 20px;
    }

    /* Dashboard Styles */
    .dashboard-section {
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

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .stat-card mat-card-content {
      position: relative;
      z-index: 1;
    }

    .stat-number {
      font-size: 32px;
      font-weight: 700;
      color: #3f51b5;
      margin-bottom: 8px;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }

    .stat-icon {
      position: absolute;
      top: 16px;
      right: 16px;
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: #e0e0e0;
    }

    .dashboard-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
    }

    /* Users Styles */
    .users-section {
      padding: 20px;
    }

    .users-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .users-header h3 {
      margin: 0;
      color: #333;
    }

    .users-actions {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .search-field {
      width: 300px;
    }

    .users-table {
      width: 100%;
      overflow-x: auto;
    }

    .users-table-content {
      min-width: 600px;
    }

    .role-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .role-admin {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .role-recruiter {
      background-color: #f3e5f5;
      color: #7b1fa2;
    }

    .users-paginator {
      margin-top: 16px;
    }

    /* Audit Logs Styles */
    .audit-section {
      padding: 20px;
    }

    .audit-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .audit-header h3 {
      margin: 0;
      color: #333;
    }

    .audit-filters {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .audit-table {
      width: 100%;
      overflow-x: auto;
    }

    .audit-table-content {
      min-width: 800px;
    }

    .action-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .action-login {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .action-create {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .action-update {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .action-delete {
      background-color: #ffebee;
      color: #d32f2f;
    }

    .audit-paginator {
      margin-top: 16px;
    }

    /* System Styles */
    .system-section {
      padding: 20px;
    }

    .system-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .system-header h3 {
      margin: 0;
      color: #333;
    }

    .system-actions {
      display: flex;
      gap: 16px;
    }

    .system-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .system-card {
      margin-bottom: 0;
    }

    .health-item, .report-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .health-item:last-child, .report-item:last-child {
      border-bottom: none;
    }

    .health-label, .report-label {
      font-weight: 500;
      color: #666;
    }

    .health-value, .report-value {
      font-weight: 600;
      color: #333;
    }

    .health-up {
      color: #4caf50;
    }

    .health-down {
      color: #f44336;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .users-header, .audit-header, .system-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .users-actions, .audit-filters, .system-actions {
        flex-direction: column;
        align-items: stretch;
      }

      .search-field {
        width: 100%;
      }

      .dashboard-actions {
        flex-direction: column;
      }
    }
  `]
})
export class AdminPanelComponent implements OnInit {
  dashboardStats: DashboardStats = {
    totalUsers: 0,
    totalCandidates: 0,
    totalPipelines: 0,
    totalAnalyses: 0,
    weeklyActions: 0,
    activeTokens: 0
  };

  users: User[] = [];
  auditLogs: AuditLog[] = [];
  totalUsers = 0;
  totalLogs = 0;
  pageSize = 10;
  
  distinctActions: string[] = [];
  distinctResourceTypes: string[] = [];
  filters = {
    action: '',
    resourceType: ''
  };

  systemHealth: any = null;
  activityReport: any = null;

  isLoadingStats = false;
  isLoadingUsers = false;
  isLoadingLogs = false;

  @ViewChild('userPaginator') userPaginator!: MatPaginator;
  @ViewChild('logPaginator') logPaginator!: MatPaginator;

  displayedUserColumns: string[] = ['id', 'username', 'email', 'role', 'actions'];
  displayedLogColumns: string[] = ['timestamp', 'user', 'action', 'description', 'resource'];

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDashboardStats();
    this.loadUsers();
    this.loadAuditLogs();
    this.loadDistinctActions();
    this.loadDistinctResourceTypes();
  }

  loadDashboardStats(): void {
    this.isLoadingStats = true;
    this.adminService.getDashboardStats().subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
        this.isLoadingStats = false;
      },
      error: () => {
        this.snackBar.open('Failed to load dashboard stats', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.isLoadingStats = false;
      }
    });
  }

  loadUsers(page: number = 0): void {
    this.isLoadingUsers = true;
    this.adminService.getUsers(page, this.pageSize).subscribe({
      next: (response) => {
        this.users = response.content;
        this.totalUsers = response.totalElements;
        this.isLoadingUsers = false;
      },
      error: () => {
        this.snackBar.open('Failed to load users', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.isLoadingUsers = false;
      }
    });
  }

  loadAuditLogs(page: number = 0): void {
    this.isLoadingLogs = true;
    this.adminService.getAuditLogs(page, this.pageSize, this.filters.action, this.filters.resourceType).subscribe({
      next: (response) => {
        this.auditLogs = response.content;
        this.totalLogs = response.totalElements;
        this.isLoadingLogs = false;
      },
      error: () => {
        this.snackBar.open('Failed to load audit logs', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.isLoadingLogs = false;
      }
    });
  }

  loadDistinctActions(): void {
    this.adminService.getDistinctActions().subscribe({
      next: (actions) => {
        this.distinctActions = actions;
      }
    });
  }

  loadDistinctResourceTypes(): void {
    this.adminService.getDistinctResourceTypes().subscribe({
      next: (types) => {
        this.distinctResourceTypes = types;
      }
    });
  }

  refreshStats(): void {
    this.loadDashboardStats();
  }

  cleanupSystem(): void {
    this.adminService.cleanupSystem().subscribe({
      next: (result) => {
        this.snackBar.open('System cleanup completed', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      },
      error: () => {
        this.snackBar.open('Failed to cleanup system', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  onUserSearch(event: any): void {
    // Implement user search logic
    console.log('Search for:', event.target.value);
  }

  onUserPageChange(event: PageEvent): void {
    this.loadUsers(event.pageIndex);
  }

  onLogPageChange(event: PageEvent): void {
    this.loadAuditLogs(event.pageIndex);
  }

  onFilterChange(): void {
    this.loadAuditLogs(0); // Reset to first page when filters change
  }

  editUserRole(user: User): void {
    // Implement user role editing
    console.log('Edit role for user:', user);
  }

  deleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.adminService.deleteUser(userId).subscribe({
        next: () => {
          this.snackBar.open('User deleted successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          this.loadUsers();
        },
        error: () => {
          this.snackBar.open('Failed to delete user', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      });
    }
  }

  getSystemHealth(): void {
    this.adminService.getSystemHealth().subscribe({
      next: (health) => {
        this.systemHealth = health;
      },
      error: () => {
        this.snackBar.open('Failed to get system health', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  getUserActivityReport(): void {
    this.adminService.getUserActivityReport().subscribe({
      next: (report) => {
        this.activityReport = report;
      },
      error: () => {
        this.snackBar.open('Failed to get activity report', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }
}
