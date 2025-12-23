import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@/environments/environment';

export interface TemplateListItem {
  id: string;
  name: string;
  agentId?: string;
  agentName?: string;
  format: string;
  sheetName: string;
  fixLength: boolean;
  fieldDelimiter: string;
  isActive?: boolean;
}

export interface TemplateFieldItem {
  id: string;
  templateId: string;
  fieldOrder: number;
  fieldName: string;
  fieldType: string;
  required: boolean;
  enabled: boolean;
  startIndex: number;
  templateName: string;
  length: number;
}

@Injectable({ providedIn: 'root' })
export class TemplateService {
  constructor(private http: HttpClient) {}

  private normalizeFormat(f: string | undefined): string {
    if (!f) return '-';
    const v = f.toLowerCase();
    if (v.includes('csv')) return '.csv';
    if (v.includes('xlsx')) return '.xlsx';
    if (v.includes('xls')) return '.xls';
    if (v.includes('txt')) return '.txt';
    return f;
  }

  deleteTemplateByAgent(agentId: string): Observable<void> {
    const url = `${environment.apiUrl}/AgentFileTemplates/${agentId}`;
    return this.http.delete<void>(url);
  }

  getTemplates(page: number = 1, rowsPerPage: number = 10,filters: any = {}): Observable<{
    items: TemplateListItem[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    statusCode: number;
    status: string;
  }> {
    let url = `${environment.apiUrl}/AgentFileTemplates?pageNumber=${page}&pageSize=${rowsPerPage}`;
    if (filters.name)
  url += `&name=${filters.name}`;

if (filters.agentName)
  url += `&agentName=${filters.agentName}`;

if (filters.sheetName)
  url += `&sheetName=${filters.sheetName}`;

    return this.http.get<any>(url).pipe(
      map((res) => {
        const statusCode = res?.statusCode ?? res?.status ?? 200;
        const status = res?.status ?? 'success';
        const payload = res?.data ?? res;
        const itemsRaw = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];
        return {
          items: itemsRaw.map((d: any) => ({
            id: d.id,
            name: d.name,
            agentId: d.agentId,
            agentName: d.agentName ?? '-',
            format: this.normalizeFormat(d.format),
            sheetName: d.sheetName ?? 'N/A',
            fixLength: !!(d.isFixedLength),
            fieldDelimiter: d.delimiter ?? (d.delimiterEnabled ? ',' : ''),
            isActive: d.isActive,
          } as TemplateListItem)),
          totalCount: payload?.totalCount ?? itemsRaw.length,
          pageNumber: payload?.pageNumber ?? page,
          pageSize: payload?.pageSize ?? rowsPerPage,
          totalPages: payload?.totalPages ?? 1,
          statusCode,
          status,
        };
      })
    );
  }

  updateTemplate(template: {
    id: string;
    agentId: string;
    name: string;
    sheetName: string;
    format: 'Txt' | 'Csv' | 'Xls' | 'Xlsx' | string;
    isFixedLength: boolean;
    delimiterEnabled: boolean;
    delimiter: string;
    isActive: boolean;
  }): Observable<TemplateListItem> {
    const url = `${environment.apiUrl}/AgentFileTemplates`;
    const nowIso = new Date().toISOString();
    const payload = {
      ...template,
      createdBy: 'admin',
      createdOn: nowIso,
      updatedBy: 'system',
      updatedOn: nowIso,
    };
    return this.http.put<any>(url, payload).pipe(
      map((res) => {
        const dto = res?.data ?? res;
        return {
          id: dto.id,
          name: dto.name,
          agentId: dto.agentId,
          agentName: dto.agentName ?? '-',
          format: this.normalizeFormat(dto.format),
          sheetName: dto.sheetName ?? 'N/A',
          fixLength: !!dto.isFixedLength,
          fieldDelimiter: dto.delimiter ?? (dto.delimiterEnabled ? ',' : ''),
          isActive: dto.isActive,
        } as TemplateListItem;
      })
    );
  }

  getTemplateByAgent(agentId: string): Observable<TemplateListItem> {
    const url = `${environment.apiUrl}/AgentFileTemplates/${agentId}`;
    return this.http.get<any>(url).pipe(
      map((res) => {
        const dto = res?.data ?? res;
        return {
          id: dto.id,
          name: dto.name,
          agentId: dto.agentId,
          agentName: dto.agentName ?? '-',
          format: this.normalizeFormat(dto.format),
          sheetName: dto.sheetName ?? 'N/A',
          fixLength: !!dto.isFixedLength,
          fieldDelimiter: dto.delimiter ?? (dto.delimiterEnabled ? ',' : ''),
          isActive: dto.isActive,
        } as TemplateListItem;
      })
    );
  }

