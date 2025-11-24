import { Routes } from '@angular/router';
import { AuditLogComponent } from './auditlog/audit-log/audit-log';

export const GENERAL_FEATURE_ROUTES: Routes = [


    { path: 'audit-log', component: AuditLogComponent, data: { title: 'Audit Logs' } },


];
