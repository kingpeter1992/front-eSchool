import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomSnackBarComponent } from './custom-snack-bar.component';
import { SnackBarData } from './snack-bar.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  show(data: SnackBarData, durationInSeconds: number = 5) {
    this.snackBar.openFromComponent(CustomSnackBarComponent, {
      data,
      duration: durationInSeconds * 1000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['custom-snack-panel'] // Pour réinitialiser le style Angular Material par défaut
    });
  }

  // Helper spécifique pour les questions
  askQuestion(message: string, actionText: string, onAction: () => void, customMemeUrl?: string) {
    this.show({
      title: 'Question...',
      message,
      type: 'question',
      actionText,
      onAction,
      memeUrl: customMemeUrl
    }, 8); // Durée plus longue pour laisser le temps de répondre
  }

  // Helpers pratiques
  success(message: string, title: string = 'Succès !') {
    this.show({ title, message, type: 'success' });
  }

  error(message: string, title: string = 'Oups !') {
    this.show({ title, message, type: 'error' });
  }
}
