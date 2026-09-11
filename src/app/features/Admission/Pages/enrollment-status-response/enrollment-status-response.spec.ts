import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnrollmentStatusResponse } from './enrollment-status-response';

describe('EnrollmentStatusResponse', () => {
  let component: EnrollmentStatusResponse;
  let fixture: ComponentFixture<EnrollmentStatusResponse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnrollmentStatusResponse],
    }).compileComponents();

    fixture = TestBed.createComponent(EnrollmentStatusResponse);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
