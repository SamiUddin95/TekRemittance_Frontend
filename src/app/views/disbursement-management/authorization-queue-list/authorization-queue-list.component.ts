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

interface AuthQueueRow {
  id: string;
  rin: string;
  agentName: string;
  beneficiaryName: string;
  amount: string;
  mode: string;
  makerUser: string;
  status: 'Pending' | 'Approved' | 'Rejected' | string;
  createdOn: string;
  error?: string;
}

@Component({
  selector: 'app-authorization-queue-list',
  standalone: true,
  imports: [CommonModule, PageTitleComponent, NgIcon, ReactiveFormsModule, GenericPaginationComponent, SkeletonLoaderComponent],
  templateUrl: './authorization-queue-list.component.html'
})
export class AuthorizationQueueListComponent implements OnInit {
  isLoading = false;
  filterForm: FormGroup;

  rows: AuthQueueRow[] = [];

  PaginationInfo: any = { Page: 1, RowsPerPage: 50 };
  totalRecord = 0;

  // modal state
  detailsVisible = false;
  selectedRow: AuthQueueRow | null = null;

  // agents dropdown
  agents: Array<{ id: string; name: string }> = [];

  constructor(private fb: FormBuilder, private agentService: AgentService, private disbursementService: DisbursementService) {
    this.filterForm = this.fb.group({
      agentId: [''],
      mode: [''],
      status: ['Pending'],
      date: [''],
      search: ['']
    });
  }

  ngOnInit(): void { this.loadAgents(); }

  onSearch(): void {
    console.log('Search button clicked');
    const agentId = this.filterForm.get('agentId')?.value;
    console.log('Selected agent ID:', agentId);
    
    if (agentId) {
      this.PaginationInfo.Page = 1; // Reset to first page for new search
      this.loadDisbursementData(agentId);
    } else {
      console.log('No agent selected');
      // Show message to user that they need to select an agent first
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
    
    this.disbursementService.getDataByAuthorize(agentId, pageNumber, pageSize).subscribe({
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

  private mapDisbursementDataToRows(items: DisbursementData[]): AuthQueueRow[] {
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
        amount: dataJson.Amount || 'N/A',
        mode: 'Bank Transfer',
        makerUser: 'System',
        status: item.status === 'P' || item.status === 'U' ? 'Pending' : item.status,
        createdOn: item.createdOn,
        error: item.error
      };
    });
  }


  private loadAgents(): void {
    this.agentService.getAgents(1, 100).subscribe({
      next: (res) => { this.agents = (res.items || []).map(a => ({ id: String(a.id), name: a.name || '-' })); },
      error: () => {}
    });
  }

  onPageChanged(page: number): void { this.PaginationInfo.Page = page; }

  view(row: AuthQueueRow): void { this.selectedRow = row; this.detailsVisible = true; }
  closeDetails(): void { this.detailsVisible = false; }
}
