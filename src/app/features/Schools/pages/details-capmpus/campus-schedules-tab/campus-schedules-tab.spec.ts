import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampusSchedulesTab } from './campus-schedules-tab';

describe('CampusSchedulesTab', () => {
  let component: CampusSchedulesTab;
  let fixture: ComponentFixture<CampusSchedulesTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampusSchedulesTab],
    }).compileComponents();

    fixture = TestBed.createComponent(CampusSchedulesTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
