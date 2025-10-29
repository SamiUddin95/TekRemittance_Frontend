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
        url: '/sign-in',
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
        label: 'General Features',
        icon: 'tablerTableColumn',
        isCollapsed: true,
        // children: [
        //     {icon: 'tablerWorld', label: 'Country Management', url: '/country-management'},
        //     {icon: 'tablerMapPin', label: 'Province Management', url: '/province-management'},
        //     {icon: 'tablerBuilding', label: 'City Management', url: '/city-management'},
        //     {icon: 'tablerBuildingBank', label: 'Bank Management', url: '/bank-management'},
        // ]
    },
    {
        label: 'Acquisition Management',
        icon: 'tablerUsers',
        isCollapsed: true,
        children: [
            {icon: 'tablerUserCheck', label: 'Agent Management', url: '/acquisition-management'},
            {icon: 'tablerUserCheck', label: 'Agent Accounts', url: '/agent-accounts'},
            {icon: 'tablerUserCheck', label: 'Bank Branches', url: '/bank-branches'},
        ]
    },
    {
        label: 'Processing Management',
        icon: 'tablerTableColumn',
        isCollapsed: true,
        children: [
            {icon: 'tablerWorld', label: 'Upload Template', url: '/bulk-upload-template'},
            {icon: 'tablerWorld', label: 'Agent File Upload', url: '/agent-file-upload'},
            
        ]
    },
    {
        label: 'Disbursement Management',
        icon: 'tablerTableColumn',
        isCollapsed: true,
        children: [
            {icon: 'tablerWorld', label: 'Disbursement', url: '/disbursement'},
            
        ]
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
    
  
    
];

export const horizontalMenuItems: MenuItemType[] = [
     {
            label: 'Dashboard',
            icon: 'tablerLayoutDashboard',
             url: '/dashboard',
    },
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
    // {
    //     label: 'General Features',
    //     icon: 'tablerTableColumn',
    //     isCollapsed: true,
    //     children: [
    //         {icon: 'tablerWorld', label: 'Country Management', url: '/country-management'},
    //         {icon: 'tablerMapPin', label: 'Province Management', url: '/province-management'},
    //         {icon: 'tablerBuilding', label: 'City Management', url: '/city-management'},
    //         {icon: 'tablerBuildingBank', label: 'Bank Management', url: '/bank-management'},
    //     ]
    // },
    {
        label: 'Acquisition Management',
        icon: 'tablerUsers',
        isCollapsed: true,
        children: [
            {icon: 'tablerUserCheck', label: 'Agent Management', url: '/acquisition-management'},
            {icon: 'tablerUserCheck', label: 'Agent Accounts', url: '/agent-accounts'},
            {icon: 'tablerUserCheck', label: 'Bank Branches', url: '/bank-branches'},
        ]
    },
    {
        label: 'Processing Management',
        icon: 'tablerTableColumn',
        isCollapsed: true,
        children: [
            {icon: 'tablerWorld', label: 'Upload Template', url: '/bulk-upload-template'},
            {icon: 'tablerWorld', label: 'Agent File Upload', url: '/agent-file-upload'},
            
        ]
    },
    {
        label: 'Disbursement Management',
        icon: 'tablerTableColumn',
        isCollapsed: true,
        children: [
            {icon: 'tablerWorld', label: 'Disbursement', url: '/disbursement'},
            
        ]
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
     
     
];
