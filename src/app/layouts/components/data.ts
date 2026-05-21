import {MenuItemType} from '@/app/types/layout';
import { PermissionService } from '@/app/shared/services/permission.service';

type UserDropdownItemType = {
    label?: string;
    icon?: string;
    url?: string;
    isDivider?: boolean;
    isHeader?: boolean;
    class?: string;
}

interface MenuItemWithPermission extends MenuItemType {
    permission?: string;
}

const menuItemsWithPermissions = [
    {
        label: 'Dashboard',
        icon: 'tablerLayoutDashboard',
        url: '/dashboard',
        permission: 'Dashbaord'
    },
    {
        label: 'Reports',
        icon: 'tablerChartBar',
        isCollapsed: true,
        children: [
            {icon: 'tablerFileReport', label: 'Transaction Reports', url: '/reports', permission: 'Reports.TransactionReports'},
            {icon: 'tablerReportMoney', label: 'Daily Remittance Report', url: '/daily-remittance-report', permission: 'Reports.DailyRemittance'},
            {icon: 'tablerCoin', label: 'Daily Settlement Report', url: '/daily-settlement-report', permission: 'Reports.DailySettlement'},
            {icon: 'tablerListDetails', label: 'Remittance Transaction Detail Report', url: '/remittance-transaction-detail-report', permission: 'Reports.RemittanceTransactionDetail'},
            {icon: 'tablerChartPie', label: 'Transaction Mode Analysis Report', url: '/transaction-mode-analysis-report', permission: 'Reports.TransactionModeAnalysis'},
            {icon: 'tablerActivity', label: 'Remittance Status Tracking Report', url: '/remittance-status-tracking-report', permission: 'Reports.RemittanceStatusTracking'},
        ]
    },
    {
        label: 'Basic Setup',
        icon: 'tablerTableColumn',
        isCollapsed: true,
        children: [
            {icon: 'tablerWorld', label: 'Country Management', url: '/country-management', permission: 'BasicSetUp.CountryManagement'},
            {icon: 'tablerMapPin', label: 'Province Management', url: '/province-management', permission: 'BasicSetUp.ProvinceManagement'},
            {icon: 'tablerBuilding', label: 'City Management', url: '/city-management', permission: 'BasicSetUp.CityManagement'},
            {icon: 'tablerBuildingBank', label: 'Bank Management', url: '/bank-management', permission: 'BasicSetUp.BankManagement'},
            {icon: 'tablerShield', label: 'AML List', url: '/aml-list', permission: 'BasicSetUp.AMLList'},
        ]
    },
    {
        label: 'General Features',
        icon: 'tablerApps',
        isCollapsed: true,
        children: [
            {icon: 'tablerFileDescription', label: 'Audit Logs', url: '/audit-logs', permission: 'GeneralFeatures.AuditLogs'},
        ]
    },
    {
        label: 'Acquisition Management',
        icon: 'tablerUserPlus',
        isCollapsed: true,
        children: [
            {icon: 'tablerUsers', label: 'Agent Management', url: '/acquisition-management', permission: 'Acquisitions.AgentManagement'},
            {icon: 'tablerUserCheck', label: 'Agent Accounts', url: '/agent-accounts', permission: 'Acquisitions.AgentAccounts'},
            {icon: 'tablerBuilding', label: 'Bank Branches', url: '/agent-branches', permission: 'Acquisitions.AgentBranches'},
        ]
    },
    {
        label: 'Processing Management',
        icon: 'tablerFileUpload',
        isCollapsed: true,
        children: [
            {icon: 'tablerFileDescription', label: 'Upload Template', url: '/bulk-upload-template', permission: 'Processing.FileTemplate'},
            {icon: 'tablerCloudUpload', label: 'Agent File Upload', url: '/agent-file-upload', permission: 'Processing.FileUpload'},
        ]
    },
    {
        label: 'Disbursement Management',
        icon: 'tablerCashBanknote',
        isCollapsed: true,
        children: [
            {icon: 'tablerClock', label: 'Disbursement Queue', url: '/disbursement-queue', permission: 'Disbursement.DisbursementQueue'},
            {icon: 'tablerChecklist', label: 'Authorization Queue', url: '/authorization-queue', permission: 'Disbursement.AuthorizationQueue'},
            {icon: 'tablerX', label: 'Rejected Queue', url: '/rejected-queue', permission: 'Disbursement.RejectedQueue'},
            {icon: 'tablerCircleCheck', label: 'Approved Queue', url: '/approved-queue', permission: 'Disbursement.ApprovedQueue'},
            {icon: 'tablerSearch', label: 'COC Payout Inquiry', url: '/coc-payout-inquiry', permission: 'Disbursement.COCpayout'},
        ]
    },
    {
        label: 'User Management',
        icon: 'tablerShield',
        isCollapsed: true,
        children: [
            {icon: 'tablerUsers', label: 'Users', url: '/users', permission: 'Security.Users'},
            {icon: 'tablerUserCheck', label: 'Approve Users', url: '/users/approve', permission: 'Security.UnAuthorized Users'},
        ]
    },
] as MenuItemWithPermission[];

