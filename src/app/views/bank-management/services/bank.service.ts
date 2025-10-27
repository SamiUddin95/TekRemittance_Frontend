import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
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

    getBanks(page: number = 1, rowsPerPage: number = 100000): Observable<{
        items: Bank[];
        totalCount: number;
        pageNumber: number;
        pageSize: number;
        totalPages: number;
        statusCode: number;
        status: string;
    }> {
        const url = `${environment.apiUrl}/BasicSetup/banks?pageNumber=${page}&pageSize=${rowsPerPage}`;
        return this.http.get<any>(url).pipe(
            map((res) => {
                const statusCode = res?.statusCode ?? res?.status ?? 200;
                const status = res?.status ?? 'success';
                const payload = res?.data ?? res;
                if (statusCode !== 200 || !payload) {
                    throw new Error(`Failed to load banks (statusCode=${statusCode})`);
                }
                const itemsRaw = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];
                return {
                    items: itemsRaw.map((d: any) => this.mapDtoToBank(d)),
                    totalCount: payload?.totalCount ?? itemsRaw.length,
                    pageNumber: payload?.pageNumber ?? page,
                    pageSize: payload?.pageSize ?? rowsPerPage,
                    totalPages: payload?.totalPages ?? 1,
                    statusCode,
                    status,
                };
            }),
            catchError((err) => throwError(() => err instanceof Error ? err : new Error('Error loading banks')))
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