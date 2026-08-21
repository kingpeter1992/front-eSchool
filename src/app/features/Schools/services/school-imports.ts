import { CommonModule, CurrencyPipe, DatePipe,NgClass } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { CampusList } from '../pages/campus-list/campus-list';
import { UserList } from '../pages/user-list/user-list';

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
    UserList
  


] as const;
