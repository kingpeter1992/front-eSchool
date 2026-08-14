import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSchool } from './admin-school';

describe('AdminSchool', () => {
  let component: AdminSchool;
  let fixture: ComponentFixture<AdminSchool>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSchool],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminSchool);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
