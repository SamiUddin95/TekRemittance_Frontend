import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountupComponent } from '../../../../shared/components/countup/countup.component';

@Component({
  selector: 'app-incoming-outgoing-cards',
  standalone: true,
  imports: [CommonModule, CountupComponent],
  templateUrl: './incoming-outgoing-cards.component.html',
  styleUrls: ['./incoming-outgoing-cards.component.css']
})
export class IncomingOutgoingCardsComponent implements OnInit {
  @Input() selectedTab: 'all' | 'incoming' | 'outgoing' = 'all';

  incoming = {
    totalTransactions: 1420,
    transactionChange: 128,
    amount: 32.8,
    success: 94.1,
    failure: 5.9
  };

  outgoing = {
    totalTransactions: 925,
    transactionChange: 0,
    amount: 12.4,
    success: 89.6,
    failure: 10.4
  };

  constructor() { }

  ngOnInit(): void {
  }

  shouldShowIncoming(): boolean {
    return this.selectedTab === 'all' || this.selectedTab === 'incoming';
  }

  shouldShowOutgoing(): boolean {
    return this.selectedTab === 'all' || this.selectedTab === 'outgoing';
  }

  getCardClass(): string {
    if (this.selectedTab === 'all') {
      return 'col-md-6';
    }
    return 'col-md-12';
  }
}
