import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PageTitleComponent } from '@app/components/page-title.component';
import { ProvinceService } from '../services/province.service';
import { CountryService } from '../../country-management/services/country.service';
import { Province } from '../models/province.model';
import { Country } from '../../country-management/models/country.model';
import { NgIcon } from '@ng-icons/core';
import Swal from 'sweetalert2';
import { SkeletonLoaderComponent } from '../../../shared/skeleton/skeleton-loader.component';

@Component({
    selector: 'app-province-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, PageTitleComponent, NgIcon, SkeletonLoaderComponent],
    templateUrl: './province-form.component.html'
})
export class ProvinceFormComponent implements OnInit {
    provinceForm: FormGroup;
    isEditMode = false;
    provinceId: string | null = null;
    isSubmitting = false;
    isLoading = false;
    countries: Country[] = [];

    constructor(
        private fb: FormBuilder,
        private provinceService: ProvinceService,
        private countryService: CountryService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.provinceForm = this.createForm();
    }

    ngOnInit(): void {
        this.loadCountries();
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEditMode = true;
                this.provinceId = params['id'];
                this.loadProvince();
            }
        });
    }

    createForm(): FormGroup {
        return this.fb.group({
            code: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
            name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
            countryId: ['', [Validators.required]],
            isActive: [true]
        });
    }

    loadCountries(): void {
        this.countryService.getCountries().subscribe({
            next: (countries) => {
                this.countries = countries.items.filter((c) => c.isActive);
            },
            error: (error) => {
                console.error('Error loading countries:', error);
            }
        });
    }

    loadProvince(): void {
        if (!this.provinceId) return;

        this.isLoading = true;
        this.provinceService.getProvinceById(this.provinceId).subscribe({
            next: (province) => {
                if (province) {
                    this.provinceForm.patchValue({
                        code: province.code,
                        name: province.name,
                        countryId: province.countryId,
                        isActive: province.isActive
                    });
                } else {
                    Swal.fire('Error!', 'Province not found.', 'error');
                    this.router.navigate(['/province-management']);
                }
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading province:', error);
                Swal.fire('Error!', 'Failed to load province.', 'error');
                this.isLoading = false;
            }
        });
    }

    onSubmit(): void {
        if (this.provinceForm.valid && !this.isSubmitting) {
            this.isSubmitting = true;
            const formValue = this.provinceForm.value;

            // Add country name for display
            const selectedCountry = this.countries.find(c => c.id === String(formValue.countryId));
            if (selectedCountry) {
                formValue.countryName = selectedCountry.name;
            }

            if (this.isEditMode && this.provinceId) {
                this.updateProvince(formValue);
            } else {
                this.createProvince(formValue);
            }
        } else {
            this.markFormGroupTouched();
        }
    }

    createProvince(provinceData: Omit<Province, 'id'>): void {
        this.provinceService.addProvince(provinceData).subscribe({
            next: (province) => {
                Swal.fire('Success!', 'Province has been created successfully.', 'success');
                this.router.navigate(['/province-management']);
            },
            error: (error) => {
                console.error('Error creating province:', error);
                Swal.fire('Error!', 'Failed to create province.', 'error');
                this.isSubmitting = false;
            }
        });
    }

    updateProvince(provinceData: Partial<Province>): void {
        if (!this.provinceId) return;

        this.provinceService.updateProvince(this.provinceId, provinceData).subscribe({
            next: (province) => {
                if (province) {
                    Swal.fire('Success!', 'Province has been updated successfully.', 'success');
                    this.router.navigate(['/province-management']);
                } else {
                    Swal.fire('Error!', 'Province not found.', 'error');
                }
            },
            error: (error) => {
                console.error('Error updating province:', error);
                Swal.fire('Error!', 'Failed to update province.', 'error');
                this.isSubmitting = false;
            }
        });
    }

    onCancel(): void {
        this.router.navigate(['/province-management']);
    }

    private markFormGroupTouched(): void {
        Object.keys(this.provinceForm.controls).forEach(key => {
            const control = this.provinceForm.get(key);
            control?.markAsTouched();
        });
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.provinceForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    getFieldError(fieldName: string): string {
        const field = this.provinceForm.get(fieldName);
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
        return this.isEditMode ? 'Edit Province' : 'Add New Province';
    }
}
