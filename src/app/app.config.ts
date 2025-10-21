import { ApplicationConfig, APP_INITIALIZER, inject, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { DecimalPipe } from '@angular/common'
import { provideDaterangepickerLocale } from 'ngx-daterangepicker-bootstrap';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { SessionService } from '@core/services/session.service';

export const appConfig: ApplicationConfig = {
  providers: [
      DecimalPipe,
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideRouter(routes),
      provideAnimations(),
      provideHttpClient(withInterceptors([authInterceptor])),
      provideDaterangepickerLocale({
          separator: ' - ',
          cancelLabel: 'Cancel',
      }),
      {
        provide: APP_INITIALIZER,
        multi: true,
        useFactory: () => {
          const session = inject(SessionService);
          return () => session.init();
        }
      }
  ],
};
