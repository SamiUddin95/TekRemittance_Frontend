import { Routes } from '@angular/router';
import { ProvinceListComponent } from './province-list/province-list.component';
import { ProvinceFormComponent } from './province-form/province-form.component';

export const PROVINCE_MANAGEMENT_ROUTES: Routes = [
    {
        path: 'province-management',
        component: ProvinceListComponent,
        data: { title: "Province Management" },
    },
    {
        path: 'province-management/add',
        component: ProvinceFormComponent,
        data: { title: "Add Province" },
    },
    {
        path: 'province-management/edit/:id',
        component: ProvinceFormComponent,
        data: { title: "Edit Province" },
    },
];
