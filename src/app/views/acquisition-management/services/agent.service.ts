import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@/environments/environment';
import { Agent } from '../models/agent.model';

@Injectable({ providedIn: 'root' })
export class AgentService {
    constructor(private http: HttpClient) {}

    private mapDtoToAgent(dto: any): Agent {
        // Normalize enum-like strings to booleans
        const rin: string | undefined = dto.rin ?? dto.Xpin ?? dto.Xpin;
        const processStr: string | undefined = dto.process ?? dto.Process;
        const acquisitionModes: string | undefined = dto.acquisitionModes ?? dto.AcquisitionModes;
        const disbursementModes: string | undefined = dto.disbursementModes ?? dto.DisbursementModes;

        const brnByApplication = rin === 'ByApplication' || dto.brnByApplication === true;
        const brnByAgent = rin === 'ByAgent' || dto.brnByAgent === true;
        const autoProcess = processStr === 'AutoProcess' || dto.autoProcess === true;
        const manualProcess = processStr === 'ManualProcess' || dto.manualProcess === true;

        const isOnlineAllow = acquisitionModes === 'IsOnLineAllow' || dto.isOnlineAllow === true;
        const isFileUploadAllow = acquisitionModes === 'IsFileUploadAllow' || dto.isFileUploadAllow === true;
        const isFtpAllow = acquisitionModes === 'IsFTPAllow' || dto.isFtpAllow === true;
        const isEmailUploadAllow = acquisitionModes === 'IsEmailUploadAllow' || dto.isEmailUploadAllow === true;
        const isWebServiceAllow = acquisitionModes === 'IsWebServiceAllow' || dto.isWebServiceAllow === true;
        const isBeneficiarySmsAllow = acquisitionModes === 'IsBeneficiarySmsAllow' || dto.isBeneficiarySmsAllow === true;

        const isDirectCreditAllow = disbursementModes === 'IsDirectCreditAllow' || dto.isDirectCreditAllow === true;
        const IsCOTCAllow = disbursementModes === 'IsCOTCAllow' || disbursementModes === 'IsOTCAllow' || dto.IsCOTCAllow === true || dto.isOtcAllow === true;
        const isOtherCreditAllow = disbursementModes === 'IsOtherCreditAllow' || dto.isOtherCreditAllow === true;
        const isRemitterSmsAllow = disbursementModes === 'IsRemitterSmsAllow' || dto.isRemitterSmsAllow === true;

        return {
            id: dto.id ?? dto.agentId ?? dto.Id,
            code: dto.agentCode ?? dto.code,
            name: dto.agentName ?? dto.name,
            phone1: dto.phone1 ?? dto.phoneNo1,
            phone2: dto.phone2 ?? dto.phoneNo2,
            fax: dto.fax,
            email: dto.email,
            logoUrl: dto.logoUrl,
            address: dto.address,
            countryId: dto.countryId,
            provinceId: dto.provinceId,
            cityId: dto.cityId,
            cutOffStart: dto.cutOffStart ?? dto.cutOffTimeStart,
            cutOffEnd: dto.cutOffEnd ?? dto.cutOffTimeEnd,
            brnByApplication,
            brnByAgent,
            autoProcess,
            manualProcess,
            isOnlineAllow,
            isFileUploadAllow,
            isFtpAllow,
            isEmailUploadAllow,
            isWebServiceAllow,
            isBeneficiarySmsAllow,
            isActive: dto.isActive ?? true,
            IsCOTCAllow,
            isDirectCreditAllow,
            isOtherCreditAllow,
            isRemitterSmsAllow,
            directIntegration: dto.directIntegration,
            inquiryUrl: dto.inquiryUrl ?? dto.inquiryURL,
            paymentUrl: dto.paymentUrl ?? dto.paymentURL,
            unlockUrl: dto.unlockUrl ?? dto.unlockURL,
            approvalStatus: dto.approvalStatus,
        } as Agent;
    }

