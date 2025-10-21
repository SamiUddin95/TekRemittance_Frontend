import { Injectable } from '@angular/core';
import { IdleDetectorService } from './idle-detector.service';
import { PopupService } from './popup.service';
import { AuthService } from './auth.service';
import { filter, switchMap, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private initialized = false;

  constructor(
    private idle: IdleDetectorService,
    private popup: PopupService,
    private auth: AuthService,
  ) {}

  init() {
    if (this.initialized) return;
    this.initialized = true;

    this.idle.onIdle
      .pipe(
        switchMap(() => {
          return this.popup.confirmLogout('No activity detected', 'You will be logged out due to inactivity.').then(c => c);
        }),
        switchMap((confirmed) => {
          if (confirmed) {
            const res = this.auth.logout(true);
            return res ?? of(null);
          }
          return of(null);
        })
      )
      .subscribe({});

    this.idle.startMonitoring();
  }
}
