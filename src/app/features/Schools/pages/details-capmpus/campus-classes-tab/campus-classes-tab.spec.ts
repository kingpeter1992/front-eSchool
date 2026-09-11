import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampusClassesTab } from './campus-classes-tab';

describe('CampusClassesTab', () => {
  let component: CampusClassesTab;
  let fixture: ComponentFixture<CampusClassesTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampusClassesTab],
    }).compileComponents();

    fixture = TestBed.createComponent(CampusClassesTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
