import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampusOverviewTab } from './campus-overview-tab';

describe('CampusOverviewTab', () => {
  let component: CampusOverviewTab;
  let fixture: ComponentFixture<CampusOverviewTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampusOverviewTab],
    }).compileComponents();

    fixture = TestBed.createComponent(CampusOverviewTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
