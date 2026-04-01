import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { CommonModule } from "@angular/common";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatListModule } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatMenuModule } from "@angular/material/menu";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { of, Subject } from "rxjs";

import { LayoutComponent } from "./layout.component";
import { AuthService } from "../services/auth.service";
import { User } from "../models/auth.model";

describe("LayoutComponent", () => {
  let component: LayoutComponent;
  let fixture: ComponentFixture<LayoutComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
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
    const spy = jasmine.createSpyObj("AuthService", [
      "logout",
      "getCurrentUser",
    ]);
    const routerSpyObj = jasmine.createSpyObj("Router", ["navigate"]);

    currentUserSubject = new Subject<User | null>();
    spy.currentUser$ = currentUserSubject.asObservable();

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        CommonModule,
        MatToolbarModule,
        MatSidenavModule,
        MatListModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: AuthService, useValue: spy },
        { provide: Router, useValue: routerSpyObj },
      ],
    }).compileComponents();

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<any>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should initialize with correct default values", () => {
    expect(component.displayName).toBe("User");
    expect(component.currentUser$).toBeDefined();
  });

  it("should update display name when user changes", () => {
    expect(component.displayName).toBe("User");

    currentUserSubject.next(mockUser);

    expect(component.displayName).toBe("Test User");
  });

  it("should reset display name when user is null", () => {
    currentUserSubject.next(mockUser);
    expect(component.displayName).toBe("Test User");

    currentUserSubject.next(null);

    expect(component.displayName).toBe("User");
  });

  it("should get current user from auth service", () => {
    authServiceSpy.getCurrentUser.and.returnValue(mockUser);

    const currentUser = component.currentUser;

    expect(authServiceSpy.getCurrentUser).toHaveBeenCalled();
    expect(currentUser).toEqual(mockUser);
  });

  it("should logout and navigate to login", () => {
    component.logout();

    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/login"]);
  });

  it("should have correct template structure", () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector(".sidenav-container")).toBeTruthy();
    expect(compiled.querySelector(".sidenav")).toBeTruthy();
    expect(compiled.querySelector(".top-toolbar")).toBeTruthy();
    expect(compiled.querySelector(".page-content")).toBeTruthy();
    expect(compiled.querySelector("router-outlet")).toBeTruthy();
  });

  it("should display navigation items", () => {
    const compiled = fixture.nativeElement;
    const navItems = compiled.querySelectorAll("mat-nav-list a");
    expect(navItems.length).toBe(6);

    const navTexts = Array.from(navItems).map(
      (item: any) => item.querySelector(".nav-text")?.textContent,
    );
    expect(navTexts).toContain("Candidates");
    expect(navTexts).toContain("Add Candidate");
    expect(navTexts).toContain("Pipeline");
    expect(navTexts).toContain("AI Analysis");
    expect(navTexts).toContain("Job Offers");
    expect(navTexts).toContain("Settings");
  });

  it("should display correct icons for navigation items", () => {
    const compiled = fixture.nativeElement;
    const icons = compiled.querySelectorAll("mat-nav-list mat-icon");

    const iconTexts = Array.from(icons).map((icon: any) => icon.textContent);
    expect(iconTexts).toContain("people");
    expect(iconTexts).toContain("person_add");
    expect(iconTexts).toContain("view_kanban");
    expect(iconTexts).toContain("psychology");
    expect(iconTexts).toContain("work");
    expect(iconTexts).toContain("settings");
  });

  it("should have correct router links", () => {
    const compiled = fixture.nativeElement;
    const navItems = compiled.querySelectorAll("mat-nav-list a");

    const routerLinks = Array.from(navItems).map((item: any) =>
      item.getAttribute("routerLink"),
    );
    expect(routerLinks).toContain("/dashboard/candidates");
    expect(routerLinks).toContain("/dashboard/candidates/add");
    expect(routerLinks).toContain("/dashboard/pipeline");
    expect(routerLinks).toContain("/dashboard/ai");
    expect(routerLinks).toContain("/dashboard/job-offers");
    expect(routerLinks).toContain("/dashboard/settings");
  });

  it("should display app title", () => {
    const compiled = fixture.nativeElement;
    const appTitle = compiled.querySelector(".app-title");
    expect(appTitle).toBeTruthy();
    expect(appTitle.textContent).toContain("ATS - Applicant Tracking System");
  });

  it("should have user menu", () => {
    const compiled = fixture.nativeElement;
    const userButton = compiled.querySelector(".user-button");
    const userMenu = compiled.querySelector("mat-menu");

    expect(userButton).toBeTruthy();
    expect(userMenu).toBeTruthy();
    expect(userButton.querySelector("mat-icon").textContent).toBe(
      "account_circle",
    );
  });

  it("should display user name in menu", () => {
    currentUserSubject.next(mockUser);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const userName = compiled.querySelector("#userMenu span");
    expect(userName?.textContent).toContain("Test User");
  });

  it("should have menu button for sidenav toggle", () => {
    const compiled = fixture.nativeElement;
    const menuButton = compiled.querySelector(".menu-button");

    expect(menuButton).toBeTruthy();
    expect(menuButton.querySelector("mat-icon").textContent).toBe("menu");
  });

  it("should have correct navigation structure", () => {
    const compiled = fixture.nativeElement;
    const sidenav = compiled.querySelector(".sidenav");
    const navList = sidenav.querySelector("mat-nav-list");

    expect(navList).toBeTruthy();
    expect(navList.querySelectorAll("a").length).toBe(6);
  });

  it("should have routerLinkActive for navigation items", () => {
    const compiled = fixture.nativeElement;
    const navItems = compiled.querySelectorAll("mat-nav-list a");

    navItems.forEach((item: any) => {
      expect(item.hasAttribute("routerLinkActive")).toBeTruthy();
      expect(item.getAttribute("routerLinkActive")).toBe("active");
    });
  });

  it("should have exact match for candidates link", () => {
    const compiled = fixture.nativeElement;
    const candidatesLink = compiled.querySelector(
      'a[routerLink="/dashboard/candidates"]',
    );

    expect(candidatesLink).toBeTruthy();
    expect(candidatesLink.getAttribute("routerLinkActiveOptions")).toBe(
      "{ exact: true }",
    );
  });

  it("should have settings link in user menu", () => {
    const compiled = fixture.nativeElement;
    const settingsMenuItem = compiled.querySelector(
      'button[routerLink="/dashboard/settings"]',
    );

    expect(settingsMenuItem).toBeTruthy();
    expect(settingsMenuItem.textContent).toContain("Settings");
  });

  it("should have logout button in user menu", () => {
    const compiled = fixture.nativeElement;
    const logoutButton = compiled.querySelector(
      'button[mat-menu-item]:has(mat-icon[fontIcon="logout"])',
    );

    expect(logoutButton).toBeTruthy();
    expect(logoutButton.textContent).toContain("Logout");
  });

  it("should apply correct CSS classes", () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector(".sidenav-container")).toBeTruthy();
    expect(compiled.querySelector(".sidenav")).toBeTruthy();
    expect(compiled.querySelector(".top-toolbar")).toBeTruthy();
    expect(compiled.querySelector(".menu-button")).toBeTruthy();
    expect(compiled.querySelector(".user-button")).toBeTruthy();
    expect(compiled.querySelector(".app-title")).toBeTruthy();
    expect(compiled.querySelector(".page-content")).toBeTruthy();
  });

  it("should have proper layout structure with sidenav container", () => {
    const compiled = fixture.nativeElement;
    const container = compiled.querySelector("mat-sidenav-container");
    const sidenav = compiled.querySelector("mat-sidenav");
    const content = compiled.querySelector("mat-sidenav-content");

    expect(container).toBeTruthy();
    expect(sidenav).toBeTruthy();
    expect(content).toBeTruthy();

    expect(sidenav.getAttribute("mode")).toBe("side");
    expect(sidenav.getAttribute("opened")).toBe("");
  });

  it("should have toolbar with correct structure", () => {
    const compiled = fixture.nativeElement;
    const toolbar = compiled.querySelector("mat-toolbar");
    const menuButton = toolbar.querySelector(".menu-button");
    const title = toolbar.querySelector(".app-title");
    const userButton = toolbar.querySelector(".user-button");

    expect(toolbar).toBeTruthy();
    expect(menuButton).toBeTruthy();
    expect(title).toBeTruthy();
    expect(userButton).toBeTruthy();

    // Check spacer elements
    const spacers = toolbar.querySelectorAll(".spacer");
    expect(spacers.length).toBe(2);
  });
});
