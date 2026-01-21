import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@/environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private baseUrl = `${environment.apiUrl}/Reports`;
  private remittanceUrl = `${environment.apiUrl}/Remittance`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('auth_token');
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  // Get transaction data for table
  getTransactions(page: number = 1, pageSize: number = 50, status?: string, accountNumber?: string): Observable<any> {
    const headers = this.getHeaders();
    let url = `${this.remittanceUrl}/data?page=${page}&pageSize=${pageSize}`;
    if (status) url += `&status=${status}`;
    if (accountNumber) url += `&accountNumber=${accountNumber}`;
    return this.http.get(url, { headers });
  }

  renderPdf(reportPath: string, parameters: Record<string,string>) {
  const headers = this.getHeaders();
  return this.http.post(
    `${this.baseUrl}/render`,
    { reportPath, format: 'PDF', parameters, fileName: 'Report' },
    { headers, responseType: 'blob' }
  );
}

  download(reportPath: string, format: 'PDF'|'EXCEL'|'IMAGE'|'CSV', parameters: Record<string, string>, fileName: string) {
    const headers = this.getHeaders();
    return this.http.post(
      `${this.baseUrl}/render`,
      { reportPath, format, parameters, fileName },
      { headers, responseType: 'blob', observe: 'response' }
    );
  }
} 