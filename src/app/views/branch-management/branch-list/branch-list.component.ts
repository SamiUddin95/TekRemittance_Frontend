import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageTitleComponent } from '@app/components/page-title.component';
import { BranchService } from '../services/branch.service';
import { Branch } from '../models/branch.model';
import { NgIcon } from '@ng-icons/core';
import Swal from 'sweetalert2';
import { GenericPaginationComponent } from '@/app/shared/generic-pagination/generic-pagination/generic-pagination.component';
import { SkeletonLoaderComponent } from '../../../shared/skeleton/skeleton-loader.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-branch-list',
    standalone: true,
    imports: [CommonModule, PageTitleComponent, NgIcon, GenericPaginationComponent, SkeletonLoaderComponent, ReactiveFormsModule],
    templateUrl: './branch-list.component.html'
})
export class BranchListComponent implements OnInit {
    branches: Branch[] = [];
    allBranches: Branch[] = [];
    totalRecord = 0;
    PaginationInfo: any = {
        Page: 1,
        RowsPerPage: 10
    };
    isLoading = false;
    filterForm!: FormGroup;

    constructor(
        private branchService: BranchService,
        private router: Router,
        private fb: FormBuilder
    ) {}

    ngOnInit(): void {
        this.filterForm = this.fb.group({
            code: [''],
            name: ['']
        });
        this.loadBranches();
    }

    loadBranches(): void {
        this.isLoading = true;
        const { code, name } = this.filterForm.value;

        this.branchService.getBranches(
            this.PaginationInfo.Page,
            this.PaginationInfo.RowsPerPage,
            code,
            name
        ).subscribe({
            next: (response: any) => {
                if (response.statusCode === 200 && response.items) {
                    this.allBranches = response.items;
                    this.totalRecord = response.totalCount;
                    this.branches = this.allBranches;
                } else {
                    this.allBranches = [];
                    this.branches = [];
                    this.totalRecord = 0;
                }
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading branches:', err);
                this.isLoading = false;
            }
        });
    }

    onSearch(): void {
        this.PaginationInfo.Page = 1;
        this.loadBranches();
    }

    onClearFilters(): void {
        this.filterForm.reset({
            code: '',
            name: ''
        });
        this.PaginationInfo.Page = 1;
        this.loadBranches();
    }

    addNewBranch(): void {
        this.router.navigate(['/branch-management/add']);
    }

    editBranch(id: number): void {
        this.router.navigate(['/branch-management/edit', id]);
    }

    deleteBranch(branch: Branch): void {
        Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to delete ${branch.name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed && branch.id != null) {
                this.branchService.deleteBranch(branch.id).subscribe({
                    next: (success) => {
                        if (success) {
                            Swal.fire('Deleted!', 'Branch has been deleted.', 'success');
                            this.loadBranches();
                        }
                    },
                    error: (error) => {
                        console.error('Error deleting branch:', error);
                        Swal.fire('Error!', 'Failed to delete branch.', 'error');
                    }
                });
            }
        });
    }

    onBranchPageChanged(page: number): void {
        this.PaginationInfo.Page = page;
        this.loadBranches();
    }

    getStatusBadgeClass(isActive: boolean): string {
        return isActive ? 'badge bg-success' : 'badge bg-danger';
    }

    getStatusText(isActive: boolean): string {
        return isActive ? 'Active' : 'Inactive';
    }
}
