import {
    Component,
    OnInit,
    ChangeDetectorRef,
    AfterViewInit,
    ViewChild,
    ElementRef,
    ChangeDetectionStrategy
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NgIcon} from '@ng-icons/core';
import {
    NgbNav,
    NgbNavContent,
    NgbNavItem,
    NgbNavLink,
    NgbNavOutlet,
    NgbProgressbar,
    NgbTooltip
} from '@ng-bootstrap/ng-bootstrap';
import {orderStatistics} from '@/app/views/dashboards/dashboard-2/data';
import {EchartComponent} from '@app/components/echart.component';
import {RouterLink} from '@angular/router';
import {DashboardService, BarGraphData} from '../../services/dashboard.service';
import {EChartsOption} from 'echarts';
import {getColor} from '@/app/utils/color-utils';
import {catchError, tap} from 'rxjs/operators';
import {of, Observable} from 'rxjs';
import {BarGraphResponse} from '../../services/dashboard.service';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '@/environments/environment';

@Component({
    selector: 'app-order-statistics',
    imports: [
        CommonModule,
        NgIcon,
        NgbNav,
        NgbNavItem,
        NgbNavLink,
        NgbNavContent,
        NgbNavOutlet,
        EchartComponent,
        NgbProgressbar, RouterLink
    ],
    templateUrl: './order-statistics.component.html',
})
export class OrderStatisticsComponent implements OnInit {
    orderStatistics = orderStatistics;
    Math = Math;
    barGraphData: BarGraphData[] = [];
    isLoading = true; 
    selectedPeriod: string = 'Monthly';
    canShowChart = false;
    
    constructor(
        private dashboardService: DashboardService, 
        private cdr: ChangeDetectorRef, 
        private http: HttpClient
    ) {
    }

    async ngOnInit() {
        await this.loadBarGraphData();
    }

    selectPeriod(period: string) {
        this.selectedPeriod = period;
        this.loadBarGraphData();
    }

    // refreshChart() {
    //     this.loadBarGraphData();
    // }

    loadBarGraphData() {
        this.isLoading = true;
        this.canShowChart = false;
        
        const url = `${environment.apiUrl}/Dashboards/barGraphDashboard`;
        const params = new HttpParams().set('dateRange', this.selectedPeriod);
        
        this.http.get<BarGraphResponse>(url, { params })
            .pipe(
                tap((response: BarGraphResponse) => {
                    if (response.status === 'success' && response.data) {
                        this.barGraphData = response.data;
                    } else {
                        // Use fallback test data if API fails or returns no data
                        this.barGraphData = this.getFallbackData();
                    }
                    this.isLoading = false;
                    
                    // Delay chart rendering to ensure DOM is ready
                    setTimeout(() => {
                        this.canShowChart = true;
                        this.cdr.detectChanges();
                    }, 300);
                }),
                catchError(error => {
                    console.error('Error loading data:', error);
                    // Use fallback test data on error
                    this.barGraphData = this.getFallbackData();
                    this.isLoading = false;
                    
                    // Delay chart rendering to ensure DOM is ready
                    setTimeout(() => {
                        this.canShowChart = true;
                        this.cdr.detectChanges();
                    }, 300);
                    return of(null);
                })
            )
            .subscribe();
    }

    getFallbackData(): BarGraphData[] {
        if (this.selectedPeriod === 'Annual') {
            return [
                { period: '2024-01-01', complete_Count: 150, process_Count: 80, cancelled_Count: 20 },
                { period: '2024-02-01', complete_Count: 200, process_Count: 90, cancelled_Count: 25 },
                { period: '2024-03-01', complete_Count: 180, process_Count: 70, cancelled_Count: 15 },
                { period: '2024-04-01', complete_Count: 220, process_Count: 100, cancelled_Count: 30 }
            ];
        } else {
            return [
                { period: '2024-01-01', complete_Count: 50, process_Count: 30, cancelled_Count: 10 },
                { period: '2024-01-02', complete_Count: 60, process_Count: 25, cancelled_Count: 8 },
                { period: '2024-01-03', complete_Count: 45, process_Count: 35, cancelled_Count: 12 }
            ];
        }
    }

    orderStatisticsChartOptions = (): EChartsOption => {
        if (this.barGraphData.length === 0) {
            return {
                title: {
                    text: 'No data available',
                    left: 'center',
                    top: 'center',
                    textStyle: { color: getColor("secondary-color") }
                },
                xAxis: { show: false },
                yAxis: { show: false },
                series: []
            };
        }

        const categories = this.barGraphData.map(item => {
            const date = new Date(item.period);
            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: '2-digit'
            });
        });

        const completedData = this.barGraphData.map(item => item.complete_Count);
        const processingData = this.barGraphData.map(item => item.process_Count);
        const cancelledData = this.barGraphData.map(item => item.cancelled_Count);

        return {
            tooltip: {
                trigger: 'axis',
                padding: [8, 15],
                backgroundColor: getColor("secondary-bg"),
                borderColor: getColor("border-color"),
                textStyle: { color: getColor("light-text-emphasis") },
                borderWidth: 1,
                transitionDuration: 0,
                axisPointer: { type: "none" },
                formatter: (params: any) => {
                    const seriesInfo = params.map((item: any) => 
                        `${item.marker} ${item.seriesName}: <span class="fw-bold">${item.value}</span> Orders`
                    ).join('<br/>');
                    return `<div class="mb-1 text-body">${params[0].axisValue}</div>${seriesInfo}`;
                }
            },
            legend: {
                data: ['Completed', 'Processing', 'Cancelled'],
                top: 15,
                textStyle: { color: getColor("body-color") }
            },
            grid: {
                left: 25,
                right: 25,
                bottom: 25,
                top: 60,
                containLabel: true
            },
            xAxis: {
                data: categories,
                axisLine: {
                    lineStyle: { type: 'dashed', color: getColor("border-color") }
                },
                axisLabel: {
                    show: true,
                    color: getColor("secondary-color")
                }
            },
            yAxis: {
                axisLine: {
                    lineStyle: { type: 'dashed', color: getColor("border-color") }
                },
                axisLabel: {
                    show: true,
                    color: getColor("secondary-color")
                }
            },
            series: [
                {
                    name: 'Completed',
                    type: 'line',
                    smooth: true,
                    itemStyle: { color: getColor("success") },
                    showAllSymbol: true,
                    symbol: 'emptyCircle',
                    symbolSize: 5,
                    data: completedData,
                    animation: false
                },
                {
                    name: 'Processing',
                    type: 'bar',
                    barWidth: 14,
                    itemStyle: {
                        borderRadius: [5, 5, 0, 0],
                        color: getColor("secondary")
                    },
                    data: processingData,
                    animation: false
                },
                {
                    name: 'Cancelled',
                    type: 'bar',
                    barWidth: 14,
                    itemStyle: {
                        borderRadius: [5, 5, 0, 0],
                        color: "#bbcae14d"
                    },
                    data: cancelledData,
                    animation: false
                }
            ]
        };
    }
}
