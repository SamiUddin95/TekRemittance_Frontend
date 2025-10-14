import {Routes} from '@angular/router';
import {Dashboard2Component} from '@/app/views/dashboards/dashboard-2/dashboard.component';

export const DASHBOARDS_ROUTES: Routes = [
    {
        path: 'dashboard',
        component: Dashboard2Component,
        data: {title: "Dashboard"},
    },

];
