import { Routes } from '@angular/router';
import { AgentListComponent } from './agent-list/agent-list.component';
import { AgentFormComponent } from './agent-form/agent-form.component';
import { AgentAccountsListComponent } from './agent-accounts-list/agent-accounts-list.component';
import { AgentAccountsFormComponent } from './agent-accounts-form/agent-accounts-form.component';
import { AgentBranchListComponent } from './agent-branch-list/agent-branch-list.component';
import { AgentBranchFormComponent } from './agent-branch-form/agent-branch-form.component';

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

// Agent Branches Routes
export const AGENT_BRANCHES_ROUTES: Routes = [
    {
        path: '',
        component: AgentBranchListComponent,
        data: { title: 'Agent Branches' }
    },
    {
        path: 'add',
        component: AgentBranchFormComponent,
        data: { title: 'Add Agent Branch' }
    },
    {
        path: 'edit/:id',
        component: AgentBranchFormComponent,
        data: { title: 'Edit Agent Branch' }
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
    // Agent branches at the root level (for /agent-branches)
    {
        path: 'agent-branches',
        children: AGENT_BRANCHES_ROUTES
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
            },
            {
                path: 'agent-branches',
                children: AGENT_BRANCHES_ROUTES
            }
        ]
    }
];
