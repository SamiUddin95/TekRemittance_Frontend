import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
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

    getProvinces(): Observable<Province[]> {
        const url = `${environment.apiUrl}/BasicSetup/Province`;
        return this.http.get<any>(url).pipe(
            map((res) => {
                const data = Array.isArray(res) ? res : res?.data;
                const arr = Array.isArray(data) ? data : [];
                return arr.map((d) => this.mapDtoToProvince(d));
            })
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
