import { Routes } from '@angular/router';
import { ReportsComponent } from './reports.component';
import { DailyRemittanceComponent } from './daily-remittance/daily-remittance.component';
import { DailySettlementComponent } from './daily-settlement/daily-settlement.component';
import { RemittanceTransactionDetailComponent } from './remittance-transaction-detail/remittance-transaction-detail.component';
import { TransactionModeAnalysisComponent } from './transaction-mode-analysis/transaction-mode-analysis.component';
import { RemittanceStatusTrackingComponent } from './remittance-status-tracking/remittance-status-tracking.component';

export const routes: Routes = [
    {
        path: 'reports',
        component: ReportsComponent,
        title: 'Reports'
    },
    {
        path: 'daily-remittance-report',
        component: DailyRemittanceComponent,
        title: 'Daily Remittance Report'
    },
    {
        path: 'daily-settlement-report',
        component: DailySettlementComponent,
        title: 'Daily Settlement Report'
    },
    {
        path: 'remittance-transaction-detail-report',
        component: RemittanceTransactionDetailComponent,
        title: 'Remittance Transaction Detail Report'
    },
    {
        path: 'transaction-mode-analysis-report',
        component: TransactionModeAnalysisComponent,
        title: 'Transaction Mode Analysis Report'
    },
    {
        path: 'remittance-status-tracking-report',
        component: RemittanceStatusTrackingComponent,
        title: 'Remittance Status Tracking Report'
    }
];