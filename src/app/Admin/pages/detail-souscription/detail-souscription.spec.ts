import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailSouscription } from './detail-souscription';

describe('DetailSouscription', () => {
  let component: DetailSouscription;
  let fixture: ComponentFixture<DetailSouscription>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailSouscription],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailSouscription);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
