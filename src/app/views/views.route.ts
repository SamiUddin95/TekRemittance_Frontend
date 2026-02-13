import {Routes} from '@angular/router';
import {WidgetsComponent} from '@/app/views/widgets/widgets.component';

export const VIEWS_ROUTES: Routes = [
    {
        path: '',
        loadChildren: () => import('./dashboards/dashboards.routes').then((mod) => mod.DASHBOARDS_ROUTES)
    },
    {
        path: '',
        loadChildren: () => import('./layouts/layout.routes').then((mod) => mod.LAYOUT_ROUTES)
    },
    {
        path: '',
        loadChildren: () => import('./pages/pages.route').then((mod) => mod.PAGES_ROUTES)
    },
    {
        path: '',
        loadChildren: () => import('./apps/apps.route').then((mod) => mod.APPS_ROUTES)
    },
    {
        path: '',
        loadChildren: () => import('./icons/icons.route').then((mod) => mod.ICONS_ROUTES)
    },
    {
        path: '',
        loadChildren: () => import('./country-management/country-management.routes').then((mod) => mod.COUNTRY_MANAGEMENT_ROUTES)
    },
    {
        path: '',
        loadChildren: () => import('./province-management/province-management.routes').then((mod) => mod.PROVINCE_MANAGEMENT_ROUTES)
    },
    {
        path: '',
        loadChildren: () => import('./city-management/city-management.routes').then((mod) => mod.CITY_MANAGEMENT_ROUTES)
    },
    {
        path: '',
        loadChildren: () => import('./bank-management/bank-management.routes').then((mod) => mod.BANK_MANAGEMENT_ROUTES)
    },
    {
        path: '',
        loadChildren: () => import('./aml-list/aml-list.routes').then((mod) => mod.AML_ROUTES)
    },
    {
        path: '',
        loadChildren: () => import('./acquisition-management/acquisition-management.routes').then((mod) => mod.ACQUISITION_MANAGEMENT_ROUTES)
    },
    {
        path: '',
        loadChildren: () => import('./processing-management/processing-management.routes').then((mod) => mod.PROCESSING_MANAGEMENT_ROUTES)
    },
    {
        path: '',
        loadChildren: () => import('./disbursement-management/disbursement-management.routes').then((mod) => mod.DISBURSEMENT_MANAGEMENT_ROUTES)
    },
    {
        path: '',
        loadChildren: () => import('./user-management/user-management.routes').then((mod) => mod.USER_MANAGEMENT_ROUTES)
    },
    {
        path: '',
        loadChildren: () => import('./general-feature/general-feature.routes').then((mod) => mod.GENERAL_FEATURE_ROUTES)
    },
    {
        path: '',
        loadChildren: () => import('./reports/reports.routes').then((mod) => mod.routes)
    },
    {
        path: 'widgets',
        component: WidgetsComponent,
        data: {title: "Widgets"},
    },
];