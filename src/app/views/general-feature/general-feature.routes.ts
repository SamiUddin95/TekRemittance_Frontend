import { Routes } from '@angular/router';
import { AuditLogComponent } from './auditlog/audit-log/audit-log';
import { ExchangeRateCalculatorComponent } from './exchange-rate-calculator/exchange-rate-calculator.component';

export const GENERAL_FEATURE_ROUTES: Routes = [

    { path: 'audit-log', component: AuditLogComponent, data: { title: 'Audit Logs' } },
    { path: 'exchange-rate-calculator', component: ExchangeRateCalculatorComponent, data: { title: 'Exchange Rate & Rebate Calculator' } },

];
