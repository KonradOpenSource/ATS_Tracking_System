import { Component } from "@angular/core";
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from "@angular/router";
import { CommonModule } from "@angular/common";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatListModule } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatMenuModule } from "@angular/material/menu";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AuthService } from "../services/auth.service";
import { AsyncPipe } from "@angular/common";

@Component({
  selector: "app-layout",
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    AsyncPipe,
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <!-- Sidebar -->
      <mat-sidenav #sidenav mode="side" opened class="sidenav">
        <mat-nav-list>
          <a
            mat-list-item
            routerLink="/dashboard/candidates"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
          >
            <mat-icon>people</mat-icon>
            <span class="nav-text">Candidates</span>
          </a>
          <a
            mat-list-item
            routerLink="/dashboard/candidates/add"
            routerLinkActive="active"
          >
            <mat-icon>person_add</mat-icon>
            <span class="nav-text">Add Candidate</span>
          </a>
          <a
            mat-list-item
            routerLink="/dashboard/pipeline"
            routerLinkActive="active"
          >
            <mat-icon>view_kanban</mat-icon>
            <span class="nav-text">Pipeline</span>
          </a>
          <a mat-list-item routerLink="/dashboard/ai" routerLinkActive="active">
            <mat-icon>psychology</mat-icon>
            <span class="nav-text">AI Analysis</span>
          </a>
          <a
            mat-list-item
            routerLink="/dashboard/job-offers"
            routerLinkActive="active"
          >
            <mat-icon>work</mat-icon>
            <span class="nav-text">Job Offers</span>
          </a>
          <a
            mat-list-item
            routerLink="/dashboard/settings"
            routerLinkActive="active"
          >
            <mat-icon>settings</mat-icon>
            <span class="nav-text">Settings</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <!-- Main Content -->
      <mat-sidenav-content>
        <!-- Top Bar -->
        <mat-toolbar class="top-toolbar">
          <button
            mat-icon-button
            (click)="sidenav.toggle()"
            class="menu-button"
          >
            <mat-icon>menu</mat-icon>
          </button>

          <span class="spacer"></span>

          <span class="app-title">ATS - Applicant Tracking System</span>

          <span class="spacer"></span>

          <button
            mat-icon-button
            [matMenuTriggerFor]="userMenu"
            class="user-button"
          >
            <mat-icon>account_circle</mat-icon>
          </button>

          <mat-menu #userMenu="matMenu">
            <button mat-menu-item>
              <mat-icon>person</mat-icon>
              <span>{{ displayName }}</span>
            </button>
            <button mat-menu-item routerLink="/dashboard/settings">
              <mat-icon>settings</mat-icon>
              <span>Settings</span>
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </mat-toolbar>

        <!-- Page Content -->
        <div class="page-content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .sidenav-container {
        height: 100vh;
      }

      .sidenav {
        width: 250px;
        background-color: #f5f5f5;
      }

      .top-toolbar {
        background-color: #3f51b5;
        color: white;
      }

      .menu-button {
        margin-right: 8px;
      }

      .user-button {
        margin-left: 8px;
      }

      .app-title {
        font-size: 18px;
        font-weight: 500;
      }

      .page-content {
        padding: 20px;
        background-color: #fafafa;
        min-height: calc(100vh - 64px);
      }

      .nav-text {
        margin-left: 16px;
      }

      .active {
        background-color: #e3f2fd;
        color: #1976d2;
      }

      mat-nav-list a {
        display: flex;
        align-items: center;
        padding: 0 16px;
        height: 48px;
      }

      mat-nav-list a:hover {
        background-color: #e8eaf6;
      }
    `,
  ],
})
export class LayoutComponent {
  currentUser$ = this.authService.currentUser$;
  displayName: string = "User";

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    // Subscribe to user changes to update display name
    this.currentUser$.subscribe((user) => {
      if (user) {
        this.displayName = `${user.firstName} ${user.lastName}`;
      } else {
        this.displayName = "User";
      }
    });
  }

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }
}
