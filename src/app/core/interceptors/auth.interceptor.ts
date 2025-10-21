import { HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, finalize, from, of, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { PopupService } from '../services/popup.service';
import Swal from 'sweetalert2';

let isHandlingAuthError = false;

export const authInterceptor: HttpInterceptorFn = (req, next): Observable<HttpEvent<unknown>> => {
  const auth = inject(AuthService);
  const popup = inject(PopupService);

  const urlLower = req.url.toLowerCase();
  const isLogout = urlLower.includes('/auth/logout');
  const isLogin = urlLower.includes('/auth/login');
  const token = isLogout ? null : auth.getToken();
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((err) => {
      // Do not trigger popup for logout endpoint, just propagate
      const url = req.url.toLowerCase();
      if (url.includes('/auth/logout')) {
        return throwError(() => err);
      }

      if (err?.status === 401 || err?.status === 403) {
        // Skip session-expired handling on login endpoint
        if (isLogin) {
          return throwError(() => err);
        }
        if (isHandlingAuthError) {
          return throwError(() => err);
        }
        isHandlingAuthError = true;
        return from(popup.confirmLogout('Session expired', 'Please login again.')).pipe(
          switchMap((confirmed) => {
            if (confirmed) {
              const res = auth.logout(true);
              return res
                ? res.pipe(
                    finalize(() => { isHandlingAuthError = false; }),
                    switchMap(() => throwError(() => err))
                  )
                : throwError(() => err);
            }
            isHandlingAuthError = false;
            return throwError(() => err);
          })
        );
      }
      return throwError(() => err);
    })
  );
};
