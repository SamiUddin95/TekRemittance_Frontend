import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

    getDataByAgent(agentId: string, pageNumber: number = 1, pageSize: number = 50): Observable<{
        items: DisbursementData[];
        totalCount: number;
        pageNumber: number;
        pageSize: number;
        totalPages: number;
        statusCode: number;
        status: string;
    }> {
        const url = `${environment.apiUrl}/Disbursement/GetDataByAgent?agentId=${agentId}&pageNumber=${pageNumber}&pageSize=${pageSize}`;
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

    getDataByAuthorize(agentId: string, pageNumber: number = 1, pageSize: number = 10): Observable<{
        items: DisbursementData[];
        totalCount: number;
        pageNumber: number;
        pageSize: number;
        totalPages: number;
        statusCode: number;
        status: string;
    }> {
        const url = `${environment.apiUrl}/Disbursement/GetDataByAuthorize/${agentId}?pageNumber=${pageNumber}&pageSize=${pageSize}`;
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

    getDataByReject(agentId: string, pageNumber: number = 1, pageSize: number = 10): Observable<{
        items: DisbursementData[];
        totalCount: number;
        pageNumber: number;
        pageSize: number;
        totalPages: number;
        statusCode: number;
        status: string;
    }> {
        const url = `${environment.apiUrl}/Disbursement/GetDataByReject/${agentId}?pageNumber=${pageNumber}&pageSize=${pageSize}`;
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

    getDataByApproved(agentId: string, pageNumber: number = 1, pageSize: number = 10): Observable<{
        items: DisbursementData[];
        totalCount: number;
        pageNumber: number;
        pageSize: number;
        totalPages: number;
        statusCode: number;
        status: string;
    }> {
        const url = `${environment.apiUrl}/Disbursement/GetDataByApproved/${agentId}?pageNumber=${pageNumber}&pageSize=${pageSize}`;
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
