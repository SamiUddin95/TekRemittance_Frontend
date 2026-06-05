import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageTitleComponent } from '@app/components/page-title.component';
import { NgIcon } from '@ng-icons/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AgentService } from '@/app/views/acquisition-management/services/agent.service';
import Swal from 'sweetalert2';
import { DisbursementService, DisbursementData } from '@/app/views/disbursement-management/services/disbursement.service';
import { Router } from '@angular/router';
import { GenericPaginationComponent } from '@/app/shared/generic-pagination/generic-pagination/generic-pagination.component';
import { SkeletonLoaderComponent } from '../../../shared/skeleton/skeleton-loader.component';
import { AuthService } from '@/app/core/services/auth.service';

interface RepairQueueRow {
  id: string;
  xpin: string;
  agentName: string;
  beneficiaryName: string;
  amount: string;
  errorReason: string;
  remarks: 'Invalid Amount' | 'Missing Info' | 'Pending' | 'Rejected' | string;
  createdOn: string;
}

@Component({
  selector: 'app-repair-queue',
  standalone: true,
  imports: [CommonModule, PageTitleComponent, NgIcon, ReactiveFormsModule, GenericPaginationComponent, SkeletonLoaderComponent],
  templateUrl: './repair-queue.component.html'
})
export class RepairQueueListComponent implements OnInit {
  isLoading = false;
  filterForm: FormGroup;
  
  rows: RepairQueueRow[] = [];
  tableHeaders: string[] = [];
  dataRows: Array<{ id: string; obj: any }> = [];

  PaginationInfo: any = { Page: 1, RowsPerPage: 10 };
  totalRecord = 0;

  // modal state
  repairVisible = false;
  selectedRow: RepairQueueRow | null = null;

  // agents dropdown
  agents: Array<{ id: string; name: string }> = [];

  constructor(private fb: FormBuilder, private agentService: AgentService, private disbursementService: DisbursementService, private router: Router, private auth: AuthService) {
    this.filterForm = this.fb.group({
      agentId: [''],
      xpin: [''],
      accountnumber: [''],
      date: [''],
      search: ['']
    });
  }

  ngOnInit(): void {
    this.loadAgents();
  }

  private loadAgents(): void {
    this.agentService.getAgents(1, 100).subscribe({
      next: (res) => {
        this.agents = (res.items || []).map(a => ({ id: String(a.id), name: a.name || '-' }));
      },
      error: () => {}
    });
  }

  onPageChanged(page: number): void {
    this.PaginationInfo.Page = page;
    const agentId = this.filterForm.get('agentId')?.value;
    if (agentId) {
      this.loadRepairData(agentId);
    }
  }

