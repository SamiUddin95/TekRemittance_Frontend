import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@/environments/environment';

export interface DisbursementData {
    id: string;
    agentId: string;
    templateId: string;
    uploadId: string;
    rowNumber: number;
    dataJson: string;
    error: string;
    createdOn: string;
    status: string;
    limitMessage?: string;
}

export interface DisbursementResponse {
    status: string;
    data: {
        items: DisbursementData[];
        totalCount: number;
        pageNumber: number;
        pageSize: number;
        totalPages: number;
    };
    statusCode: number;
    errorMessage: string | null;
}

@Injectable({ providedIn: 'root' })
export class DisbursementService {
    constructor(private http: HttpClient) { }

    getDataByAgent(
  agentId: string,
  pageNumber: number = 1,
  pageSize: number = 50,
  filters: { xpin?: string; accountNumber?: string; date?: string } = {}
): Observable<any> {
  let url = `${environment.apiUrl}/Disbursement/GetDataByAgent?agentId=${agentId}`;
 
  const userId = sessionStorage.getItem('auth_userid');
  if (userId) {
    url += `&userId=${userId}`;
    console.log('getDataByAgent: Adding userId to URL:', userId);
  } else {
    console.warn('getDataByAgent: No userId found in session storage');
  }
 
  url += `&pageNumber=${pageNumber}&pageSize=${pageSize}`;

  if (filters.xpin) url += `&xpin=${filters.xpin}`;
  if (filters.accountNumber) url += `&accountNumber=${filters.accountNumber}`;
  if (filters.date) url += `&date=${filters.date}`;

  console.log('Final getDataByAgent URL:', url);

  return this.http.get<any>(url).pipe(
    map(res => {
      const payload = res?.data ?? res;
      const itemsRaw = Array.isArray(payload?.items) ? payload.items : [];
      return {
        items: itemsRaw,
        totalCount: payload?.totalCount ?? itemsRaw.length,
        pageNumber: payload?.pageNumber ?? pageNumber,
        pageSize: payload?.pageSize ?? pageSize,
        totalPages: payload?.totalPages ?? 1,
        status: res?.status ?? 'success'
      };
    })
  );
}

    remitReject(userId: string, xpin: string | number, modeOfTransaction?: string): Observable<any> {
        const url = `${environment.apiUrl}/Disbursement/RemitReject`;
        const body: any = { userId, xpin: String(xpin ?? '') };
        if (modeOfTransaction) body.modeOfTransaction = modeOfTransaction;
        return this.http.post<any>(url, body);
    }

    remitApprove(userId: string, xpin: string | number, modeOfTransaction?: string): Observable<any> {
        const url = `${environment.apiUrl}/Disbursement/RemitApprove`;
        const body: any = { userId, xpin: String(xpin ?? '') };
        if (modeOfTransaction) body.modeOfTransaction = modeOfTransaction;
        return this.http.post<any>(url, body);
    }
 
    remitAuthorize(userId: string, xpin: string | number, modeOfTransaction?: string): Observable<any> {
        const url = `${environment.apiUrl}/Disbursement/RemitAuthorize`;
        const body: any = { userId, xpin: String(xpin ?? '') };
        if (modeOfTransaction) body.modeOfTransaction = modeOfTransaction;
        return this.http.post<any>(url, body);
    }

    remitRepair(userId: string, xpin: string | number, modeOfTransaction?: string): Observable<any> {
        const url = `${environment.apiUrl}/Disbursement/RemitRepair`;
        const body: any = { userId, xpin: String(xpin ?? '') };
        if (modeOfTransaction) body.modeOfTransaction = modeOfTransaction;
        return this.http.post<any>(url, body);
    }
 
    remitReverse(userId: string, xpin: string | number, modeOfTransaction?: string): Observable<any> {
        const url = `${environment.apiUrl}/Disbursement/RemitReverse`;
        const body: any = { userId, xpin: String(xpin ?? '') };
        if (modeOfTransaction) body.modeOfTransaction = modeOfTransaction;
        return this.http.post<any>(url, body);
    }
    
