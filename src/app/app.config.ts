import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { provideNativeDateAdapter } from '@angular/material/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(), // ✅ Uniquement le mode Zoneless
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()), // ✅ Déclaré une seule fois proprement
    provideHttpClient(withInterceptors([jwtInterceptor])),
    MessageService,
    DialogService,
    ConfirmationService,
    provideNativeDateAdapter(),
  ],
};
