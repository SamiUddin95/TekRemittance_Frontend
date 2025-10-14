import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageTitleComponent } from '@app/components/page-title.component';
import { ProvinceService } from '../services/province.service';
import { Province } from '../models/province.model';
import { NgIcon } from '@ng-icons/core';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-province-list',
    standalone: true,
    imports: [CommonModule, PageTitleComponent, NgIcon],
    templateUrl: './province-list.component.html'
})
export class ProvinceListComponent implements OnInit {
    provinces: Province[] = [];
    currentPage = 1;
    totalPages = 1;
    totalItems = 0;
    itemsPerPage = 10;
    isLoading = false;

    constructor(
        private provinceService: ProvinceService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadProvinces();
    }

    loadProvinces(): void {
        this.isLoading = true;
        this.provinceService.getProvinces(this.currentPage, this.itemsPerPage)
            .subscribe({
                next: (response) => {
                    this.provinces = response.provinces;
                    this.totalItems = response.total;
                    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
                    this.isLoading = false;
                },
                error: (error) => {
                    console.error('Error loading provinces:', error);
                    this.isLoading = false;
                }
            });
    }

    addNewProvince(): void {
        this.router.navigate(['/province-management/add']);
    }

    editProvince(id: number): void {
        this.router.navigate(['/province-management/edit', id]);
    }

    deleteProvince(province: Province): void {
        Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to delete ${province.name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed && province.id) {
                this.provinceService.deleteProvince(province.id).subscribe({
                    next: (success) => {
                        if (success) {
                            Swal.fire('Deleted!', 'Province has been deleted.', 'success');
                            this.loadProvinces();
                        }
                    },
                    error: (error) => {
                        console.error('Error deleting province:', error);
                        Swal.fire('Error!', 'Failed to delete province.', 'error');
                    }
                });
            }
        });
    }

    goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.loadProvinces();
        }
    }

    previousPage(): void {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadProvinces();
        }
    }

    nextPage(): void {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.loadProvinces();
        }
    }

    getStatusBadgeClass(isActive: boolean): string {
        return isActive ? 'badge bg-success' : 'badge bg-danger';
    }

    getStatusText(isActive: boolean): string {
        return isActive ? 'Active' : 'Inactive';
    }
}
