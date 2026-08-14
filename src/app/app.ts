import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SplashStoreComposant } from './core/intros/component/splash-store-composant/splash-store-composant';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,ConfirmDialogModule, SplashStoreComposant],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('erp-scolaire-frontend');
}
