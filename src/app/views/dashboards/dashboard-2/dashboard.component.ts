import {Component, HostListener, OnInit} from '@angular/core';
import {PageTitleComponent} from '@app/components/page-title.component';
import {statistics} from '@/app/views/dashboards/dashboard-2/data';
import {
    StatisticsWidgetComponent
} from '@/app/views/dashboards/dashboard-2/components/statistics-widget/statistics-widget.component';
import {
    OrderStatisticsComponent
} from '@/app/views/dashboards/dashboard-2/components/order-statistics/order-statistics.component';
import {TransactionsComponent} from '@/app/views/dashboards/dashboard-2/components/transactions/transactions.component';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {DashboardService, DashboardData} from './services/dashboard.service';
import {catchError, tap} from 'rxjs/operators';
import {of} from 'rxjs';

@Component({
    selector: 'app-dashboard-2',
    imports: [
        CommonModule,
        FormsModule,
        PageTitleComponent,
        StatisticsWidgetComponent,
        OrderStatisticsComponent,
        TransactionsComponent
    ],
    templateUrl: './dashboard.component.html',
})
export class Dashboard2Component implements OnInit {
    statistics = statistics;
    selectedPeriod = 'Today';
    timePeriods = ['Today', 'Weekly', 'Monthly', 'Annual'];
    isDropdownOpen = false;
    isLoading = false;
    dashboardData: DashboardData | null = null;

    constructor(private dashboardService: DashboardService) {}

    ngOnInit() {
        this.loadDashboardData();
    }

    toggleDropdown() {
        this.isDropdownOpen = !this.isDropdownOpen;
    }

    loadDashboardData() {
        this.isLoading = true;
        this.dashboardService.getDisbursementDashboard(this.selectedPeriod)
            .pipe(
                tap(response => {
                    if (response.status === 'success' && response.data) {
                        this.dashboardData = response.data;
                        this.updateStatisticsWithApiData(response.data);
                    }
                    this.isLoading = false;
                }),
                catchError(error => {
                    console.error('Error loading dashboard data:', error);
                    this.isLoading = false;
                    return of(null);
                })
            )
            .subscribe();
    }

    updateStatisticsWithApiData(data: DashboardData) {
        // Update statistics with API data
        this.statistics[0].value = data.successCount; 
        this.statistics[1].value = data.successAmount; 
        this.statistics[2].value = data.successPercentage; 
        this.statistics[3].value = data.failedCount; 
        this.statistics[4].value = data.failedAmount; 
        
        // Update descriptions based on selected period
        let description = '';
        switch(this.selectedPeriod) {
            case 'Today':
                description = 'From today';
                break;
            case 'Weekly':
                description = 'From last 7 days';
                break;
            case 'Monthly':
                description = 'From last month';
                break;
            case 'Annual':
                description = 'From last year';
                break;
            default:
                description = 'From last month';
        }
        
        // Update all statistics descriptions
        this.statistics.forEach(stat => {
            stat.description = description;
        });
    }

    selectPeriod(period: string) {
        this.selectedPeriod = period;
        this.isDropdownOpen = false;
        this.loadDashboardData();
    }

    trackByIndex(index: number, item: any): number {
        return index;
    }

    // Close dropdown when clicking outside
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event) {
        const target = event.target as HTMLElement;
        if (!target.closest('.dropdown')) {
            this.isDropdownOpen = false;
        }
    }
}
