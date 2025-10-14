import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Country, CountryListResponse } from '../models/country.model';

@Injectable({
    providedIn: 'root'
})
export class CountryService {
    private countries: Country[] = [
        { id: 1, code: 'DEUTDEFFXXX', name: 'Germany', isActive: true },
        { id: 2, code: 'HSBCLONCXXX', name: 'United Kingdom', isActive: true },
        { id: 3, code: 'SCBLSG22XXX', name: 'Singapore', isActive: true },
        { id: 4, code: 'BNPAFRPPXXX', name: 'France', isActive: true },
        { id: 5, code: 'CHASUS33XXX', name: 'United States', isActive: false },
    ];

    private countriesSubject = new BehaviorSubject<Country[]>(this.countries);
    public countries$ = this.countriesSubject.asObservable();

    getCountries(page: number = 1, limit: number = 10): Observable<CountryListResponse> {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedCountries = this.countries.slice(startIndex, endIndex);

        return of({
            countries: paginatedCountries,
            total: this.countries.length,
            page,
            limit
        });
    }

    getCountryById(id: number): Observable<Country | undefined> {
        const country = this.countries.find(c => c.id === id);
        return of(country);
    }

    addCountry(country: Omit<Country, 'id'>): Observable<Country> {
        const newCountry: Country = {
            ...country,
            id: Math.max(...this.countries.map(c => c.id || 0)) + 1,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        this.countries.push(newCountry);
        this.countriesSubject.next([...this.countries]);
        return of(newCountry);
    }

    updateCountry(id: number, country: Partial<Country>): Observable<Country | null> {
        const index = this.countries.findIndex(c => c.id === id);
        if (index !== -1) {
            this.countries[index] = {
                ...this.countries[index],
                ...country,
                updatedAt: new Date()
            };
            this.countriesSubject.next([...this.countries]);
            return of(this.countries[index]);
        }
        return of(null);
    }

    deleteCountry(id: number): Observable<boolean> {
        const index = this.countries.findIndex(c => c.id === id);
        if (index !== -1) {
            this.countries.splice(index, 1);
            this.countriesSubject.next([...this.countries]);
            return of(true);
        }
        return of(false);
    }
}
