import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountupComponent } from '../../../../shared/components/countup/countup.component';

@Component({
  selector: 'app-eprc-overview',
  standalone: true,
  imports: [CommonModule, CountupComponent],
  templateUrl: './eprc-overview.component.html',
  styleUrls: ['./eprc-overview.component.css']
})
export class EprcOverviewComponent implements OnInit {

  eprc = {
    generated: 1210,
    received: 1050,
    verified: 160
  };

  constructor() { }

  ngOnInit(): void {
  }

}
