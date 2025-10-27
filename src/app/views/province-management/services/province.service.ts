import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Province } from '../models/province.model';
import { environment } from '@/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ProvinceService {
    constructor(private http: HttpClient) {}

    private mapDtoToProvince(dto: any): Province {
        return {
            id: dto.id ?? dto.provinceId ?? dto.Id,
            code: dto.provinceCode ?? dto.code,
            name: dto.provinceName ?? dto.name,
            isActive: dto.isActive ?? true,
            countryId: dto.countryId ?? String(dto.countryId),
            countryName: dto.countryName,
            createdAt: dto.createdOn ? new Date(dto.createdOn) : undefined,
            updatedAt: dto.updatedOn ? new Date(dto.updatedOn) : undefined,
        } as Province;
    }

    getProvinces(page: number = 1, rowsPerPage: number = 100000): Observable<{
        items: Province[];
        totalCount: number;
        pageNumber: number;
        pageSize: number;
        totalPages: number;
        statusCode: number;
        status: string;
    }> {
        const url = `${environment.apiUrl}/BasicSetup/provinces?pageNumber=${page}&pageSize=${rowsPerPage}`;
        return this.http.get<any>(url).pipe(
            map((res) => {
                const statusCode = res?.statusCode ?? res?.status ?? 200;
                const status = res?.status ?? 'success';
                const payload = res?.data ?? res;
                if (statusCode !== 200 || !payload) {
                    throw new Error(`Failed to load provinces (statusCode=${statusCode})`);
                }
                const itemsRaw = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];
                return {
                    items: itemsRaw.map((d: any) => this.mapDtoToProvince(d)),
                    totalCount: payload?.totalCount ?? itemsRaw.length,
                    pageNumber: payload?.pageNumber ?? page,
                    pageSize: payload?.pageSize ?? rowsPerPage,
                    totalPages: payload?.totalPages ?? 1,
                    statusCode,
                    status,
                };
            }),
            catchError((err) => throwError(() => err instanceof Error ? err : new Error('Error loading provinces')))
        );
    }

    getProvinceById(id: string): Observable<Province | undefined> {
        const url = `${environment.apiUrl}/BasicSetup/provincebyId/${id}`;
        return this.http.get<any>(url).pipe(
            map((res) => {
                const dto = res?.data ?? res;
                return dto ? this.mapDtoToProvince(dto) : undefined;
            })
        );
    }

    addProvince(province: Omit<Province, 'id'>): Observable<Province> {
        const url = `${environment.apiUrl}/BasicSetup/CreateProvince`;
        const nowIso = new Date().toISOString();
        const payload = {
            id: crypto?.randomUUID ? crypto.randomUUID() : undefined,
            provinceCode: province.code,
            provinceName: province.name,
            isActive: province.isActive,
            createdBy: '',
            updatedBy: '',
            createdOn: nowIso,
            updatedOn: nowIso,
            countryId: province.countryId,
        };
        return this.http.post<any>(url, payload).pipe(
            map((res) => this.mapDtoToProvince(res?.data ?? res))
        );
    }

    updateProvince(id: string, province: Partial<Province>): Observable<Province> {
        const url = `${environment.apiUrl}/BasicSetup/updateProvince`;
        const nowIso = new Date().toISOString();
        const payload = {
            id,
            provinceCode: province.code,
            provinceName: province.name,
            isActive: province.isActive,
            createdBy: '',
            updatedBy: '',
            createdOn: nowIso,
            updatedOn: nowIso,
            countryId: province.countryId,
        };
        return this.http.put<any>(url, payload).pipe(
            map((res) => this.mapDtoToProvince(res?.data ?? res))
        );
    }

    deleteProvince(id: string): Observable<boolean> {
        const url = `${environment.apiUrl}/BasicSetup/deleteProvince/${id}`;
        return this.http.delete<any>(url).pipe(
            map((res) => {
                const status = res?.status ?? res?.statusCode;
                return status === 'success' || status === 200 || status === 204 || res === true;
            })
        );
    }
}
