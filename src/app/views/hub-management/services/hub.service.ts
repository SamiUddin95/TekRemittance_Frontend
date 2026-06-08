import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Hub } from '../models/hub.model';
import { environment } from '@/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class HubService {
    constructor(private http: HttpClient) {}

    private mapDtoToHub(dto: any): Hub {
        return {
            id: dto.id ?? dto.Id,
            code: dto.code,
            name: dto.name,
            isDeleted: dto.isDeleted ?? false,
            createdBy: dto.createdBy,
            updatedBy: dto.updatedBy,
            createdOn: dto.createdOn,
            updatedOn: dto.updatedOn,
        } as Hub;
    }

    getHubs(
        page: number = 1,
        rowsPerPage: number = 10,
        code?: string,
        name?: string
    ): Observable<{
        items: Hub[];
        totalCount: number;
        pageNumber: number;
        pageSize: number;
        totalPages: number;
        statusCode: number;
        status: string;
    }> {
        let url = `${environment.apiUrl}/BasicSetup/hubs?pageNumber=${page}&pageSize=${rowsPerPage}`;
        if (code) url += `&code=${code}`;
        if (name) url += `&name=${name}`;

        return this.http.get<any>(url).pipe(
            map((res) => {
                const statusCode = res?.statusCode ?? 200;
                const status = res?.status ?? 'success';
                const payload = res?.data ?? res;
                const itemsRaw = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];

                const items = itemsRaw.map((d: any) => this.mapDtoToHub(d));

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
                return throwError(() => err instanceof Error ? err : new Error('Error loading hubs'));
            })
        );
    }

    getHubById(id: number): Observable<Hub | undefined> {
        const url = `${environment.apiUrl}/BasicSetup/hubs?pageNumber=1&pageSize=1000`;
        return this.http.get<any>(url).pipe(
            map((res) => {
                const payload = res?.data ?? res;
                const itemsRaw = Array.isArray(payload?.items) ? payload.items : [];
                const dto = itemsRaw.find((d: any) => (d.id ?? d.Id) === id);
                return dto ? this.mapDtoToHub(dto) : undefined;
            })
        );
    }

    addHub(hub: Omit<Hub, 'id'>): Observable<Hub> {
        const url = `${environment.apiUrl}/BasicSetup/CreateHub`;
        const nowIso = new Date().toISOString();
        const payload = {
            code: hub.code,
            name: hub.name,
            isDeleted: hub.isDeleted,
            createdBy: '',
            updatedBy: '',
            createdOn: nowIso,
            updatedOn: nowIso
        };
        return this.http.post<any>(url, payload).pipe(
            map(res => this.mapDtoToHub(res?.data ?? res)),
            catchError(err => throwError(() => err))
        );
    }

    updateHub(id: number, hub: Partial<Hub>): Observable<Hub> {
        const url = `${environment.apiUrl}/BasicSetup/UpdateHub`;
        const nowIso = new Date().toISOString();
        const payload = {
            id,
            code: hub.code,
            name: hub.name,
            isDeleted: hub.isDeleted,
            createdBy: hub.createdBy ?? '',
            updatedBy: '',
            createdOn: hub.createdOn ?? nowIso,
            updatedOn: nowIso
        };
        return this.http.put<any>(url, payload).pipe(
            map((res) => this.mapDtoToHub(res?.data ?? res))
        );
    }

    deleteHub(id: number): Observable<boolean> {
        const url = `${environment.apiUrl}/BasicSetup/DeleteHub/${id}`;
        return this.http.delete<any>(url).pipe(
            map((res) => {
                const status = res?.status ?? res?.statusCode;
                return status === 'success' || status === 200 || status === 204 || res === true;
            })
        );
    }
}
