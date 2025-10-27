import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
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
            createdBy: dto.createdBy,
            updatedBy: dto.updatedBy,
        } as Country;
    }

    getCountries(page: number = 1, rowsPerPage: number = 100000): Observable<{
        items: Country[];
        totalCount: number;
        pageNumber: number;
        pageSize: number;
        totalPages: number;
        statusCode: number;
        status: string;
    }> {
        const url = `${environment.apiUrl}/BasicSetup/countries?pageNumber=${page}&pageSize=${rowsPerPage}`;
        return this.http.get<any>(url).pipe(
            map((res) => {
                const statusCode = res?.statusCode ?? res?.status ?? 200;
                const status = res?.status ?? 'success';
                const payload = res?.data ?? res;
                if (statusCode !== 200 || !payload) {
                    throw new Error(`Failed to load countries (statusCode=${statusCode})`);
                }
                const itemsRaw = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];
                return {
                    items: itemsRaw.map((d: any) => this.mapDtoToCountry(d)),
                    totalCount: payload?.totalCount ?? itemsRaw.length,
                    pageNumber: payload?.pageNumber ?? page,
                    pageSize: payload?.pageSize ?? rowsPerPage,
                    totalPages: payload?.totalPages ?? 1,
                    statusCode,
                    status,
                };
            }),
            catchError((err) => {
                return throwError(() => err instanceof Error ? err : new Error('Error loading countries'));
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
