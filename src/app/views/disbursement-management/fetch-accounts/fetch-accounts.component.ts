import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageTitleComponent } from '@app/components/page-title.component';
import { NgIcon } from '@ng-icons/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { GenericPaginationComponent } from '@/app/shared/generic-pagination/generic-pagination/generic-pagination.component';
import { AgentService } from '@/app/views/acquisition-management/services/agent.service';
import { FetchAccountsService, FetchAccountsData } from '../services/fetch-accounts.service';
import { SkeletonLoaderComponent } from '@/app/shared/skeleton/skeleton-loader.component';

interface FetchAccountRow {
  id: string;
  accountNumber: string;
  accountTitle: string;
  bankName: string;
  branchCode: string;
  status: 'Pending' | 'Verified' | 'Failed' | string;
  verificationDate: string;
  error?: string;
}

@Component({
  selector: 'app-fetch-accounts',
  standalone: true,
  imports: [CommonModule, PageTitleComponent, NgIcon, ReactiveFormsModule, GenericPaginationComponent, SkeletonLoaderComponent],
  templateUrl: './fetch-accounts.component.html'
})
export class FetchAccountsComponent implements OnInit {
  isLoading = false;
  filterForm: FormGroup;
  rows: FetchAccountRow[] = [];
  tableHeaders: string[] = [];
  dataRows: Array<{ id: string; obj: any }> = [];

  PaginationInfo: any = { Page: 1, RowsPerPage: 10 };
  totalRecord = 0;

  // details modal state
  detailsVisible = false;
  selectedRow: FetchAccountRow | null = null;

  // agents dropdown
  agents: Array<{ id: string; name: string }> = [];

  constructor(private fb: FormBuilder, private agentService: AgentService, private fetchAccountsService: FetchAccountsService) {
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
      error: () => { /* ignore for now */ }
    });
  }

  onPageChanged(page: number): void {
    this.PaginationInfo.Page = page;
    const agentId = this.filterForm.get('agentId')?.value;
    if (agentId) {
      this.loadFetchAccountsData(agentId);
    }
  }

  onSearch(): void {
    console.log('Search button clicked');
    const agentId = this.filterForm.get('agentId')?.value;
    console.log('Selected agent ID:', agentId);
    
    if (agentId) {
      this.PaginationInfo.Page = 1; // Reset to first page for new search
      this.loadFetchAccountsData(agentId);
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
      status: '',
      dateFrom: '',
      dateTo: '',
      search: ''
    });

    // Reset pagination and table state
    this.PaginationInfo.Page = 1;
    this.rows = [];
    this.tableHeaders = [];
    this.dataRows = [];
    this.totalRecord = 0;
  }

  private loadFetchAccountsData(agentId: string): void {
    console.log('Loading fetch accounts data for agent:', agentId);
    this.isLoading = true;
    const pageNumber = this.PaginationInfo.Page;
    const pageSize = this.PaginationInfo.RowsPerPage;
    
    console.log('Making API call with params:', { agentId, pageNumber, pageSize });
    
    this.fetchAccountsService.getDataByAgent(agentId, pageNumber, pageSize).subscribe({
      next: (response) => {
        console.log('API response received:', response);
        this.isLoading = false;
        if (response.status === 'success' && response.items) {
          this.rows = this.mapFetchAccountsDataToRows(response.items);
          // Build dynamic headers from dataJson keys
          const parsedObjects: any[] = response.items.map((item: FetchAccountsData) => {
            try { return JSON.parse(item.dataJson || '{}'); } catch { return {}; }
          });
          const headerSet = new Set<string>();
          parsedObjects.forEach(o => Object.keys(o || {}).forEach(k => headerSet.add(k)));
          // ensure AgentName appears as a dynamic column (if not already in dataJson)
          const headersArr = Array.from(headerSet);
          if (!headersArr.includes('AgentName')) {
            headersArr.unshift('AgentName');
          }
          this.tableHeaders = headersArr;
          // Build renderable data rows preserving id and status for actions
          this.dataRows = response.items.map((item: FetchAccountsData, idx: number) => {
            const obj = parsedObjects[idx] || {};
            // add AgentName field
            const agentName = (this.agents.find(a => a.id?.toLowerCase() === item.agentId?.toLowerCase())?.name)
              || `Agent-${(item.agentId || '').substring(0, 8)}`;
            return {
              id: item.id,
              obj: { AgentName: agentName, ...obj }
            };
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

  private mapFetchAccountsDataToRows(items: FetchAccountsData[]): FetchAccountRow[] {
    return items.map(item => {
      let dataJson: any = {};
      try {
        dataJson = JSON.parse(item.dataJson || '{}');
      } catch (e) {
        dataJson = {};
      }

      return {
        id: item.id,
        accountNumber: dataJson['Account Number'] || 'N/A',
        accountTitle: dataJson['Account Title'] || 'N/A',
        bankName: dataJson['Bank Name'] || 'N/A',
        branchCode: dataJson['Branch Code'] || 'N/A',
        status: item.status || 'Pending',
        verificationDate: dataJson['Verification Date'] || '-',
        error: item.error
      };
    });
  }

  view(row: FetchAccountRow): void {
    this.selectedRow = row;
    this.detailsVisible = true;
  }

  closeDetails(): void {
    this.detailsVisible = false;
  }

  verify(row: FetchAccountRow): void {
    this.fetchAccountsService.verifyAccount(row.id).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          Swal.fire({
            icon: 'success',
            title: 'Account Verified',
            text: `Account ${row.accountNumber} has been verified successfully`,
            confirmButtonText: 'OK'
          }).then(() => {
            // Update the status in the data
            row.status = 'Verified';
            row.verificationDate = new Date().toISOString().split('T')[0];
          });
        }
      },
      error: (error) => {
        console.error('Verify error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Verification Failed',
          text: 'Failed to verify account. Please try again.',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  reject(row: FetchAccountRow): void {
    this.fetchAccountsService.rejectAccount(row.id).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          Swal.fire({
            icon: 'warning',
            title: 'Account Rejected',
            text: `Account ${row.accountNumber} has been rejected`,
            confirmButtonText: 'OK'
          }).then(() => {
            // Update the status in the data
            row.status = 'Failed';
            row.verificationDate = new Date().toISOString().split('T')[0];
          });
        }
      },
      error: (error) => {
        console.error('Reject error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Rejection Failed',
          text: 'Failed to reject account. Please try again.',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  // wrappers for dynamic table actions
  private findRowById(id: string): FetchAccountRow | null {
    return this.rows.find(r => r.id === id) || null;
  }

  onView(id: string): void {
    const row = this.findRowById(id);
    if (row) this.view(row);
  }

  onVerify(id: string): void {
    const row = this.findRowById(id);
    if (row) this.verify(row);
  }

  onReject(id: string): void {
    const row = this.findRowById(id);
    if (row) this.reject(row);
  }
}
