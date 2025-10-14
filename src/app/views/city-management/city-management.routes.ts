import { Routes } from '@angular/router';
import { CityListComponent } from './city-list/city-list.component';
import { CityFormComponent } from './city-form/city-form.component';

export const CITY_MANAGEMENT_ROUTES: Routes = [
    {
        path: 'city-management',
        component: CityListComponent,
        data: { title: "City Management" },
    },
    {
        path: 'city-management/add',
        component: CityFormComponent,
        data: { title: "Add City" },
    },
    {
        path: 'city-management/edit/:id',
        component: CityFormComponent,
        data: { title: "Edit City" },
    },
];
