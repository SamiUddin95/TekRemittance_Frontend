import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageTitleComponent } from '@app/components/page-title.component';
import { ProvinceService } from '../services/province.service';
import { Province } from '../models/province.model';
import { NgIcon } from '@ng-icons/core';
import Swal from 'sweetalert2';
import { GenericPaginationComponent } from '@/app/shared/generic-pagination/generic-pagination/generic-pagination.component';
import { SkeletonLoaderComponent } from '../../../shared/skeleton/skeleton-loader.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-province-list',
    standalone: true,
    imports: [CommonModule, PageTitleComponent, NgIcon, GenericPaginationComponent, SkeletonLoaderComponent, ReactiveFormsModule],
    templateUrl: './province-list.component.html'
})
export class ProvinceListComponent implements OnInit {
    provinces: Province[] = [];
    allProvinces: Province[] = [];
    totalRecord = 0;
    PaginationInfo: any = {
        Page: 1,
        RowsPerPage: 10
    };
    isLoading = false;
    filterForm!: FormGroup;

    constructor(
        private provinceService: ProvinceService,
        private router: Router,
        private fb: FormBuilder
    ) {}

    ngOnInit(): void {
        this.filterForm = this.fb.group({
            provinceCode: [''],
            provinceName: [''],
            status: ['']
        });
        this.loadProvinces();
    }

    loadProvinces(): void {
    this.isLoading = true;
    const { provinceCode, provinceName, status } = this.filterForm.value;

    this.provinceService.getProvinces(
        this.PaginationInfo.Page,
        this.PaginationInfo.RowsPerPage,
        provinceCode,
        provinceName,
        status
    ).subscribe({
        next: (res) => {
            if (res.statusCode === 200 && res.items) {
                this.allProvinces = res.items;
                this.provinces = this.allProvinces; // no need to filter frontend
                this.totalRecord = res.totalCount;
            }
            this.isLoading = false;
        },
        error: (err) => {
            console.error('Error loading provinces:', err);
            this.isLoading = false;
        }
    });
}


    addNewProvince(): void {
        this.router.navigate(['/province-management/add']);
    }

    editProvince(id: string): void {
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

    onProvincePageChanged(page: number): void {
        this.PaginationInfo.Page = page;
        this.loadProvinces();
    }

    applyFilters(): void {
        if (!this.allProvinces) {
            this.provinces = [];
            return;
        }

        const { provinceCode, provinceName, status } = this.filterForm?.value || {};

        this.provinces = this.allProvinces.filter((province) => {
            const matchesCode = provinceCode
                ? province.code?.toLowerCase().includes(provinceCode.toLowerCase())
                : true;

            const matchesName = provinceName
                ? province.name?.toLowerCase().includes(provinceName.toLowerCase())
                : true;

            const matchesStatus = status !== undefined && status !== null && status !== ''
                ? province.isActive === (status === 'true')
                : true;

            return matchesCode && matchesName && matchesStatus;
        });
    }

    onSearch(): void {
        this.loadProvinces();
    }

    onClearFilters(): void {
        this.filterForm.reset({
            provinceCode: '',
            provinceName: '',
            status: ''
        });
        this.loadProvinces();
    }

    getStatusBadgeClass(isActive: boolean): string {
        return isActive ? 'badge bg-success' : 'badge bg-danger';
    }

    getStatusText(isActive: boolean): string {
        return isActive ? 'Active' : 'Inactive';
    }
}
