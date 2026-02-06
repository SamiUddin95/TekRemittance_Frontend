import {Routes} from '@angular/router';
import { HomeRemittanceDashboardComponent } from './dashboard-2/home-remittance-dashboard/home-remittance-dashboard.component';

export const DASHBOARDS_ROUTES: Routes = [
    {
        path: 'dashboard',
        component: HomeRemittanceDashboardComponent,
        data: {title: "Dashboard"},
    },

];
