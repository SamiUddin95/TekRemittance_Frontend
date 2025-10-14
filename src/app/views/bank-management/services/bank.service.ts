import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Bank, BankListResponse } from '../models/bank.model';

@Injectable({
    providedIn: 'root'
})
export class BankService {
    private banks: Bank[] = [
        { id: 1, code: 'DEUTDEFFXXX', name: 'Deutsche Bank', iata: 'DB', website: 'www.db.com', phoneNo: '+49-69-910-00', description: 'German multinational investment bank', isActive: true },
        { id: 2, code: 'HSBCLONCXXX', name: 'HSBC Holdings', iata: 'HSBC', website: 'www.hsbc.com', phoneNo: '+44-20-7991-8888', description: 'British multinational investment bank', isActive: true },
        { id: 3, code: 'SCBLSG22XXX', name: 'Standard Chartered', iata: 'SCB', website: 'www.sc.com', phoneNo: '+65-6747-7000', description: 'British multinational banking corporation', isActive: true },
        { id: 4, code: 'BNPAFRPPXXX', name: 'BNP Paribas', iata: 'BNP', website: 'www.bnpparibas.com', phoneNo: '+33-1-40-14-45-46', description: 'French international banking group', isActive: true },
        { id: 5, code: 'CHASUS33XXX', name: 'J.P. Morgan Chase', iata: 'JPM', website: 'www.jpmorganchase.com', phoneNo: '+1-212-270-6000', description: 'American multinational investment bank', isActive: false },
    ];

    private banksSubject = new BehaviorSubject<Bank[]>(this.banks);
    public banks$ = this.banksSubject.asObservable();

    getBanks(page: number = 1, limit: number = 10): Observable<BankListResponse> {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedBanks = this.banks.slice(startIndex, endIndex);

        return of({
            banks: paginatedBanks,
            total: this.banks.length,
            page,
            limit
        });
    }

    getBankById(id: number): Observable<Bank | undefined> {
        const bank = this.banks.find(b => b.id === id);
        return of(bank);
    }

    addBank(bank: Omit<Bank, 'id'>): Observable<Bank> {
        const newBank: Bank = {
            ...bank,
            id: Math.max(...this.banks.map(b => b.id || 0)) + 1,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        this.banks.push(newBank);
        this.banksSubject.next([...this.banks]);
        return of(newBank);
    }

    updateBank(id: number, bank: Partial<Bank>): Observable<Bank | null> {
        const index = this.banks.findIndex(b => b.id === id);
        if (index !== -1) {
            this.banks[index] = {
                ...this.banks[index],
                ...bank,
                updatedAt: new Date()
            };
            this.banksSubject.next([...this.banks]);
            return of(this.banks[index]);
        }
        return of(null);
    }

    deleteBank(id: number): Observable<boolean> {
        const index = this.banks.findIndex(b => b.id === id);
        if (index !== -1) {
            this.banks.splice(index, 1);
            this.banksSubject.next([...this.banks]);
            return of(true);
        }
        return of(false);
    }
}