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
  rin: string;
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
    const agentId = this.filterForm.get('agentId')?.value;
    if (!agentId) {
      Swal.fire({
        icon: 'warning',
        title: 'Agent required',
        text: 'Please select the Agent first',
        confirmButtonText: 'OK'
      });
      return;
    }
    this.PaginationInfo.Page = 1;
    this.loadRepairData(agentId);
  }

  private loadRepairData(agentId: string): void {
    this.isLoading = true;
    const pageNumber = this.PaginationInfo.Page;
    const pageSize = this.PaginationInfo.RowsPerPage;
    this.disbursementService.getDataByRepair(agentId, pageNumber, pageSize).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status === 'success' && response.items) {
          this.rows = this.mapRepairItems(response.items);
          this.totalRecord = response.totalCount;
        } else {
          this.rows = [];
          this.totalRecord = 0;
        }
      },
      error: () => {
        this.isLoading = false;
        this.rows = [];
        this.totalRecord = 0;
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
        rin: String(data.XPin || `Row-${item.rowNumber}`),
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
    console.log('Repair clicked for RIN:', row.rin);
    this.router.navigate(['/repair-instruction'], { state: { row } });
  }

  closeRepair(): void {
    this.repairVisible = false;
    this.selectedRow = null;
  }

  saveRepair(): void {
    console.log('Saving repair for RIN:', this.selectedRow?.rin);
    // Implement save logic here
    this.closeRepair();
  }

  viewDetails(row: RepairQueueRow): void {
    console.log('View details for RIN:', row.rin);
    // Implement view details logic here
  }

  deleteItem(row: RepairQueueRow): void {
    if (confirm(`Are you sure you want to reject RIN ${row.rin}?`)) {
      console.log('Reject clicked for RIN:', row.rin);
      // Implement delete logic here
    }
  }
}
