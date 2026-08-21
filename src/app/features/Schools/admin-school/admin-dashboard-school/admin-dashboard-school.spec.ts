import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDashboardSchool } from './admin-dashboard-school';

describe('AdminDashboardSchool', () => {
  let component: AdminDashboardSchool;
  let fixture: ComponentFixture<AdminDashboardSchool>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDashboardSchool],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardSchool);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