    getAgents(
    page: number = 1,
    rowsPerPage: number = 10,
    code?: string,
    agentname?: string,
    status?: string
): Observable<{
    items: Agent[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    statusCode: number;
    status: string;
}> {
    let url = `${environment.apiUrl}/AcquisitionAgents?pageNumber=${page}&pageSize=${rowsPerPage}`;

    if (code) url += `&code=${code}`;
    if (agentname) url += `&agentname=${agentname}`;
    if (status) url += `&status=${status}`;

    return this.http.get<any>(url).pipe(
        map((res) => {
            const statusCode = res?.statusCode ?? res?.status ?? 200;
            const statusRes = res?.status ?? 'success';
            const payload = res?.data ?? res;
            const itemsRaw = Array.isArray(payload?.items) ? payload.items : [];
            return {
                items: itemsRaw.map((d: any) => this.mapDtoToAgent(d)),
                totalCount: payload?.totalCount ?? itemsRaw.length,
                pageNumber: payload?.pageNumber ?? page,
                pageSize: payload?.pageSize ?? rowsPerPage,
                totalPages: payload?.totalPages ?? 1,
                statusCode,
                status: statusRes,
            };
        })
    );
}

    getAgentById(id: string): Observable<Agent | undefined> {
        const url = `${environment.apiUrl}/AcquisitionAgents/${id}`;
        return this.http.get<any>(url).pipe(
            map((res) => {
                const dto = res?.data ?? res;
                return dto ? this.mapDtoToAgent(dto) : undefined;
            })
        );
    }

    addAgent(agent: Omit<Agent, 'id'>): Observable<Agent> {
        const url = `${environment.apiUrl}/AcquisitionAgents`;
        const payload = this.mapFormToCreateDto(agent);
        return this.http.post<any>(url, payload).pipe(map((res) => this.mapDtoToAgent(res?.data ?? res)));
    }

    updateAgent(id: string, agent: Partial<Agent>): Observable<Agent> {
        const url = `${environment.apiUrl}/AcquisitionAgents`;
        const payload = this.mapFormToUpdateDto(id, agent);
        return this.http.put<any>(url, payload).pipe(map((res) => this.mapDtoToAgent(res?.data ?? res)));
    }

    deleteAgent(id: string): Observable<boolean> {
        const url = `${environment.apiUrl}/AcquisitionAgents/${id}`;
        return this.http.delete<any>(url).pipe(map((res) => {
            const status = res?.status ?? res?.statusCode;
            return status === 'success' || status === 200 || status === 204 || res === true;
        }));
    }

    private mapFormToCreateDto(agent: Omit<Agent, 'id'>): any {
        const toHMS = (t?: string) => (t && t.length === 5 ? `${t}:00` : t) ?? '';

        // Derive enum-like strings from exclusive checkboxes
        const rin = agent.brnByAgent ? 'ByAgent' : agent.brnByApplication ? 'ByApplication' : undefined;
        const process = agent.manualProcess ? 'ManualProcess' : agent.autoProcess ? 'AutoProcess' : undefined;

        const acquisitionModes = agent.isFtpAllow ? 'IsFTPAllow'
            : agent.isOnlineAllow ? 'IsOnLineAllow'
            : agent.isFileUploadAllow ? 'IsFileUploadAllow'
            : agent.isEmailUploadAllow ? 'IsEmailUploadAllow'
            : agent.isWebServiceAllow ? 'IsWebServiceAllow'
            : agent.isBeneficiarySmsAllow ? 'IsBeneficiarySmsAllow'
            : undefined;

        const disbursementModes = agent.isDirectCreditAllow ? 'IsDirectCreditAllow'
            : ((agent as any).IsCOTCAllow || (agent as any).isOtcAllow) ? 'IsCOTCAllow'
            : agent.isOtherCreditAllow ? 'IsOtherCreditAllow'
            : agent.isRemitterSmsAllow ? 'IsRemitterSmsAllow'
            : undefined;

        const nowIso = new Date().toISOString();

        return {
            code: agent.code,
            agentName: agent.name,
            phone1: agent.phone1,
            phone2: agent.phone2,
            fax: agent.fax,
            email: agent.email,
            logoUrl: agent.logoUrl ?? '',
            address: agent.address,
            countryId: agent.countryId,
            provinceId: agent.provinceId,
            cityId: agent.cityId,
            cutOffTimeStart: toHMS(agent.cutOffStart),
            cutOffTimeEnd: toHMS(agent.cutOffEnd),
            rin,
            process,
            acquisitionModes,
            disbursementModes,
            directIntegration: agent.directIntegration ?? false,
            isActive: agent.isActive ?? true,
            inquiryURL: agent.inquiryUrl,
            paymentURL: agent.paymentUrl,
            unlockURL: agent.unlockUrl,
            createdBy: 'admin',
            createdOn: nowIso,
            updatedBy: 'system',
            updatedOn: nowIso,
        };
    }

    private mapFormToUpdateDto(id: string, agent: Partial<Agent>): any {
        const toHMS = (t?: string) => (t && t.length === 5 ? `${t}:00` : t) ?? '';

        const rin = agent?.brnByAgent ? 'ByAgent' : agent?.brnByApplication ? 'ByApplication' : undefined;
        const process = agent?.manualProcess ? 'ManualProcess' : agent?.autoProcess ? 'AutoProcess' : undefined;

        const acquisitionModes = agent?.isFtpAllow ? 'IsFTPAllow'
            : agent?.isOnlineAllow ? 'IsOnLineAllow'
            : agent?.isFileUploadAllow ? 'IsFileUploadAllow'
            : agent?.isEmailUploadAllow ? 'IsEmailUploadAllow'
            : agent?.isWebServiceAllow ? 'IsWebServiceAllow'
            : agent?.isBeneficiarySmsAllow ? 'IsBeneficiarySmsAllow'
            : undefined;

        const disbursementModes = agent?.isDirectCreditAllow ? 'IsDirectCreditAllow'
            : ((agent as any)?.IsCOTCAllow || (agent as any)?.isOtcAllow) ? 'IsCOTCAllow'
            : agent?.isOtherCreditAllow ? 'IsOtherCreditAllow'
            : agent?.isRemitterSmsAllow ? 'IsRemitterSmsAllow'
            : undefined;

        return {
            id,
            code: agent.code,
            agentName: agent.name,
            phone1: agent.phone1,
            phone2: agent.phone2,
            fax: agent.fax,
            email: agent.email,
            logoUrl: agent.logoUrl,
            address: agent.address,
            countryId: agent.countryId,
            provinceId: agent.provinceId,
            cityId: agent.cityId,
            cutOffTimeStart: toHMS(agent.cutOffStart),
            cutOffTimeEnd: toHMS(agent.cutOffEnd),
            rin,
            process,
            acquisitionModes,
            disbursementModes,
            directIntegration: agent.directIntegration,
            isActive: agent.isActive,
            inquiryURL: agent.inquiryUrl,
            paymentURL: agent.paymentUrl,
            unlockURL: agent.unlockUrl,
        };
    }
}
