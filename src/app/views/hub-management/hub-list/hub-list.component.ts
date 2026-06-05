import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageTitleComponent } from '@app/components/page-title.component';
import { HubService } from '../services/hub.service';
import { Hub } from '../models/hub.model';
import { NgIcon } from '@ng-icons/core';
import Swal from 'sweetalert2';
import { GenericPaginationComponent } from '@/app/shared/generic-pagination/generic-pagination/generic-pagination.component';
import { SkeletonLoaderComponent } from '../../../shared/skeleton/skeleton-loader.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-hub-list',
    standalone: true,
    imports: [CommonModule, PageTitleComponent, NgIcon, GenericPaginationComponent, SkeletonLoaderComponent, ReactiveFormsModule],
    templateUrl: './hub-list.component.html'
})
export class HubListComponent implements OnInit {
    hubs: Hub[] = [];
    allHubs: Hub[] = [];
    totalRecord = 0;
    PaginationInfo: any = {
        Page: 1,
        RowsPerPage: 10
    };
    isLoading = false;
    filterForm!: FormGroup;

    constructor(
        private hubService: HubService,
        private router: Router,
        private fb: FormBuilder
    ) {}

    ngOnInit(): void {
        this.filterForm = this.fb.group({
            code: [''],
            name: ['']
        });
        this.loadHubs();
    }

    loadHubs(): void {
        this.isLoading = true;
        const { code, name } = this.filterForm.value;

        this.hubService.getHubs(
            this.PaginationInfo.Page,
            this.PaginationInfo.RowsPerPage,
            code,
            name
        ).subscribe({
            next: (response: any) => {
                if (response.statusCode === 200 && response.items) {
                    this.allHubs = response.items;
                    this.totalRecord = response.totalCount;
                    this.hubs = this.allHubs;
                } else {
                    this.allHubs = [];
                    this.hubs = [];
                    this.totalRecord = 0;
                }
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading hubs:', err);
                this.isLoading = false;
            }
        });
    }

    onSearch(): void {
        this.PaginationInfo.Page = 1;
        this.loadHubs();
    }

    onClearFilters(): void {
        this.filterForm.reset({
            code: '',
            name: ''
        });
        this.PaginationInfo.Page = 1;
        this.loadHubs();
    }

    addNewHub(): void {
        this.router.navigate(['/hub-management/add']);
    }

    editHub(id: number): void {
        this.router.navigate(['/hub-management/edit', id]);
    }

    deleteHub(hub: Hub): void {
        Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to delete ${hub.name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed && hub.id != null) {
                this.hubService.deleteHub(hub.id).subscribe({
                    next: (success) => {
                        if (success) {
                            Swal.fire('Deleted!', 'Hub has been deleted.', 'success');
                            this.loadHubs();
                        }
                    },
                    error: (error) => {
                        console.error('Error deleting hub:', error);
                        Swal.fire('Error!', 'Failed to delete hub.', 'error');
                    }
                });
            }
        });
    }

    onHubPageChanged(page: number): void {
        this.PaginationInfo.Page = page;
        this.loadHubs();
    }

    getStatusBadgeClass(isDeleted: boolean): string {
        return isDeleted ? 'badge bg-danger' : 'badge bg-success';
    }

    getStatusText(isDeleted: boolean): string {
        return isDeleted ? 'Inactive' : 'Active';
    }
}
