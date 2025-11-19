import { Routes } from '@angular/router';

export const USER_MANAGEMENT_ROUTES: Routes = [
  {
    path: 'users',
    children: [
      { path: '', loadComponent: () => import('./user-list/user-list.component').then(m => m.UserListComponent) },
      { path: 'add', loadComponent: () => import('./user-form/user-form.component').then(m => m.UserFormComponent) },
      { path: 'edit/:id', loadComponent: () => import('./user-form/user-form.component').then(m => m.UserFormComponent) },
      { path: 'approve', loadComponent: () => import('./approve-users/approve-users.component').then(m => m.ApproveUsersComponent) },
      { path: 'groups', loadComponent: () => import('./group-list/group-list.component').then(m => m.GroupListComponent) },
      { path: 'groups/add', loadComponent: () => import('./group-form/group-form.component').then(m => m.GroupFormComponent) },
      { path: 'groups/edit/:id', loadComponent: () => import('./group-form/group-form.component').then(m => m.GroupFormComponent) },
    ]
  }
];
