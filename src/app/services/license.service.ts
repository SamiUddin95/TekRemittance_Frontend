import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '@/environments/environment';

export interface LicenseStatusData {
  isValid: boolean;
  isExpired: boolean;
  expiryDate: string;
  daysRemaining: number;
  message: string;
}

export interface LicenseStatusResponse {
  status: string;
  data: LicenseStatusData;
  statusCode: number;
  errorMessage: string | null;
}

export interface LicenseUpdateRequest {
  encryptedKey: string;
}

export interface LicenseUpdateResponse {
  status: string;
  data: any;
  statusCode: number;
  errorMessage: string | null;
}

@Injectable({ providedIn: 'root' })
export class LicenseService {
  public static readonly WARNING_THRESHOLD_DAYS = 45;

  private readonly statusSubject = new BehaviorSubject<LicenseStatusData | null>(null);
  public readonly licenseStatus$ = this.statusSubject.asObservable();

  constructor(private http: HttpClient) {}

  getLicenseStatus(): Observable<LicenseStatusResponse> {
    const url = `${environment.apiUrl}/License/status`;
    return this.http.get<LicenseStatusResponse>(url).pipe(
      tap((res) => {
        if (res?.data) {
          this.setStatus(res.data);
        }
      })
    );
  }

  updateLicense(encryptedKey: string): Observable<LicenseUpdateResponse> {
    const url = `${environment.apiUrl}/License/update`;
    const body: LicenseUpdateRequest = { encryptedKey };
    return this.http.post<LicenseUpdateResponse>(url, body);
  }

  setStatus(status: LicenseStatusData | null): void {
    this.statusSubject.next(status);
  }

  getCurrentStatus(): LicenseStatusData | null {
    return this.statusSubject.value;
  }

  shouldShowWarning(status: LicenseStatusData | null): boolean {
    if (!status) return false;
    return status.isExpired || status.daysRemaining <= LicenseService.WARNING_THRESHOLD_DAYS;
  }

  formatExpiryDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  buildWarningMessage(status: LicenseStatusData | null): string {
    if (!status) return '';
    const date = this.formatExpiryDate(status.expiryDate);
    const days = status.daysRemaining;
    return `Application license will expire on ${date} (${days} day(s) left). Please renew.`;
  }
}