const horizontalMenuItemsWithPermissions = [
    {
        label: 'Dashboard',
        icon: 'tablerLayoutDashboard',
        url: '/dashboard',
        permission: 'Dashbaord'
    },
    {
        label: 'Reports',
        icon: 'tablerTableColumn',
        isCollapsed: true,
        children: [
            {icon: 'tablerFileReport', label: 'Transaction Reports', url: '/reports', permission: 'Reports.TransactionReports'},
            {icon: 'tablerReportMoney', label: 'Daily Remittance Report', url: '/daily-remittance-report', permission: 'Reports.DailyRemittance'},
            {icon: 'tablerCoin', label: 'Daily Settlement Report', url: '/daily-settlement-report', permission: 'Reports.DailySettlement'},
            {icon: 'tablerListDetails', label: 'Remittance Transaction Detail Report', url: '/remittance-transaction-detail-report', permission: 'Reports.RemittanceTransactionDetail'},
            {icon: 'tablerChartPie', label: 'Transaction Mode Analysis Report', url: '/transaction-mode-analysis-report', permission: 'Reports.TransactionModeAnalysis'},
            {icon: 'tablerActivity', label: 'Remittance Status Tracking Report', url: '/remittance-status-tracking-report', permission: 'Reports.RemittanceStatusTracking'},
        ]
    },
    {
        label: 'Basic Setup',
        icon: 'tablerTableColumn',
        isCollapsed: true,
        children: [
            {icon: 'tablerWorld', label: 'Country Management', url: '/country-management', permission: 'BasicSetUp.CountryManagement'},
            {icon: 'tablerMapPin', label: 'Province Management', url: '/province-management', permission: 'BasicSetUp.ProvinceManagement'},
            {icon: 'tablerBuilding', label: 'City Management', url: '/city-management', permission: 'BasicSetUp.CityManagement'},
            {icon: 'tablerBuildingBank', label: 'Bank Management', url: '/bank-management', permission: 'BasicSetUp.BankManagement'},
            {icon: 'tablerShield', label: 'AML List', url: '/aml-list', permission: 'BasicSetUp.AMLList'},
        ]
    },
    {
        label: 'General Features',
        icon: 'tablerApps',
        isCollapsed: true,
        children: [
            {icon: 'tablerFileDescription', label: 'Audit Logs', url: '/audit-log', permission: 'GeneralFeatures.AuditLogs'},
        ]
    },
    {
        label: 'Acquisitions',
        icon: 'tablerUserPlus',
        isCollapsed: true,
        children: [
            {icon: 'tablerUsers', label: 'Agent Management', url: '/acquisition-management', permission: 'Acquisitions.AgentManagement'},
            {icon: 'tablerUserCheck', label: 'Agent Accounts', url: '/agent-accounts', permission: 'Acquisitions.AgentAccounts'},
            {icon: 'tablerBuilding', label: 'Agent Branches', url: '/agent-branches', permission: 'Acquisitions.AgentBranches'},
        ]
    },
    {
        label: 'Processing',
        icon: 'tablerFileUpload',
        isCollapsed: true,
        children: [
            {icon: 'tablerFileDescription', label: 'File Template', url: '/bulk-upload-template', permission: 'Processing.FileTemplate'},
            {icon: 'tablerCloudUpload', label: 'File Upload', url: '/agent-file-upload', permission: 'Processing.FileUpload'},
            {icon: 'tablerTools', label: 'Repair Queue', url: '/repair-queue', permission: 'Processing.RepairQueue'},
            {icon: 'tablerShieldCheck', label: 'AML/Screening Queue', url: '/aml-screening-queue', permission: 'Processing.AML/ScreeningQueue'},
        ]
    },
    {
        label: 'Disbursement',
        icon: 'tablerCashBanknote',
        isCollapsed: true,
        children: [
            {icon: 'tablerClock', label: 'Disbursement Queue', url: '/disbursement-queue', permission: 'Disbursement.DisbursementQueue'},
            {icon: 'tablerChecklist', label: 'Authorization Queue', url: '/authorization-queue', permission: 'Disbursement.AuthorizationQueue'},
            {icon: 'tablerX', label: 'Rejected Queue', url: '/rejected-queue', permission: 'Disbursement.RejectedQueue'},
            {icon: 'tablerCircleCheck', label: 'Approved Queue', url: '/approved-queue', permission: 'Disbursement.ApprovedQueue'},
            {icon: 'tablerDownload', label: 'Pull Agents', url: '/fetch-accounts', permission: 'Disbursement.PullAgents'},
            {icon: 'tablerCash', label: 'COC Payout', url: '/coc-payout', permission: 'Disbursement.COCpayout'},
            {icon: 'tablerSearch', label: 'COC Payout Inquiry', url: '/coc-payout-inquiry', permission: 'Disbursement.COCpayout'},
            {icon: 'tablerBuildingBank', label: 'EPRC', url: '/internal-bank-accounts', permission: 'Disbursement.InternalBanksAccount'},
        ]
    },
    {
        label: 'Security',
        icon: 'tablerShield',
        isCollapsed: true,
        children: [
            {icon: 'tablerUsers', label: 'Users', url: '/users', permission: 'Security.Users'},
            {icon: 'tablerUserOff', label: 'Un-Authorized Users', url: '/users/approve', permission: 'Security.UnAuthorized Users'},
            {icon: 'tablerUsersGroup', label: 'Group', url: '/users/groups', permission: 'Security.Group'},
        ]
    },
] as MenuItemWithPermission[];

