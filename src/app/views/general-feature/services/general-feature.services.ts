import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '@/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GeneralFeatureService {
    private apiUrl = `${environment.apiUrl}/AuditLogs`;

    constructor(private http: HttpClient) {}

    getAuditLogs(page: number, pageSize: number, searchText: string = '') {
        const params: any = { pageNumber: page, pageSize: pageSize };
        if (searchText) params.search = searchText;
        return this.http.get(`${this.apiUrl}/Auditlogs`, { params }).pipe(
            map((res: any) => res.data),
            catchError((err) => throwError(() => err))
        );
    }
}
