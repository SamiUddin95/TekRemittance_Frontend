import { Routes } from '@angular/router';
import { BranchListComponent } from './branch-list/branch-list.component';
import { BranchFormComponent } from './branch-form/branch-form.component';

export const BRANCH_MANAGEMENT_ROUTES: Routes = [
    {
        path: 'branch-management',
        component: BranchListComponent,
        data: { title: "Branch Management" },
    },
    {
        path: 'branch-management/add',
        component: BranchFormComponent,
        data: { title: "Add Branch" },
    },
    {
        path: 'branch-management/edit/:id',
        component: BranchFormComponent,
        data: { title: "Edit Branch" },
    },
];