function filterMenuItems(items: MenuItemWithPermission[], permissionService: PermissionService): MenuItemType[] {
    return items
        .map((item: MenuItemWithPermission) => {
            if (item.children) {
                const filteredChildren = filterMenuItems(item.children, permissionService);
                if (filteredChildren.length === 0) {
                    return null;
                }
                return { ...item, children: filteredChildren };
            }
            if (item.permission && !permissionService.hasPermission(item.permission)) {
                return null;
            }
            const { permission, ...rest } = item;
            return rest;
        })
        .filter((item): item is MenuItemType => item !== null);
}

export const getMenuItems = (permissionService: PermissionService): MenuItemType[] => {
    return filterMenuItems(menuItemsWithPermissions, permissionService);
};

export const getHorizontalMenuItems = (permissionService: PermissionService): MenuItemType[] => {
    return filterMenuItems(horizontalMenuItemsWithPermissions, permissionService);
};

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
        label: 'Reports',
        icon: 'tablerChartBar',
        isCollapsed: true,
        children: [
            {icon: 'tablerFileReport', label: 'Transaction Reports', url: '/reports'},
            {icon: 'tablerReportMoney', label: 'Daily Remittance Report', url: '/daily-remittance-report'},
            {icon: 'tablerCoin', label: 'Daily Settlement Report', url: '/daily-settlement-report'},
            {icon: 'tablerListDetails', label: 'Remittance Transaction Detail Report', url: '/remittance-transaction-detail-report'},
            {icon: 'tablerChartPie', label: 'Transaction Mode Analysis Report', url: '/transaction-mode-analysis-report'},
            {icon: 'tablerActivity', label: 'Remittance Status Tracking Report', url: '/remittance-status-tracking-report'},
        ]
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
            {icon: 'tablerShield', label: 'AML List', url: '/aml-list'},
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
            {icon: 'tablerSearch', label: 'COC Payout Inquiry', url: '/coc-payout-inquiry'},

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
