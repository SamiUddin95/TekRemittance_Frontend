import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-incoming-outgoing-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './incoming-outgoing-cards.component.html',
  styleUrls: ['./incoming-outgoing-cards.component.css']
})
export class IncomingOutgoingCardsComponent implements OnInit {
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
}
