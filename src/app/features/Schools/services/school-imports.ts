import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';

// Vous pouvez aussi y mettre des modules Angular Material, PrimeNG, etc.
export const SCHOOL_IMPORTS = [
  CommonModule,
  ReactiveFormsModule,
  FormsModule,
  RouterLink,
  RouterOutlet
] as const;
