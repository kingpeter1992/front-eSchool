import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SplashStore } from '../../../services/SplashStore';

@Component({
  selector: 'app-splash-store-composant',
standalone: true,
  imports: [
    CommonModule,
    MatProgressBarModule
  ],
  templateUrl: './splash-store-composant.html',
  styleUrl: './splash-store-composant.css',
})
export class SplashStoreComposant {
  // On renomme pour éviter le conflit de nom exact avec la classe du service
  protected readonly splashStore = inject(SplashStore);
}
