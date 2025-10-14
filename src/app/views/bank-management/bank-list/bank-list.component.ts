import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageTitleComponent } from '@app/components/page-title.component';
import { BankService } from '../services/bank.service';
import { Bank } from '../models/bank.model';
import { NgIcon } from '@ng-icons/core';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-bank-list',
    standalone: true,
    imports: [CommonModule, PageTitleComponent, NgIcon],
    templateUrl: './bank-list.component.html'
})
export class BankListComponent implements OnInit {
    banks: Bank[] = [];
    currentPage = 1;
    totalPages = 1;
    totalItems = 0;
    itemsPerPage = 10;
    isLoading = false;

    constructor(
        private bankService: BankService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadBanks();
    }

    loadBanks(): void {
        this.isLoading = true;
        this.bankService.getBanks(this.currentPage, this.itemsPerPage)
            .subscribe({
                next: (response) => {
                    this.banks = response.banks;
                    this.totalItems = response.total;
                    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
                    this.isLoading = false;
                },
                error: (error) => {
                    console.error('Error loading banks:', error);
                    this.isLoading = false;
                }
            });
    }

    addNewBank(): void {
        this.router.navigate(['/bank-management/add']);
    }

    editBank(id: number): void {
        this.router.navigate(['/bank-management/edit', id]);
    }

    deleteBank(bank: Bank): void {
        Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to delete ${bank.name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed && bank.id) {
                this.bankService.deleteBank(bank.id).subscribe({
                    next: (success) => {
                        if (success) {
                            Swal.fire('Deleted!', 'Bank has been deleted.', 'success');
                            this.loadBanks();
                        }
                    },
                    error: (error) => {
                        console.error('Error deleting bank:', error);
                        Swal.fire('Error!', 'Failed to delete bank.', 'error');
                    }
                });
            }
        });
    }

    goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.loadBanks();
        }
    }

    previousPage(): void {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadBanks();
        }
    }

    nextPage(): void {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.loadBanks();
        }
    }

    getStatusBadgeClass(isActive: boolean): string {
        return isActive ? 'badge bg-success' : 'badge bg-danger';
    }

    getStatusText(isActive: boolean): string {
        return isActive ? 'Active' : 'Inactive';
    }
}