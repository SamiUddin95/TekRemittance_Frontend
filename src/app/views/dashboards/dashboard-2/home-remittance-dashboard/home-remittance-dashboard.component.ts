import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionStatusByChannelComponent } from '../transaction-status-by-channel/transaction-status-by-channel.component';
import { IncomingOutgoingCardsComponent } from '../incoming-outgoing-cards/incoming-outgoing-cards.component';
import { AgentBankPerformanceComponent } from '../agent-bank-performance/agent-bank-performance.component';
import { EprcOverviewComponent } from '../eprc-overview/eprc-overview.component';
import { PageTitleComponent } from '../../../../components/page-title.component';

@Component({
  selector: 'app-home-remittance-dashboard',
  standalone: true,
  imports: [CommonModule, TransactionStatusByChannelComponent, IncomingOutgoingCardsComponent, AgentBankPerformanceComponent, EprcOverviewComponent, PageTitleComponent],
  templateUrl: './home-remittance-dashboard.component.html',
  styleUrls: ['./home-remittance-dashboard.component.css']
})
export class HomeRemittanceDashboardComponent implements OnInit {
  agents = [
    { name: 'A-01', tx: 420, amount: 8.4 },
    { name: 'A-02', tx: 310, amount: 6.1 },
    { name: 'A-03', tx: 195, amount: 4.2 },
    { name: 'A-04', tx: 165, amount: 3.6 },
    { name: 'A-05', tx: 110, amount: 2.8 }
  ];

  banks = [
    { name: 'HBL', tx: 385, amount: 9.2 },
    { name: 'UBL', tx: 312, amount: 7.5 },
    { name: 'MCB', tx: 280, amount: 6.5 },
    { name: 'Bank Alfalah', tx: 224, amount: 5.0 },
    { name: 'Meezan Bank', tx: 219, amount: 4.6 }
  ];

  eprc = {
    generated: 1210,
    received: 1050,
    verified: 980
  };

  constructor() { }

  ngOnInit(): void {
  }
}