  addTemplate(template: {
    agentId: string;
    name: string;
    sheetName: string;
    format: 'Txt' | 'Csv' | 'Xls' | 'Xlsx' | string;
    isFixedLength: boolean;
    delimiterEnabled: boolean;
    delimiter: string;
    isActive: boolean;
  }): Observable<TemplateListItem> {
    const url = `${environment.apiUrl}/AgentFileTemplates`;
    const nowIso = new Date().toISOString();
    const payload = {
      ...template,
      createdBy: 'admin',
      createdOn: nowIso,
      updatedBy: 'system',
      updatedOn: nowIso,
    };
    return this.http.post<any>(url, payload).pipe(
      map((res) => {
        const dto = res?.data ?? res;
        return {
          id: dto.id,
          name: dto.name,
          agentId: dto.agentId,
          agentName: dto.agentName ?? '-',
          format: this.normalizeFormat(dto.format),
          sheetName: dto.sheetName ?? 'N/A',
          fixLength: !!dto.isFixedLength,
          fieldDelimiter: dto.delimiter ?? (dto.delimiterEnabled ? ',' : ''),
          isActive: dto.isActive,
        } as TemplateListItem;
      })
    );
  }

  getTemplateFields(templateId: string): Observable<TemplateFieldItem[]> {
    const url = `${environment.apiUrl}/AgentFileTemplateFields?templateId=${templateId}`;
    return this.http.get<any>(url).pipe(
      map((res) => {
        const payload = res?.data ?? res;
        const itemsRaw = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];
        return itemsRaw.map((d: any) => ({
          id: d.id,
          templateId: d.templateId,
          templateName: d.templateName,
          fieldOrder: Number(d.fieldOrder ?? d.order ?? 0),
          fieldName: d.fieldName,
          fieldType: d.fieldType,
          required: !!d.required,
          enabled: !!(d.enabled ?? d.enable),
          startIndex: Number(d.startIndex ?? 0),
          length: Number(d.length ?? 0),
        } as TemplateFieldItem));
      })
    );
  }

  addTemplateField(payload: {
    id?: string;
    templateId: string;
    fieldOrder: number;
    fieldName: string;
    fieldType: string;
    required: boolean;
    enabled: boolean;
    startIndex?: number;
    length?: number;
  }): Observable<TemplateFieldItem> {
    const url = `${environment.apiUrl}/AgentFileTemplateFields`;
    const body = {
      id: payload.id,
      templateId: payload.templateId,
      fieldOrder: payload.fieldOrder,
      fieldName: payload.fieldName,
      fieldType: payload.fieldType,
      required: payload.required,
      enabled: payload.enabled,
      startIndex: payload.startIndex ?? 0,
      length: payload.length ?? 0,
    };
    return this.http.post<any>(url, body).pipe(
      map((res) => {
        const d = res?.data ?? res;
        return {
          id: d.id,
          templateId: d.templateId,
          fieldOrder: Number(d.fieldOrder ?? 0),
          fieldName: d.fieldName,
          fieldType: d.fieldType,
          required: !!d.required,
          enabled: !!d.enabled,
          startIndex: Number(d.startIndex ?? 0),
          length: Number(d.length ?? 0),
        } as TemplateFieldItem;
      })
    );
  }

  updateTemplateField(payload: {
    id: string;
    templateId: string;
    fieldOrder: number;
    fieldName: string;
    fieldType: string;
    required: boolean;
    enabled: boolean;
    startIndex?: number;
    length?: number;
  }): Observable<TemplateFieldItem> {
    const url = `${environment.apiUrl}/AgentFileTemplateFields`;
    const body = {
      id: payload.id,
      templateId: payload.templateId,
      fieldOrder: payload.fieldOrder,
      fieldName: payload.fieldName,
      fieldType: payload.fieldType,
      required: payload.required,
      enabled: payload.enabled,
      startIndex: payload.startIndex ?? 0,
      length: payload.length ?? 0,
    };
    return this.http.put<any>(url, body).pipe(
      map((res) => {
        const d = res?.data ?? res;
        return {
          id: d.id,
          templateId: d.templateId,
          fieldOrder: Number(d.fieldOrder ?? 0),
          fieldName: d.fieldName,
          fieldType: d.fieldType,
          required: !!d.required,
          enabled: !!d.enabled,
          startIndex: Number(d.startIndex ?? 0),
          length: Number(d.length ?? 0),
        } as TemplateFieldItem;
      })
    );
  }

  deleteTemplateField(id: string): Observable<void> {
    const url = `${environment.apiUrl}/AgentFileTemplateFields/${id}`;
    return this.http.delete<void>(url);
  }
}
