import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transaction-status-by-channel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-status-by-channel.component.html',
  styleUrls: ['./transaction-status-by-channel.component.css']
})
export class TransactionStatusByChannelComponent implements OnInit {
  channels = [
    { name: 'IBFT', incoming: 40, outgoing: 30, pending: 20 },
    { name: 'Raast', incoming: 88, outgoing: 12, pending: 0 },
    { name: 'FT', incoming: 40, outgoing: 0, pending: 15 },
    { name: 'RTGS', incoming: 80, outgoing: 20, pending: 0 }
  ];

  constructor() { }

  ngOnInit(): void {
  }
}
