import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AgentService } from '../../acquisition-management/services/agent.service';
import { PageTitleComponent } from '@app/components/page-title.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { tablerFileReport, tablerSearch, tablerX, tablerPrinter } from '@ng-icons/tabler-icons';
import { SsrsReportViewerComponent } from '../report-viewer/ssrs-report-viewer.component';

@Component({
  selector: 'app-remittance-status-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PageTitleComponent, NgIconComponent, SsrsReportViewerComponent],
  templateUrl: './remittance-status-tracking.component.html',
  styleUrls: ['./remittance-status-tracking.component.scss'],
  providers: [AgentService, provideIcons({ tablerFileReport, tablerSearch, tablerX, tablerPrinter })]
})
export class RemittanceStatusTrackingComponent implements OnInit {
  filterForm: FormGroup;
  agents: Array<{ id: string; name: string }> = [];

  showReport = false;
  reportParams: any = {};

  constructor(private fb: FormBuilder, private agentService: AgentService) {
    this.filterForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      xpin: [''],
      agentId: ['']
    });
  }

  ngOnInit(): void {
    this.loadAgents();
  }

  private loadAgents(): void {
    this.agentService.getAgents(1, 100).subscribe({
      next: (res) => {
        this.agents = (res.items || []).map((a: any) => ({ id: String(a.id), name: a.name || '-' }));
      },
      error: () => {}
    });
  }

  openReport(): void {
    const filters = this.filterForm.value;
    this.reportParams = {
      startDate: filters.startDate || '',
      endDate: filters.endDate || '',
      xpin: filters.xpin || '',
      agentId: filters.agentId || '',
      reportTitle: 'Remittance Status Tracking Report'
    };
    this.showReport = true;
  }

  closeReport(): void {
    this.showReport = false;
    this.reportParams = {};
  }
}
