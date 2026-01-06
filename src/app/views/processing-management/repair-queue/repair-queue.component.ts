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

  constructor(private fb: FormBuilder, private agentService: AgentService, private disbursementService: DisbursementService, private router: Router) {
    this.filterForm = this.fb.group({
      agentId: [''],
      xpin: [''],
      accountnumber: [''],
      date: ['']
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
      const agentId = this.filterForm.get('agentId')?.value;
      console.log('Selected agent ID:', agentId);
      
      if (agentId) {
        this.PaginationInfo.Page = 1; 
        this.loadRepairData(agentId);
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
      date: ''
    });

    // Reset pagination and table state
    this.PaginationInfo.Page = 1;
    this.rows = [];
    this.tableHeaders = [];
    this.dataRows = [];
    this.totalRecord = 0;
  }


private loadRepairData(agentId: string): void {

  this.isLoading = true;

  const pageNumber = this.PaginationInfo.Page;
  const pageSize = this.PaginationInfo.RowsPerPage;

  // 🔹 Filters (same as AML)
  const accountnumber = this.filterForm.get('accountnumber')?.value;
  const xpin = this.filterForm.get('xpin')?.value;
  const date = this.filterForm.get('date')?.value;

  this.disbursementService
    .getDataByRepair(
      agentId,
      pageNumber,
      pageSize,
      { accountNumber: accountnumber, xpin: xpin, date: date }
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
    console.log('Repair clicked for RIN:', row.xpin);
    this.router.navigate(['/repair-instruction'], { state: { row } });
  }

  closeRepair(): void {
    this.repairVisible = false;
    this.selectedRow = null;
  }

  saveRepair(): void {
    console.log('Saving repair for RIN:', this.selectedRow?.xpin);
    // Implement save logic here
    this.closeRepair();
  }

  viewDetails(row: RepairQueueRow): void {
    console.log('View details for RIN:', row.xpin);
    // Implement view details logic here
  }

  deleteItem(row: RepairQueueRow): void {
    if (confirm(`Are you sure you want to reject RIN ${row.xpin}?`)) {
      console.log('Reject clicked for RIN:', row.xpin);
      // Implement delete logic here
    }
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
    if (row) this.deleteItem(row);
  }
}
