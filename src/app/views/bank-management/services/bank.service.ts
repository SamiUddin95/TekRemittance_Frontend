import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Bank } from '../models/bank.model';
import { environment } from '@/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class BankService {
    constructor(private http: HttpClient) {}

    private mapDtoToBank(dto: any): Bank {
        return {
            id: dto.id ?? dto.bankId ?? dto.Id,
            code: dto.bankCode ?? dto.code,
            name: dto.bankName ?? dto.name,
            iata: dto.imd ?? dto.iata,
            website: dto.website,
            aliases: dto.allases ?? dto.aliases,
            phoneNo: dto.phoneNo?.toString?.() ?? dto.phoneNo,
            description: dto.description,
            isActive: dto.isActive ?? true,
            createdAt: dto.createdOn ? new Date(dto.createdOn) : undefined,
            updatedAt: dto.updatedOn ? new Date(dto.updatedOn) : undefined,
        } as Bank;
    }

    getBanks(): Observable<Bank[]> {
        const url = `${environment.apiUrl}/BasicSetup/Bank`;
        return this.http.get<any>(url).pipe(
            map((res) => {
                const data = Array.isArray(res) ? res : res?.data;
                const arr = Array.isArray(data) ? data : [];
                return arr.map((d) => this.mapDtoToBank(d));
            })
        );
    }

    getBankById(id: string): Observable<Bank | undefined> {
        const url = `${environment.apiUrl}/BasicSetup/BankbyId/${id}`;
        return this.http.get<any>(url).pipe(
            map((res) => {
                const dto = res?.data ?? res;
                return dto ? this.mapDtoToBank(dto) : undefined;
            })
        );
    }

    addBank(bank: Omit<Bank, 'id'>): Observable<Bank> {
        const url = `${environment.apiUrl}/BasicSetup/CreateBank`;
        const nowIso = new Date().toISOString();
        const payload = {
            id: crypto?.randomUUID ? crypto.randomUUID() : undefined,
            bankCode: bank.code,
            bankName: bank.name,
            imd: bank.iata,
            website: bank.website,
            allases: bank.aliases,
            phoneNo: bank.phoneNo ? Number(bank.phoneNo) : 0,
            description: bank.description,
            isActive: bank.isActive,
            createdBy: '',
            updatedBy: '',
            createdOn: nowIso,
            updatedOn: nowIso
        };
        return this.http.post<any>(url, payload).pipe(
            map((res) => this.mapDtoToBank(res?.data ?? res))
        );
    }

    updateBank(id: string, bank: Partial<Bank>): Observable<Bank> {
        const url = `${environment.apiUrl}/BasicSetup/updateBank`;
        const nowIso = new Date().toISOString();
        const payload = {
            id,
            bankCode: bank.code,
            bankName: bank.name,
            imd: bank.iata,
            website: bank.website,
            allases: bank.aliases,
            phoneNo: bank.phoneNo ? Number(bank.phoneNo) : 0,
            description: bank.description,
            isActive: bank.isActive,
            createdBy: '',
            updatedBy: '',
            createdOn: nowIso,
            updatedOn: nowIso
        };
        return this.http.put<any>(url, payload).pipe(
            map((res) => this.mapDtoToBank(res?.data ?? res))
        );
    }

    deleteBank(id: string): Observable<boolean> {
        const url = `${environment.apiUrl}/BasicSetup/deleteBank/${id}`;
        return this.http.delete<any>(url).pipe(
            map((res) => {
                const status = res?.status ?? res?.statusCode;
                return status === 'success' || status === 200 || status === 204 || res === true;
            })
        );
    }
}