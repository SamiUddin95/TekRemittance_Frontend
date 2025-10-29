import { Routes } from '@angular/router';
import { AgentListComponent } from './agent-list/agent-list.component';
import { AgentFormComponent } from './agent-form/agent-form.component';
import { AgentAccountsListComponent } from './agent-accounts-list/agent-accounts-list.component';
import { AgentAccountsFormComponent } from './agent-accounts-form/agent-accounts-form.component';

// Agent Accounts Routes
export const AGENT_ACCOUNTS_ROUTES: Routes = [
    {
        path: '',
        component: AgentAccountsListComponent,
        data: { title: 'Agent Accounts' }
    },
    {
        path: 'add',
        component: AgentAccountsFormComponent,
        data: { title: 'Add Agent Account' }
    },
    {
        path: 'edit/:id',
        component: AgentAccountsFormComponent,
        data: { title: 'Edit Agent Account' }
    }
];

// Main Acquisition Management Routes
export const ACQUISITION_MANAGEMENT_ROUTES: Routes = [
    // Redirect empty path to acquisition-management
    {
        path: '',
        redirectTo: 'acquisition-management',
        pathMatch: 'full'
    },
    // Agent accounts at the root level (for /agent-accounts)
    {
        path: 'agent-accounts',
        children: AGENT_ACCOUNTS_ROUTES
    },
    // Acquisition management routes
    {
        path: 'acquisition-management',
        children: [
            {
                path: '',
                component: AgentListComponent,
                data: { title: 'Acquisition Management' }
            },
            {
                path: 'add',
                component: AgentFormComponent,
                data: { title: 'Add Acquisition Agent' }
            },
            {
                path: 'edit/:id',
                component: AgentFormComponent,
                data: { title: 'Edit Acquisition Agent' }
            },
            {
                path: 'agent-accounts',
                children: AGENT_ACCOUNTS_ROUTES
            }
        ]
    }
];
