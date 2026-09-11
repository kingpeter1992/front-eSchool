import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardEnrollment } from './dashboard-enrollment';

describe('DashboardEnrollment', () => {
  let component: DashboardEnrollment;
  let fixture: ComponentFixture<DashboardEnrollment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardEnrollment],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardEnrollment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
