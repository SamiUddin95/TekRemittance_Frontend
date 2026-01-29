import {Component, HostListener, OnInit, ChangeDetectorRef, ViewChild, AfterViewInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {worldTransactionMapOptions, pieChartOptions} from '@/app/views/dashboards/dashboard-2/data';
import {RouterLink} from '@angular/router';
import {currency} from '@/app/constants';
import {NgIcon} from '@ng-icons/core';
import {toTitleCase} from '@/app/utils/string-utils';
import {VectorMapComponent} from '@app/components/vector-map.component';
import {EchartComponent} from '@app/components/echart.component';
import {UiCardComponent} from '@app/components/ui-card.component';
import {DashboardService, RecentTransaction, TransactionModeData, TransactionModeItem} from '../../services/dashboard.service';
import {catchError, tap} from 'rxjs/operators';
import {of} from 'rxjs';
import type {EChartsType} from 'echarts/core';

import 'jsvectormap/dist/maps/world.js';

@Component({
    selector: 'app-transactions',
    imports: [
        CommonModule,
        RouterLink, 
        NgIcon, 
        VectorMapComponent, 
        UiCardComponent, 
        EchartComponent
    ],
    templateUrl: './transactions.component.html',
})
export class TransactionsComponent implements OnInit, AfterViewInit {
    transactions: RecentTransaction[] = [];
    currency = currency;
    toTitleCase = toTitleCase;
    worldTransactionMapOptions = worldTransactionMapOptions;
    pieChartOptions = pieChartOptions;
    isLoading = true;
    
    // Chart dropdown functionality
    selectedChartPeriod = 'Today';
    chartPeriods = ['Today', 'Weekly', 'Monthly', 'Annual'];
    isChartDropdownOpen = false;

    // Transaction mode data for pie chart
    transactionModeData: TransactionModeData = {
        ftCount: 0,
        ibftCount: 0,
        rtgsCount: 0
    };

    // Flag to force chart re-rendering
    shouldRenderChart = true;

    // Modal properties
    isModalOpen = false;
    modalData: TransactionModeItem[] = [];
    selectedMode = '';
    modalLoading = false;

    // Custom pie chart options for transaction mode
    transactionPieChartOptions = (): any => {
        const total = this.transactionModeData.ftCount + this.transactionModeData.ibftCount + this.transactionModeData.rtgsCount;
        
        return {
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c}'
            },
            legend: {
                bottom: '0%',
                left: 'center',
                data: ['FT', 'IBFT', 'RTGS'],
                textStyle: {
                    fontSize: 12,
                    color: '#6c757d'
                }
            },
            series: [
                {
                    name: 'Transaction Mode',
                    type: 'pie',
                    radius: '70%',
                    center: ['50%', '45%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 4,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: {
                        show: true,
                        position: 'outside',
                        formatter: '{b}\n{c}',
                        fontSize: 11,
                        color: '#6c757d'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: '14',
                            fontWeight: 'bold'
                        },
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                    labelLine: {
                        show: true,
                        length: 15,
                        length2: 10
                    },
                    data: [
                        {
                            value: this.transactionModeData.ftCount,
                            name: 'FT',
                            itemStyle: {
                                // color: '#10b981'
                                color: '#1ab394'
                            }
                        },
                        {
                            value: this.transactionModeData.ibftCount,
                            name: 'IBFT',
                            itemStyle: {
                                // color: '#f59e0b'
                                color: '#f8ac59'
                            }
                        },
                        {
                            value: this.transactionModeData.rtgsCount,
                            name: 'RTGS',
                            itemStyle: {
                                // color: '#ef4444'
                                color: '#ed5565'
                            }
                        }
                    ]
                }
            ]
        };
    };

    // Chart click event handler
    onChartInit = (chart: EChartsType) => {
        // Add click event listener to the chart
        chart.on('click', (params: any) => {
            if (params.data && params.data.name) {
                const mode = params.data.name;
                this.openTransactionModal(mode);
            }
        });
    };

    constructor(
        private dashboardService: DashboardService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.loadRecentTransactions();
        this.loadTransactionModeData();
    }

    ngAfterViewInit() {
        // Chart will be available after view initialization
    }

    loadRecentTransactions() {
        this.isLoading = true;
        
        this.dashboardService.getRecentTransactions()
            .pipe(
                tap((response) => {
                    if (response.status === 'success' && response.data) {
                        this.transactions = response.data;
                    } else {
                        //this.transactions = this.getFallbackTransactions();
                    }
                    this.isLoading = false;
                    this.cdr.detectChanges();
                }),
                catchError(error => {
                    console.error('Error loading recent transactions:', error);
                    //this.transactions = this.getFallbackTransactions();
                    this.isLoading = false;
                    this.cdr.detectChanges();
                    return of(null);
                })
            )
            .subscribe();
    }

    loadTransactionModeData() {
        this.dashboardService.getTransactionModeCount(this.selectedChartPeriod)
            .pipe(
                tap((response) => {
                    if (response.status === 'success' && response.data) {
                        this.transactionModeData = response.data;
                    } else {
                        // Use fallback data if API fails
                        this.transactionModeData = {
                            ftCount: 5,
                            ibftCount: 3,
                            rtgsCount: 2
                        };
                    }
                    // Force chart update by toggling render flag
                    this.shouldRenderChart = false;
                    setTimeout(() => {
                        this.shouldRenderChart = true;
                        this.cdr.detectChanges();
                    }, 50);
                }),
                catchError(error => {
                    console.error('Error loading transaction mode data:', error);
                    // Use fallback data on error
                    // this.transactionModeData = {
                    //     ftCount: 5,
                    //     ibftCount: 3,
                    //     rtgsCount: 2
                    // };
                    // Force chart update by toggling render flag
                    this.shouldRenderChart = false;
                    setTimeout(() => {
                        this.shouldRenderChart = true;
                        this.cdr.detectChanges();
                    }, 50);
                    return of(null);
                })
            )
            .subscribe();
    }

    getTransactionId(transaction: RecentTransaction, index: number): string {
        return `#TR-${index + 1}`;
    }

    getTransactionOrder(transaction: RecentTransaction): string {
        if (transaction.accountTitle) {
            return `Account: ${transaction.accountTitle}`;
        }
        return `Agent: ${transaction.agentName}`;
    }

    getTransactionDate(transaction: RecentTransaction): string {
        const date = new Date(transaction.date);
        return date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    getTransactionTime(transaction: RecentTransaction): string {
        const date = new Date(transaction.date);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    getTransactionVariant(status: string): string {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'success';
            case 'processing':
                return 'warning';
            case 'cancelled':
                return 'danger';
            default:
                return 'secondary';
        }
    }

    getPaymentMethodIcon(mode: string | null): string {
        switch (mode?.toLowerCase()) {
            case 'ft':
                return 'fund-transfer';
            case 'ibft':
                return 'bank-transfer';
            default:
                return 'credit-card';
        }
    }

    refreshTransactions() {
        this.loadRecentTransactions();
        this.loadTransactionModeData();
    }

    toggleChartDropdown() {
        this.isChartDropdownOpen = !this.isChartDropdownOpen;
    }

    selectChartPeriod(period: string) {
        this.selectedChartPeriod = period;
        this.isChartDropdownOpen = false;
        // Reload transaction mode data when period changes
        this.loadTransactionModeData();
    }

    // Modal methods
    openTransactionModal(mode: string) {
        this.selectedMode = mode;
        this.modalLoading = true;
        this.isModalOpen = true;
        
        this.dashboardService.getTransactionModeList(this.selectedChartPeriod, mode)
            .pipe(
                tap((response) => {
                    if (response.status === 'success' && response.data) {
                        this.modalData = response.data;
                    } else {
                        this.modalData = [];
                    }
                    this.modalLoading = false;
                    this.cdr.detectChanges();
                }),
                catchError(error => {
                    console.error('Error loading transaction mode list:', error);
                    this.modalData = [];
                    this.modalLoading = false;
                    this.cdr.detectChanges();
                    return of(null);
                })
            )
            .subscribe();
    }

    closeModal() {
        this.isModalOpen = false;
        this.modalData = [];
        this.selectedMode = '';
        this.modalLoading = false;
    }

    // Helper methods for modal data
    formatModalDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatModalAmount(amount: number): string {
        return this.currency + amount.toLocaleString();
    }

    getStatusBadgeClass(status: string): string {
        switch (status.toLowerCase()) {
            case 'r':
            case 'completed':
                return 'badge-soft-success';
            case 'u':
            case 'processing':
                return 'badge-soft-warning';
            case 'aml':
            case 'cancelled':
                return 'badge-soft-danger';
            default:
                return 'badge-soft-secondary';
        }
    }

    getStatusText(status: string): string {
        switch (status.toLowerCase()) {
            case 'r':
                return 'Released';
            case 'u':
                return 'Under Review';
            case 'aml':
                return 'AML Check';
            default:
                return status;
        }
    }

    // Close dropdown when clicking outside
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event) {
        const target = event.target as HTMLElement;
        if (!target.closest('.dropdown')) {
            this.isChartDropdownOpen = false;
        }
    }
}
