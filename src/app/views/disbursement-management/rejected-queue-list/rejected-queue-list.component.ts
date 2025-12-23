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

interface RejectedRow {
  id: string;
  xpin: string;
  agentName: string;
  beneficiaryName: string;
  amount: string;
  disbursementMode: string;
  remarks: 'Invalid Amount' | 'Missing Info' | string;
  createdOn: string;
  error?: string;
}

@Component({
  selector: 'app-rejected-queue-list',
  standalone: true,
  imports: [CommonModule, PageTitleComponent, NgIcon, ReactiveFormsModule, GenericPaginationComponent, SkeletonLoaderComponent],
  templateUrl: './rejected-queue-list.component.html'
})
export class RejectedQueueListComponent implements OnInit {
  isLoading = false;
  filterForm: FormGroup;

  rows: RejectedRow[] = [];
  tableHeaders: string[] = [];
  dataRows: Array<{ id: string; obj: any }> = [];

  PaginationInfo: any = { Page: 1, RowsPerPage: 10 };
  totalRecord = 0;

  // details modal state (placeholder for future use)
  detailsVisible = false;

  // agents dropdown
  agents: Array<{ id: string; name: string }> = [];

  constructor(private fb: FormBuilder, private agentService: AgentService, private disbursementService: DisbursementService, private auth: AuthService) {
    this.filterForm = this.fb.group({
      agentId: [''],
      xpin: [''],
      accountnumber: [''],
      date: ['']
    });
  }

  ngOnInit(): void { this.loadAgents(); }

  private loadAgents(): void {
    this.agentService.getAgents(1, 100).subscribe({
      next: (res) => { this.agents = (res.items || []).map(a => ({ id: String(a.id), name: a.name || '-' })); },
      error: () => {}
    });
  }

  onPageChanged(page: number): void {
    this.PaginationInfo.Page = page;
    const agentId = this.filterForm.get('agentId')?.value;
    if (agentId) {
      this.loadRejectedData(agentId);
    }
  }


onSearch(): void {
  console.log('Search button clicked');

  const formValues = this.filterForm.value;
  const agentId = formValues.agentId?.trim();

  if (!agentId) {
    Swal.fire({
      icon: 'warning',
      title: 'Agent required',
      text: 'Please select the Agent first',
      confirmButtonText: 'OK'
    });
    return;
  }

  // Collect filters (empty values ko ignore karo)
  const filters = {
    xpin: formValues.xpin?.trim() || undefined,
    accountNumber: formValues.accountnumber?.trim() || undefined,
    date: formValues.date || undefined
  };

  console.log('Searching Rejected Data - Agent:', agentId, 'Filters:', filters);

  this.PaginationInfo.Page = 1;
  this.loadRejectedData(agentId, filters);
}

  onClearFilters(): void {
    // Reset form fields to defaults
    this.filterForm.reset({
      agentId: '',
      xpin: '',
      accountnumber: '',
      date: ''
    });

    // Reset pagination and table state
    this.PaginationInfo.Page = 1;
    this.rows = [];
    this.tableHeaders = [];
    this.dataRows = [];
    this.totalRecord = 0;
  }