    markAml(userId: string, xpin: string | number, modeOfTransaction?: string): Observable<any> {
  const url = `${environment.apiUrl}/Disbursement/AntiMoneyLaundering`;
  const body: any = { userId, xpin: String(xpin ?? '') };
  if (modeOfTransaction) body.modeOfTransaction = modeOfTransaction;
  return this.http.post<any>(url, body);
}




getDataByAuthorize(
  agentId: string,
  pageNumber: number = 1,
  pageSize: number = 10,
  filters: { xpin?: string; accountNumber?: string; date?: string; userId?: string } = {}
): Observable<{
  items: DisbursementData[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  statusCode: number;
  status: string;
}> {
  let params = new HttpParams()
    .set('pageNumber', pageNumber.toString())
    .set('pageSize', pageSize.toString());
 
  const userId = sessionStorage.getItem('auth_userid');
  if (userId) {
    params = params.set('userId', userId);
    console.log('Service: Adding userId to params:', userId);
  } else {
    console.warn('Service: No userId found in session storage');
  }
 
  if (filters.xpin) {
    params = params.set('xpin', filters.xpin);
  }
  if (filters.accountNumber) {
    params = params.set('accountNumber', filters.accountNumber);
  }
  if (filters.date) {
    params = params.set('date', filters.date); 
  }

  const url = `${environment.apiUrl}/Disbursement/GetDataByAuthorize/${agentId}`;

  return this.http.get<any>(url, { params }).pipe(
    map((res) => {
      const statusCode = res?.statusCode ?? res?.status ?? 200;
      const status = res?.status ?? 'success';
      const payload = res?.data ?? res;
      const itemsRaw = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];

      return {
        items: itemsRaw,
        totalCount: payload?.totalCount ?? itemsRaw.length,
        pageNumber: payload?.pageNumber ?? pageNumber,
        pageSize: payload?.pageSize ?? pageSize,
        totalPages: payload?.totalPages ?? 1,
        statusCode,
        status,
      };
    })
  );
}


getDataByReject(
  agentId: string,
  pageNumber: number = 1,
  pageSize: number = 10,
  filters: { xpin?: string; accountNumber?: string; date?: string } = {}
): Observable<{
  items: DisbursementData[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  statusCode: number;
  status: string;
}> {
  let params = new HttpParams()
    .set('pageNumber', pageNumber.toString())
    .set('pageSize', pageSize.toString());

  if (filters.xpin) {
    params = params.set('xpin', filters.xpin);
  }
  if (filters.accountNumber) {
    params = params.set('accountNumber', filters.accountNumber);
  }
  if (filters.date) {
    params = params.set('date', filters.date); // agar backend mein 'edate' hai to 'edate' kar dena
  }

  const url = `${environment.apiUrl}/Disbursement/GetDataByReject/${agentId}`;

  return this.http.get<any>(url, { params }).pipe(
    map((res) => {
      const statusCode = res?.statusCode ?? res?.status ?? 200;
      const status = res?.status ?? 'success';
      const payload = res?.data ?? res;
      const itemsRaw = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];

      return {
        items: itemsRaw,
        totalCount: payload?.totalCount ?? itemsRaw.length,
        pageNumber: payload?.pageNumber ?? pageNumber,
        pageSize: payload?.pageSize ?? pageSize,
        totalPages: payload?.totalPages ?? 1,
        statusCode,
        status,
      };
    })
  );
}

  

getDataByApproved(
  agentId: string,
  pageNumber: number = 1,
  pageSize: number = 10,
  filters: { xpin?: string; accountNumber?: string; date?: string } = {}
): Observable<{
  items: DisbursementData[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  statusCode: number;
  status: string;
}> {
  let params = new HttpParams()
    .set('pageNumber', pageNumber.toString())
    .set('pageSize', pageSize.toString());

  if (filters.xpin) {
    params = params.set('xpin', filters.xpin);
  }
  if (filters.accountNumber) {
    params = params.set('accountNumber', filters.accountNumber);
  }
  if (filters.date) {
    params = params.set('date', filters.date); 
  }

  const url = `${environment.apiUrl}/Disbursement/GetDataByApproved/${agentId}`;

  return this.http.get<any>(url, { params }).pipe(
    map((res) => {
      const statusCode = res?.statusCode ?? res?.status ?? 200;
      const status = res?.status ?? 'success';
      const payload = res?.data ?? res;
      const itemsRaw = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];

      return {
        items: itemsRaw,
        totalCount: payload?.totalCount ?? itemsRaw.length,
        pageNumber: payload?.pageNumber ?? pageNumber,
        pageSize: payload?.pageSize ?? pageSize,
        totalPages: payload?.totalPages ?? 1,
        statusCode,
        status,
      };
    })
  );
}



getDataByRepair(
  agentId: string,
  pageNumber: number = 1,
  pageSize: number = 10,
  filters: { xpin?: string; accountNumber?: string; date?: string } = {}
): Observable<{
  items: DisbursementData[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  statusCode: number;
  status: string;
}> {

  let params = new HttpParams()
    .set('pageNumber', pageNumber.toString())
    .set('pageSize', pageSize.toString());

  if (filters.xpin) {
    params = params.set('xpin', filters.xpin);
  }

  if (filters.accountNumber) {
    params = params.set('accountNumber', filters.accountNumber);
  }

  if (filters.date) {
    params = params.set('date', filters.date);
  }

  const url = `${environment.apiUrl}/Disbursement/GetDataByRepair/${agentId}`;

  return this.http.get<any>(url, { params }).pipe(
    map((res) => {
      const statusCode = res?.statusCode ?? res?.status ?? 200;
      const status = res?.status ?? 'success';
      const payload = res?.data ?? res;

      const itemsRaw = Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload)
        ? payload
        : [];

      return {
        items: itemsRaw,
        totalCount: payload?.totalCount ?? itemsRaw.length,
        pageNumber: payload?.pageNumber ?? pageNumber,
        pageSize: payload?.pageSize ?? pageSize,
        totalPages: payload?.totalPages ?? 1,
        statusCode,
        status,
      };
    })
  );
}

}
