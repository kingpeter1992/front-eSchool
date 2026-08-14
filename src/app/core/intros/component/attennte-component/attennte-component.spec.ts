import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttennteComponent } from './attennte-component';

describe('AttennteComponent', () => {
  let component: AttennteComponent;
  let fixture: ComponentFixture<AttennteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttennteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttennteComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