  private loadRejectedData(
  agentId: string,
  filters: { xpin?: string; accountNumber?: string; date?: string } = {}
): void {
  console.log('Loading rejected data for agent:', agentId, 'with filters:', filters);
  this.isLoading = true;

  const pageNumber = this.PaginationInfo.Page;
  const pageSize = this.PaginationInfo.RowsPerPage;

  this.disbursementService
    .getDataByReject(agentId, pageNumber, pageSize, filters)
    .subscribe({
      next: (response) => {
        console.log('API response received:', response);
        this.isLoading = false;

        if (response.status === 'success' && response.items) {
          this.rows = this.mapRejectedDataToRows(response.items);

          // Dynamic headers from dataJson
          const parsedObjects: any[] = response.items.map((item: DisbursementData) => {
            try { return JSON.parse(item.dataJson || '{}'); } catch { return {}; }
          });

          const headerSet = new Set<string>();
          parsedObjects.forEach(o => Object.keys(o || {}).forEach(k => headerSet.add(k)));

          const headersArr = Array.from(headerSet);
          if (!headersArr.includes('AgentName')) {
            headersArr.unshift('AgentName');
          }
          this.tableHeaders = headersArr;

          // Data rows with AgentName
          this.dataRows = response.items.map((item: DisbursementData, idx: number) => {
            const obj = parsedObjects[idx] || {};
            const agentName = (this.agents.find(a => a.id?.toLowerCase() === item.agentId?.toLowerCase())?.name)
              || `Agent-${(item.agentId || '').substring(0, 8)}`;
            return { id: item.id, obj: { AgentName: agentName, ...obj } };
          });

          this.totalRecord = response.totalCount;
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

  private mapRejectedDataToRows(items: DisbursementData[]): RejectedRow[] {
    return items.map(item => {
      let dataJson: any = {};
      try {
        dataJson = JSON.parse(item.dataJson);
      } catch (e) {
        dataJson = {};
      }

      return {
        id: item.id,
        xpin: dataJson.XPin || dataJson.Xpin || dataJson.xpin || dataJson.XPIN ||'',
        agentName: `Agent-${item.agentId.substring(0, 8)}`,
        beneficiaryName: dataJson.AccountNumber || 'N/A',
        amount: dataJson.Amount ? `$${dataJson.Amount}` : 'N/A',
        disbursementMode: 'Bank Transfer',
        remarks: item.error?.includes('Invalid date') ? 'Missing Info' : 'Invalid Amount',
        createdOn: item.createdOn,
        error: item.error
      };
    });
  }

  repair(row: RejectedRow): void {
    const userId = this.auth.getUserId();
    const xpin = row?.xpin;

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
      title: 'Confirm Repair',
      html: `Are you sure you want to repair this remittance?<br><br><strong>XPin:</strong> ${xpin}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, repair!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.disbursementService.remitRepair(userId, xpin).subscribe({
          next: (res) => {
            this.isLoading = false;
            const status = res?.status;
            const message = res?.errorMessage || (status === 'success' ? 'Remittance repaired successfully.' : 'Repair operation failed.');
            
            if (status === 'success') {
              Swal.fire({
                icon: 'success',
                title: 'Repair Successful',
                text: message,
                confirmButtonText: 'OK'
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Repair Failed',
                text: message,
                confirmButtonText: 'OK'
              });
            }
            
            // Reload the data to refresh the list regardless of success/failure
            const agentId = this.filterForm.get('agentId')?.value;
            if (agentId) {
              this.loadRejectedData(agentId);
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
            console.error('RemitRepair error', err);
          }
        });
      }
    });
  }

  revert(row: RejectedRow): void {
    const userId = this.auth.getUserId();
    const xpin = row?.xpin;

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
      title: 'Confirm Revert',
      html: `Are you sure you want to revert this remittance?<br><br><strong>XPin:</strong> ${xpin}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, revert!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.disbursementService.remitReverse(userId, xpin).subscribe({
          next: (res) => {
            this.isLoading = false;
            const status = res?.status;
            const message = res?.errorMessage || (status === 'success' ? 'Remittance reverted successfully.' : 'Revert operation failed.');
            
            if (status === 'success') {
              Swal.fire({
                icon: 'success',
                title: 'Revert Successful',
                text: message,
                confirmButtonText: 'OK'
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Revert Failed',
                text: message,
                confirmButtonText: 'OK'
              });
            }
            
            // Reload the data to refresh the list regardless of success/failure
            const agentId = this.filterForm.get('agentId')?.value;
            if (agentId) {
              this.loadRejectedData(agentId);
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
            console.error('RemitReverse error', err);
          }
        });
      }
    });
  }

  // helpers to bridge dynamic rows to existing handlers
  private findRowById(id: string): RejectedRow | null {
    return this.rows.find(r => r.id === id) || null;
  }

  onRepair(id: string): void {
    const row = this.findRowById(id);
    if (row) this.repair(row);
  }

  onRevert(id: string): void {
    const row = this.findRowById(id);
    if (row) this.revert(row);
  }
}
