import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DasboardSchool } from './dasboard-school';

describe('DasboardSchool', () => {
  let component: DasboardSchool;
  let fixture: ComponentFixture<DasboardSchool>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DasboardSchool],
    }).compileComponents();

    fixture = TestBed.createComponent(DasboardSchool);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
