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
        loadChildren: () => import('./processing-management/processing-management.routes').then((mod) => mod.PROCESSING_MANAGEMENT_ROUTES)
    },
    {
        path: '',
        loadChildren: () => import('./user-management/user-management.routes').then((mod) => mod.USER_MANAGEMENT_ROUTES)
    },
    {
        path: 'widgets',
        component: WidgetsComponent,
        data: {title: "Widgets"},
    },
   
];
