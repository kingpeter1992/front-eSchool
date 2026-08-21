import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampusList } from './campus-list';

describe('CampusList', () => {
  let component: CampusList;
  let fixture: ComponentFixture<CampusList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampusList],
    }).compileComponents();

    fixture = TestBed.createComponent(CampusList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
