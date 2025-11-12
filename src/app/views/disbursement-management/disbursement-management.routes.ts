import { Routes } from '@angular/router';
import { DisbursementQueueListComponent } from './disbursement-queue-list/disbursement-queue-list.component';
import { AuthorizationQueueListComponent } from './authorization-queue-list/authorization-queue-list.component';
import { RejectedQueueListComponent } from './rejected-queue-list/rejected-queue-list.component';
import { ApprovedQueueListComponent } from './approved-queue-list/approved-queue-list.component';
import { FetchAccountsComponent } from './fetch-accounts/fetch-accounts.component';
import { CocPayoutComponent } from './coc-payout/coc-payout.component';

export const DISBURSEMENT_MANAGEMENT_ROUTES: Routes = [
  {
    path: 'disbursement-queue',
    component: DisbursementQueueListComponent,
    data: { title: 'Disbursement Queue' },
  },
  {
    path: 'authorization-queue',
    component: AuthorizationQueueListComponent,
    data: { title: 'Authorization Queue' },
  },
  {
    path: 'rejected-queue',
    component: RejectedQueueListComponent,
    data: { title: 'Rejected Queue' },
  },
  {
    path: 'approved-queue',
    component: ApprovedQueueListComponent,
    data: { title: 'Approved Queue' },
  },
  {
    path: 'fetch-accounts',
    component: FetchAccountsComponent,
    data: { title: 'Fetch Accounts' },
  },
  {
    path: 'coc-payout',
    component: CocPayoutComponent,
    data: { title: 'COC Payout' },
  },
];
