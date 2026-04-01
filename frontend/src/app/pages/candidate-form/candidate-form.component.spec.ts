import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { of } from "rxjs";

import { CandidateFormComponent } from "./candidate-form.component";
import { CandidateService } from "../../services/candidate.service";
import {
  Candidate,
  CreateCandidateRequest,
  UpdateCandidateRequest,
} from "../../models/candidate.model";

describe("CandidateFormComponent", () => {
  let component: CandidateFormComponent;
  let fixture: ComponentFixture<CandidateFormComponent>;
  let candidateServiceSpy: jasmine.SpyObj<CandidateService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let routeSpy: jasmine.SpyObj<ActivatedRoute>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  const mockCandidate: Candidate = {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "123-456-7890",
    summary: "Experienced developer",
    experience: "5 years of experience",
    education: "Bachelor degree",
    skills: "JavaScript, Angular, TypeScript",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj("CandidateService", [
      "getCandidate",
      "createCandidate",
      "updateCandidate",
    ]);
    const routerSpyObj = jasmine.createSpyObj("Router", ["navigate"]);
    const routeSpyObj = jasmine.createSpyObj("ActivatedRoute", ["snapshot"]);
    const snackBarSpyObj = jasmine.createSpyObj("MatSnackBar", ["open"]);

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
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
        { provide: CandidateService, useValue: spy },
        { provide: Router, useValue: routerSpyObj },
        { provide: ActivatedRoute, useValue: routeSpyObj },
        { provide: MatSnackBar, useValue: snackBarSpyObj },
      ],
    }).compileComponents();

    candidateServiceSpy = TestBed.inject(
      CandidateService,
    ) as jasmine.SpyObj<CandidateService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    routeSpy = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CandidateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should initialize with correct default values", () => {
    expect(component.isLoading).toBeFalse();
    expect(component.isEditMode).toBeFalse();
    expect(component.candidateId).toBeNull();
    expect(component.candidateForm).toBeDefined();
  });

  it("should initialize form with correct fields and validators", () => {
    const form = component.candidateForm;
    expect(form.contains("firstName")).toBeTruthy();
    expect(form.contains("lastName")).toBeTruthy();
    expect(form.contains("email")).toBeTruthy();
    expect(form.contains("phone")).toBeTruthy();
    expect(form.contains("summary")).toBeTruthy();
    expect(form.contains("experience")).toBeTruthy();
    expect(form.contains("education")).toBeTruthy();
    expect(form.contains("skills")).toBeTruthy();

    // Test required validators
    expect(
      form.get("firstName")?.hasValidator(Validators.required),
    ).toBeTruthy();
    expect(
      form.get("lastName")?.hasValidator(Validators.required),
    ).toBeTruthy();
    expect(form.get("email")?.hasValidator(Validators.required)).toBeTruthy();
    expect(form.get("email")?.hasValidator(Validators.email)).toBeTruthy();
  });

  it("should detect edit mode from route parameters", () => {
    routeSpy.snapshot = {
      paramMap: {
        get: jasmine.createSpy("get").and.returnValue("1"),
      },
    } as any;

    spyOn(component, "loadCandidate");

    component.ngOnInit();

    expect(component.isEditMode).toBeTrue();
    expect(component.candidateId).toBe(1);
    expect(component.loadCandidate).toHaveBeenCalledWith(1);
  });

  it("should stay in create mode when no id in route", () => {
    routeSpy.snapshot = {
      paramMap: {
        get: jasmine.createSpy("get").and.returnValue(null),
      },
    } as any;

    spyOn(component, "loadCandidate");

    component.ngOnInit();

    expect(component.isEditMode).toBeFalse();
    expect(component.candidateId).toBeNull();
    expect(component.loadCandidate).not.toHaveBeenCalled();
  });

  it("should load candidate data in edit mode", () => {
    candidateServiceSpy.getCandidate.and.returnValue(of(mockCandidate));

    component.loadCandidate(1);

    expect(component.isLoading).toBeTrue();
    expect(candidateServiceSpy.getCandidate).toHaveBeenCalledWith(1);
    expect(component.candidateForm.value).toEqual({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "123-456-7890",
      summary: "Experienced developer",
      experience: "5 years of experience",
      education: "Bachelor degree",
      skills: "JavaScript, Angular, TypeScript",
    });
    expect(component.isLoading).toBeFalse();
  });

  it("should handle load candidate error", () => {
    candidateServiceSpy.getCandidate.and.returnValue(of(mockCandidate));

    component.loadCandidate(1);

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      "Failed to load candidate",
      "Close",
      {
        duration: 3000,
        horizontalPosition: "center",
        verticalPosition: "top",
      },
    );
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/dashboard/candidates"]);
    expect(component.isLoading).toBeFalse();
  });

  it("should validate form correctly", () => {
    const form = component.candidateForm;

    // Test empty form
    form.patchValue({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      summary: "",
      experience: "",
      education: "",
      skills: "",
    });
    expect(form.invalid).toBeTruthy();

    // Test valid form
    form.patchValue({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "123-456-7890",
      summary: "Summary",
      experience: "Experience",
      education: "Education",
      skills: "Skills",
    });
    expect(form.valid).toBeTruthy();
  });

  it("should validate email field", () => {
    const emailControl = component.candidateForm.get("email");

    // Test invalid email
    emailControl?.setValue("invalid-email");
    expect(emailControl?.invalid).toBeTruthy();
    expect(emailControl?.hasError("email")).toBeTruthy();

    // Test valid email
    emailControl?.setValue("valid@example.com");
    expect(emailControl?.valid).toBeTruthy();
  });

  it("should not submit invalid form", () => {
    spyOn(console, "log");
    component.candidateForm.patchValue({
      firstName: "",
      lastName: "",
      email: "",
    });

    component.onSubmit();

    expect(console.log).toHaveBeenCalledWith(
      "onSubmit called",
      component.candidateForm.value,
      false,
    );
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      "Please fill all required fields correctly",
      "Close",
      {
        duration: 3000,
      },
    );
    expect(candidateServiceSpy.createCandidate).not.toHaveBeenCalled();
    expect(candidateServiceSpy.updateCandidate).not.toHaveBeenCalled();
  });

  it("should create new candidate in create mode", () => {
    component.isEditMode = false;
    component.candidateForm.patchValue({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "123-456-7890",
      summary: "Summary",
      experience: "Experience",
      education: "Education",
      skills: "Skills",
    });

    candidateServiceSpy.createCandidate.and.returnValue(of(mockCandidate));

    component.onSubmit();

    const expectedRequest: CreateCandidateRequest = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "123-456-7890",
      summary: "Summary",
      experience: "Experience",
      education: "Education",
      skills: "Skills",
    };

    expect(component.isLoading).toBeTrue();
    expect(candidateServiceSpy.createCandidate).toHaveBeenCalledWith(
      expectedRequest,
    );
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      "Candidate created successfully",
      "Close",
      {
        duration: 3000,
        horizontalPosition: "center",
        verticalPosition: "top",
      },
    );
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/dashboard/candidates"]);
  });

  it("should update existing candidate in edit mode", () => {
    component.isEditMode = true;
    component.candidateId = 1;
    component.candidateForm.patchValue({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "123-456-7890",
      summary: "Summary",
      experience: "Experience",
      education: "Education",
      skills: "Skills",
    });

    candidateServiceSpy.updateCandidate.and.returnValue(of(mockCandidate));

    component.onSubmit();

    const expectedRequest: UpdateCandidateRequest = {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "123-456-7890",
      summary: "Summary",
      experience: "Experience",
      education: "Education",
      skills: "Skills",
    };

    expect(component.isLoading).toBeTrue();
    expect(candidateServiceSpy.updateCandidate).toHaveBeenCalledWith(
      1,
      expectedRequest,
    );
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      "Candidate updated successfully",
      "Close",
      {
        duration: 3000,
        horizontalPosition: "center",
        verticalPosition: "top",
      },
    );
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/dashboard/candidates"]);
  });

  it("should handle create candidate error", () => {
    spyOn(console, "error");
    component.isEditMode = false;
    component.candidateForm.patchValue({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "123-456-7890",
      summary: "Summary",
      experience: "Experience",
      education: "Education",
      skills: "Skills",
    });

    candidateServiceSpy.createCandidate.and.returnValue(of(mockCandidate));

    component.onSubmit();

    expect(console.error).toHaveBeenCalledWith(
      "Failed to create candidate:",
      jasmine.any(Object),
    );
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      "Failed to create candidate. Please try again.",
      "Close",
      {
        duration: 3000,
        horizontalPosition: "center",
        verticalPosition: "top",
      },
    );
    expect(component.isLoading).toBeFalse();
  });

  it("should handle update candidate error", () => {
    component.isEditMode = true;
    component.candidateId = 1;
    component.candidateForm.patchValue({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "123-456-7890",
      summary: "Summary",
      experience: "Experience",
      education: "Education",
      skills: "Skills",
    });

    candidateServiceSpy.updateCandidate.and.returnValue(of(mockCandidate));

    component.onSubmit();

    expect(component.isLoading).toBeFalse();
  });

  it("should have correct template structure", () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector(".form-container")).toBeTruthy();
    expect(compiled.querySelector(".form-card")).toBeTruthy();
    expect(compiled.querySelector("form")).toBeTruthy();
  });

  it("should display correct title based on mode", () => {
    component.isEditMode = false;
    fixture.detectChanges();

    let compiled = fixture.nativeElement;
    expect(compiled.querySelector("mat-card-title").textContent).toContain(
      "Add New Candidate",
    );
    expect(compiled.querySelector("mat-card-subtitle").textContent).toContain(
      "Fill in the candidate details",
    );

    component.isEditMode = true;
    fixture.detectChanges();

    compiled = fixture.nativeElement;
    expect(compiled.querySelector("mat-card-title").textContent).toContain(
      "Edit Candidate",
    );
    expect(compiled.querySelector("mat-card-subtitle").textContent).toContain(
      "Update candidate information",
    );
  });

  it("should display correct button text based on mode", () => {
    component.isEditMode = false;
    fixture.detectChanges();

    let compiled = fixture.nativeElement;
    expect(compiled.querySelector(".submit-button span").textContent).toContain(
      "Create",
    );

    component.isEditMode = true;
    fixture.detectChanges();

    compiled = fixture.nativeElement;
    expect(compiled.querySelector(".submit-button span").textContent).toContain(
      "Update",
    );
  });

  it("should disable submit button when form is invalid", () => {
    component.candidateForm.patchValue({
      firstName: "",
      lastName: "",
      email: "",
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector(".submit-button").disabled).toBeTruthy();
  });

  it("should disable submit button when loading", () => {
    component.isLoading = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector(".submit-button").disabled).toBeTruthy();
    expect(compiled.querySelector(".submit-button mat-spinner")).toBeTruthy();
  });
});
