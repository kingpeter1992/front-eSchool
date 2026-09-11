import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAdmission } from './create-admission';

describe('CreateAdmission', () => {
  let component: CreateAdmission;
  let fixture: ComponentFixture<CreateAdmission>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAdmission],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateAdmission);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
