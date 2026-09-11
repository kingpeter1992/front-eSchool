import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, tap, catchError, throwError, finalize } from 'rxjs';
import { LoaderService } from '../../shared/loader/loader-service';
import { StorageService } from '../storage-service/storage-service';
import { Toast } from '../../shared/toaste/Toast';
import { ApiErrorResponse } from '../../utilities/ApiErrorResponse';

export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

  const storageService = inject(StorageService);
  const toastrService = inject(Toast);
  const loaderService = inject(LoaderService);

  const publicUrls = [
    '/api/auth/login',
    '/api/auth/register'
  ];

  const isPublicUrl = publicUrls.some(url => req.url.includes(url));

  loaderService.show();

  const token = storageService.getToken();

  const authReq = token && !isPublicUrl
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  return next(authReq).pipe(
    tap((event: HttpEvent<unknown>) => {
      if (event instanceof HttpResponse) {
        const body: any = event.body;
        if (body && body.success === true && body.message) {
          toastrService.success(body.message);
        }
      }
    }),

    catchError((error: HttpErrorResponse) => {
      const errorMessage = extractErrorMessage(error);

      // Affichage automatique du message retourné par le Backend
      toastrService.error(errorMessage);

      return throwError(() => error);
    }),

    finalize(() => {
      loaderService.hide();
    })
  );
};

/**
 * Extraction intelligente du message d'erreur depuis ApiErrorResponse
 */
function extractErrorMessage(error: HttpErrorResponse): string {
  // 1. Cas d'erreur réseau / serveur éteint (status 0)
  if (error.status === 0) {
    return 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
  }

  // 2. Si le serveur Spring a renvoyé un corps JSON (ApiErrorResponse)
  if (error.error) {
    // Cas normal : l'erreur est déjà parsée sous forme d'objet JSON
    if (typeof error.error === 'object' && error.error.message) {
      return error.error.message;
    }

    // Cas où la réponse JSON a été reçue sous forme de String brut
    if (typeof error.error === 'string') {
      try {
        const parsed: ApiErrorResponse = JSON.parse(error.error);
        if (parsed && parsed.message) {
          return parsed.message;
        }
      } catch {
        // Si ce n'est pas du JSON valide mais du texte simple
        if (error.error.trim().length > 0) {
          return error.error;
        }
      }
    }
  }

  // 3. Fallback sur les codes de statut HTTP si aucun message n'a été transmis dans le JSON
  switch (error.status) {
    case 400:
      return 'Données invalides envoyées au serveur.';
    case 401:
      return 'Session expirée ou non autorisée. Veuillez vous reconnecter.';
    case 403:
      return 'Accès refusé. Vous n\'avez pas les droits nécessaires.';
    case 404:
      return 'La ressource demandée n\'a pas été trouvée.';
    case 422:
      return 'Erreur de validation des données.';
    case 500:
      return 'Une erreur interne ';
    default:
      return 'Une erreur inattendue est survenue.';
  }
}
