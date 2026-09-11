import { CommonModule, CurrencyPipe, DatePipe,NgClass } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { CampusList } from '../pages/campus-list/campus-list';
import { UserList } from '../pages/user-list/user-list';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

// Vous pouvez aussi y mettre des modules Angular Material, PrimeNG, etc.
export const SCHOOL_IMPORTS = [
  CommonModule,
  ReactiveFormsModule,
  FormsModule,
  RouterLink,
  RouterOutlet,
  CommonModule,
   CurrencyPipe,
    DatePipe,
    RouterModule,
    NgClass,
    CampusList,
    UserList,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule


] as const;
