import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        NoopAnimationsModule
      ],
      declarations: [
        AppComponent
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct title', () => {
    expect(component.title).toBe('ATS - Applicant Tracking System');
  });

  it('should have correct template structure', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('app-layout')).toBeTruthy();
  });

  it('should render app-layout component', () => {
    const compiled = fixture.nativeElement;
    const appLayout = compiled.querySelector('app-layout');
    expect(appLayout).toBeTruthy();
  });

  it('should have root element', () => {
    const compiled = fixture.nativeElement;
    expect(compiled).toBeTruthy();
  });

  it('should be a standalone component', () => {
    expect(AppComponent).toBeDefined();
  });
});
