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

interface QueueRow {
  id: string;
  xpin: string;
  agentName: string;
  beneficiaryName: string;
  amount: string;
  disbursementMode: string;
  status: 'Pending' | 'Completed' | 'On Hold' | string;
  transferMode: string;
  createdOn: string;
  error?: string;
}

type ModeOfTransfer = 'IBFT' | 'FT' | 'RTGS' | 'RAAST';

@Component({
  selector: 'app-disbursement-queue-list',
  standalone: true,
  imports: [CommonModule, PageTitleComponent, NgIcon, ReactiveFormsModule, GenericPaginationComponent, SkeletonLoaderComponent],
  templateUrl: './disbursement-queue-list.component.html',
  styleUrls: ['./disbursement-queue-list.component.css']
})
export class DisbursementQueueListComponent implements OnInit {
  isLoading = false;
  filterForm: FormGroup;
  rows: QueueRow[] = [];
  tableHeaders: string[] = [];
  dataRows: Array<{ id: string; obj: any; status: string }> = [];

  modeOfTransferByRowId: Record<string, ModeOfTransfer> = {};

  PaginationInfo: any = { Page: 1, RowsPerPage: 10 };
  totalRecord = 0;
 
  detailsVisible = false;
  selectedRow: QueueRow | null = null;
  detailsMode: 'view' | 'disburse' = 'view';
 
  selectedRows: Set<string> = new Set();
  selectAllChecked = false;
  topSelectAllChecked = false;  
  tableSelectAllChecked = false;  
  selectedModeOfTransfer: ModeOfTransfer | '' = '';
  selectAllAcrossPages = false;  
  allXPins: string[] = [];  
 
  agents: Array<{ id: string; name: string }> = [];
 
  limitType: string | number | null = null;

