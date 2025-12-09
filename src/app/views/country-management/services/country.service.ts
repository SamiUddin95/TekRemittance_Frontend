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


getCountries(
    page: number = 1,
    rowsPerPage: number = 10,
    countryCode?: string,
    countryName?: string,
    status?: string
): Observable<{
    items: Country[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    statusCode: number;
    status: string;
}> {
    let url = `${environment.apiUrl}/BasicSetup/countries?pageNumber=${page}&pageSize=${rowsPerPage}`;
    if (countryCode) url += `&countryCode=${countryCode}`;
    if (countryName) url += `&countryName=${countryName}`;
    if (status) url += `&status=${status}`;

    return this.http.get<any>(url).pipe(
        map((res) => {
            const statusCode = res?.statusCode ?? res?.status ?? 200;
            const status = res?.status ?? 'success';
            const payload = res?.data ?? res;
            if (statusCode !== 200 || !payload) {
                throw new Error(`Failed to load countries (statusCode=${statusCode})`);
            }
            const itemsRaw = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];

            // ✅ Important: Use 'any' for DTO to avoid c: any error
            const items = itemsRaw.map((d: any) => this.mapDtoToCountry(d));

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
