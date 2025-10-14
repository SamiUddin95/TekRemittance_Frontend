import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { City, CityListResponse } from '../models/city.model';

@Injectable({
    providedIn: 'root'
})
export class CityService {
    private cities: City[] = [
        { id: 1, code: 'DEUTDEFFXXX', name: 'Germany', countryId: 1, countryName: 'Germany', provinceId: 1, provinceName: 'Bavaria', isActive: true },
        { id: 2, code: 'HSBCLONCXXX', name: 'United Kingdom', countryId: 2, countryName: 'United Kingdom', provinceId: 2, provinceName: 'England', isActive: true },
        { id: 3, code: 'SCBLSG22XXX', name: 'Singapore', countryId: 3, countryName: 'Singapore', provinceId: 3, provinceName: 'Central', isActive: true },
        { id: 4, code: 'BNPAFRPPXXX', name: 'France', countryId: 4, countryName: 'France', provinceId: 4, provinceName: 'Ile-de-France', isActive: true },
        { id: 5, code: 'CHASUS33XXX', name: 'United States', countryId: 5, countryName: 'United States', provinceId: 5, provinceName: 'California', isActive: false },
    ];

    private citiesSubject = new BehaviorSubject<City[]>(this.cities);
    public cities$ = this.citiesSubject.asObservable();

    getCities(page: number = 1, limit: number = 10): Observable<CityListResponse> {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedCities = this.cities.slice(startIndex, endIndex);

        return of({
            cities: paginatedCities,
            total: this.cities.length,
            page,
            limit
        });
    }

    getCityById(id: number): Observable<City | undefined> {
        const city = this.cities.find(c => c.id === id);
        return of(city);
    }

    addCity(city: Omit<City, 'id'>): Observable<City> {
        const newCity: City = {
            ...city,
            id: Math.max(...this.cities.map(c => c.id || 0)) + 1,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        this.cities.push(newCity);
        this.citiesSubject.next([...this.cities]);
        return of(newCity);
    }

    updateCity(id: number, city: Partial<City>): Observable<City | null> {
        const index = this.cities.findIndex(c => c.id === id);
        if (index !== -1) {
            this.cities[index] = {
                ...this.cities[index],
                ...city,
                updatedAt: new Date()
            };
            this.citiesSubject.next([...this.cities]);
            return of(this.cities[index]);
        }
        return of(null);
    }

    deleteCity(id: number): Observable<boolean> {
        const index = this.cities.findIndex(c => c.id === id);
        if (index !== -1) {
            this.cities.splice(index, 1);
            this.citiesSubject.next([...this.cities]);
            return of(true);
        }
        return of(false);
    }
}
