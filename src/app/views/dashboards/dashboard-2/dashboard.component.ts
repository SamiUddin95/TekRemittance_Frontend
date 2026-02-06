import {Component, HostListener, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HomeRemittanceDashboardComponent} from './home-remittance-dashboard/home-remittance-dashboard.component';

@Component({
    selector: 'app-dashboard-2',
    imports: [CommonModule, HomeRemittanceDashboardComponent],
    templateUrl: './dashboard.component.html',
})
export class Dashboard2Component implements OnInit {
    
  constructor() {}
  ngOnInit(): void {}
}

