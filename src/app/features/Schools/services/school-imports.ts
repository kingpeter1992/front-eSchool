import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';

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
    RouterModule
] as const;
