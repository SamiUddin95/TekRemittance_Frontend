import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageTitleComponent } from '@app/components/page-title.component';
import { NgIcon } from '@ng-icons/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { GenericPaginationComponent } from '@/app/shared/generic-pagination/generic-pagination/generic-pagination.component';
import { SkeletonLoaderComponent } from '@/app/shared/skeleton/skeleton-loader.component';
import { AgentService } from '@/app/views/acquisition-management/services/agent.service';
import { DisbursementService, DisbursementData } from '../services/disbursement.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-coc-payout-inquiry',
  standalone: true,
  imports: [
    CommonModule,
    PageTitleComponent,
    NgIcon,
    ReactiveFormsModule,
    GenericPaginationComponent,
    SkeletonLoaderComponent
  ],
  templateUrl: './coc-payout-inquiry.component.html'
})
export class CocPayoutInquiryComponent implements OnInit {
  isLoading = false;
  filterForm: FormGroup;
  rows: DisbursementData[] = [];
  tableHeaders: string[] = [];
  dataRows: Array<{ id: string; obj: any }> = [];

  PaginationInfo: any = { Page: 1, RowsPerPage: 10 };
  totalRecord = 0;

  agents: Array<{ id: string; name: string }> = [];

  constructor(
    private fb: FormBuilder,
    private disbursementService: DisbursementService,
    private agentService: AgentService
  ) {
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

  onSearch(): void {
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

    const filters = {
      xpin: formValues.xpin?.trim() || undefined,
      accountNumber: formValues.accountnumber?.trim() || undefined,
      date: formValues.date || undefined
    };

    this.PaginationInfo.Page = 1;
    this.loadData(agentId, filters);
  }

  onClearFilters(): void {
    this.filterForm.reset({
      agentId: '',
      xpin: '',
      accountnumber: '',
      date: ''
    });
    this.PaginationInfo.Page = 1;
    this.rows = [];
    this.tableHeaders = [];
    this.dataRows = [];
    this.totalRecord = 0;
  }

  onPageChanged(page: number): void {
    this.PaginationInfo.Page = page;
    const agentId = this.filterForm.get('agentId')?.value;
    if (agentId) {
      const filters = {
        xpin: this.filterForm.get('xpin')?.value?.trim() || undefined,
        accountNumber: this.filterForm.get('accountnumber')?.value?.trim() || undefined,
        date: this.filterForm.get('date')?.value || undefined
      };
      this.loadData(agentId, filters);
    }
  }

  private loadData(
    agentId: string,
    filters: { accountNumber?: string; xpin?: string; date?: string } = {}
  ): void {
    this.isLoading = true;
    const pageNumber = this.PaginationInfo.Page;
    const pageSize = this.PaginationInfo.RowsPerPage;

    this.disbursementService
      .getCOCPayout(agentId, pageNumber, pageSize, filters)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response?.status === 'success' && response.items?.length) {
            this.rows = response.items;

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
                || (item as any).agentName
                || `Agent-${(item.agentId || '').substring(0, 8)}`;
              return { id: item.id, obj: { AgentName: agentName, ...obj } };
            });

            this.totalRecord = response.totalCount || 0;
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
          console.error('COCPayout API error', err);
        }
      });
  }
}
