import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageTitleComponent } from '@app/components/page-title.component';
import { NgIcon } from '@ng-icons/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { GenericPaginationComponent } from '@/app/shared/generic-pagination/generic-pagination/generic-pagination.component';
import { AgentService } from '@/app/views/acquisition-management/services/agent.service';
import { DisbursementService, DisbursementData } from '../services/disbursement.service';
import { SkeletonLoaderComponent } from '@/app/shared/skeleton/skeleton-loader.component';

interface QueueRow {
  id: string;
  rin: string;
  agentName: string;
  beneficiaryName: string;
  amount: string;
  disbursementMode: string;
  status: 'Pending' | 'Completed' | 'On Hold' | string;
  transferMode: string;
  createdOn: string;
  error?: string;
}

@Component({
  selector: 'app-disbursement-queue-list',
  standalone: true,
  imports: [CommonModule, PageTitleComponent, NgIcon, ReactiveFormsModule, GenericPaginationComponent, SkeletonLoaderComponent],
  templateUrl: './disbursement-queue-list.component.html'
})
export class DisbursementQueueListComponent implements OnInit {
  isLoading = false;
  filterForm: FormGroup;
  rows: QueueRow[] = [];

  PaginationInfo: any = { Page: 1, RowsPerPage: 10 };
  totalRecord = 0;

  // details modal state
  detailsVisible = false;
  selectedRow: QueueRow | null = null;
  detailsMode: 'view' | 'disburse' = 'view';

  // agents for dropdown
  agents: Array<{ id: string; name: string }> = [];

  constructor(private fb: FormBuilder, private agentService: AgentService, private disbursementService: DisbursementService) {
    this.filterForm = this.fb.group({
      agentId: [''],
      mode: [''],
      status: [''],
      dateFrom: [''],
      dateTo: [''],
      search: ['']
    });
  }

  ngOnInit(): void {
    this.loadAgents();
  }

  private loadAgents(): void {
    // load first page of agents; can be enhanced later with pagination/search
    this.agentService.getAgents(1, 100).subscribe({
      next: (res) => {
        this.agents = (res.items || []).map(a => ({ id: String(a.id), name: a.name || '-' }));
      },
      error: () => { /* ignore for now */ }
    });
  }

  onPageChanged(page: number): void {
    this.PaginationInfo.Page = page;
    const agentId = this.filterForm.get('agentId')?.value;
    if (agentId) {
      this.loadDisbursementData(agentId);
    }
  }

  onSearch(): void {
    console.log('Search button clicked');
    const agentId = this.filterForm.get('agentId')?.value;
    console.log('Selected agent ID:', agentId);
    
    if (agentId) {
      this.PaginationInfo.Page = 1; // Reset to first page for new search
      this.loadDisbursementData(agentId);
    } else {
      console.log('No agent selected');
      Swal.fire({
        icon: 'warning',
        title: 'Agent required',
        text: 'Please select the Agent first',
        confirmButtonText: 'OK'
      });
    }
  }

  private loadDisbursementData(agentId: string): void {
    console.log('Loading disbursement data for agent:', agentId);
    this.isLoading = true;
    const pageNumber = this.PaginationInfo.Page;
    const pageSize = this.PaginationInfo.RowsPerPage;
    
    console.log('Making API call with params:', { agentId, pageNumber, pageSize });
    
    this.disbursementService.getDataByAgent(agentId, pageNumber, pageSize).subscribe({
      next: (response) => {
        console.log('API response received:', response);
        this.isLoading = false;
        if (response.status === 'success' && response.items) {
          this.rows = this.mapDisbursementDataToRows(response.items);
          this.totalRecord = response.totalCount;
          console.log('Mapped rows:', this.rows);
        } else {
          this.rows = [];
          this.totalRecord = 0;
        }
      },
      error: (error) => {
        console.error('API error:', error);
        this.isLoading = false;
        this.rows = [];
        this.totalRecord = 0;
      }
    });
  }

  private mapDisbursementDataToRows(items: DisbursementData[]): QueueRow[] {
    return items.map(item => {
      let dataJson: any = {};
      try {
        dataJson = JSON.parse(item.dataJson);
      } catch (e) {
        dataJson = {};
      }

      return {
        id: item.id,
        rin: dataJson.XPin || `Row-${item.rowNumber}`,
        agentName: `Agent-${item.agentId.substring(0, 8)}`,
        beneficiaryName: dataJson.AccountNumber || 'N/A',
        amount: dataJson.Amount ? `$${dataJson.Amount}` : 'N/A',
        disbursementMode: 'Bank Transfer',
        status: item.status === 'P' ? 'Pending' : item.status,
        transferMode: 'Raast ID',
        createdOn: item.createdOn,
        error: item.error
      };
    });
  }

  view(row: QueueRow): void {
    this.selectedRow = row;
    this.detailsMode = 'view';
    this.detailsVisible = true;
  }

  closeDetails(): void {
    this.detailsVisible = false;
  }

  disburse(row: QueueRow): void {
    this.selectedRow = row;
    this.detailsMode = 'disburse';
    this.detailsVisible = true;
  }
  reject(_row: QueueRow): void { /* hook for later API */ }
}
