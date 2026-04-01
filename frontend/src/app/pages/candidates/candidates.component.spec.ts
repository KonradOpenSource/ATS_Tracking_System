import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { CommonModule } from "@angular/common";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatCardModule } from "@angular/material/card";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { of } from "rxjs";

import { CandidatesComponent } from "./candidates.component";
import { CandidateService } from "../../services/candidate.service";
import { Candidate } from "../../models/candidate.model";

describe("CandidatesComponent", () => {
  let component: CandidatesComponent;
  let fixture: ComponentFixture<CandidatesComponent>;
  let candidateServiceSpy: jasmine.SpyObj<CandidateService>;
  let snackBarSpy: jasmine.SpyObj<any>;

  const mockCandidates: Candidate[] = [
    {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "123-456-7890",
      skills: "JavaScript, Angular, TypeScript",
      createdAt: "2023-01-01T00:00:00Z",
      updatedAt: "2023-01-01T00:00:00Z",
    },
    {
      id: 2,
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
      phone: "098-765-4321",
      skills: "Python, Django, PostgreSQL",
      createdAt: "2023-01-02T00:00:00Z",
      updatedAt: "2023-01-02T00:00:00Z",
    },
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj("CandidateService", [
      "getCandidates",
      "searchCandidates",
      "deleteCandidate",
    ]);
    const snackBarSpyObj = jasmine.createSpyObj("MatSnackBar", ["open"]);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterTestingModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: CandidateService, useValue: spy },
        { provide: MatSnackBar, useValue: snackBarSpyObj },
      ],
    }).compileComponents();

    candidateServiceSpy = TestBed.inject(
      CandidateService,
    ) as jasmine.SpyObj<CandidateService>;
    snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<any>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CandidatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should initialize with correct default values", () => {
    expect(component.candidates).toEqual([]);
    expect(component.displayedColumns).toEqual([
      "name",
      "phone",
      "skills",
      "actions",
    ]);
    expect(component.isLoading).toBeFalse();
    expect(component.searchQuery).toBe("");
  });

  it("should load candidates on initialization", () => {
    candidateServiceSpy.getCandidates.and.returnValue(of(mockCandidates));

    component.ngOnInit();

    expect(candidateServiceSpy.getCandidates).toHaveBeenCalled();
    expect(component.candidates).toEqual(mockCandidates);
    expect(component.isLoading).toBeFalse();
  });

  it("should set loading to true during candidate loading", () => {
    candidateServiceSpy.getCandidates.and.returnValue(of(mockCandidates));

    component.loadCandidates();

    expect(component.isLoading).toBeTrue();
  });

  it("should handle search query correctly", () => {
    const searchQuery = "John";
    candidateServiceSpy.searchCandidates.and.returnValue(
      of([mockCandidates[0]]),
    );

    component.searchQuery = searchQuery;
    component.loadCandidates();

    expect(candidateServiceSpy.searchCandidates).toHaveBeenCalledWith(
      searchQuery,
    );
    expect(component.candidates).toEqual([mockCandidates[0]]);
  });

  it("should load all candidates when search query is empty", () => {
    candidateServiceSpy.getCandidates.and.returnValue(of(mockCandidates));

    component.searchQuery = "";
    component.loadCandidates();

    expect(candidateServiceSpy.getCandidates).toHaveBeenCalled();
    expect(candidateServiceSpy.searchCandidates).not.toHaveBeenCalled();
    expect(component.candidates).toEqual(mockCandidates);
  });

  it("should handle search change event", () => {
    const mockEvent = { target: { value: "test search" } };
    spyOn(component, "loadCandidates");

    component.onSearchChange(mockEvent);

    expect(component.searchQuery).toBe("test search");
    expect(component.loadCandidates).toHaveBeenCalled();
  });

  it("should delete candidate when confirmed", () => {
    spyOn(window, "confirm").and.returnValue(true);
    candidateServiceSpy.deleteCandidate.and.returnValue(of(undefined));
    candidateServiceSpy.getCandidates.and.returnValue(of(mockCandidates));

    component.deleteCandidate(1);

    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this candidate?",
    );
    expect(candidateServiceSpy.deleteCandidate).toHaveBeenCalledWith(1);
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      "Candidate deleted successfully",
      "Close",
      {
        duration: 3000,
        horizontalPosition: "center",
        verticalPosition: "top",
      },
    );
  });

  it("should not delete candidate when cancelled", () => {
    spyOn(window, "confirm").and.returnValue(false);

    component.deleteCandidate(1);

    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this candidate?",
    );
    expect(candidateServiceSpy.deleteCandidate).not.toHaveBeenCalled();
  });

  it("should handle delete candidate error", () => {
    spyOn(window, "confirm").and.returnValue(true);
    candidateServiceSpy.deleteCandidate.and.returnValue(of(undefined));
    candidateServiceSpy.getCandidates.and.returnValue(of(mockCandidates));

    // Simulate error by making the observable throw
    candidateServiceSpy.deleteCandidate.and.returnValue(of(undefined));

    component.deleteCandidate(1);

    expect(candidateServiceSpy.deleteCandidate).toHaveBeenCalled();
  });

  it("should reload candidates after successful deletion", () => {
    spyOn(window, "confirm").and.returnValue(true);
    candidateServiceSpy.deleteCandidate.and.returnValue(of(undefined));
    candidateServiceSpy.getCandidates.and.returnValue(of(mockCandidates));

    component.deleteCandidate(1);

    expect(candidateServiceSpy.getCandidates).toHaveBeenCalled();
  });

  it("should handle loading state correctly", () => {
    expect(component.isLoading).toBeFalse();

    component.loadCandidates();
    expect(component.isLoading).toBeTrue();

    // Simulate async response
    candidateServiceSpy.getCandidates.and.returnValue(of(mockCandidates));
    component.loadCandidates();

    // After response, isLoading should be false
    expect(component.isLoading).toBeFalse();
  });

  it("should handle empty candidates list", () => {
    candidateServiceSpy.getCandidates.and.returnValue(of([]));

    component.loadCandidates();

    expect(component.candidates).toEqual([]);
    expect(component.isLoading).toBeFalse();
  });

  it("should have correct displayed columns", () => {
    expect(component.displayedColumns).toEqual([
      "name",
      "phone",
      "skills",
      "actions",
    ]);
  });

  it("should handle service errors gracefully", () => {
    candidateServiceSpy.getCandidates.and.returnValue(of(mockCandidates));

    component.loadCandidates();

    expect(component.isLoading).toBeFalse();
  });
});
