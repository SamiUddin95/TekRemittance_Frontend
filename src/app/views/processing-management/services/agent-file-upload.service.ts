import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@/environments/environment';

export interface AgentUploadedFile {
  id: string;
  templateId: string;
  fileName: string;
  status: string;
  errorMessage?: string;
  rowCount: number;
  processAt?: string;
}

@Injectable({ providedIn: 'root' })
export class AgentFileUploadService {
  constructor(private http: HttpClient) {}

  getFiles(page: number = 1, rowsPerPage: number = 10): Observable<{ items: AgentUploadedFile[]; totalCount: number; pageNumber: number; pageSize: number; totalPages: number; statusCode: number; status: string; }> {
    const url = `${environment.apiUrl}/AgentFileUploads`;
    const params = new HttpParams().set('pageNumber', page).set('pageSize', rowsPerPage);
    return this.http.get<any>(url, { params }).pipe(
      map((res) => {
        const statusCode = res?.statusCode ?? res?.status ?? 200;
        const status = res?.status ?? 'success';
        const payload = res?.data ?? res;
        const itemsRaw = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];
        return {
          items: itemsRaw.map((d: any) => ({
            id: String(d.id ?? d.fileId ?? ''),
            templateId: String(d.templateId ?? d.fileTemplateId ?? ''),
            fileName: String(d.fileName ?? d.name ?? ''),
            status: String(d.status ?? d.fileStatus ?? ''),
            errorMessage: d.errorMessage ?? d.errors ?? '',
            rowCount: Number(d.rowCount ?? d.count ?? 0),
            processAt: d.processAt ?? d.processedAt ?? d.createdOn ?? null,
          } as AgentUploadedFile)),
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

  uploadFile(file: File): Observable<any> {
    const url = `${environment.apiUrl}/AgentFileUploads`;
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(url, formData);
  }

  deleteFile(id: string): Observable<void> {
    const url = `${environment.apiUrl}/AgentFileUploads/${id}`;
    return this.http.delete<void>(url);
  }
}
