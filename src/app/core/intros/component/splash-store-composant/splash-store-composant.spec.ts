import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplashStoreComposant } from './splash-store-composant';

describe('SplashStoreComposant', () => {
  let component: SplashStoreComposant;
  let fixture: ComponentFixture<SplashStoreComposant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SplashStoreComposant],
    }).compileComponents();

    fixture = TestBed.createComponent(SplashStoreComposant);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
