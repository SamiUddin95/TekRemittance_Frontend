import { environment } from '@/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface AmlScreeningData {
  id: string;
  accountNumber: string;
  accountTitle: string;
  bankName: string;
  branchCode: string;
  status: 'Pending' | 'Pass' | 'Fail' | 'Review';
  screeningDate: string;
  hitCount: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  remarks: string;
  agentId: string;
  dataJson?: string;
  createdOn: string;
  error?: string;
}

export interface AmlScreeningResponse {
  status: string;
  items: AmlScreeningData[];
  totalCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class AmlScreeningService {
  
  constructor(private http: HttpClient) { }


  getDataByAgent(
    agentId: string,
    pageNumber: number,
    pageSize: number,
    accountnumber?: string,
    xpin?: string,
    date?: string
  ): Observable<any> {

    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (accountnumber) {
      params = params.set('accountnumber', accountnumber);
    }

    if (xpin) {
      params = params.set('xpin', xpin);
    }
    if (date) {
    params = params.set('date', date); 
  }
    const url = `${environment.apiUrl}/Disbursement/GetDataAntiMoneyLaundering/${agentId}`;

    return this.http.get<any>(url, { params });
  }

  approveScreening(screeningId: string): Observable<{status: string, message: string}> {
    // Mock implementation - replace with actual API call
    return of({
      status: 'success',
      message: 'AML screening approved successfully'
    });
  }

  rejectScreening(screeningId: string): Observable<{status: string, message: string}> {
    // Mock implementation - replace with actual API call
    return of({
      status: 'success',
      message: 'AML screening rejected successfully'
    });
  }
}