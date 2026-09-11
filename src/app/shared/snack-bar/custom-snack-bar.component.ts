import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { SnackBarData, DEFAULT_MEMES } from './snack-bar.model';

@Component({
  selector: 'app-custom-snack-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="snackbar-card" [ngClass]="data.type">
      <!-- Image / Meme GIF -->
      <div class="meme-container">
        <img [src]="data.memeUrl || defaultMeme" alt="Meme" class="meme-img" />
      </div>

      <!-- Contenu Texte -->
      <div class="content-container">
        @if (data.title) {
          <h4 class="snack-title">{{ data.title }}</h4>
        }
        <p class="snack-message">{{ data.message }}</p>
      </div>

      <!-- Actions -->
      <div class="actions-container">
        @if (data.actionText) {
          <button class="btn-action" (click)="executeAction()">
            {{ data.actionText }}
          </button>
        }
        <button class="btn-close" (click)="close()">✕</button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .snackbar-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 18px;
      border-radius: 16px;
      background: rgba(18, 18, 24, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5),
                  0 0 15px rgba(255, 255, 255, 0.05);
      color: #ffffff;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      min-width: 320px;
      max-width: 480px;
      overflow: hidden;
    }

    .snackbar-card.question { border-left: 4px solid #a855f7; }
    .snackbar-card.success  { border-left: 4px solid #10b981; }
    .snackbar-card.error    { border-left: 4px solid #ef4444; }
    .snackbar-card.warning  { border-left: 4px solid #f59e0b; }
    .snackbar-card.info     { border-left: 4px solid #3b82f6; }

    .meme-container {
      width: 52px;
      height: 52px;
      flex-shrink: 0;
      border-radius: 12px;
      overflow: hidden;
      border: 2px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    }

    .meme-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .content-container {
      flex-grow: 1;
    }

    .snack-title {
      margin: 0 0 2px 0;
      font-size: 0.95rem;
      font-weight: 700;
      letter-spacing: -0.01em;
      color: #f3f4f6;
    }

    .snack-message {
      margin: 0;
      font-size: 0.85rem;
      color: #9ca3af;
      line-height: 1.35;
    }

    .actions-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-action {
      background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
      color: white;
      border: none;
      padding: 6px 14px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(168, 85, 247, 0.4);
    }

    .btn-action:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(168, 85, 247, 0.6);
    }

    .btn-close {
      background: transparent;
      border: none;
      color: #6b7280;
      font-size: 1.1rem;
      cursor: pointer;
      padding: 4px;
      border-radius: 50%;
      transition: color 0.2s ease;
    }

    .btn-close:hover {
      color: #ffffff;
    }
  `]
})
export class CustomSnackBarComponent {
  get defaultMeme(): string {
    return DEFAULT_MEMES[this.data.type] || DEFAULT_MEMES.info;
  }

  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: SnackBarData,
    private snackBarRef: MatSnackBarRef<CustomSnackBarComponent>
  ) {}

  executeAction() {
    if (this.data.onAction) {
      this.data.onAction();
    }
    this.close();
  }

  close() {
    this.snackBarRef.dismiss();
  }
}
