import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';

export interface BarGraphData {
  period: string;
  complete_Count: number;
  process_Count: number;
  cancelled_Count: number;
}

export interface BarGraphResponse {
  status: string;
  data: BarGraphData[];
  statusCode: number;
  errorMessage: string | null;
}

export interface DashboardData {
  failedAmount: number;
  failedCount: number;
  successAmount: number;
  successCount: number;
  successPercentage: number;
  totalCount: number;
  totalAmount: number;
}

export interface DashboardResponse {
  status: string;
  data: DashboardData;
  statusCode: number;
  errorMessage: string | null;
}

export interface RecentTransaction {
  agentName: string;
  xpin: string | null;
  date: string;
  accountNumber: string | null;
  accountTitle: string | null;
  amount: number;
  status: 'Completed' | 'Processing' | 'Cancelled';
  modeOfTransaction: string | null;
}

export interface RecentTransactionsResponse {
  status: string;
  data: RecentTransaction[];
  statusCode: number;
  errorMessage: string | null;
}

export interface TransactionModeItem {
    agentName: string;
    xpin: string | null;
    date: string;
    accountNumber: string | null;
    accountTitle: string | null;
    amount: number;
    status: string;
    modeOfTransaction: string;
}

export interface TransactionModeListResponse {
    status: string;
    data: TransactionModeItem[];
    statusCode: number;
    errorMessage: string | null;
}

export interface TransactionModeData {
    ftCount: number;
    ibftCount: number;
    rtgsCount: number;
}

export interface TransactionModeResponse {
    status: string;
    data: TransactionModeData;
    statusCode: number;
    errorMessage: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient) { }

  getDisbursementDashboard(dateRange: string = 'Today'): Observable<DashboardResponse> {
    const url = `${environment.apiUrl}/Dashboards/dashboard/disbursement`;
    const params = new HttpParams().set('dateRange', dateRange);
    
    return this.http.get<DashboardResponse>(url, { params });
  }

  getBarGraphDashboard(dateRange: string = 'Monthly'): Observable<BarGraphResponse> {
    console.log('DashboardService: getBarGraphDashboard called with dateRange:', dateRange);
    const url = `${environment.apiUrl}/Dashboards/barGraphDashboard`;
    const params = new HttpParams().set('dateRange', dateRange);
    console.log('DashboardService: Making API call to:', url, 'with params:', params.toString());
    
    return this.http.get<BarGraphResponse>(url, { params });
  }

  getRecentTransactions(): Observable<RecentTransactionsResponse> {
    const url = `${environment.apiUrl}/Dashboards/dashboard/RecentTransactions`;
    
    return this.http.get<RecentTransactionsResponse>(url);
  }

  getTransactionModeCount(dateRange: string = 'Today'): Observable<TransactionModeResponse> {
    const url = `${environment.apiUrl}/Dashboards/dashboard/transactionModeCount`;
    const params = new HttpParams().set('dateRange', dateRange);
    
    return this.http.get<TransactionModeResponse>(url, { params });
  }

  getTransactionModeList(dateRange: string = 'Today', mode: string): Observable<TransactionModeListResponse> {
    const url = `${environment.apiUrl}/Dashboards/dashboard/transactionModeList`;
    const params = new HttpParams()
      .set('dateRange', dateRange)
      .set('mode', mode);
    
    return this.http.get<TransactionModeListResponse>(url, { params });
  }
}
