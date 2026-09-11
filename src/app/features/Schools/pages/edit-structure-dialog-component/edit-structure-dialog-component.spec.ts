import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditStructureDialogComponent } from './edit-structure-dialog-component';

describe('EditStructureDialogComponent', () => {
  let component: EditStructureDialogComponent;
  let fixture: ComponentFixture<EditStructureDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditStructureDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditStructureDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
