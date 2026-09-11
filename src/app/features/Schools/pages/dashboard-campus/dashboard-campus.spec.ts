import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardCampus } from './dashboard-campus';

describe('DashboardCampus', () => {
  let component: DashboardCampus;
  let fixture: ComponentFixture<DashboardCampus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardCampus],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardCampus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
