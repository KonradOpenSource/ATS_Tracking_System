import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatIconModule } from "@angular/material/icon";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { of } from "rxjs";

import { LoginComponent } from "./login.component";
import { AuthService } from "../../services/auth.service";
import { LoginRequest, AuthResponse } from "../../models/auth.model";

describe("LoginComponent", () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  const mockAuthResponse: AuthResponse = {
    accessToken: "mock-jwt-token",
    tokenType: "Bearer",
    expiresIn: 3600,
  };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj("AuthService", [
      "login",
      "storeTempUserData",
    ]);
    snackBarSpy = jasmine.createSpyObj("MatSnackBar", ["open"]);

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: "dashboard", component: class {} },
        ]),
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatIconModule,
        MatSnackBarModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should initialize login form with empty fields", () => {
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.get("username")?.value).toBe("");
    expect(component.loginForm.get("password")?.value).toBe("");
  });

  it("should make username required", () => {
    const usernameControl = component.loginForm.get("username");
    usernameControl?.setValue("");
    expect(usernameControl?.invalid).toBeTruthy();
    expect(usernameControl?.hasError("required")).toBeTruthy();
  });

  it("should make password required", () => {
    const passwordControl = component.loginForm.get("password");
    passwordControl?.setValue("");
    expect(passwordControl?.invalid).toBeTruthy();
    expect(passwordControl?.hasError("required")).toBeTruthy();
  });

  it("should validate form with valid credentials", () => {
    component.loginForm.patchValue({
      username: "test@example.com",
      password: "password123",
    });
    expect(component.loginForm.valid).toBeTruthy();
  });

  it("should invalidate form with empty credentials", () => {
    component.loginForm.patchValue({
      username: "",
      password: "",
    });
    expect(component.loginForm.invalid).toBeTruthy();
  });

  it("should toggle password visibility", () => {
    expect(component.hidePassword).toBeTrue();

    component.togglePasswordVisibility();
    expect(component.hidePassword).toBeFalse();

    component.togglePasswordVisibility();
    expect(component.hidePassword).toBeTrue();
  });

  it("should not submit form when invalid", () => {
    spyOn(component, "onSubmit").and.callThrough();
    component.loginForm.patchValue({
      username: "",
      password: "",
    });

    component.onSubmit();

    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it("should submit form when valid", () => {
    const mockLoginRequest: LoginRequest = {
      username: "test@example.com",
      password: "password123",
    };

    const mockResponse = {
      token: "mock-jwt-token",
      refreshToken: "mock-refresh-token",
      user: {
        id: 1,
        username: "test@example.com",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        role: "RECRUITER",
      },
    };

    const mockAuthResponse: AuthResponse = {
      accessToken: "mock-jwt-token",
      tokenType: "Bearer",
      expiresIn: 3600,
    };

    authServiceSpy.login.and.returnValue(of(mockAuthResponse));

    component.loginForm.patchValue(mockLoginRequest);
    component.onSubmit();

    expect(authServiceSpy.storeTempUserData).toHaveBeenCalledWith({
      username: "test@example.com",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      role: "RECRUITER",
    });
    expect(authServiceSpy.login).toHaveBeenCalledWith(mockLoginRequest);
  });

  it("should handle admin user correctly", () => {
    const mockLoginRequest: LoginRequest = {
      username: "admin@ats.com",
      password: "password123",
    };

    authServiceSpy.login.and.returnValue(of(mockAuthResponse));

    component.loginForm.patchValue(mockLoginRequest);
    component.onSubmit();

    expect(authServiceSpy.storeTempUserData).toHaveBeenCalledWith({
      username: "admin@ats.com",
      email: "admin@ats.com",
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
    });
  });

  it("should handle regular user correctly", () => {
    const mockLoginRequest: LoginRequest = {
      username: "user@example.com",
      password: "password123",
    };

    authServiceSpy.login.and.returnValue(of(mockAuthResponse));

    component.loginForm.patchValue(mockLoginRequest);
    component.onSubmit();

    expect(authServiceSpy.storeTempUserData).toHaveBeenCalledWith({
      username: "user@example.com",
      email: "user@example.com",
      firstName: "John",
      lastName: "Recruiter",
      role: "RECRUITER",
    });
  });

  it("should set loading to true during submission", () => {
    authServiceSpy.login.and.returnValue(of(mockAuthResponse));

    component.loginForm.patchValue({
      username: "test@example.com",
      password: "password123",
    });

    component.onSubmit();

    expect(component.isLoading).toBeTrue();
  });

  it("should have correct initial state", () => {
    expect(component.isLoading).toBeFalse();
    expect(component.hidePassword).toBeTrue();
    expect(component.loginForm).toBeDefined();
  });
});
