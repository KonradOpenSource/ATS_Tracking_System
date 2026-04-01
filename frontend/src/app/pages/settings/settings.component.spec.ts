import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule, Validators } from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { of, Subject } from "rxjs";

import { SettingsComponent } from "./settings.component";
import { AuthService } from "../../services/auth.service";
import { User } from "../../models/auth.model";

describe("SettingsComponent", () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let currentUserSubject: Subject<User | null>;

  const mockUser: User = {
    id: 1,
    username: "testuser",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    role: "RECRUITER",
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj("AuthService", ["updateUser"]);
    const snackBarSpyObj = jasmine.createSpyObj("MatSnackBar", ["open"]);

    currentUserSubject = new Subject<User | null>();
    spy.currentUser$ = currentUserSubject.asObservable();

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSelectModule,
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
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should initialize with correct default values", () => {
    expect((component as any).currentUser).toBeNull();
    expect(component.settingsForm).toBeDefined();
    expect((component as any).isLoading).toBeFalse();
    expect((component as any).userSubscription).toBeNull();
  });

  it("should initialize form with correct fields and validators", () => {
    const form = component.settingsForm;
    expect(form.contains("username")).toBeTruthy();
    expect(form.contains("email")).toBeTruthy();
    expect(form.contains("firstName")).toBeTruthy();
    expect(form.contains("lastName")).toBeTruthy();
    expect(form.contains("notificationEmail")).toBeTruthy();
    expect(form.contains("theme")).toBeTruthy();

    // Test required validators
    expect(
      form.get("username")?.hasValidator(Validators.required),
    ).toBeTruthy();
    expect(form.get("email")?.hasValidator(Validators.required)).toBeTruthy();
    expect(
      form.get("firstName")?.hasValidator(Validators.required),
    ).toBeTruthy();
    expect(
      form.get("lastName")?.hasValidator(Validators.required),
    ).toBeTruthy();
    expect(form.get("theme")?.hasValidator(Validators.required)).toBeTruthy();

    // Test email validators
    expect(form.get("email")?.hasValidator(Validators.email)).toBeTruthy();
    expect(
      form.get("notificationEmail")?.hasValidator(Validators.email),
    ).toBeTruthy();
  });

  it("should load user data on initialization", () => {
    spyOn(localStorage, "getItem").and.returnValue(null);
    spyOn(localStorage, "setItem");
    const classListSpy = spyOn(document.body.classList, "remove");
    const addSpy = spyOn(document.body.classList, "add");

    component.ngOnInit();

    expect((component as any).userSubscription).toBeTruthy();
    expect(localStorage.getItem).toHaveBeenCalledWith("user_settings");
    expect(classListSpy).toHaveBeenCalledWith("light-theme", "dark-theme");
    expect(addSpy).toHaveBeenCalledWith("light-theme");
  });

  it("should load saved settings from localStorage", () => {
    const savedSettings = {
      username: "saveduser",
      email: "saved@example.com",
      firstName: "Saved",
      lastName: "User",
      notificationEmail: "notify@example.com",
      theme: "dark",
    };

    const classListSpy = spyOn(document.body.classList, "remove");
    const addSpy = spyOn(document.body.classList, "add");
    spyOn(localStorage, "setItem");

    component.ngOnInit();

    expect(component.settingsForm.value).toEqual(savedSettings);
    expect(localStorage.setItem).toHaveBeenCalledWith("selected_theme", "dark");
  });

  it("should update form when user data is received", () => {
    component.ngOnInit();

    currentUserSubject.next(mockUser);

    expect(component.currentUser).toEqual(mockUser);
    expect(component.settingsForm.get("username")?.value).toBe("testuser");
    expect(component.settingsForm.get("email")?.value).toBe("test@example.com");
    expect(component.settingsForm.get("firstName")?.value).toBe("Test");
    expect(component.settingsForm.get("lastName")?.value).toBe("User");
  });

  it("should apply theme correctly", () => {
    const classListSpy = spyOn(document.body.classList, "remove");
    const addSpy = spyOn(document.body.classList, "add");
    spyOn(localStorage, "setItem");

    (component as any).applyTheme("dark");

    expect(classListSpy).toHaveBeenCalledWith("light-theme", "dark-theme");
    expect(addSpy).toHaveBeenCalledWith("dark-theme");
    expect(localStorage.setItem).toHaveBeenCalledWith("selected_theme", "dark");
  });

  it("should apply light theme when not dark", () => {
    const classListSpy = spyOn(document.body.classList, "remove");
    const addSpy = spyOn(document.body.classList, "add");
    spyOn(localStorage, "setItem");

    (component as any).applyTheme("light");

    expect(classListSpy).toHaveBeenCalledWith("light-theme", "dark-theme");
    expect(addSpy).toHaveBeenCalledWith("light-theme");
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "selected_theme",
      "light",
    );
  });

  it("should handle theme change", () => {
    spyOn(component as any, "applyTheme");

    component.onThemeChange("dark");

    expect((component as any).applyTheme).toHaveBeenCalledWith("dark");
  });

  it("should validate form correctly", () => {
    const form = component.settingsForm;

    // Test empty form
    form.patchValue({
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      notificationEmail: "",
      theme: "",
    });
    expect(form.invalid).toBeTruthy();

    // Test valid form
    form.patchValue({
      username: "testuser",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      notificationEmail: "notify@example.com",
      theme: "light",
    });
    expect(form.valid).toBeTruthy();
  });

  it("should validate email fields", () => {
    const emailControl = component.settingsForm.get("email");
    const notificationEmailControl =
      component.settingsForm.get("notificationEmail");

    // Test invalid email
    emailControl?.setValue("invalid-email");
    expect(emailControl?.invalid).toBeTruthy();
    expect(emailControl?.hasError("email")).toBeTruthy();

    // Test valid email
    emailControl?.setValue("valid@example.com");
    expect(emailControl?.valid).toBeTruthy();

    // Test notification email (optional but should validate if provided)
    notificationEmailControl?.setValue("invalid-email");
    expect(notificationEmailControl?.invalid).toBeTruthy();
    expect(notificationEmailControl?.hasError("email")).toBeTruthy();

    notificationEmailControl?.setValue("notify@example.com");
    expect(notificationEmailControl?.valid).toBeTruthy();
  });

  it("should not save settings when form is invalid", () => {
    component.settingsForm.patchValue({
      username: "",
      email: "",
      firstName: "",
      lastName: "",
    });

    component.saveSettings();

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      "Please fill in all required fields",
      "Close",
      {
        duration: 3000,
        horizontalPosition: "center",
        verticalPosition: "top",
      },
    );
    expect(authServiceSpy.updateUser).not.toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();
  });

  it("should save settings when form is valid", () => {
    spyOn(localStorage, "setItem");

    component.settingsForm.patchValue({
      username: "testuser",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      notificationEmail: "notify@example.com",
      theme: "dark",
    });

    component.saveSettings();

    expect(component.isLoading).toBeTrue();
    expect(authServiceSpy.updateUser).toHaveBeenCalledWith({
      username: "testuser",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
    });
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "user_settings",
      jasmine.any(String),
    );
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      "Settings saved successfully!",
      "Close",
      {
        duration: 3000,
        horizontalPosition: "center",
        verticalPosition: "top",
      },
    );
    expect(component.isLoading).toBeFalse();
  });

  it("should unsubscribe on destroy", () => {
    spyOn(localStorage, "getItem").and.returnValue(null);
    spyOn(localStorage, "setItem");
    const classListSpy = spyOn(document.body.classList, "remove");
    const addSpy = spyOn(document.body.classList, "add");

    component.ngOnInit();
    expect((component as any).userSubscription).toBeTruthy();

    const unsubscribeSpy = spyOn(
      (component as any).userSubscription!,
      "unsubscribe",
    );

    component.ngOnDestroy();

    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  it("should handle null user subscription", () => {
    (component as any).userSubscription = null;

    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  it("should have correct template structure", () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector(".settings-container")).toBeTruthy();
    expect(compiled.querySelector(".settings-card")).toBeTruthy();
    expect(compiled.querySelector("form")).toBeTruthy();
    expect(compiled.querySelector(".user-info")).toBeTruthy();
    expect(compiled.querySelector(".settings-section")).toBeTruthy();
  });

  it("should display user role when user is available", () => {
    component.currentUser = mockUser;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector(".user-info p").textContent).toContain(
      "RECRUITER",
    );
  });

  it("should disable save button when form is invalid", () => {
    component.settingsForm.patchValue({
      username: "",
      email: "",
      firstName: "",
      lastName: "",
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(
      compiled.querySelector('button[type="submit"]').disabled,
    ).toBeTruthy();
  });

  it("should disable save button when loading", () => {
    component.isLoading = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(
      compiled.querySelector('button[type="submit"]').disabled,
    ).toBeTruthy();
    expect(
      compiled.querySelector('button[type="submit"] span').textContent,
    ).toContain("Saving...");
  });

  it("should show save button text correctly when not loading", () => {
    component.isLoading = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(
      compiled.querySelector('button[type="submit"] span').textContent,
    ).toContain("Save Settings");
  });

  it("should handle invalid notification email", () => {
    component.settingsForm.patchValue({
      username: "testuser",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      notificationEmail: "invalid-email",
      theme: "light",
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(
      compiled.querySelector('button[type="submit"]').disabled,
    ).toBeTruthy();
  });
});
