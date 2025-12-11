import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@/environments/environment';

export interface AgentAccountItemDto {
  id: string;
  agentAccountName: string;
  accountNumber: number;
  agentName: string;
  approve: boolean;
  accountTitle: string;
  accountType: string;
  isActive: boolean;
}

export interface AgentAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  agentName: string;
  approve: boolean;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class AgentAccountsService {
  constructor(private http: HttpClient) {}

  getAccounts(pageNumber: number, pageSize: number): Observable<{ items: AgentAccount[]; totalCount: number; pageNumber: number; pageSize: number; totalPages: number; statusCode: number; status: string; }>
  {
    const url = `${environment.apiUrl}/AcquisitionAgentAccount?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    return this.http.get<any>(url).pipe(
      map((res) => {
        const d = res?.data ?? res ?? {};
        const items: AgentAccount[] = (d.items ?? []).map((x: AgentAccountItemDto) => ({
          id: x.id,
          accountName: (x as any).accountTitle ?? x.agentAccountName ?? '',
          accountNumber: String(x.accountNumber ?? ''),
          agentName: x.agentName,
          approve: !!x.approve,
          isActive: !!x.isActive,
        }));
        return {
          items,
          totalCount: Number(d.totalCount ?? 0),
          pageNumber: Number(d.pageNumber ?? pageNumber),
          pageSize: Number(d.pageSize ?? pageSize),
          totalPages: Number(d.totalPages ?? 1),
          statusCode: Number(res?.statusCode ?? 200),
          status: String(res?.status ?? 'success')
        };
      })
    );
  }

  createAccount(payload: { agentId: string; accountNumber: string; accountTitle: string; accountType: string; isActive: boolean; approve?: boolean; agentName?: string }): Observable<AgentAccount> {
    const url = `${environment.apiUrl}/AcquisitionAgentAccount`;
    const nowIso = new Date().toISOString();
    const body = {
      agentId: payload.agentId,
      accountNumber: payload.accountNumber,
      accountTitle: payload.accountTitle,
      accountType: payload.accountType,
      isActive: payload.isActive,
      approve: payload.approve ?? false,
      agentName: payload.agentName ?? '',
      createdBy: 'admin',
      updatedBy: 'system',
      createdOn: nowIso,
      updatedOn: nowIso,
    };
    return this.http.post<any>(url, body).pipe(
      map((res) => {
        const d: AgentAccountItemDto = (res?.data ?? res) as any;
        return {
          id: d.id,
          accountName: d.agentAccountName ?? d.accountTitle ?? '',
          accountNumber: String(d.accountNumber ?? ''),
          agentName: d.agentName ?? '',
          approve: !!d.approve,
          isActive: !!d.isActive,
        } as AgentAccount;
      })
    );
  }

  getAccountById(id: string): Observable<AgentAccount> {
    const url = `${environment.apiUrl}/AcquisitionAgentAccount/${id}`;
    return this.http.get<any>(url).pipe(
      map((res) => {
        const d: AgentAccountItemDto = (res?.data ?? res) as any;
        return {
          id: d.id,
          accountName: d.agentAccountName ?? d.accountTitle ?? '',
          accountNumber: String(d.accountNumber ?? ''),
          agentName: d.agentName ?? '',
          approve: !!d.approve,
          isActive: !!d.isActive,
          // expose agentId for edit form selection
          agentId: String((d as any).agentId ?? ''),
        } as AgentAccount;
      })
    );
  }

  updateAccountById(payload: { id: string; agentId: string;   agentAccountName: string; accountNumber: any; agentName: string; approve: boolean; accountTitle: string; accountType: string; isActive: boolean; }): Observable<AgentAccount> {
    const url = `${environment.apiUrl}/AcquisitionAgentAccount/updatebyid`;
    const nowIso = new Date().toISOString();
    const body = {
      ...payload,
      createdBy: 'admin',
      updatedBy: 'system',
      createdOn: nowIso,
      updatedOn: nowIso,
    };
    return this.http.put<any>(url, body).pipe(
      map((res) => {
        const d: AgentAccountItemDto = (res?.data ?? res) as any;
        return {
          id: d.id,
          accountName: d.agentAccountName ?? d.accountTitle ?? '',
          accountNumber: String(d.accountNumber ?? ''),
          agentName: d.agentName ?? '',
          approve: !!d.approve,
          isActive: !!d.isActive,
        } as AgentAccount;
      })
    );
  }

  deleteAccountById(id: string): Observable<boolean> {
    const url = `${environment.apiUrl}/AcquisitionAgentAccount/deletebyid/${id}`;
    return this.http.delete<any>(url).pipe(
      map((res) => {
        const status = res?.status ?? res?.statusCode;
        return status === 'success' || status === 200 || status === 204;
      })
    );
  }
}
