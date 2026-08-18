import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DasboardSubcription } from './dasboard-subcription';

describe('DasboardSubcription', () => {
  let component: DasboardSubcription;
  let fixture: ComponentFixture<DasboardSubcription>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DasboardSubcription],
    }).compileComponents();

    fixture = TestBed.createComponent(DasboardSubcription);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
