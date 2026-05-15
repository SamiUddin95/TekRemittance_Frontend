import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageTitleComponent } from '@app/components/page-title.component';
import { NgIcon } from '@ng-icons/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { GenericPaginationComponent } from '@/app/shared/generic-pagination/generic-pagination/generic-pagination.component';
import { SkeletonLoaderComponent } from '@/app/shared/skeleton/skeleton-loader.component';
import {
  InternalBankAccountsService,
  InternalBankAccountData
} from '../services/internal-bank-accounts.service';
import { AgentService } from '@/app/views/acquisition-management/services/agent.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-internal-bank-accounts',
  standalone: true,
  imports: [
    CommonModule,
    PageTitleComponent,
    NgIcon,
    ReactiveFormsModule,
    GenericPaginationComponent,
    SkeletonLoaderComponent
  ],
  templateUrl: './internal-bank-accounts.component.html'
})
export class InternalBankAccountsComponent implements OnInit {
  isLoading = false;
  filterForm: FormGroup;
  rows: InternalBankAccountData[] = [];
  tableHeaders: string[] = [];
  dataRows: Array<{ id: string; obj: any }> = [];

  PaginationInfo: any = { Page: 1, RowsPerPage: 10 };
  totalRecord = 0;

  // agents dropdown
  agents: Array<{ id: string; name: string }> = [];

