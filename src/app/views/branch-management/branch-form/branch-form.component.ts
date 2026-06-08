import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PageTitleComponent } from '@app/components/page-title.component';
import { BranchService } from '../services/branch.service';
import { Branch, HubDropdown } from '../models/branch.model';
import { NgIcon } from '@ng-icons/core';
import Swal from 'sweetalert2';
import { SkeletonLoaderComponent } from '../../../shared/skeleton/skeleton-loader.component';

@Component({
    selector: 'app-branch-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, PageTitleComponent, NgIcon, SkeletonLoaderComponent],
    templateUrl: './branch-form.component.html'
})
export class BranchFormComponent implements OnInit {
    branchForm: FormGroup;
    isEditMode = false;
    branchId: number | null = null;
    isSubmitting = false;
    isLoading = false;
    private loadedBranch: Branch | null = null;
    hubDropdown: HubDropdown[] = [];
    isLoadingHubs = false;

    constructor(
        private fb: FormBuilder,
        private branchService: BranchService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.branchForm = this.createForm();
    }

    ngOnInit(): void {
        this.loadHubDropdown();
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEditMode = true;
                this.branchId = Number(params['id']);
                this.loadBranch();
            }
        });
    }

    createForm(): FormGroup {
        return this.fb.group({
            code: ['', [Validators.required, Validators.maxLength(20)]],
            name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
            hubCode: [0, [Validators.required, Validators.min(1)]],
            isActive: [false]
        });
    }

    loadHubDropdown(): void {
        this.isLoadingHubs = true;
        this.branchService.getHubDropdown().subscribe({
            next: (hubs) => {
                this.hubDropdown = hubs;
                this.isLoadingHubs = false;
            },
            error: (error) => {
                console.error('Error loading hub dropdown:', error);
                this.isLoadingHubs = false;
            }
        });
    }

    loadBranch(): void {
        if (this.branchId == null) return;

        this.isLoading = true;
        this.branchService.getBranchById(this.branchId).subscribe({
            next: (branch) => {
                if (branch) {
                    this.loadedBranch = branch;
                    this.branchForm.patchValue({
                        code: branch.code,
                        name: branch.name,
                        hubCode: branch.hubCode,
                        isActive: branch.isActive
                    });
                } else {
                    Swal.fire('Error!', 'Branch not found.', 'error');
                    this.router.navigate(['/branch-management']);
                }
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading branch:', error);
                Swal.fire('Error!', 'Failed to load branch.', 'error');
                this.isLoading = false;
            }
        });
    }

    onSubmit(): void {
        if (this.branchForm.valid && !this.isSubmitting) {
            this.isSubmitting = true;
            const formValue = this.branchForm.value;

            if (this.isEditMode && this.branchId != null) {
                this.updateBranch(formValue);
            } else {
                this.createBranch(formValue);
            }
        } else {
            this.markFormGroupTouched();
        }
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.branchForm.get(fieldName);
        return !!(field && field.invalid && (field.touched || field.dirty));
    }

    createBranch(branchData: Omit<Branch, 'id'>): void {
        const payload = {
            ...branchData,
            isDeleted: false
        };
        this.branchService.addBranch(payload).subscribe({
            next: () => {
                Swal.fire('Success!', 'Branch has been created successfully.', 'success');
                this.router.navigate(['/branch-management']);
                this.isSubmitting = false;
            },
            error: (err) => {
                console.error('Error creating branch:', err);
                let message = 'Failed to create branch.';
                if (err?.error) {
                    if (typeof err.error === 'object' && err.error.errorMessage) {
                        message = err.error.errorMessage;
                    } else if (typeof err.error === 'string') {
                        message = err.error;
                    }
                }
                if (message.toLowerCase().includes('already exists')) {
                    Swal.fire('Warning!', 'Branch already exists.', 'warning');
                } else {
                    Swal.fire('Error!', message, 'error');
                }
                this.isSubmitting = false;
            }
        });
    }

    updateBranch(branchData: Partial<Branch>): void {
        if (this.branchId == null) return;

        const payload: Partial<Branch> = {
            ...branchData,
            isDeleted: this.loadedBranch?.isDeleted ?? false,
            createdBy: this.loadedBranch?.createdBy,
            createdOn: this.loadedBranch?.createdOn
        };

        this.branchService.updateBranch(this.branchId, payload).subscribe({
            next: (branch) => {
                if (branch) {
                    Swal.fire('Success!', 'Branch has been updated successfully.', 'success');
                    this.router.navigate(['/branch-management']);
                } else {
                    Swal.fire('Error!', 'Branch not found.', 'error');
                }
                this.isSubmitting = false;
            },
            error: (error) => {
                console.error('Error updating branch:', error);
                Swal.fire('Error!', 'Failed to update branch.', 'error');
                this.isSubmitting = false;
            }
        });
    }

    onCancel(): void {
        this.router.navigate(['/branch-management']);
    }

    private markFormGroupTouched(): void {
        Object.keys(this.branchForm.controls).forEach(key => {
            const control = this.branchForm.get(key);
            control?.markAsTouched();
        });
    }

    getFieldError(fieldName: string): string {
        const field = this.branchForm.get(fieldName);
        if (field?.errors) {
            if (field.errors['required']) {
                return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
            }
            if (field.errors['minlength']) {
                return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field.errors['minlength'].requiredLength} characters`;
            }
            if (field.errors['maxlength']) {
                return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} cannot exceed ${field.errors['maxlength'].requiredLength} characters`;
            }
            if (field.errors['min']) {
                return `Hub is required`;
            }
        }
        return '';
    }

    getPageTitle(): string {
        return this.isEditMode ? 'Edit Branch' : 'Add New Branch';
    }
}
