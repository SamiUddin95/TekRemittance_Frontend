import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Branch, BranchListResponse, HubDropdown } from '../models/branch.model';
import { environment } from '@/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class BranchService {
    constructor(private http: HttpClient) {}

    private mapDtoToBranch(dto: any): Branch {
        return {
            id: dto.id ?? dto.Id,
            code: dto.code,
            name: dto.name,
            isActive: dto.isActive ?? false,
            hubCode: dto.hubCode ?? dto.hubId ?? 0,
            isDeleted: dto.isDeleted ?? false,
            createdBy: dto.createdBy,
            updatedBy: dto.updatedBy,
            createdOn: dto.createdOn,
            updatedOn: dto.updatedOn,
        } as Branch;
    }

    getBranches(
        page: number = 1,
        rowsPerPage: number = 10,
        code?: string,
        name?: string
    ): Observable<{
        items: Branch[];
        totalCount: number;
        pageNumber: number;
        pageSize: number;
        totalPages: number;
        statusCode: number;
        status: string;
    }> {
        let url = `${environment.apiUrl}/BasicSetup/bankbranches?pageNumber=${page}&pageSize=${rowsPerPage}`;
        if (code) url += `&code=${code}`;
        if (name) url += `&name=${name}`;

        return this.http.get<any>(url).pipe(
            map((res) => {
                const statusCode = res?.statusCode ?? 200;
                const status = res?.status ?? 'success';
                const payload = res?.data ?? res;
                const itemsRaw = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];

                const items = itemsRaw.map((d: any) => this.mapDtoToBranch(d));

                return {
                    items,
                    totalCount: payload?.totalCount ?? items.length,
                    pageNumber: payload?.pageNumber ?? page,
                    pageSize: payload?.pageSize ?? rowsPerPage,
                    totalPages: payload?.totalPages ?? 1,
                    statusCode,
                    status,
                };
            }),
            catchError((err) => {
                return throwError(() => err instanceof Error ? err : new Error('Error loading branches'));
            })
        );
    }

    getBranchById(id: number): Observable<Branch | undefined> {
        const url = `${environment.apiUrl}/BasicSetup/BankBranchById/${id}`;
        return this.http.get<any>(url).pipe(
            map((res) => {
                const payload = res?.data ?? res;
                return payload ? this.mapDtoToBranch(payload) : undefined;
            })
        );
    }

    getHubDropdown(): Observable<HubDropdown[]> {
        const url = `${environment.apiUrl}/BasicSetup/hubs-dropdown`;
        return this.http.get<any>(url).pipe(
            map((res) => {
                const payload = res?.data ?? res;
                return Array.isArray(payload) ? payload : [];
            })
        );
    }

    addBranch(branch: Omit<Branch, 'id'>): Observable<Branch> {
        const url = `${environment.apiUrl}/BasicSetup/CreateBankBranch`;
        const nowIso = new Date().toISOString();
        const payload = {
            id: 0,
            code: branch.code,
            name: branch.name,
            isActive: branch.isActive,
            hubCode: branch.hubCode,
            isDeleted: branch.isDeleted,
            createdBy: '',
            updatedBy: '',
            createdOn: nowIso,
            updatedOn: nowIso
        };
        return this.http.post<any>(url, payload).pipe(
            map(res => this.mapDtoToBranch(res?.data ?? res)),
            catchError(err => throwError(() => err))
        );
    }

    updateBranch(id: number, branch: Partial<Branch>): Observable<Branch> {
        const url = `${environment.apiUrl}/BasicSetup/UpdateBankBranch`;
        const nowIso = new Date().toISOString();
        const payload = {
            id,
            code: branch.code,
            name: branch.name,
            isActive: branch.isActive,
            hubCode: branch.hubCode,
            isDeleted: branch.isDeleted,
            createdBy: branch.createdBy ?? '',
            updatedBy: '',
            createdOn: branch.createdOn ?? nowIso,
            updatedOn: nowIso
        };
        return this.http.put<any>(url, payload).pipe(
            map((res) => this.mapDtoToBranch(res?.data ?? res))
        );
    }

    deleteBranch(id: number): Observable<boolean> {
        const url = `${environment.apiUrl}/BasicSetup/DeleteBankBranch/${id}`;
        return this.http.delete<any>(url).pipe(
            map((res) => {
                const status = res?.status ?? res?.statusCode;
                return status === 'success' || status === 200 || status === 204 || res === true;
            })
        );
    }
}
