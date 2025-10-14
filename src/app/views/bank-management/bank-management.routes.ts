import { Routes } from '@angular/router';
import { BankListComponent } from './bank-list/bank-list.component';
import { BankFormComponent } from './bank-form/bank-form.component';

export const BANK_MANAGEMENT_ROUTES: Routes = [
    {
        path: 'bank-management',
        component: BankListComponent,
        data: { title: "Bank Management" },
    },
    {
        path: 'bank-management/add',
        component: BankFormComponent,
        data: { title: "Add Bank" },
    },
    {
        path: 'bank-management/edit/:id',
        component: BankFormComponent,
        data: { title: "Edit Bank" },
    },
];
