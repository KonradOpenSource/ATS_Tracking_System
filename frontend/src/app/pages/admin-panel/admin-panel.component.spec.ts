import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { of, throwError } from "rxjs";
import { CommonModule } from "@angular/common";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatCardModule } from "@angular/material/card";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { AdminPanelComponent } from "./admin-panel.component";
import { AdminService } from "../../services/admin.service";
import {
  DashboardStats,
  User,
  AuditLog,
  PageResponse,
} from "../../models/admin.model";

describe("AdminPanelComponent", () => {
  let component: AdminPanelComponent;
  let fixture: ComponentFixture<AdminPanelComponent>;
  let adminServiceSpy: jasmine.SpyObj<AdminService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  const mockUser: User = {
    id: 1,
    username: "testuser",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    role: "RECRUITER",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  };

  const mockAuditLog: AuditLog = {
    id: 1,
    action: "LOGIN",
    description: "User logged in",
    resourceType: "USER",
    resourceId: 1,
    ipAddress: "127.0.0.1",
    userAgent: "Mozilla/5.0",
    createdAt: "2023-01-01T00:00:00Z",
  };

  const mockDashboardStats: DashboardStats = {
    totalUsers: 100,
    totalCandidates: 50,
    totalPipelines: 10,
    totalAnalyses: 25,
    weeklyActions: 75,
    activeTokens: 30,
  };

  const mockUserResponse: PageResponse<User> = {
    content: [mockUser],
    totalElements: 1,
    totalPages: 1,
    size: 10,
    number: 0,
  };

  const mockLogResponse: PageResponse<AuditLog> = {
    content: [mockAuditLog],
    totalElements: 1,
    totalPages: 1,
    size: 10,
    number: 0,
  };

  const mockActions = ["LOGIN", "LOGOUT", "CREATE"];
  const mockResourceTypes = ["USER", "CANDIDATE", "PIPELINE"];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj("AdminService", [
      "getDashboardStats",
      "getUsers",
      "getAuditLogs",
      "getDistinctActions",
      "getDistinctResourceTypes",
      "deleteUser",
    ]);
    const snackBarSpyObj = jasmine.createSpyObj("MatSnackBar", ["open"]);

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        CommonModule,
        MatCardModule,
        MatTableModule,
        MatPaginatorModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: AdminService, useValue: spy },
        { provide: MatSnackBar, useValue: snackBarSpyObj },
      ],
    }).compileComponents();

    adminServiceSpy = TestBed.inject(
      AdminService,
    ) as jasmine.SpyObj<AdminService>;
    snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminPanelComponent);
    component = fixture.componentInstance;

    // Set up default spy returns before component initialization
    adminServiceSpy.getDashboardStats.and.returnValue(of(mockDashboardStats));
    adminServiceSpy.getUsers.and.returnValue(of(mockUserResponse));
    adminServiceSpy.getAuditLogs.and.returnValue(of(mockLogResponse));
    adminServiceSpy.getDistinctActions.and.returnValue(of(mockActions));
    adminServiceSpy.getDistinctResourceTypes.and.returnValue(
      of(mockResourceTypes),
    );

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should initialize with correct default values", () => {
    expect(component.dashboardStats).toEqual(mockDashboardStats);
    expect(component.users).toEqual([mockUser]);
    expect(component.auditLogs).toEqual([mockAuditLog]);
    expect(component.distinctActions).toEqual(mockActions);
    expect(component.distinctResourceTypes).toEqual(mockResourceTypes);
    expect(component.isLoadingStats).toBeFalse();
    expect(component.isLoadingUsers).toBeFalse();
    expect(component.isLoadingLogs).toBeFalse();
  });

  it("should display dashboard stats correctly", () => {
    expect(component.dashboardStats.totalUsers).toBe(100);
    expect(component.dashboardStats.totalCandidates).toBe(50);
    expect(component.dashboardStats.totalPipelines).toBe(10);
    expect(component.dashboardStats.totalAnalyses).toBe(25);
    expect(component.dashboardStats.weeklyActions).toBe(75);
    expect(component.dashboardStats.activeTokens).toBe(30);
  });

  it("should load users", () => {
    expect(adminServiceSpy.getUsers).toHaveBeenCalledWith(0, 10);
    expect(component.users).toEqual([mockUser]);
    expect(component.totalUsers).toBe(1);
  });

  it("should load audit logs", () => {
    expect(adminServiceSpy.getAuditLogs).toHaveBeenCalledWith(
      0,
      10,
      "ALL",
      "ALL",
    );
    expect(component.auditLogs).toEqual([mockAuditLog]);
    expect(component.totalLogs).toBe(1);
  });

  it("should load distinct actions", () => {
    expect(adminServiceSpy.getDistinctActions).toHaveBeenCalled();
    expect(component.distinctActions).toEqual(mockActions);
  });

  it("should load distinct resource types", () => {
    expect(adminServiceSpy.getDistinctResourceTypes).toHaveBeenCalled();
    expect(component.distinctResourceTypes).toEqual(mockResourceTypes);
  });

  it("should handle user page change", () => {
    const mockPageEvent = { pageIndex: 1, pageSize: 10, length: 50 };
    component.onUserPageChange(mockPageEvent);

    expect(adminServiceSpy.getUsers).toHaveBeenCalledWith(1, 10);
  });

  it("should handle log page change", () => {
    const mockPageEvent = { pageIndex: 1, pageSize: 10, length: 50 };
    component.onLogPageChange(mockPageEvent);

    expect(adminServiceSpy.getAuditLogs).toHaveBeenCalledWith(
      1,
      10,
      "LOGIN",
      "USER",
    );
  });

  it("should handle filter change", () => {
    (component as any).selectedAction = "LOGIN";
    (component as any).selectedResourceType = "USER";
    component.onFilterChange();

    expect(adminServiceSpy.getAuditLogs).toHaveBeenCalledWith(
      0,
      10,
      "LOGIN",
      "USER",
    );
  });

  it("should get system health", () => {
    pending();
  });

  it("should get user activity report", () => {
    pending();
  });

  it("should handle dashboard stats error", () => {
    adminServiceSpy.getDashboardStats.and.returnValue(
      throwError(() => new Error("Error")),
    );

    component.loadDashboardStats();

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      "Failed to load dashboard stats",
      "Close",
      {
        duration: 3000,
        horizontalPosition: "center",
        verticalPosition: "top",
      },
    );
  });

  it("should handle users loading error", () => {
    const mockErrorResponse = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 10,
      number: 0,
    };
    adminServiceSpy.getUsers.and.returnValue(of(mockErrorResponse));

    component.loadUsers();

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      "Failed to load users",
      "Close",
      {
        duration: 3000,
        horizontalPosition: "center",
        verticalPosition: "top",
      },
    );
  });

  it("should handle audit logs loading error", () => {
    const mockErrorResponse = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 10,
      number: 0,
    };
    adminServiceSpy.getAuditLogs.and.returnValue(of(mockErrorResponse));

    component.loadAuditLogs();

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      "Failed to load audit logs",
      "Close",
      {
        duration: 3000,
        horizontalPosition: "center",
        verticalPosition: "top",
      },
    );
  });

  it("should handle edit user role", () => {
    pending();
  });

  it("should handle delete user when confirmed", () => {
    spyOn(window, "confirm").and.returnValue(true);
    adminServiceSpy.deleteUser.and.returnValue(of(undefined));

    component.deleteUser(1);

    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this user?",
    );
    expect(adminServiceSpy.deleteUser).toHaveBeenCalledWith(1);
  });

  it("should not delete user when cancelled", () => {
    spyOn(window, "confirm").and.returnValue(false);

    component.deleteUser(1);

    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this user?",
    );
    expect(adminServiceSpy.deleteUser).not.toHaveBeenCalled();
  });

  it("should handle delete user error", () => {
    spyOn(window, "confirm").and.returnValue(true);
    adminServiceSpy.deleteUser.and.returnValue(
      throwError(() => new Error("Error")),
    );

    component.deleteUser(1);

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      "Failed to delete user",
      "Close",
      {
        duration: 3000,
        horizontalPosition: "center",
        verticalPosition: "top",
      },
    );
  });

  it("should refresh stats", () => {
    component.refreshStats();

    expect(adminServiceSpy.getDashboardStats).toHaveBeenCalled();
    expect(adminServiceSpy.getUsers).toHaveBeenCalled();
    expect(adminServiceSpy.getAuditLogs).toHaveBeenCalled();
  });

  it("should handle cleanup system", () => {
    pending();
  });

  it("should handle cleanup system error", () => {
    pending();
  });

  it("should handle user search", () => {
    pending();
  });

  it("should handle activity report error", () => {
    pending();
  });

  it("should display loading states correctly", () => {
    // Test initial loading states
    expect(component.isLoadingStats).toBeFalse();
    expect(component.isLoadingUsers).toBeFalse();
    expect(component.isLoadingLogs).toBeFalse();

    // Test loading states during operations
    adminServiceSpy.getDashboardStats.and.returnValue(of(mockDashboardStats));
    component.loadDashboardStats();
    expect(component.isLoadingStats).toBeFalse(); // Should be false after successful load
  });

  it("should have correct displayed columns", () => {
    expect((component as any).displayedColumns).toEqual([
      "id",
      "username",
      "email",
      "role",
      "isActive",
      "createdAt",
      "lastLogin",
      "actions",
    ]);
  });

  it("should have correct log displayed columns", () => {
    expect((component as any).logDisplayedColumns).toEqual([
      "id",
      "action",
      "resourceType",
      "resourceId",
      "details",
      "performedBy",
      "performedAt",
    ]);
  });

  it("should have correct template structure", () => {
    const compiled = fixture.debugElement.nativeElement;

    // Check if main sections exist
    expect(compiled.querySelector(".admin-dashboard")).toBeTruthy();
    expect(compiled.querySelector(".stats-section")).toBeTruthy();
    expect(compiled.querySelector(".users-section")).toBeTruthy();
    expect(compiled.querySelector(".audit-logs-section")).toBeTruthy();
  });
});
