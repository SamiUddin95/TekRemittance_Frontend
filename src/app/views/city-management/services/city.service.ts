import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { City } from '../models/city.model';
import { environment } from '@/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CityService {
    constructor(private http: HttpClient) {}

    private mapDtoToCity(dto: any): City {
        return {
            id: dto.id ?? dto.cityId ?? dto.Id,
            code: dto.cityCode ?? dto.code,
            name: dto.cityName ?? dto.name,
            isActive: dto.isActive ?? true,
            countryId: dto.countryId,
            countryName: dto.countryName,
            provinceId: dto.provinceId,
            provinceName: dto.provinceName,
            createdAt: dto.createdOn ? new Date(dto.createdOn) : undefined,
            updatedAt: dto.updatedOn ? new Date(dto.updatedOn) : undefined,
        } as City;
    }

getCities(
    page: number = 1,
    rowsPerPage: number = 10,
    cityCode?: string,
    cityName?: string,
    status?: string
): Observable<{
    items: City[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    statusCode: number;
    status: string;
}> {
    let url = `${environment.apiUrl}/BasicSetup/cities?pageNumber=${page}&pageSize=${rowsPerPage}`;
    if (cityCode) url += `&cityCode=${cityCode}`;
    if (cityName) url += `&cityName=${cityName}`;
    if (status) url += `&status=${status}`;

    return this.http.get<any>(url).pipe(
        map((res) => {
            const statusCode = res?.statusCode ?? 200;
            const status = res?.status ?? 'success';
            const payload = res?.data ?? res;
            const itemsRaw = Array.isArray(payload?.items) ? payload.items : [];
            return {
                items: itemsRaw.map((d: any) => this.mapDtoToCity(d)),
                totalCount: payload?.totalCount ?? itemsRaw.length,
                pageNumber: payload?.pageNumber ?? page,
                pageSize: payload?.pageSize ?? rowsPerPage,
                totalPages: payload?.totalPages ?? 1,
                statusCode,
                status,
            };
        }),
        catchError((err) => throwError(() => err instanceof Error ? err : new Error('Error loading cities')))
    );
}

    getCityById(id: string): Observable<City | undefined> {
        const url = `${environment.apiUrl}/BasicSetup/CitybyId/${id}`;
        return this.http.get<any>(url).pipe(
            map((res) => {
                const dto = res?.data ?? res;
                return dto ? this.mapDtoToCity(dto) : undefined;
            })
        );
    }

    addCity(city: Omit<City, 'id'>): Observable<City> {
        const url = `${environment.apiUrl}/BasicSetup/CreateCity`;
        const nowIso = new Date().toISOString();
        const payload = {
            id: crypto?.randomUUID ? crypto.randomUUID() : undefined,
            cityCode: city.code,
            cityName: city.name,
            isActive: city.isActive,
            createdBy: '',
            updatedBy: '',
            createdOn: nowIso,
            updatedOn: nowIso,
            countryId: city.countryId,
            provinceId: city.provinceId,
        };
        return this.http.post<any>(url, payload).pipe(
            map((res) => this.mapDtoToCity(res?.data ?? res))
        );
    }

    updateCity(id: string, city: Partial<City>): Observable<City> {
        const url = `${environment.apiUrl}/BasicSetup/updateCity`;
        const nowIso = new Date().toISOString();
        const payload = {
            id,
            cityCode: city.code,
            cityName: city.name,
            isActive: city.isActive,
            createdBy: '',
            updatedBy: '',
            createdOn: nowIso,
            updatedOn: nowIso,
            countryId: city.countryId,
            provinceId: city.provinceId,
        };
        return this.http.put<any>(url, payload).pipe(
            map((res) => this.mapDtoToCity(res?.data ?? res))
        );
    }

    deleteCity(id: string): Observable<boolean> {
        const url = `${environment.apiUrl}/BasicSetup/deleteCity/${id}`;
        return this.http.delete<any>(url).pipe(
            map((res) => {
                const status = res?.status ?? res?.statusCode;
                return status === 'success' || status === 200 || status === 204 || res === true;
            })
        );
    }
}
