import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';

export interface InternalBankAccountData {
  id: string;
  agentId: string;
  agentName: string;
  templateId: string;
  uploadId: string;
  rowNumber: number;
  dataJson: string;
  error: string;
  createdOn: string;
  updatedOn: string;
  status: string;
  limitType: string | null;
  remarks: string | null;
  modeOfTransaction: string | null;
}

export interface InternalBankAccountsResponse {
  status: string;
  data: {
    items: InternalBankAccountData[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  };
  statusCode: number;
  errorMessage: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class InternalBankAccountsService {

  constructor(private http: HttpClient) {}

  getInternalBankAccounts(
    agentId: string,
    pageNumber: number,
    pageSize: number,
    filters: { accountnumber?: string; xpin?: string; date?: string } = {}
  ): Observable<InternalBankAccountsResponse> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (filters.accountnumber) {
      params = params.set('accountnumber', filters.accountnumber);
    }
    if (filters.xpin) {
      params = params.set('xpin', filters.xpin);
    }
    if (filters.date) {
      params = params.set('date', filters.date);
    }

    const url = `${environment.apiUrl}/Disbursement/InternalBankAccounts/${agentId}`;
    return this.http.get<InternalBankAccountsResponse>(url, { params });
  }
}
