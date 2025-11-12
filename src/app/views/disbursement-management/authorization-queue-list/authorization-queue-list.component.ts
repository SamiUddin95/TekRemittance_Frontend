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
import { AuthService } from '@/app/core/services/auth.service';

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
  tableHeaders: string[] = [];
  dataRows: Array<{ id: string; obj: any }> = [];

  PaginationInfo: any = { Page: 1, RowsPerPage: 50 };
  totalRecord = 0;

  // modal state
  detailsVisible = false;
  selectedRow: AuthQueueRow | null = null;

  // agents dropdown
  agents: Array<{ id: string; name: string }> = [];

  constructor(private fb: FormBuilder, private agentService: AgentService, private disbursementService: DisbursementService, private auth: AuthService) {
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

  onClearFilters(): void {
    // Reset form fields to defaults
    this.filterForm.reset({
      agentId: '',
      mode: '',
      status: 'Pending',
      date: '',
      search: ''
    });

    // Reset pagination and table state
    this.PaginationInfo.Page = 1;
    this.rows = [];
    this.tableHeaders = [];
    this.dataRows = [];
    this.totalRecord = 0;
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
          // Build dynamic headers from dataJson keys
          const parsedObjects: any[] = response.items.map((item: DisbursementData) => {
            try { return JSON.parse(item.dataJson || '{}'); } catch { return {}; }
          });
          const headerSet = new Set<string>();
          parsedObjects.forEach(o => Object.keys(o || {}).forEach(k => headerSet.add(k)));
          // Ensure AgentName column exists
          const headersArr = Array.from(headerSet);
          if (!headersArr.includes('AgentName')) {
            headersArr.unshift('AgentName');
          }
          this.tableHeaders = headersArr;
          // Build renderable rows with AgentName merged
          this.dataRows = response.items.map((item: DisbursementData, idx: number) => {
            const obj = parsedObjects[idx] || {};
            const agentName = (this.agents.find(a => a.id?.toLowerCase() === item.agentId?.toLowerCase())?.name)
              || `Agent-${(item.agentId || '').substring(0, 8)}`;
            return { id: item.id, obj: { AgentName: agentName, ...obj } };
          });
          this.totalRecord = response.totalCount;
          console.log('Dynamic headers:', this.tableHeaders);
        } else {
          this.rows = [];
          this.tableHeaders = [];
          this.dataRows = [];
          this.totalRecord = 0;
        }
      },
      error: (error) => {
        console.error('API error:', error);
        this.isLoading = false;
        this.rows = [];
        this.tableHeaders = [];
        this.dataRows = [];
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
        rin: dataJson.XPin || dataJson.Xpin || dataJson.xpin || '',
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

  // helpers for dynamic table view action
  private findRowById(id: string): AuthQueueRow | null {
    return this.rows.find(r => r.id === id) || null;
  }

  onView(id: string): void {
    const row = this.findRowById(id);
    if (row) this.view(row);
  }

  onDisburse(id: string): void {
    const row = this.findRowById(id);
    if (!row) return;
    
    const userId = this.auth.getUserId();
    const xpin = row?.rin;

    if (!userId) {
      Swal.fire({
        icon: 'warning',
        title: 'User not found',
        text: 'Please login again to continue.'
      });
      return;
    }

    if (!xpin) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing XPin',
        text: 'XPin not available for this row.'
      });
      return;
    }

    // Show confirmation dialog before proceeding
    Swal.fire({
      title: 'Confirm Disbursement',
      html: `Are you sure you want to disburse this remittance?<br><br><strong>XPin:</strong> ${xpin}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, disburse!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.disbursementService.remitApprove(userId, xpin).subscribe({
          next: (res) => {
            this.isLoading = false;
            const isSuccess = res?.isSuccess;
            const message = res?.message || 'No message from server';
            
            if (isSuccess) {
              Swal.fire({
                icon: 'success',
                title: 'Disbursement Successful',
                text: message,
                confirmButtonText: 'OK'
              });
            } else {
              Swal.fire({
                icon: 'warning',
                title: 'Disbursement Failed',
                text: message,
                confirmButtonText: 'OK'
              });
            }
            
            // Reload the data to refresh the list regardless of success/failure
            const agentId = this.filterForm.get('agentId')?.value;
            if (agentId) {
              this.loadDisbursementData(agentId);
            }
          },
          error: (err) => {
            this.isLoading = false;
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'API call failed. Please try again.',
              confirmButtonText: 'OK'
            });
            console.error('RemitApprove error', err);
          }
        });
      }
    });
  }

  onReject(id: string): void {
    const row = this.findRowById(id);
    if (!row) return;
    
    const userId = this.auth.getUserId();
    const xpin = row?.rin;

    if (!userId) {
      Swal.fire({
        icon: 'warning',
        title: 'User not found',
        text: 'Please login again to continue.'
      });
      return;
    }

    if (!xpin) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing XPin',
        text: 'XPin not available for this row.'
      });
      return;
    }

    this.isLoading = true;
    this.disbursementService.remitReject(userId, xpin).subscribe({
      next: (res) => {
        this.isLoading = false;
        if ((res?.status || '').toLowerCase() === 'success') {
          Swal.fire({
            icon: 'success',
            title: 'Rejected',
            text: 'Remittance rejected successfully.'
          });
          // Reload the data to refresh the list
          const agentId = this.filterForm.get('agentId')?.value;
          if (agentId) {
            this.loadDisbursementData(agentId);
          }
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Failed',
            text: res?.errorMessage || 'Failed to reject remittance.'
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'API call failed. Please try again.'
        });
        console.error('RemitReject error', err);
      }
    });
  }  
}
