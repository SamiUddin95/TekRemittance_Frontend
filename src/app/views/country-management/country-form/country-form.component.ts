import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PageTitleComponent } from '@app/components/page-title.component';
import { CountryService } from '../services/country.service';
import { Country } from '../models/country.model';
import { NgIcon } from '@ng-icons/core';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-country-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, PageTitleComponent, NgIcon],
    templateUrl: './country-form.component.html'
})
export class CountryFormComponent implements OnInit {
    countryForm: FormGroup;
    isEditMode = false;
    countryId: number | null = null;
    isSubmitting = false;
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private countryService: CountryService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.countryForm = this.createForm();
    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEditMode = true;
                this.countryId = +params['id'];
                this.loadCountry();
            }
        });
    }

    createForm(): FormGroup {
        return this.fb.group({
            code: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
            name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
            isActive: [true]
        });
    }

    loadCountry(): void {
        if (!this.countryId) return;

        this.isLoading = true;
        this.countryService.getCountryById(this.countryId).subscribe({
            next: (country) => {
                if (country) {
                    this.countryForm.patchValue({
                        code: country.code,
                        name: country.name,
                        isActive: country.isActive
                    });
                } else {
                    Swal.fire('Error!', 'Country not found.', 'error');
                    this.router.navigate(['/country-management']);
                }
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading country:', error);
                Swal.fire('Error!', 'Failed to load country.', 'error');
                this.isLoading = false;
            }
        });
    }

    onSubmit(): void {
        if (this.countryForm.valid && !this.isSubmitting) {
            this.isSubmitting = true;
            const formValue = this.countryForm.value;

            if (this.isEditMode && this.countryId) {
                this.updateCountry(formValue);
            } else {
                this.createCountry(formValue);
            }
        } else {
            this.markFormGroupTouched();
        }
    }

    createCountry(countryData: Omit<Country, 'id'>): void {
        this.countryService.addCountry(countryData).subscribe({
            next: (country) => {
                Swal.fire('Success!', 'Country has been created successfully.', 'success');
                this.router.navigate(['/country-management']);
            },
            error: (error) => {
                console.error('Error creating country:', error);
                Swal.fire('Error!', 'Failed to create country.', 'error');
                this.isSubmitting = false;
            }
        });
    }

    updateCountry(countryData: Partial<Country>): void {
        if (!this.countryId) return;

        this.countryService.updateCountry(this.countryId, countryData).subscribe({
            next: (country) => {
                if (country) {
                    Swal.fire('Success!', 'Country has been updated successfully.', 'success');
                    this.router.navigate(['/country-management']);
                } else {
                    Swal.fire('Error!', 'Country not found.', 'error');
                }
            },
            error: (error) => {
                console.error('Error updating country:', error);
                Swal.fire('Error!', 'Failed to update country.', 'error');
                this.isSubmitting = false;
            }
        });
    }

    onCancel(): void {
        this.router.navigate(['/country-management']);
    }

    private markFormGroupTouched(): void {
        Object.keys(this.countryForm.controls).forEach(key => {
            const control = this.countryForm.get(key);
            control?.markAsTouched();
        });
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.countryForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    getFieldError(fieldName: string): string {
        const field = this.countryForm.get(fieldName);
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
        return this.isEditMode ? 'Edit Country' : 'Add New Country';
    }
}
