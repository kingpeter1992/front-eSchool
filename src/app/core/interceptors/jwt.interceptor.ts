import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, tap, catchError, throwError, finalize } from 'rxjs';
import { LoaderService } from '../../shared/loader/loader-service';
import { StorageService } from '../storage-service/storage-service';
import { Toast } from '../../shared/toaste/Toast';





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
   //   console.log('URL:', req.url);
   //   console.log('TOKEN:', token);
   //   console.log('IS PUBLIC:', isPublicUrl);
   //   console.log('AUTH HEADER:', authReq.headers.get('Authorization'));

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
      toastrService.error(errorMessage);

      return throwError(() => error);
    }),

    finalize(() => {
      loaderService.hide();
    })
  );
};

function extractErrorMessage(error: HttpErrorResponse): string {
  if (error.error) {
    if (typeof error.error === 'object' && error.error.message) {
      return error.error.message;
    }

    if (typeof error.error === 'string') {
      try {
        const parsed = JSON.parse(error.error);
        return parsed.message || error.error;
      } catch {
        return error.error;
      }
    }
  }

  switch (error.status) {
    case 400:
      return 'Requête incorrecte.';
    case 401:
      return 'Session expirée.';
    case 403:
      return 'Accès refusé.';
    case 500:
      return 'Erreur interne du serveur.';
    default:
      return 'Une erreur inattendue est survenue.';
  }
}
