import { Component, Inject } from '@angular/core';
import { SCHOOL_IMPORTS } from '../../services/school-imports';
import { EditDialogData } from '../../models/academic.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-structure-dialog-component',
  standalone: true,
  imports: [SCHOOL_IMPORTS],
  templateUrl: './edit-structure-dialog-component.html',
  styleUrl: './edit-structure-dialog-component.scss',
})
export class EditStructureDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<EditStructureDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditDialogData
  ) {}
}
