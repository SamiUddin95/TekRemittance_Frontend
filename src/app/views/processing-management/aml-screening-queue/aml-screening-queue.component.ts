import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageTitleComponent } from '@app/components/page-title.component';
import { NgIcon } from '@ng-icons/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { GenericPaginationComponent } from '@/app/shared/generic-pagination/generic-pagination/generic-pagination.component';
import { AgentService } from '@/app/views/acquisition-management/services/agent.service';
import { AmlScreeningService, AmlScreeningData } from '../services/aml-screening.service';
import { SkeletonLoaderComponent } from '@/app/shared/skeleton/skeleton-loader.component';
import { AuthService } from '@/app/core/services/auth.service';

interface AmlScreeningRow {
  id: string;
  accountNumber: string;
  accountTitle: string;
  bankName: string;
  branchCode: string;
  status: 'Pending' | 'Pass' | 'Fail' | 'Review' | string;
  screeningDate: string;
  hitCount: number;
  riskLevel: 'Low' | 'Medium' | 'High' | string;
  remarks: string;
  error?: string;
}

@Component({
  selector: 'app-aml-screening-queue',
  standalone: true,
  imports: [CommonModule, PageTitleComponent, NgIcon, ReactiveFormsModule, GenericPaginationComponent, SkeletonLoaderComponent],
  templateUrl: './aml-screening-queue.component.html'
})
export class AmlScreeningQueueComponent implements OnInit {
  isLoading = false;
  filterForm: FormGroup;
  rows: AmlScreeningRow[] = [];
  tableHeaders: string[] = [];
  dataRows: Array<{ id: string; obj: any }> = [];

  PaginationInfo: any = { Page: 1, RowsPerPage: 10 };
  totalRecord = 0;

  // details modal state
  detailsVisible = false;
  selectedRow: AmlScreeningRow | null = null;

  // agents dropdown
  agents: Array<{ id: string; name: string }> = [];

