import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { of } from "rxjs";

import { RegisterComponent } from "./register.component";
import { AuthService } from "../../services/auth.service";
import { RegisterRequest } from "../../models/auth.model";

describe("RegisterComponent", () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj("AuthService", [
      "register",
      "storeTempUserData",
    ]);

    const snackBarSpyObj = jasmine.createSpyObj("MatSnackBar", ["open"]);

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
        MatSnackBarModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: AuthService, useValue: spy },
        { provide: MatSnackBar, useValue: snackBarSpyObj },
      ],
    }).compileComponents();

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should initialize register form with correct fields and default values", () => {
    expect(component.registerForm).toBeDefined();
    expect(component.registerForm.get("firstName")?.value).toBe("");
    expect(component.registerForm.get("lastName")?.value).toBe("");
    expect(component.registerForm.get("username")?.value).toBe("");
    expect(component.registerForm.get("email")?.value).toBe("");
    expect(component.registerForm.get("password")?.value).toBe("");
    expect(component.registerForm.get("role")?.value).toBe("RECRUITER");
  });

  it("should make first name required", () => {
    const firstNameControl = component.registerForm.get("firstName");
    firstNameControl?.setValue("");
    expect(firstNameControl?.invalid).toBeTruthy();
    expect(firstNameControl?.hasError("required")).toBeTruthy();
  });

  it("should make last name required", () => {
    const lastNameControl = component.registerForm.get("lastName");
    lastNameControl?.setValue("");
    expect(lastNameControl?.invalid).toBeTruthy();
    expect(lastNameControl?.hasError("required")).toBeTruthy();
  });

  it("should make username required", () => {
    const usernameControl = component.registerForm.get("username");
    usernameControl?.setValue("");
    expect(usernameControl?.invalid).toBeTruthy();
    expect(usernameControl?.hasError("required")).toBeTruthy();
  });

  it("should make email required and valid", () => {
    const emailControl = component.registerForm.get("email");

    // Test required validation
    emailControl?.setValue("");
    expect(emailControl?.invalid).toBeTruthy();
    expect(emailControl?.hasError("required")).toBeTruthy();

    // Test email validation
    emailControl?.setValue("invalid-email");
    expect(emailControl?.invalid).toBeTruthy();
    expect(emailControl?.hasError("email")).toBeTruthy();

    // Test valid email
    emailControl?.setValue("test@example.com");
    expect(emailControl?.valid).toBeTruthy();
  });

  it("should make password required with minimum length", () => {
    const passwordControl = component.registerForm.get("password");

    // Test required validation
    passwordControl?.setValue("");
    expect(passwordControl?.invalid).toBeTruthy();
    expect(passwordControl?.hasError("required")).toBeTruthy();

    // Test minimum length validation
    passwordControl?.setValue("123");
    expect(passwordControl?.invalid).toBeTruthy();
    expect(passwordControl?.hasError("minlength")).toBeTruthy();

    // Test valid password
    passwordControl?.setValue("password123");
    expect(passwordControl?.valid).toBeTruthy();
  });

  it("should make role required", () => {
    const roleControl = component.registerForm.get("role");
    roleControl?.setValue("");
    expect(roleControl?.invalid).toBeTruthy();
    expect(roleControl?.hasError("required")).toBeTruthy();
  });

  it("should validate form with all valid data", () => {
    component.registerForm.patchValue({
      firstName: "John",
      lastName: "Doe",
      username: "johndoe",
      email: "john@example.com",
      password: "password123",
      role: "RECRUITER",
    });
    expect(component.registerForm.valid).toBeTruthy();
  });

  it("should invalidate form with empty fields", () => {
    component.registerForm.patchValue({
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      role: "",
    });
    expect(component.registerForm.invalid).toBeTruthy();
  });

  it("should not submit form when invalid", () => {
    spyOn(component, "onSubmit").and.callThrough();
    component.registerForm.patchValue({
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      role: "",
    });

    component.onSubmit();

    expect(authServiceSpy.register).not.toHaveBeenCalled();
  });

  it("should submit form when valid", () => {
    const mockRegisterRequest: RegisterRequest = {
      firstName: "John",
      lastName: "Doe",
      username: "johndoe",
      email: "john@example.com",
      password: "password123",
      role: "RECRUITER",
    };

    const mockResponse = {
      accessToken: "mock-token",
      tokenType: "Bearer",
      expiresIn: 3600,
    };

    authServiceSpy.register.and.returnValue(of(mockResponse));

    component.registerForm.patchValue(mockRegisterRequest);
    component.onSubmit();

    expect(authServiceSpy.storeTempUserData).toHaveBeenCalledWith({
      username: "johndoe",
      email: "john@example.com",
      firstName: "John",
      lastName: "Doe",
      role: "RECRUITER",
    });
    expect(authServiceSpy.register).toHaveBeenCalledWith(mockRegisterRequest);
  });

  it("should handle admin role registration", () => {
    const mockRegisterRequest: RegisterRequest = {
      firstName: "Admin",
      lastName: "User",
      username: "admin",
      email: "admin@example.com",
      password: "admin123",
      role: "ADMIN",
    };

    authServiceSpy.register.and.returnValue(
      of({
        accessToken: "mock-token",
        tokenType: "Bearer",
        expiresIn: 3600,
      }),
    );

    component.registerForm.patchValue(mockRegisterRequest);
    component.onSubmit();

    expect(authServiceSpy.storeTempUserData).toHaveBeenCalledWith({
      username: "admin",
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
    });
  });

  it("should set loading to true during submission", () => {
    authServiceSpy.register.and.returnValue(
      of({
        accessToken: "mock-token",
        tokenType: "Bearer",
        expiresIn: 3600,
      }),
    );

    component.registerForm.patchValue({
      firstName: "John",
      lastName: "Doe",
      username: "johndoe",
      email: "john@example.com",
      password: "password123",
      role: "RECRUITER",
    });

    component.onSubmit();

    expect(component.isLoading).toBeTrue();
  });

  it("should have correct initial state", () => {
    expect(component.isLoading).toBeFalse();
    expect(component.registerForm).toBeDefined();
    expect(component.registerForm.get("role")?.value).toBe("RECRUITER");
  });

  it("should validate email format correctly", () => {
    const emailControl = component.registerForm.get("email");

    const invalidEmails = [
      "invalid",
      "invalid@",
      "@invalid.com",
      "invalid@com",
      "invalid..email@example.com",
      "invalid.email@example.",
    ];

    invalidEmails.forEach((email) => {
      emailControl?.setValue(email);
      expect(emailControl?.invalid).toBeTruthy(
        `Email ${email} should be invalid`,
      );
    });

    const validEmails = [
      "test@example.com",
      "user.name@domain.co.uk",
      "user+tag@example.org",
      "user123@test-domain.com",
    ];

    validEmails.forEach((email) => {
      emailControl?.setValue(email);
      expect(emailControl?.valid).toBeTruthy(`Email ${email} should be valid`);
    });
  });
});
