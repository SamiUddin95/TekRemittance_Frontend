import { Routes } from '@angular/router';
import { CountryListComponent } from './country-list/country-list.component';
import { CountryFormComponent } from './country-form/country-form.component';

export const COUNTRY_MANAGEMENT_ROUTES: Routes = [
    {
        path: 'country-management',
        component: CountryListComponent,
        data: { title: "Country Management" },
    },
    {
        path: 'country-management/add',
        component: CountryFormComponent,
        data: { title: "Add Country" },
    },
    {
        path: 'country-management/edit/:id',
        component: CountryFormComponent,
        data: { title: "Edit Country" },
    },
];
