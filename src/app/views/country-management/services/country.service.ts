import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of } from 'rxjs';
import { Country } from '../models/country.model';
import { environment } from '@/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CountryService {
    constructor(private http: HttpClient) {}

    private mapDtoToCountry(dto: any): Country {
        return {
            id: dto.id ?? dto.Id ?? dto.countryId,
            code: dto.countryCode ?? dto.code,
            name: dto.countryName ?? dto.name,
            isActive: dto.isActive ?? true,
            createdAt: dto.createdOn ? new Date(dto.createdOn) : undefined,
            updatedAt: dto.updatedOn ? new Date(dto.updatedOn) : undefined,
        } as Country;
    }

    getCountries(): Observable<Country[]> {
        const url = `${environment.apiUrl}/BasicSetup/countries`;
        return this.http.get<any>(url).pipe(
            map((res) => {
                const data = Array.isArray(res) ? res : res?.data;
                const arr = Array.isArray(data) ? data : [];
                return arr.map((d) => this.mapDtoToCountry(d));
            })
        );
    }

    getCountryById(id: string): Observable<Country | undefined> {
        const url = `${environment.apiUrl}/BasicSetup/countrybyId/${id}`;
        return this.http.get<any>(url).pipe(
            map((res) => {
                const dto = res?.data ?? res;
                return dto ? this.mapDtoToCountry(dto) : undefined;
            })
        );
    }

    addCountry(country: Omit<Country, 'id'>): Observable<Country> {
        const url = `${environment.apiUrl}/BasicSetup/create`;
        const nowIso = new Date().toISOString();
        const payload = {
            id: crypto?.randomUUID ? crypto.randomUUID() : undefined,
            countryCode: country.code,
            countryName: country.name,
            isActive: country.isActive,
            createdBy: '',
            updatedBy: '',
            createdOn: nowIso,
            updatedOn: nowIso
        };
        return this.http.post<any>(url, payload).pipe(
            map((res) => this.mapDtoToCountry(res?.data ?? res))
        );
    }

    updateCountry(id: string, country: Partial<Country>): Observable<Country> {
        const url = `${environment.apiUrl}/BasicSetup/update`;
        const nowIso = new Date().toISOString();
        const payload = {
            id,
            countryCode: country.code,
            countryName: country.name,
            isActive: country.isActive,
            createdBy: '',
            updatedBy: '',
            createdOn: nowIso,
            updatedOn: nowIso
        };
        return this.http.put<any>(url, payload).pipe(
            map((res) => this.mapDtoToCountry(res?.data ?? res))
        );
    }

    deleteCountry(id: string): Observable<boolean> {
        const url = `${environment.apiUrl}/BasicSetup/delete/${id}`;
        return this.http.delete<any>(url).pipe(
            map((res) => {
                const status = res?.status ?? res?.statusCode;
                return status === 'success' || status === 200 || status === 204 || res === true;
            })
        );
    }
}
