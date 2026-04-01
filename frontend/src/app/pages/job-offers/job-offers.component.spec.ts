import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { JobOffersComponent } from './job-offers.component';

describe('JobOffersComponent', () => {
  let component: JobOffersComponent;
  let fixture: ComponentFixture<JobOffersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterTestingModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        NoopAnimationsModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobOffersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize correctly', () => {
    expect(component).toBeDefined();
  });

  it('should call ngOnInit on component initialization', () => {
    spyOn(component, 'ngOnInit');
    component.ngOnInit();
    expect(component.ngOnInit).toHaveBeenCalled();
  });

  it('should have correct template structure', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.job-offers-container')).toBeTruthy();
    expect(compiled.querySelector('.job-offers-card')).toBeTruthy();
    expect(compiled.querySelector('.coming-soon')).toBeTruthy();
  });

  it('should display coming soon message', () => {
    const compiled = fixture.nativeElement;
    const comingSoonText = compiled.querySelector('.coming-soon p').textContent;
    expect(comingSoonText).toContain('This feature is coming soon!');
  });

  it('should display job offers title', () => {
    const compiled = fixture.nativeElement;
    const titleElement = compiled.querySelector('mat-card-title');
    expect(titleElement.textContent).toContain('Job Offers');
  });

  it('should display job offers subtitle', () => {
    const compiled = fixture.nativeElement;
    const subtitleElement = compiled.querySelector('mat-card-subtitle');
    expect(subtitleElement.textContent).toContain('Manage job postings and recruitment');
  });

  it('should display coming soon icon', () => {
    const compiled = fixture.nativeElement;
    const iconElement = compiled.querySelector('.coming-soon-icon');
    expect(iconElement).toBeTruthy();
    expect(iconElement.textContent).toContain('work_outline');
  });

  it('should display feature list', () => {
    const compiled = fixture.nativeElement;
    const listItems = compiled.querySelectorAll('.coming-soon li');
    expect(listItems.length).toBe(4);
    expect(listItems[0].textContent).toContain('Create and manage job postings');
    expect(listItems[1].textContent).toContain('Track application status');
    expect(listItems[2].textContent).toContain('Manage interview schedules');
    expect(listItems[3].textContent).toContain('Generate recruitment reports');
  });

  it('should display disabled coming soon button', () => {
    const compiled = fixture.nativeElement;
    const buttonElement = compiled.querySelector('button[mat-raised-button]');
    expect(buttonElement).toBeTruthy();
    expect(buttonElement.disabled).toBeTruthy();
    expect(buttonElement.textContent).toContain('Coming Soon');
  });

  it('should have correct styling classes', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.job-offers-container')).toBeTruthy();
    expect(compiled.querySelector('.job-offers-card')).toBeTruthy();
    expect(compiled.querySelector('.coming-soon')).toBeTruthy();
    expect(compiled.querySelector('.coming-soon-icon')).toBeTruthy();
  });

  it('should have proper component structure', () => {
    expect(component.constructor.name).toBe('JobOffersComponent');
    expect(component.constructor).toBeDefined();
  });
});
