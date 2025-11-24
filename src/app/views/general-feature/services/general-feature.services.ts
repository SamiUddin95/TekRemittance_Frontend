import { AuditLogComponent } from '../auditlog/audit-log/audit-log';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '@/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class GeneralFeatureService {
    constructor(private http: HttpClient) {}

}
