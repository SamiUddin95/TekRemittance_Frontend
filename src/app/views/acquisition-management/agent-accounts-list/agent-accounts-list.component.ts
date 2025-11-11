import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageTitleComponent } from '@app/components/page-title.component';
import { NgIcon } from '@ng-icons/core';
import { Router } from '@angular/router';
import { GenericPaginationComponent } from '@/app/shared/generic-pagination/generic-pagination/generic-pagination.component';
import { AgentAccountsService } from '../services/agent-accounts.service';
import Swal from 'sweetalert2';
import { SkeletonLoaderComponent } from '../../../shared/skeleton/skeleton-loader.component';

interface AccountRow {
  id: string;
  accountName: string;
  accountNumber: string;
  agentName: string;
  active: boolean;
  approve: boolean;
}

@Component({
  selector: 'app-agent-accounts-list',
  standalone: true,
  imports: [CommonModule, PageTitleComponent, NgIcon, GenericPaginationComponent, SkeletonLoaderComponent],
  templateUrl: './agent-accounts-list.component.html'
})
export class AgentAccountsListComponent implements OnInit {
  rows: AccountRow[] = [];
  isLoading = false;
  PaginationInfo: any = { Page: 1, RowsPerPage: 10 };
  totalRecord = 0;

  constructor(private router: Router, private accountsService: AgentAccountsService) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.isLoading = true;
    this.accountsService.getAccounts(this.PaginationInfo.Page, this.PaginationInfo.RowsPerPage)
      .subscribe({
        next: (res) => {
          this.rows = res.items.map((x) => ({
            id: x.id,
            accountName: x.accountName,
            accountNumber: x.accountNumber,
            agentName: x.agentName,
            active: x.isActive,
            approve: x.approve,
          }));
          this.totalRecord = res.totalCount;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading accounts:', err);
          this.isLoading = false;
        }
      });
  }

  addAccount(): void { this.router.navigate(['/agent-accounts/add']); }
  editAccount(row: AccountRow): void { this.router.navigate(['/agent-accounts/add'], { state: { id: row.id } }); }
  deleteAccount(row: AccountRow): void {
    if (!row?.id) return;
    Swal.fire({
      icon: 'warning',
      title: 'Delete account?',
      text: 'This will delete the selected account.',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    }).then((res) => {
      if (!res.isConfirmed) return;
      this.accountsService.deleteAccountById(row.id).subscribe({
        next: (ok) => {
          if (ok) {
            Swal.fire({ icon: 'success', title: 'Account deleted', timer: 1200, showConfirmButton: false });
            this.loadAccounts();
          } else {
            Swal.fire({ icon: 'error', title: 'Delete failed', text: 'Server did not confirm deletion.' });
          }
        },
        error: (err) => {
          const body = (err?.error ?? err) as any;
          const msg = body?.errorMessage ?? body?.message ?? err?.message ?? 'Failed to delete account.';
          Swal.fire({ icon: 'error', title: 'Delete failed', text: msg });
        }
      });
    });
  }

  onPageChanged(page: number): void {
    this.PaginationInfo.Page = page;
    this.loadAccounts();
  }
}
