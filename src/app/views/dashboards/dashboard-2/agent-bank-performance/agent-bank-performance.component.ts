import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountupComponent } from '../../../../shared/components/countup/countup.component';

@Component({
  selector: 'app-agent-bank-performance',
  standalone: true,
  imports: [CommonModule, CountupComponent],
  templateUrl: './agent-bank-performance.component.html',
  styleUrls: ['./agent-bank-performance.component.css']
})
export class AgentBankPerformanceComponent implements OnInit {

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

  constructor() { }

  ngOnInit(): void {
    console.log('Agents data:', this.agents);
    console.log('Banks data:', this.banks);
  }

}
