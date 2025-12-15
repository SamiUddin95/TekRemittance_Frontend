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
        icon: 'tablerApps',
        isCollapsed: true,
        children: [
              {icon: 'tablerFileDescription', label: 'Audit Logs', url: '/audit-logs'},

        ]
    },
    {
        label: 'Acquisition Management',
        icon: 'tablerUserPlus',
        isCollapsed: true,
        children: [
            {icon: 'tablerUsers', label: 'Agent Management', url: '/acquisition-management'},
            {icon: 'tablerUserCheck', label: 'Agent Accounts', url: '/agent-accounts'},
            {icon: 'tablerBuilding', label: 'Bank Branches', url: '/agent-branches'},
        ]
    },
    {
        label: 'Processing Management',
        icon: 'tablerFileUpload',
        isCollapsed: true,
        children: [
            {icon: 'tablerFileDescription', label: 'Upload Template', url: '/bulk-upload-template'},
            {icon: 'tablerCloudUpload', label: 'Agent File Upload', url: '/agent-file-upload'},

        ]
    },
    {
        label: 'Disbursement Management',
        icon: 'tablerCashBanknote',
        isCollapsed: true,
        children: [
            {icon: 'tablerClock', label: 'Disbursement Queue', url: '/disbursement-queue'},
            {icon: 'tablerChecklist', label: 'Authorization Queue', url: '/authorization-queue'},
            {icon: 'tablerX', label: 'Rejected Queue', url: '/rejected-queue'},
            {icon: 'tablerCircleCheck', label: 'Approved Queue', url: '/approved-queue'},

        ]
    },
    {
        label: 'User Management',
        icon: 'tablerShield',
        isCollapsed: true,
        children: [
            {icon: 'tablerUsers', label: 'Users', url: '/users'},
            {icon: 'tablerUserCheck', label: 'Approve Users', url: '/users/approve'},
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
    {
        label: 'General Features',
        icon: 'tablerApps',
        isCollapsed: true,
        children: [
            {icon: 'tablerFileDescription', label: 'Audit Logs', url: '/audit-log'},
            // {icon: 'tablerMapPin', label: 'Province Management', url: '/province-management'},
            // {icon: 'tablerBuilding', label: 'City Management', url: '/city-management'},
            // {icon: 'tablerBuildingBank', label: 'Bank Management', url: '/bank-management'},
        ]
    },
    {
        label: 'Acquisitions',
        icon: 'tablerUserPlus',
        isCollapsed: true,
        children: [
            {icon: 'tablerUsers', label: 'Agent Management', url: '/acquisition-management'},
            {icon: 'tablerUserCheck', label: 'Agent Accounts', url: '/agent-accounts'},
            {icon: 'tablerBuilding', label: 'Agent Branches', url: '/agent-branches'},
        ]
    },
    {
        label: 'Processing',
        icon: 'tablerFileUpload',
        isCollapsed: true,
        children: [
            {icon: 'tablerFileDescription', label: 'File Template', url: '/bulk-upload-template'},
            {icon: 'tablerCloudUpload', label: 'File Upload', url: '/agent-file-upload'},
            {icon: 'tablerTools', label: 'Repair Queue', url: '/repair-queue'},
            {icon: 'tablerShieldCheck', label: 'AML/Screening Queue', url: '/aml-screening-queue'},
        ]
    },
    {
        label: 'Disbursement',
        icon: 'tablerCashBanknote',
        isCollapsed: true,
        children: [
            {icon: 'tablerClock', label: 'Disbursement Queue', url: '/disbursement-queue'},
            {icon: 'tablerChecklist', label: 'Authorization Queue', url: '/authorization-queue'},
            {icon: 'tablerX', label: 'Rejected Queue', url: '/rejected-queue'},
            {icon: 'tablerCircleCheck', label: 'Approved Queue', url: '/approved-queue'},
            {icon: 'tablerDownload', label: 'Fetch Accounts', url: '/fetch-accounts'},
            {icon: 'tablerCash', label: 'COC Payout', url: '/coc-payout'},
        ]
    },
    {
        label: 'Security',
        icon: 'tablerShield',
        isCollapsed: true,
        children: [
            {icon: 'tablerUsers', label: 'Users', url: '/users'},
            {icon: 'tablerUserOff', label: 'Un-Authorized Users', url: '/users/approve'},
            {icon: 'tablerUsersGroup', label: 'Group', url: '/users/groups'},

        ]
    },


];