   onSearch(): void {
      console.log('Search button clicked');
      const formValues = this.filterForm.value;
      const agentId = formValues.agentId?.trim();
      console.log('Selected agent ID:', agentId);
      
      if (agentId) {
        this.PaginationInfo.Page = 1;
        const filters = {
          xpin: formValues.xpin?.trim() || undefined,
          accountNumber: formValues.accountnumber?.trim() || undefined,
          date: formValues.date || undefined,
          search: formValues.search?.trim() || undefined
        };
        this.loadRepairData(agentId, filters);
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

  onClearFilters(): void {
    // Reset form fields to defaults
    this.filterForm.reset({
      agentId: '',
      xpin: '',
      accountnumber: '',
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


private loadRepairData(agentId: string, filters?: { xpin?: string; accountNumber?: string; date?: string; search?: string }): void {

  this.isLoading = true;

  const pageNumber = this.PaginationInfo.Page;
  const pageSize = this.PaginationInfo.RowsPerPage;

  // 🔹 Filters (same as AML)
  const accountnumber = filters?.accountNumber || this.filterForm.get('accountnumber')?.value;
  const xpin = filters?.xpin || this.filterForm.get('xpin')?.value;
  const date = filters?.date || this.filterForm.get('date')?.value;
  const search = filters?.search || this.filterForm.get('search')?.value;

  this.disbursementService
    .getDataByRepair(
      agentId,
      pageNumber,
      pageSize,
      { accountNumber: accountnumber, xpin: xpin, date: date, search: search }
    )
    .subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.status === 'success' && response.items) {

          this.rows = this.mapRepairItems(response.items);

          // 🔹 Parse dataJson for dynamic headers
          const parsedObjects: any[] = response.items.map((item: DisbursementData) => {
            try { return JSON.parse(item.dataJson || '{}'); }
            catch { return {}; }
          });

          const headerSet = new Set<string>();
          parsedObjects.forEach(o =>
            Object.keys(o || {}).forEach(k => headerSet.add(k))
          );

          // 🔹 AgentName first column
          const headers = Array.from(headerSet);
          const idx = headers.indexOf('AgentName');
          if (idx === -1) headers.unshift('AgentName');
          else {
            headers.splice(idx, 1);
            headers.unshift('AgentName');
          }

          this.tableHeaders = headers;

          // 🔹 Rows mapping
          const agentMap = new Map(this.agents.map(a => [a.id, a.name]));
          this.dataRows = response.items.map((item: DisbursementData, i: number) => {
            const base = parsedObjects[i] || {};
            const agentName =
              agentMap.get(String(item.agentId)) ||
              `Agent-${String(item.agentId).substring(0, 8)}`;

            return {
              id: item.id,
              obj: { AgentName: agentName, ...base }
            };
          });

          this.totalRecord = response.totalCount;

        } else {
          this.rows = [];
          this.tableHeaders = [];
          this.dataRows = [];
          this.totalRecord = 0;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.rows = [];
        this.tableHeaders = [];
        this.dataRows = [];
        this.totalRecord = 0;
        console.error('Repair API error', err);
      }
    });
}


  private mapRepairItems(items: DisbursementData[]): RepairQueueRow[] {
    return items.map(item => {
      let data: any = {};
      try { data = JSON.parse(item.dataJson); } catch { data = {}; }
      const error = item.error || '';
      const remarks = error.toLowerCase().includes('invalid number') || error.toLowerCase().includes('invalid amount')
        ? 'Invalid Amount'
        : error.toLowerCase().includes('missing')
          ? 'Missing Info'
          : error.toLowerCase().includes('invalid date')
            ? 'Pending'
            : 'Pending';
      return {
        id: item.id,
        xpin: data.XPin || data.Xpin || data.xpin || data.XPIN ||'',
        agentName: `Agent-${item.agentId.substring(0, 8)}`,
        beneficiaryName: data.AccountNumber || 'N/A',
        amount: data.Amount ? `$${String(data.Amount).trim()}` : 'N/A',
        errorReason: error || '-',
        remarks,
        createdOn: item.createdOn,
      };
    });
  }

  repair(row: RepairQueueRow): void {
    this.repairVisible = false;
    this.selectedRow = null;
    this.router.navigate(['/repair-instruction'], { state: { row } });
  }

  closeRepair(): void {
    this.repairVisible = false;
    this.selectedRow = null;
  }

  saveRepair(): void {
    this.closeRepair();
  }

  viewDetails(row: RepairQueueRow): void {
    console.log('View details for RIN:', row.xpin);
    // Implement view details logic here
  }

  reject(row: RepairQueueRow): void {
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

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to reject XPin ${xpin}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, reject it',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (!result.isConfirmed) return;

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
            const agentId = this.filterForm.get('agentId')?.value;
            if (agentId) {
              this.loadRepairData(agentId);
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
    });
  }

  // wrappers for dynamic table actions
  private findRowById(id: string): RepairQueueRow | null {
    return this.rows.find(r => r.id === id) || null;
  }

  onRepair(id: string): void {
    const row = this.findRowById(id);
    if (row) this.repair(row);
  }

  onReject(id: string): void {
    const row = this.findRowById(id);
    if (row) this.reject(row);
  }
}
