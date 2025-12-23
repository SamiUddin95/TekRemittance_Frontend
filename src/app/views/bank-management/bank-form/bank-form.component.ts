import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PageTitleComponent } from '@app/components/page-title.component';
import { BankService } from '../services/bank.service';
import { Bank } from '../models/bank.model';
import { NgIcon } from '@ng-icons/core';
import Swal from 'sweetalert2';
import { SkeletonLoaderComponent } from '../../../shared/skeleton/skeleton-loader.component';

@Component({
    selector: 'app-bank-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, PageTitleComponent, NgIcon, SkeletonLoaderComponent],
    templateUrl: './bank-form.component.html'
})
export class BankFormComponent implements OnInit {
    bankForm: FormGroup;
    isEditMode = false;
    bankId: string | null = null;
    isSubmitting = false;
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private bankService: BankService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.bankForm = this.createForm();
    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEditMode = true;
                this.bankId = params['id'];
                this.loadBank();
            }
        });
    }

    createForm(): FormGroup {
        debugger
        return this.fb.group({
            code: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
            name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
            iata: ['', [Validators.maxLength(10)]],
            website: ['', [Validators.maxLength(255)]],
            phoneNo: ['', [Validators.maxLength(20)]],
            description: ['', [Validators.maxLength(500)]],
            isActive: [false]
        });
    }

    loadBank(): void {
        if (!this.bankId) return;

        this.isLoading = true;
        this.bankService.getBankById(this.bankId).subscribe({
            next: (bank) => {
                if (bank) {
                    this.bankForm.patchValue({
                        code: bank.code,
                        name: bank.name,
                        iata: bank.iata || '',
                        website: bank.website || '',
                        phoneNo: bank.phoneNo || '',
                        description: bank.description || '',
                        isActive: bank.isActive
                    });
                } else {
                    Swal.fire('Error!', 'Bank not found.', 'error');
                    this.router.navigate(['/bank-management']);
                }
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading bank:', error);
                Swal.fire('Error!', 'Failed to load bank.', 'error');
                this.isLoading = false;
            }
        });
    }

    onSubmit(): void {
        if (this.bankForm.valid && !this.isSubmitting) {
            this.isSubmitting = true;
            const formValue = this.bankForm.value;

            if (this.isEditMode && this.bankId) {
                this.updateBank(formValue);
            } else {
                this.createBank(formValue);
            }
        } else {
            this.markFormGroupTouched();
        }
    }

    createBank(bankData: Omit<Bank, 'id'>): void {
        this.bankService.addBank(bankData).subscribe({
            next: (bank) => {
                Swal.fire('Success!', 'Bank has been created successfully.', 'success');
                this.router.navigate(['/bank-management']);
            },
            error: (error) => {
                console.error('Error creating bank:', error);
                Swal.fire('Error!', 'Failed to create bank.', 'error');
                this.isSubmitting = false;
            }
        });
    }

    updateBank(bankData: Partial<Bank>): void {
        if (!this.bankId) return;

        this.bankService.updateBank(this.bankId, bankData).subscribe({
            next: (bank) => {
                if (bank) {
                    Swal.fire('Success!', 'Bank has been updated successfully.', 'success');
                    this.router.navigate(['/bank-management']);
                } else {
                    Swal.fire('Error!', 'Bank not found.', 'error');
                }
            },
            error: (error) => {
                console.error('Error updating bank:', error);
                Swal.fire('Error!', 'Failed to update bank.', 'error');
                this.isSubmitting = false;
            }
        });
    }

    onCancel(): void {
        this.router.navigate(['/bank-management']);
    }

    private markFormGroupTouched(): void {
        Object.keys(this.bankForm.controls).forEach(key => {
            const control = this.bankForm.get(key);
            control?.markAsTouched();
        });
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.bankForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    getFieldError(fieldName: string): string {
        const field = this.bankForm.get(fieldName);
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
        return this.isEditMode ? 'Edit Bank' : 'Add Bank';
    }
}