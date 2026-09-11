import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SplashStoreComposant } from './core/intros/component/splash-store-composant/splash-store-composant';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DetailsSchool } from './features/Schools/admin-school/details-school/details-school';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,ConfirmDialogModule, SplashStoreComposant, DetailsSchool],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('hSCHOOL');
}
