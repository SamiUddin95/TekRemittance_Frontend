import {MenuItemType} from '@/app/types/layout';

type UserDropdownItemType = {
    label?: string;
    icon?: string;
    url?: string;
    isDivider?: boolean;
    isHeader?: boolean;
    class?: string;
}

export const userDropdownItems: UserDropdownItemType[] = [

    {
        label: 'Log Out',
        icon: 'tablerLogout2',
        url: 'Sign In',
        class: 'text-danger fw-semibold'
    }
];

export const menuItems: MenuItemType[] = [
     {
            label: 'Dashboard',
            icon: 'tablerLayoutDashboard',
             url: '/dashboard',
    },
    {
        label: 'User Management',
        icon: 'tablerTableColumn',
        isCollapsed: true,
        children: [
            {icon: 'tablerWorld', label: 'Users', url: '/users'},
            {icon: 'tablerCheck', label: 'Approve Users', url: '/users/approve'},
        ]
    },
    // {
    //     label: 'Apps',
    //     icon: 'tablerApps',
    //     children: [

    //         {
    //             label: 'Users',
    //             icon: 'tablerUsers',
    //             isCollapsed: true,
    //             children: [
    //                 {label: 'Contacts', url: '/apps/users/contacts'},
    //                 {label: 'Roles', url: '/apps/users/roles'},
    //                 {label: 'Permissions', url: '/apps/users/permissions'},
    //             ]
    //         },
    //     ]
    // },
    {
        label: 'Basic Setup',
        icon: 'tablerTableColumn',
        isCollapsed: true,
        children: [
            {icon: 'tablerWorld', label: 'Country Management', url: '/country-management'},
            {icon: 'tablerMapPin', label: 'Province Management', url: '/province-management'},
            {icon: 'tablerBuilding', label: 'City Management', url: '/city-management'},
            {icon: 'tablerBuildingBank', label: 'Bank Management', url: '/bank-management'},
        ]
    },
    
  
    
];

export const horizontalMenuItems: MenuItemType[] = [
    {
            label: 'Dashboard',
            icon: 'tablerLayoutDashboard',
             url: '/dashboard',
    },
    {
        label: 'User Management',
        icon: 'tablerTableColumn',
        isCollapsed: true,
        children: [
            {icon: 'tablerWorld', label: 'Users', url: '/users'},
            {icon: 'tablerCheck', label: 'Approve Users', url: '/users/approve'},
        ]
    },
    // {
    //     label: 'Apps',
    //     icon: 'tablerApps',
    //     children: [

    //         {
    //             label: 'Users',
    //             icon: 'tablerUsers',
    //             isCollapsed: true,
    //             children: [
    //                 {label: 'Contacts', url: '/apps/users/contacts'},
    //                 {label: 'Roles', url: '/apps/users/roles'},
    //                 {label: 'Permissions', url: '/apps/users/permissions'},
    //             ]
    //         },
    //     ]
    // },
    {
        label: 'Basic Setup',
        icon: 'tablerTableColumn',
        isCollapsed: true,
        children: [
            {icon: 'tablerWorld', label: 'Country Management', url: '/country-management'},
            {icon: 'tablerMapPin', label: 'Province Management', url: '/province-management'},
            {icon: 'tablerBuilding', label: 'City Management', url: '/city-management'},
            {icon: 'tablerBuildingBank', label: 'Bank Management', url: '/bank-management'},
        ]
    },
    {
        label: 'Processing Management',
        icon: 'tablerTableColumn',
        isCollapsed: true,
        children: [
            {icon: 'tablerWorld', label: 'Bulk Upload Template', url: '/bulk-upload-template'},
            {icon: 'tablerMapPin', label: 'Bulk Upload', url: '/bulk-upload'}, 
        ]
    },
     
     
];
