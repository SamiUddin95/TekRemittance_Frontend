import {Routes} from '@angular/router';  
import {ContactsComponent} from '@/app/views/apps/users/contacts/contacts.component';
import {RolesComponent} from '@/app/views/apps/users/roles/roles.component';
import {PermissionsComponent} from '@/app/views/apps/users/permissions/permissions.component';

export const APPS_ROUTES: Routes = [
    
    {
        path: 'apps/users/contacts',
        component: ContactsComponent,
        data: {title: "Contacts"},
    },
    {
        path: 'apps/users/roles',
        component: RolesComponent,
        data: {title: "User Roles"},
    },
    {
        path: 'apps/users/permissions',
        component: PermissionsComponent,
        data: {title: "User Permissions"},
    }
]
