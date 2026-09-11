import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAdmision } from './add-admision';

describe('AddAdmision', () => {
  let component: AddAdmision;
  let fixture: ComponentFixture<AddAdmision>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAdmision],
    }).compileComponents();

    fixture = TestBed.createComponent(AddAdmision);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