  constructor(private fb: FormBuilder, private agentService: AgentService, private amlScreeningService: AmlScreeningService, private auth: AuthService) {
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
      error: () => { /* ignore for now */ }
    });
  }

  onPageChanged(page: number): void {
    this.PaginationInfo.Page = page;
    const agentId = this.filterForm.get('agentId')?.value;
    if (agentId) {
      this.loadAmlScreeningData(agentId);
    }
  }

  onSearch(): void {
    console.log('Search button clicked');
    const agentId = this.filterForm.get('agentId')?.value;
    console.log('Selected agent ID:', agentId);
    
    if (agentId) {
      this.PaginationInfo.Page = 1; // Reset to first page for new search
      this.loadAmlScreeningData(agentId);
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

  // private loadAmlScreeningData(agentId: string): void {
  //   console.log('Loading AML screening data for agent:', agentId);
  //   this.isLoading = true;
  //   const pageNumber = this.PaginationInfo.Page;
  //   const pageSize = this.PaginationInfo.RowsPerPage;
    
  //   console.log('Making API call with params:', { agentId, pageNumber, pageSize });
    
  //   this.amlScreeningService.getDataByAgent(agentId, pageNumber, pageSize).subscribe({
  //     next: (response: any) => {
  //       console.log('API response received:', response);
  //       this.isLoading = false;
  //       if (response.status === 'success' && response.items)
  //          {
  //         this.rows = this.mapAmlScreeningDataToRows(response.items);
  //         // Build dynamic headers from dataJson keys
  //         const parsedObjects: any[] = response.items.map((item: AmlScreeningData) => {
  //           try { return JSON.parse(item.dataJson || '{}'); } catch { return {}; }
  //         });
  //         const headerSet = new Set<string>();
  //         parsedObjects.forEach(o => Object.keys(o || {}).forEach(k => headerSet.add(k)));
  //         // ensure AgentName appears as a dynamic column (if not already in dataJson)
  //         const headersArr = Array.from(headerSet);
  //         if (!headersArr.includes('AgentName')) {
  //           headersArr.unshift('AgentName');
  //         }
  //         this.tableHeaders = headersArr;
  //         // Build renderable data rows preserving id and status for actions
  //         this.dataRows = response.items.map((item: AmlScreeningData, idx: number) => {
  //           const obj = parsedObjects[idx] || {};
  //           // add AgentName field
  //           const agentName = (this.agents.find(a => a.id?.toLowerCase() === item.agentId?.toLowerCase())?.name)
  //             || `Agent-${(item.agentId || '').substring(0, 8)}`;
  //           return {
  //             id: item.id,
  //             obj: { AgentName: agentName, ...obj }
  //           };
  //         });
  //         this.totalRecord = response.totalCount;
  //         console.log('Dynamic headers:', this.tableHeaders);
  //       } else {
  //         this.rows = [];
  //         this.tableHeaders = [];
  //         this.dataRows = [];
  //         this.totalRecord = 0;
  //       }
  //     },
  //     error: (error: any) => {
  //       console.error('API error:', error);
  //       this.isLoading = false;
  //       this.rows = [];
  //       this.tableHeaders = [];
  //       this.dataRows = [];
  //       this.totalRecord = 0;
  //     }
  //   });
  // }

private loadAmlScreeningData(agentId: string): void {

  this.isLoading = true;

  const pageNumber = this.PaginationInfo.Page;
  const pageSize = this.PaginationInfo.RowsPerPage;

  const accountnumber = this.filterForm.get('accountnumber')?.value;
  const xpin = this.filterForm.get('xpin')?.value;
  const date = this.filterForm.get('date')?.value;

  this.amlScreeningService
    .getDataByAgent(agentId, pageNumber, pageSize, accountnumber, xpin, date)
    .subscribe({
      next: (response: any) => {

        this.isLoading = false;

       
        if (response.status === 'success' && response.data?.items) {

          const items = response.data.items;

          this.rows = this.mapAmlScreeningDataToRows(items);

          const parsedObjects = items.map((item: AmlScreeningData) => {
            try { 
              return JSON.parse(item.dataJson || '{}'); 
            } catch { 
              return {}; 
            }
          });

          const headerSet = new Set<string>();
          parsedObjects.forEach((o:any) =>
            Object.keys(o).forEach(k => headerSet.add(k))
          );

          this.tableHeaders = Array.from(headerSet);

          this.dataRows = items.map((item: AmlScreeningData, idx: number) => ({
            id: item.id,
            obj: parsedObjects[idx]
          }));

          this.totalRecord = response.data.totalCount;

        } else {
          // no data case
          this.rows = [];
          this.dataRows = [];
          this.tableHeaders = [];
          this.totalRecord = 0;
        }
        
      },

      error: (err) => {
        this.isLoading = false;
        this.rows = [];
        this.dataRows = [];
        this.tableHeaders = [];
        this.totalRecord = 0;
        console.error('AML API error', err);
      }
    });
}


  private mapAmlScreeningDataToRows(items: AmlScreeningData[]): AmlScreeningRow[] {
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
        screeningDate: dataJson['Screening Date'] || new Date().toISOString().split('T')[0],
        hitCount: dataJson['Hit Count'] || 0,
        riskLevel: dataJson['Risk Level'] || 'Low',
        remarks: dataJson['Remarks'] || '',
        error: item.error
      };
    });
  }

  view(row: AmlScreeningRow): void {
    this.selectedRow = row;
    this.detailsVisible = true;
  }

  closeDetails(): void {
    this.detailsVisible = false;
  }

  approve(row: AmlScreeningRow): void {
    this.amlScreeningService.approveScreening(row.id).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          Swal.fire({
            icon: 'success',
            title: 'Screening Approved',
            text: `AML screening for account ${row.accountNumber} has been approved`,
            confirmButtonText: 'OK'
          }).then(() => {
            // Update the status in the data
            row.status = 'Pass';
          });
        }
      },
      error: (error: any) => {
        console.error('Approve error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Approval Failed',
          text: 'Failed to approve screening. Please try again.',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  reject(row: AmlScreeningRow): void {
    this.amlScreeningService.rejectScreening(row.id).subscribe({
      next: (response: any ) => {
        if (response.status === 'success') {
          Swal.fire({
            icon: 'warning',
            title: 'Screening Rejected',
            text: `AML screening for account ${row.accountNumber} has been rejected`,
            confirmButtonText: 'OK'
          }).then(() => {
            // Update the status in the data
            row.status = 'Fail';
          });
        }
      },
      error: (error: any) => {
        console.error('Reject error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Rejection Failed',
          text: 'Failed to reject screening. Please try again.',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  // wrappers for dynamic table actions
  private findRowById(id: string): AmlScreeningRow | null {
    return this.rows.find(r => r.id === id) || null;
  }

  onView(id: string): void {
    const row = this.findRowById(id);
    if (row) this.view(row);
  }

  onApprove(id: string): void {
    const row = this.findRowById(id);
    if (row) this.approve(row);
  }

  onReject(id: string): void {
    const row = this.findRowById(id);
    if (row) this.reject(row);
  }

  onRevert(id: string): void {
    const row = this.findRowById(id);
    if (!row) return;

    // Get XPIN from the data row
    const dataRow = this.dataRows.find(r => r.id === id);
    const xpin = dataRow?.obj?.xpin || dataRow?.obj?.XPIN || dataRow?.obj?.Xpin || id;

    // Get userId from AuthService
    const userId = this.auth.getUserId();

    if (!userId) {
      Swal.fire({
        icon: 'warning',
        title: 'User not found',
        text: 'Please login again to continue.',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Show remarks input dialog
    Swal.fire({
      title: 'Revert AML Screening',
      html: `
        <div class="text-start">
          <p><strong>XPIN:</strong> ${xpin}</p>
          <p><strong>Current Status:</strong> <span class="badge bg-warning">${row.status}</span></p>
          <hr>
          <label for="remarks" class="form-label"><strong>Remarks for Revert:</strong></label>
          <textarea id="remarks" class="form-control" rows="3" placeholder="Please enter remarks for reverting this AML screening..."></textarea>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Revert!',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const remarks = (document.getElementById('remarks') as HTMLTextAreaElement).value;
        if (!remarks || remarks.trim() === '') {
          Swal.showValidationMessage('Please enter remarks for revert');
          return false;
        }
        return remarks.trim();
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const remarks = result.value;
        
        this.isLoading = true;
        this.amlScreeningService.revertScreening(xpin, remarks, userId).subscribe({
          next: (response: any) => {
            this.isLoading = false;
            if (response?.isSuccess || response?.status === 'success') {
              Swal.fire({
                icon: 'success',
                title: 'Screening Reverted',
                html: `
                  <div class="text-start">
                    <p>AML screening has been successfully reverted.</p>
                    <p><strong>XPIN:</strong> ${xpin}</p>
                    <p><strong>Remarks:</strong> ${remarks}</p>
                  </div>
                `,
                confirmButtonText: 'OK'
              }).then(() => {
                // Reload the data to refresh the list
                const agentId = this.filterForm.get('agentId')?.value;
                if (agentId) {
                  this.loadAmlScreeningData(agentId);
                }
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Revert Failed',
                text: response?.message || response?.errorMessage || 'Failed to revert AML screening. Please try again.',
                confirmButtonText: 'OK'
              });
            }
          },
          error: (error: any) => {
            this.isLoading = false;
            console.error('Revert error:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'API call failed. Please try again.',
              confirmButtonText: 'OK'
            });
          }
        });
      }
    });
  }
}
