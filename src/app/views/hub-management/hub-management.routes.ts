import { Routes } from '@angular/router';
import { HubListComponent } from './hub-list/hub-list.component';
import { HubFormComponent } from './hub-form/hub-form.component';

export const HUB_MANAGEMENT_ROUTES: Routes = [
    {
        path: 'hub-management',
        component: HubListComponent,
        data: { title: "Hub Management" },
    },
    {
        path: 'hub-management/add',
        component: HubFormComponent,
        data: { title: "Add Hub" },
    },
    {
        path: 'hub-management/edit/:id',
        component: HubFormComponent,
        data: { title: "Edit Hub" },
    },
];
