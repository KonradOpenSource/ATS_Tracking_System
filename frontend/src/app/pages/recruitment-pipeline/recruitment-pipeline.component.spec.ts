import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { CdkDropList, CdkDrag } from "@angular/cdk/drag-drop";
import { of } from "rxjs";

import { RecruitmentPipelineComponent } from "./recruitment-pipeline.component";
import { RecruitmentService } from "../../services/recruitment.service";
import {
  RecruitmentStage,
  CandidateStageHistory,
} from "../../models/recruitment.model";

describe("RecruitmentPipelineComponent", () => {
  let component: RecruitmentPipelineComponent;
  let fixture: ComponentFixture<RecruitmentPipelineComponent>;
  let recruitmentServiceSpy: jasmine.SpyObj<RecruitmentService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  const mockStages: RecruitmentStage[] = [
    {
      id: 1,
      name: "Applied",
      description: "Candidates who have applied",
      order: 1,
      createdAt: "2023-01-01T00:00:00Z",
      updatedAt: "2023-01-01T00:00:00Z",
    },
    {
      id: 2,
      name: "Screening",
      description: "Initial screening phase",
      order: 2,
      createdAt: "2023-01-01T00:00:00Z",
      updatedAt: "2023-01-01T00:00:00Z",
    },
  ];

  const mockCandidates: CandidateStageHistory[] = [
    {
      id: 1,
      candidate: {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
      },
      stage: mockStages[0],
      notes: "Applied via website",
      changedBy: {
        id: 1,
        firstName: "Recruiter",
        lastName: "User",
      },
      changedAt: "2023-01-01T00:00:00Z",
    },
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj("RecruitmentService", [
      "getStages",
      "getCandidatesInStage",
      "moveCandidateToStage",
      "initializeDefaultStages",
    ]);
    const snackBarSpyObj = jasmine.createSpyObj("MatSnackBar", ["open"]);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterTestingModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        NoopAnimationsModule,
        CdkDropList,
        CdkDrag,
      ],
      providers: [
        { provide: RecruitmentService, useValue: spy },
        { provide: MatSnackBar, useValue: snackBarSpyObj },
      ],
    }).compileComponents();

    recruitmentServiceSpy = TestBed.inject(
      RecruitmentService,
    ) as jasmine.SpyObj<RecruitmentService>;
    snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecruitmentPipelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should initialize with correct default values", () => {
    expect(component.stages).toEqual([]);
    expect(component.allCandidates).toEqual([]);
    expect(component.isLoading).toBeFalse();
  });

  it("should load pipeline data on initialization", () => {
    recruitmentServiceSpy.getStages.and.returnValue(of(mockStages));
    recruitmentServiceSpy.getCandidatesInStage.and.returnValue(
      of(mockCandidates),
    );

    component.ngOnInit();

    expect(recruitmentServiceSpy.getStages).toHaveBeenCalled();
    expect(component.isLoading).toBeTrue();
  });

  it("should handle load pipeline data error", () => {
    recruitmentServiceSpy.getStages.and.returnValue(of(mockStages));

    component.loadPipelineData();

    expect(component.isLoading).toBeTrue();
  });

  it("should load candidates in stages correctly", () => {
    component.stages = mockStages;
    recruitmentServiceSpy.getCandidatesInStage.and.returnValue(
      of(mockCandidates),
    );

    component.loadCandidatesInStages();

    expect(recruitmentServiceSpy.getCandidatesInStage).toHaveBeenCalledWith(
      mockStages[0].id,
    );
    expect(recruitmentServiceSpy.getCandidatesInStage).toHaveBeenCalledWith(
      mockStages[1].id,
    );
  });

  it("should stop loading when no stages exist", () => {
    component.stages = [];
    component.isLoading = true;

    component.loadCandidatesInStages();

    expect(component.isLoading).toBeFalse();
  });

  it("should get candidates for stage correctly", () => {
    component.allCandidates = mockCandidates;

    const candidates = component.getCandidatesForStage(1);

    expect(candidates).toEqual([mockCandidates[0]]);
  });

  it("should return empty array for stage with no candidates", () => {
    component.allCandidates = mockCandidates;

    const candidates = component.getCandidatesForStage(999);

    expect(candidates).toEqual([]);
  });

  it("should calculate total candidates count correctly", () => {
    component.stages = mockStages;
    component.allCandidates = mockCandidates;

    const count = component.getTotalCandidatesCount();

    expect(count).toBe(1);
  });

  it("should get connected drop lists correctly", () => {
    component.stages = mockStages;

    const connectedLists = component.getConnectedDropLists();

    expect(connectedLists).toEqual(["cdk-drop-list-0", "cdk-drop-list-1"]);
  });

  it("should initialize default stages", () => {
    recruitmentServiceSpy.initializeDefaultStages.and.returnValue(
      of(undefined),
    );
    spyOn(component, "loadPipelineData");

    component.initializeStages();

    expect(recruitmentServiceSpy.initializeDefaultStages).toHaveBeenCalled();
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      "Default stages initialized successfully",
      "Close",
      {
        duration: 3000,
        horizontalPosition: "center",
        verticalPosition: "top",
      },
    );
    expect(component.loadPipelineData).toHaveBeenCalled();
  });

  it("should handle initialize stages error", () => {
    recruitmentServiceSpy.initializeDefaultStages.and.returnValue(
      of(undefined),
    );

    component.initializeStages();

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      "Failed to initialize default stages",
      "Close",
      {
        duration: 3000,
        horizontalPosition: "center",
        verticalPosition: "top",
      },
    );
  });

  it("should move candidate to stage", () => {
    recruitmentServiceSpy.moveCandidateToStage.and.returnValue(
      of(mockCandidates[0]),
    );
    spyOn(component, "loadCandidatesInStages");

    component.moveCandidateToStage(1, 2);

    expect(recruitmentServiceSpy.moveCandidateToStage).toHaveBeenCalledWith(
      1,
      2,
      {
        notes: "Moved via drag and drop",
        changedById: 1,
      },
    );
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      "Candidate moved successfully",
      "Close",
      {
        duration: 3000,
        horizontalPosition: "center",
        verticalPosition: "top",
      },
    );
    expect(component.loadCandidatesInStages).toHaveBeenCalled();
  });

  it("should handle move candidate error", () => {
    recruitmentServiceSpy.moveCandidateToStage.and.returnValue(
      of(mockCandidates[0]),
    );
    spyOn(component, "loadCandidatesInStages");

    component.moveCandidateToStage(1, 2);

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      "Failed to move candidate",
      "Close",
      {
        duration: 3000,
        horizontalPosition: "center",
        verticalPosition: "top",
      },
    );
    expect(component.loadCandidatesInStages).toHaveBeenCalled();
  });

  it("should view candidate history", () => {
    spyOn(console, "log");

    component.viewCandidateHistory(1);

    expect(console.log).toHaveBeenCalledWith("View history for candidate:", 1);
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      "Candidate history feature coming soon",
      "Close",
      {
        duration: 3000,
        horizontalPosition: "center",
        verticalPosition: "top",
      },
    );
  });

  it("should handle drag and drop within same stage", () => {
    const mockEvent = {
      previousContainer: { data: mockCandidates },
      container: { data: mockCandidates },
      previousIndex: 0,
      currentIndex: 1,
    } as any;

    component.drop(mockEvent, 1);

    expect(mockCandidates[0]).toEqual(mockCandidates[1]);
  });

  it("should handle drag and drop between stages", () => {
    const sourceCandidates = [mockCandidates[0]];
    const targetCandidates: CandidateStageHistory[] = [];

    const mockEvent = {
      previousContainer: { data: sourceCandidates },
      container: { data: targetCandidates },
      previousIndex: 0,
      currentIndex: 0,
    } as any;

    spyOn(component, "moveCandidateToStage");

    component.drop(mockEvent, 2);

    expect(sourceCandidates.length).toBe(0);
    expect(targetCandidates.length).toBe(1);
    expect(component.moveCandidateToStage).toHaveBeenCalledWith(1, 2);
  });

  it("should have correct template structure", () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector(".pipeline-container")).toBeTruthy();
    expect(compiled.querySelector(".pipeline-card")).toBeTruthy();
    expect(compiled.querySelector(".actions-row")).toBeTruthy();
  });

  it("should display loading state correctly", () => {
    component.isLoading = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector(".loading-container")).toBeTruthy();
    expect(compiled.querySelector("mat-spinner")).toBeTruthy();
  });

  it("should display no stages state correctly", () => {
    component.isLoading = false;
    component.stages = [];
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector(".no-stages")).toBeTruthy();
    expect(compiled.querySelector(".no-stages-icon")).toBeTruthy();
  });
});
