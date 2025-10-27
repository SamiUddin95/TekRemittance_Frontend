import { Routes } from '@angular/router';
import { AgentListComponent } from './agent-list/agent-list.component';
import { AgentFormComponent } from './agent-form/agent-form.component';

export const ACQUISITION_MANAGEMENT_ROUTES: Routes = [
    {
        path: 'acquisition-management',
        component: AgentListComponent,
        data: { title: 'Acquisition Management' },
    },
    {
        path: 'acquisition-management/add',
        component: AgentFormComponent,
        data: { title: 'Add Acquisition Agent' },
    },
    {
        path: 'acquisition-management/edit/:id',
        component: AgentFormComponent,
        data: { title: 'Edit Acquisition Agent' },
    },
];