  constructor(
    private fb: FormBuilder,
    private internalBankAccountsService: InternalBankAccountsService,
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
      accountnumber: formValues.accountnumber?.trim() || undefined,
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
        accountnumber: this.filterForm.get('accountnumber')?.value?.trim() || undefined,
        date: this.filterForm.get('date')?.value || undefined
      };
      this.loadData(agentId, filters);
    }
  }

  private loadData(
    agentId: string,
    filters: { accountnumber?: string; xpin?: string; date?: string } = {}
  ): void {
    this.isLoading = true;
    const pageNumber = this.PaginationInfo.Page;
    const pageSize = this.PaginationInfo.RowsPerPage;

    this.internalBankAccountsService
      .getInternalBankAccounts(agentId, pageNumber, pageSize, filters)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response?.status === 'success' && response.data?.items) {
            this.rows = response.data.items;

            // Dynamic headers from dataJson
            const parsedObjects: any[] = response.data.items.map((item: InternalBankAccountData) => {
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
            this.dataRows = response.data.items.map((item: InternalBankAccountData, idx: number) => {
              const obj = parsedObjects[idx] || {};
              const agentName = (this.agents.find(a => a.id?.toLowerCase() === item.agentId?.toLowerCase())?.name)
                || item.agentName || `Agent-${(item.agentId || '').substring(0, 8)}`;
              return { id: item.id, obj: { AgentName: agentName, ...obj } };
            });

            this.totalRecord = response.data.totalCount || 0;
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
          console.error('InternalBankAccounts API error', err);
        }
      });
  }

  getStatusLabel(status: string): string {
    switch ((status || '').toUpperCase()) {
      case 'A': return 'Active';
      case 'U': return 'Unverified';
      case 'R': return 'Rejected';
      case 'P': return 'Pending';
      default: return status || '-';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch ((status || '').toUpperCase()) {
      case 'A': return 'bg-success';
      case 'U': return 'bg-warning';
      case 'R': return 'bg-danger';
      case 'P': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  formatDisplayDate(value: string): string {
    if (!value) return '-';
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) return value;
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const mi = String(d.getMinutes()).padStart(2, '0');
      return `${dd}-${mm}-${yyyy} ${hh}:${mi}`;
    } catch {
      return value;
    }
  }

  // EPRC modal state
  eprcModalVisible = false;
  selectedEprcData: any = null;

  onGenerateEprc(id: string): void {
    const row = this.rows.find(r => r.id === id);
    const dataRow = this.dataRows.find(r => r.id === id);
    if (!row && !dataRow) return;

    const obj = dataRow?.obj || {};

    // Hardcoded e-PRC data (mirroring sample format)
    this.selectedEprcData = {
      eprcNo: 'ABPL-' + (id?.substring(0, 6).toUpperCase() || 'XXXXXX') + '-100506',
      eprcDate: 'Apr 28, 2026',
      // Remitter
      remitterName: 'R AHMAD',
      remitterIdType: 'NICOP / CNIC / Passport No. / POC / Entity Registration No. / Any other Unique ID',
      remitterIdValue: 'Not Available',
      remitterIban: 'PK98ALFH4000217604350',
      remittingInstitution: 'Not Available',
      remitterCountry: 'UK',
      remitterCountryCode: '2090',
      // Beneficiary
      beneficiaryName: obj['AccountTitle'] || 'C******LAH',
      beneficiaryIdType: 'NICOP / CNIC / POC / Passport No. / NTN',
      beneficiaryIdValue: '****71319577',
      beneficiaryIban: obj['AccountNo'] ? ('PK****' + obj['AccountNo']) : 'PK****0010269964 15',
      beneficiaryBank: 'AL Baraka Bank (Pakistan) Limited',
      // Transaction
      realizationDate: 'Nov 30, 2025',
      totalProceedsFcy: 'Not Applicable',
      fcyRetained: 'Not Applicable',
      amountInFcy: 'Not Available',
      rateOfConversion: 'Not Applicable',
      amountInPkr: (obj['Amount'] ? Number(obj['Amount']).toFixed(2) : '982.00'),
      purposeOfRemittance: 'Home Remittance',
      purposeCode: '9471',
      transactionRefNo: '541374'
    };

    this.eprcModalVisible = true;
  }

  closeEprcModal(): void {
    this.eprcModalVisible = false;
    this.selectedEprcData = null;
  }

  downloadEprc(): void {
    const content = document.getElementById('eprc-certificate-content');
    if (!content) return;

    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (!printWindow) return;

    const styles = `
      <style>
        * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; margin: 0; padding: 24px; color: #1f2937; background: #fff; }
        .eprc-wrapper { max-width: 800px; margin: 0 auto; }
        .eprc-bank-name { text-align: center; font-weight: 600; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; color: #0f766e; margin-bottom: 6px; }
        .eprc-title { text-align: center; font-weight: 700; font-size: 15px; background: linear-gradient(90deg, #0f766e 0%, #14b8a6 100%); color: #fff; padding: 10px; border-radius: 4px; letter-spacing: 0.5px; margin-bottom: 12px; }
        .eprc-tagline { font-size: 10px; color: #64748b; font-style: italic; }
        table.eprc-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 11px; color: #1f2937; margin-bottom: 12px; border: 1px solid #cbd5e1; border-radius: 4px; overflow: hidden; }
        table.eprc-table td, table.eprc-table th { border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 7px 9px; vertical-align: top; }
        table.eprc-table tr:last-child td { border-bottom: none; }
        table.eprc-table td:last-child { border-right: none; }
        table.eprc-meta-table { border: none; margin-bottom: 8px; }
        table.eprc-meta-table td { border: none; padding: 4px 8px; }
        .eprc-section-header td { background: #0f766e; color: #fff; font-weight: 700; font-size: 11px; letter-spacing: 0.6px; text-transform: uppercase; padding: 8px 10px; }
        .eprc-label { width: 25%; font-weight: 600; color: #475569; background: #f8fafc; }
        .eprc-subhead { background-color: #ecfdf5; color: #065f46; font-weight: 700; text-align: center; font-size: 10px; text-transform: uppercase; letter-spacing: 0.4px; }
        .eprc-statement { font-size: 10px; color: #475569; background: #f8fafc; font-style: italic; }
        .eprc-note { font-size: 10px; font-style: italic; margin-top: 6px; color: #64748b; }
        .eprc-footer-list { padding-left: 18px; margin: 0; }
        .eprc-footer-list li { margin-bottom: 4px; }
        @media print { body { padding: 0; } }
      </style>
    `;

    printWindow.document.write(`
      <html>
        <head>
          <title>e-PRC Certificate</title>
          ${styles}
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  }
}
