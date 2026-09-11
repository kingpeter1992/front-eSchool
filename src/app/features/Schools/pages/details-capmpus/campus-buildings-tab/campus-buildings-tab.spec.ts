import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampusBuildingsTab } from './campus-buildings-tab';

describe('CampusBuildingsTab', () => {
  let component: CampusBuildingsTab;
  let fixture: ComponentFixture<CampusBuildingsTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampusBuildingsTab],
    }).compileComponents();

    fixture = TestBed.createComponent(CampusBuildingsTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
