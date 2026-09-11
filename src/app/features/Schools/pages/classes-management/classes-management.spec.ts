import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassesManagement } from './classes-management';

describe('ClassesManagement', () => {
  let component: ClassesManagement;
  let fixture: ComponentFixture<ClassesManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassesManagement],
    }).compileComponents();

    fixture = TestBed.createComponent(ClassesManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
