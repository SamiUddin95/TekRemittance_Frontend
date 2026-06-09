import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PageTitleComponent } from '@app/components/page-title.component';
import { HubService } from '../services/hub.service';
import { Hub } from '../models/hub.model';
import { NgIcon } from '@ng-icons/core';
import Swal from 'sweetalert2';
import { SkeletonLoaderComponent } from '../../../shared/skeleton/skeleton-loader.component';

@Component({
    selector: 'app-hub-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, PageTitleComponent, NgIcon, SkeletonLoaderComponent],
    templateUrl: './hub-form.component.html'
})
export class HubFormComponent implements OnInit {
    hubForm: FormGroup;
    isEditMode = false;
    hubCode: number | null = null;
    isSubmitting = false;
    isLoading = false;
    private loadedHub: Hub | null = null;

    constructor(
        private fb: FormBuilder,
        private hubService: HubService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.hubForm = this.createForm();
    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEditMode = true;
                this.hubCode = Number(params['id']);
                this.loadHub();
            }
        });
    }

    createForm(): FormGroup {
        return this.fb.group({
            code: ['', [Validators.required, Validators.maxLength(20)]],
            name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
            isActive: [true]
        });
    }

    loadHub(): void {
        if (this.hubCode == null) return;

        this.isLoading = true;
        this.hubService.getHubById(this.hubCode).subscribe({
            next: (hub) => {
                if (hub) {
                    this.loadedHub = hub;
                    this.hubForm.patchValue({
                        code: hub.code,
                        name: hub.name,
                        isActive: hub.isActive
                    });
                } else {
                    Swal.fire('Error!', 'Hub not found.', 'error');
                    this.router.navigate(['/hub-management']);
                }
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading hub:', error);
                Swal.fire('Error!', 'Failed to load hub.', 'error');
                this.isLoading = false;
            }
        });
    }

    onSubmit(): void {
        if (this.hubForm.valid && !this.isSubmitting) {
            this.isSubmitting = true;
            const formValue = this.hubForm.value;

            if (this.isEditMode && this.hubCode != null) {
                this.updateHub(formValue);
            } else {
                this.createHub(formValue);
            }
        } else {
            this.markFormGroupTouched();
        }
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.hubForm.get(fieldName);
        return !!(field && field.invalid && (field.touched || field.dirty));
    }

    createHub(hubData: Omit<Hub, 'id'>): void {
        this.hubService.addHub(hubData).subscribe({
            next: () => {
                Swal.fire('Success!', 'Hub has been created successfully.', 'success');
                this.router.navigate(['/hub-management']);
                this.isSubmitting = false;
            },
            error: (err) => {
                console.error('Error creating hub:', err);
                let message = 'Failed to create hub.';
                if (err?.error) {
                    if (typeof err.error === 'object' && err.error.errorMessage) {
                        message = err.error.errorMessage;
                    } else if (typeof err.error === 'string') {
                        message = err.error;
                    }
                }
                if (message.toLowerCase().includes('already exists')) {
                    Swal.fire('Warning!', 'Hub already exists.', 'warning');
                } else {
                    Swal.fire('Error!', message, 'error');
                }
                this.isSubmitting = false;
            }
        });
    }

    updateHub(hubData: Partial<Hub>): void {
        if (this.hubCode == null) return;

        const payload: Partial<Hub> = {
            ...hubData,
            createdBy: this.loadedHub?.createdBy,
            createdOn: this.loadedHub?.createdOn
        };

        this.hubService.updateHub(this.hubCode, payload).subscribe({
            next: (hub) => {
                if (hub) {
                    Swal.fire('Success!', 'Hub has been updated successfully.', 'success');
                    this.router.navigate(['/hub-management']);
                } else {
                    Swal.fire('Error!', 'Hub not found.', 'error');
                }
                this.isSubmitting = false;
            },
            error: (error) => {
                console.error('Error updating hub:', error);
                Swal.fire('Error!', 'Failed to update hub.', 'error');
                this.isSubmitting = false;
            }
        });
    }

    onCancel(): void {
        this.router.navigate(['/hub-management']);
    }

    private markFormGroupTouched(): void {
        Object.keys(this.hubForm.controls).forEach(key => {
            const control = this.hubForm.get(key);
            control?.markAsTouched();
        });
    }

    getFieldError(fieldName: string): string {
        const field = this.hubForm.get(fieldName);
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
        }
        return '';
    }

    getPageTitle(): string {
        return this.isEditMode ? 'Edit Hub' : 'Add New Hub';
    }
}
