import {Component, HostListener} from '@angular/core';
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
export class Dashboard2Component {
    statistics = statistics;
    selectedPeriod = 'Monthly';
    timePeriods = ['Today', 'Weekly', 'Monthly', 'Annual'];
    isDropdownOpen = false;

    toggleDropdown() {
        this.isDropdownOpen = !this.isDropdownOpen;
    }

    selectPeriod(period: string) {
        this.selectedPeriod = period;
        this.isDropdownOpen = false;
        
        // Generate appropriate description based on selected period
        let description = '';
        switch(period) {
            case 'Today':
                description = 'From today';
                break;
            case 'Last 7 days':
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
        
        // Update all statistics badges and descriptions with the selected period
        this.statistics.forEach(stat => {
            if (stat.badge) {
                stat.badge.text = period;
            }
            stat.description = description;
        });
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
