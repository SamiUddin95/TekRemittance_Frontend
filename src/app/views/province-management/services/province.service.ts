import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Province, ProvinceListResponse } from '../models/province.model';

@Injectable({
    providedIn: 'root'
})
export class ProvinceService {
    private provinces: Province[] = [
        { id: 1, code: 'DEUTDEFFXXX', name: 'Germany', countryId: 1, countryName: 'Germany', isActive: true },
        { id: 2, code: 'HSBCLONCXXX', name: 'United Kingdom', countryId: 2, countryName: 'United Kingdom', isActive: true },
        { id: 3, code: 'SCBLSG22XXX', name: 'Singapore', countryId: 3, countryName: 'Singapore', isActive: true },
        { id: 4, code: 'BNPAFRPPXXX', name: 'France', countryId: 4, countryName: 'France', isActive: true },
        { id: 5, code: 'CHASUS33XXX', name: 'United States', countryId: 5, countryName: 'United States', isActive: false },
    ];

    private provincesSubject = new BehaviorSubject<Province[]>(this.provinces);
    public provinces$ = this.provincesSubject.asObservable();

    getProvinces(page: number = 1, limit: number = 10): Observable<ProvinceListResponse> {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedProvinces = this.provinces.slice(startIndex, endIndex);

        return of({
            provinces: paginatedProvinces,
            total: this.provinces.length,
            page,
            limit
        });
    }

    getProvinceById(id: number): Observable<Province | undefined> {
        const province = this.provinces.find(p => p.id === id);
        return of(province);
    }

    addProvince(province: Omit<Province, 'id'>): Observable<Province> {
        const newProvince: Province = {
            ...province,
            id: Math.max(...this.provinces.map(p => p.id || 0)) + 1,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        this.provinces.push(newProvince);
        this.provincesSubject.next([...this.provinces]);
        return of(newProvince);
    }

    updateProvince(id: number, province: Partial<Province>): Observable<Province | null> {
        const index = this.provinces.findIndex(p => p.id === id);
        if (index !== -1) {
            this.provinces[index] = {
                ...this.provinces[index],
                ...province,
                updatedAt: new Date()
            };
            this.provincesSubject.next([...this.provinces]);
            return of(this.provinces[index]);
        }
        return of(null);
    }

    deleteProvince(id: number): Observable<boolean> {
        const index = this.provinces.findIndex(p => p.id === id);
        if (index !== -1) {
            this.provinces.splice(index, 1);
            this.provincesSubject.next([...this.provinces]);
            return of(true);
        }
        return of(false);
    }
}
