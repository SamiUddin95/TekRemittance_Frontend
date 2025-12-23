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
  let url = `${environment.apiUrl}/Disbursement/GetDataByAgent?agentId=${agentId}&pageNumber=${pageNumber}&pageSize=${pageSize}`;

  if (filters.xpin) url += `&xpin=${filters.xpin}`;
  if (filters.accountNumber) url += `&accountNumber=${filters.accountNumber}`;
  if (filters.date) url += `&date=${filters.date}`;

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


    // RemitReject: rejects a disbursement by XPin and UserId
    remitReject(userId: string, xpin: string | number): Observable<any> {
        const url = `${environment.apiUrl}/Disbursement/RemitReject`;
        const body = { userId, xpin: String(xpin ?? '') };
        return this.http.post<any>(url, body);
    }

    // RemitApprove: approves a disbursement by XPin and UserId
    remitApprove(userId: string, xpin: string | number): Observable<any> {
        const url = `${environment.apiUrl}/Disbursement/RemitApprove`;
        const body = { userId, xpin: String(xpin ?? '') };
        return this.http.post<any>(url, body);
    }

    // RemitAuthorize: authorizes a disbursement by XPin and UserId
    remitAuthorize(userId: string, xpin: string | number): Observable<any> {
        const url = `${environment.apiUrl}/Disbursement/RemitAuthorize`;
        const body = { userId, xpin: String(xpin ?? '') };
        return this.http.post<any>(url, body);
    }

    // RemitRepair: repairs a rejected disbursement by XPin and UserId
    remitRepair(userId: string, xpin: string | number): Observable<any> {
        const url = `${environment.apiUrl}/Disbursement/RemitRepair`;
        const body = { userId, xpin: String(xpin ?? '') };
        return this.http.post<any>(url, body);
    }

    // RemitReverse: reverses a disbursement by XPin and UserId
    remitReverse(userId: string, xpin: string | number): Observable<any> {
        const url = `${environment.apiUrl}/Disbursement/RemitReverse`;
        const body = { userId, xpin: String(xpin ?? '') };
        return this.http.post<any>(url, body);
    }


getDataByAuthorize(
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

  // Add optional filters only if they exist
  if (filters.xpin) {
    params = params.set('xpin', filters.xpin);
  }
  if (filters.accountNumber) {
    params = params.set('accountNumber', filters.accountNumber);
  }
  if (filters.date) {
    params = params.set('date', filters.date); // agar backend mein 'edate' hai to yahan 'edate' likh dena
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
    params = params.set('date', filters.date); // agar backend mein 'edate' hai to yahan 'edate' kar dena
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



    getDataByRepair(agentId: string, pageNumber: number = 1, pageSize: number = 10): Observable<{
        items: DisbursementData[];
        totalCount: number;
        pageNumber: number;
        pageSize: number;
        totalPages: number;
        statusCode: number;
        status: string;
    }> {
        const url = `${environment.apiUrl}/Disbursement/GetDataByRepair/${agentId}?pageNumber=${pageNumber}&pageSize=${pageSize}`;
        return this.http.get<any>(url).pipe(
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
}
