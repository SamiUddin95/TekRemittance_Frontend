import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
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

    getCities(): Observable<City[]> {
        const url = `${environment.apiUrl}/BasicSetup/City`;
        return this.http.get<any>(url).pipe(
            map((res) => {
                const data = Array.isArray(res) ? res : res?.data;
                const arr = Array.isArray(data) ? data : [];
                return arr.map((d) => this.mapDtoToCity(d));
            })
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