  constructor(private fb: FormBuilder, private agentService: AgentService, private disbursementService: DisbursementService, private auth: AuthService) {
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

  getModeOfTransfer(rowId: string): ModeOfTransfer {
    return this.modeOfTransferByRowId[rowId] ?? 'IBFT';
  }

  setModeOfTransfer(rowId: string, mode: string): void {
    const normalized = (mode || '').toUpperCase();
    const next: ModeOfTransfer = (normalized === 'FT' || normalized === 'RTGS' || normalized === 'IBFT' || normalized === 'RAAST')
      ? (normalized as ModeOfTransfer)
      : 'IBFT';
    this.modeOfTransferByRowId[rowId] = next;
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
      this.loadDisbursementData(agentId);
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

  const filters = {
    xpin: formValues.xpin?.trim() || undefined,
    accountNumber: formValues.accountnumber?.trim() || undefined,
    date: formValues.date || undefined
  };

  console.log('Searching with Agent:', agentId, 'Filters:', filters);

  this.PaginationInfo.Page = 1; 
  this.loadDisbursementData(agentId, filters);
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
private loadDisbursementData(
  agentId: string,
  filters: { xpin?: string; accountNumber?: string; date?: string } = {}
): void {
  console.log('Loading data for agent:', agentId, 'with filters:', filters);
  this.isLoading = true;

  const pageNumber = this.PaginationInfo.Page;
  const pageSize = this.PaginationInfo.RowsPerPage;

  this.disbursementService
    .getDataByAgent(agentId, pageNumber, pageSize, filters)
    .subscribe({
      next: (response) => {
        console.log('API response:', response);
        this.isLoading = false;

        if (response.status === 'success' && response.items) {
          this.rows = this.mapDisbursementDataToRows(response.items);
          
          this.limitType = response.limitType || null;

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

          this.dataRows = response.items.map((item: DisbursementData, idx: number) => {
            const obj = parsedObjects[idx] || {};
            const agentName = (this.agents.find(a => a.id?.toLowerCase() === item.agentId?.toLowerCase())?.name)
              || `Agent-${(item.agentId || '').substring(0, 8)}`;
            return {
              id: item.id,
              status: item.status === 'P' ? 'Pending' : (item.status || ''),
              obj: { AgentName: agentName, limitType: item.limitType, ...obj }
            };
          });

          this.dataRows.forEach(r => {
            if (!this.modeOfTransferByRowId[r.id]) {
              // Find the original item to get modeOfTransaction from item level
              const originalItem = response.items.find((item: DisbursementData) => item.id === r.id);
              let modeFromApi = originalItem?.modeOfTransaction || originalItem?.ModeOfTransaction;
              
              // Normalize the mode value to match our enum values
              let normalizedMode: ModeOfTransfer = 'IBFT';
              if (modeFromApi) {
                const upperMode = modeFromApi.toUpperCase();
                if (upperMode === 'FT' || upperMode === 'RTGS' || upperMode === 'IBFT' || upperMode === 'RAAST') {
                  normalizedMode = upperMode as ModeOfTransfer;
                }
              }
              
              this.modeOfTransferByRowId[r.id] = normalizedMode;
            }
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
        xpin: dataJson.XPin || dataJson.Xpin || dataJson.xpin || dataJson.XPIN ||'',
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
    const userId = this.auth.getUserId();
    const xpin = row?.xpin;
    const modeOfTransaction = this.getModeOfTransfer(row.id);

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
      title: 'Confirm Disbursement',
      html: `Are you sure you want to disburse this remittance?<br><br><strong>XPin:</strong> ${xpin}<br><strong>Mode:</strong> ${modeOfTransaction}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, disburse!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.disbursementService.remitApprove(userId, xpin, modeOfTransaction).subscribe({
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
                title: 'Disbursement Unauthorized',
                text: message,
                confirmButtonText: 'OK'
              });
            }
             
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

  reject(row: QueueRow): void {
    const userId = this.auth.getUserId();
    const xpin = row?.xpin;
    const modeOfTransaction = this.getModeOfTransfer(row.id);

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
    this.disbursementService.remitReject(userId, xpin, modeOfTransaction).subscribe({
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

  markAml(row: QueueRow): void {
  const userId = this.auth.getUserId();
  const xpin = row?.xpin;
  const modeOfTransaction = this.getModeOfTransfer(row.id);

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

  this.disbursementService.markAml(userId, xpin, modeOfTransaction).subscribe({
    next: (res) => {
      this.isLoading = false;

      if ((res?.status || '').toLowerCase() === 'success') {
        Swal.fire({
          icon: 'success',
          title: 'AML Hold',
          text: 'Remittance moved to AML successfully.'
        });

        // 🔄 Reload current screen
        const agentId = this.filterForm.get('agentId')?.value;
        if (agentId) {
          this.loadDisbursementData(agentId);
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: res?.errorMessage || 'Failed to move remittance to AML.'
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
      console.error('AML error', err);
    }
  });
}

  authorize(row: QueueRow): void {
    const userId = this.auth.getUserId();
    const xpin = row?.xpin;
    const modeOfTransaction = this.getModeOfTransfer(row.id);

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
      title: 'Confirm Authorization',
      html: `Are you sure you want to authorize this remittance?<br><br><strong>XPin:</strong> ${xpin}<br><strong>Mode:</strong> ${modeOfTransaction}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, authorize!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.disbursementService.remitAuthorize(userId, xpin, modeOfTransaction).subscribe({
          next: (res) => {
            this.isLoading = false;
            const status = res?.status;
            const message = res?.errorMessage || 'Authorization completed successfully';
            
            if (status === 'success') {
              Swal.fire({
                icon: 'success',
                title: 'Authorization Successful',
                text: message,
                confirmButtonText: 'OK'
              });
            } else {
              Swal.fire({
                icon: 'warning',
                title: 'Authorization Failed',
                text: message,
                confirmButtonText: 'OK'
              });
            }
             
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
            console.error('RemitAuthorize error', err);
          }
        });
      }
    });
  }
 
  private findRowById(id: string): QueueRow | null {
    return this.rows.find(r => r.id === id) || null;
  }

  onView(id: string): void {
    const row = this.findRowById(id);
    if (row) {
      row.transferMode = this.getModeOfTransfer(id);
      this.view(row);
    }
  }

  onDisburse(id: string): void {
    const row = this.findRowById(id);
    if (row) {
      row.transferMode = this.getModeOfTransfer(id);
      this.disburse(row);
    }
  }

  onReject(id: string): void {
    const row = this.findRowById(id);
    if (row) {
      row.transferMode = this.getModeOfTransfer(id);
      this.reject(row);
    }
  }
  
  onAml(id: string): void {
  const row = this.findRowById(id);
  if (row) {
    row.transferMode = this.getModeOfTransfer(id);
    this.markAml(row);
  }
}

  onAuthorize(id: string): void {
    const row = this.findRowById(id);
    if (row) {
      row.transferMode = this.getModeOfTransfer(id);
      this.authorize(row);
    }
  }
 
  onTopSelectAllChange(event: any): void {
    const isChecked = event.target.checked;
    this.topSelectAllChecked = isChecked;
    
    if (isChecked) { 
      this.selectAllAcrossPages = true;
      this.allXPins = []; 
      
      this.selectedRows.clear();
      this.dataRows.forEach(row => {
        this.selectedRows.add(row.id);
      });
       
      this.tableSelectAllChecked = false;
      
      Swal.fire({
        icon: 'success',
        title: 'All Records Selected',
        html: `Successfully selected <strong>all records</strong> across all pages.`,
        confirmButtonColor: '#667eea',
        timer: 2000,
        showConfirmButton: false
      });
    } else { 
      this.selectedRows.clear();
      this.selectAllAcrossPages = false;
      this.allXPins = [];
      this.tableSelectAllChecked = false;
    }
  }

  onTableSelectAllChange(event: any): void {
    const isChecked = event.target.checked;
    this.tableSelectAllChecked = isChecked;
    
    if (isChecked) { 
      this.selectAllAcrossPages = false;
      this.allXPins = [];
       
      this.selectedRows.clear();
      this.dataRows.forEach(row => {
        this.selectedRows.add(row.id);
      }); 
      this.topSelectAllChecked = false;
    } else { 
      this.selectedRows.clear();
      this.selectAllAcrossPages = false;
      this.allXPins = [];
      this.topSelectAllChecked = false;
    }
  }

  private selectAllCurrentPage(): void {
    this.selectedRows.clear();
    this.selectAllAcrossPages = false;
    this.allXPins = [];
    
    this.dataRows.forEach(row => {
      this.selectedRows.add(row.id);
    });
  }

  private selectAllAcrossAllPages(): void {
    // Directly set selection state without API call
    this.selectAllAcrossPages = true;
    this.allXPins = []; // Empty array for select all mode
    
    // Select current page rows for UI display
    this.selectedRows.clear();
    this.dataRows.forEach(row => {
      this.selectedRows.add(row.id);
    });
    
    Swal.fire({
      icon: 'success',
      title: 'All Records Selected',
      html: `Successfully selected <strong>all records</strong> across all pages.`,
      confirmButtonColor: '#667eea',
      timer: 2000,
      showConfirmButton: false
    });
  }

  onRowSelectChange(rowId: string, event: any): void {
    const isChecked = event.target.checked;
    
    if (this.selectAllAcrossPages) {
      // If we're in "select all across pages" mode, deselecting a row should switch to individual selection mode
      if (!isChecked) {
        this.selectAllAcrossPages = false;
        this.allXPins = [];
        this.topSelectAllChecked = false;
        // Don't add the clicked row since user is deselecting it
        return;
      }
    }
    
    if (isChecked) {
      this.selectedRows.add(rowId);
    } else {
      this.selectedRows.delete(rowId);
    }
    
    // Update checkbox states based on selection
    const allCurrentPageSelected = this.selectedRows.size === this.dataRows.length && this.dataRows.length > 0;
    this.tableSelectAllChecked = allCurrentPageSelected;
    
    // If no rows selected, uncheck both select all checkboxes
    if (this.selectedRows.size === 0) {
      this.topSelectAllChecked = false;
      this.tableSelectAllChecked = false;
    }
  }

  isRowSelected(rowId: string): boolean {
    return this.selectedRows.has(rowId);
  }

  onModeOfTransferChange(event: any): void {
    this.selectedModeOfTransfer = event.target.value as ModeOfTransfer;
  }

  canBulkApprove(): boolean {
    return this.selectedRows.size > 0 && this.selectedModeOfTransfer !== '';
  }

  onBulkApprove(): void {
    if (!this.canBulkApprove()) {
      Swal.fire({
        icon: 'warning',
        title: 'Selection Required',
        text: 'Please select at least one record and choose a mode of transfer.',
        confirmButtonColor: '#667eea'
      });
      return;
    }

    let selectedXPins: string[] = [];
    let isTrue = false;
    
    if (this.selectAllAcrossPages) {
      // When select all across pages is used, send isTrue: true and no XPINs
      selectedXPins = [];
      isTrue = true;
    } else {
      // Extract XPINs from selected rows (current page only)
      selectedXPins = Array.from(this.selectedRows).map(rowId => {
        const row = this.dataRows.find(r => r.id === rowId);
        console.log('Row data for XPIN extraction:', row);
        console.log('Available properties:', row ? Object.keys(row) : 'Row not found');
        console.log('obj properties:', row?.obj ? Object.keys(row.obj) : 'obj not found');
        
        // Try different possible XPIN field names
        const xpin = row?.obj?.xpin || 
                     row?.obj?.['XPIN'] || 
                     row?.obj?.['xPin'] || 
                     (row as any)?.xpin || 
                     (row as any)?.['XPIN'] ||
                     (row as any)?.['xPin'];
        
        console.log('Extracted XPIN:', xpin);
        return xpin || rowId; // Fallback to rowId only if absolutely necessary
      });
      isTrue = false;
    }

    const selectionScope = this.selectAllAcrossPages ? 'all records across all pages' : 'selected records';
    
    Swal.fire({
      title: 'Confirm Bulk Approval',
      html: `Are you sure you want to approve <strong>${selectedXPins.length}</strong> records (${selectionScope}) using <strong>${this.selectedModeOfTransfer}</strong>?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#dc3545',
      confirmButtonText: 'Yes, Approve!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        
        const bulkApproveRequest = {
          xpins: selectedXPins,
          userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6', // TODO: Get from auth service
          modeOfTransaction: this.selectedModeOfTransfer,
          agentId: this.filterForm.get('agentId')?.value || '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          status: 'P',
          isTrue: isTrue
        };

        this.disbursementService.bulkApprove(bulkApproveRequest).subscribe({
          next: (response: any) => {
            this.isLoading = false;
            this.selectedRows.clear();
            this.selectAllChecked = false;
            
            const approvedCount = isTrue ? 'all records' : selectedXPins.length;
            
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: `Successfully approved ${approvedCount} records.`,
              confirmButtonColor: '#667eea'
            }).then(() => {
              // Refresh the data
              this.onSearch();
            });
          },
          error: (error: any) => {
            this.isLoading = false;
            console.error('Bulk approve failed:', error);
            
            Swal.fire({
              icon: 'error',
              title: 'Approval Failed',
              text: error.error?.message || 'Failed to approve records. Please try again.',
              confirmButtonColor: '#667eea'
            });
          }
        });
      }
    });
  }
}
