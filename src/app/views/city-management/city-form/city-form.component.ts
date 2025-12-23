import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PageTitleComponent } from '@app/components/page-title.component';
import { CityService } from '../services/city.service';
import { CountryService } from '../../country-management/services/country.service';
import { ProvinceService } from '../../province-management/services/province.service';
import { City } from '../models/city.model';
import { Country } from '../../country-management/models/country.model';
import { Province } from '../../province-management/models/province.model';
import { NgIcon } from '@ng-icons/core';
import Swal from 'sweetalert2';
import { SkeletonLoaderComponent } from '../../../shared/skeleton/skeleton-loader.component';

@Component({
    selector: 'app-city-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, PageTitleComponent, NgIcon, SkeletonLoaderComponent],
    templateUrl: './city-form.component.html'
})
export class CityFormComponent implements OnInit {
    cityForm: FormGroup;
    isEditMode = false;
    cityId: string | null = null;
    isSubmitting = false;
    isLoading = false;
    countries: Country[] = [];
    provinces: Province[] = [];
    filteredProvinces: Province[] = [];

    constructor(
        private fb: FormBuilder,
        private cityService: CityService,
        private countryService: CountryService,
        private provinceService: ProvinceService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.cityForm = this.createForm();
    }

    ngOnInit(): void {
        this.loadCountries();
        this.loadProvinces();
        this.setupCountryChangeListener();
        
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEditMode = true;
                this.cityId = params['id'];
                this.loadCity();
            }
        });
    }

    createForm(): FormGroup {
        return this.fb.group({
            code: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
            name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
            countryId: ['', [Validators.required]],
            provinceId: ['', [Validators.required]],
            isActive: [false]
        });
    }

    loadCountries(): void {
        this.countryService.getCountries().subscribe({
            next: (countries) => {
                this.countries = countries.items.filter(c => c.isActive);
            },
            error: (error) => {
                console.error('Error loading countries:', error);
            }
        });
    }

    loadProvinces(): void {
        this.provinceService.getProvinces().subscribe({
            next: (res) => {
                this.provinces = res.items.filter((p: Province) => p.isActive);
            },
            error: (error) => {
                console.error('Error loading provinces:', error);
            }
        });
    }

    setupCountryChangeListener(): void {
        this.cityForm.get('countryId')?.valueChanges.subscribe(countryId => {
            if (countryId) {
                this.filteredProvinces = this.provinces.filter((p) => p.countryId === String(countryId));
                this.cityForm.patchValue({ provinceId: '' });
            } else {
                this.filteredProvinces = [];
            }
        });
    }

    loadCity(): void {
        if (!this.cityId) return;

        this.isLoading = true;
        this.cityService.getCityById(this.cityId).subscribe({
            next: (city) => {
                if (city) {
                    this.cityForm.patchValue({
                        code: city.code,
                        name: city.name,
                        countryId: city.countryId,
                        provinceId: city.provinceId,
                        isActive: city.isActive
                    });
                } else {
                    Swal.fire('Error!', 'City not found.', 'error');
                    this.router.navigate(['/city-management']);
                }
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading city:', error);
                Swal.fire('Error!', 'Failed to load city.', 'error');
                this.isLoading = false;
            }
        });
    }

    onSubmit(): void {
        if (this.cityForm.valid && !this.isSubmitting) {
            this.isSubmitting = true;
            const formValue = this.cityForm.value;

            // Add country and province names for display
            const selectedCountry = this.countries.find(c => c.id === String(formValue.countryId));
            const selectedProvince = this.filteredProvinces.find((p) => p.id === String(formValue.provinceId));
            
            if (selectedCountry) {
                formValue.countryName = selectedCountry.name;
            }
            if (selectedProvince) {
                formValue.provinceName = selectedProvince.name;
            }

            if (this.isEditMode && this.cityId) {
                this.updateCity(formValue);
            } else {
                this.createCity(formValue);
            }
        } else {
            this.markFormGroupTouched();
        }
    }

    createCity(cityData: Omit<City, 'id'>): void {
        this.cityService.addCity(cityData).subscribe({
            next: (city) => {
                Swal.fire('Success!', 'City has been created successfully.', 'success');
                this.router.navigate(['/city-management']);
            },
            error: (error) => {
                console.error('Error creating city:', error);
                Swal.fire('Error!', 'Failed to create city.', 'error');
                this.isSubmitting = false;
            }
        });
    }

    updateCity(cityData: Partial<City>): void {
        if (!this.cityId) return;

        this.cityService.updateCity(this.cityId, cityData).subscribe({
            next: (city) => {
                if (city) {
                    Swal.fire('Success!', 'City has been updated successfully.', 'success');
                    this.router.navigate(['/city-management']);
                } else {
                    Swal.fire('Error!', 'City not found.', 'error');
                }
            },
            error: (error) => {
                console.error('Error updating city:', error);
                Swal.fire('Error!', 'Failed to update city.', 'error');
                this.isSubmitting = false;
            }
        });
    }

    onCancel(): void {
        this.router.navigate(['/city-management']);
    }

    private markFormGroupTouched(): void {
        Object.keys(this.cityForm.controls).forEach(key => {
            const control = this.cityForm.get(key);
            control?.markAsTouched();
        });
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.cityForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    getFieldError(fieldName: string): string {
        const field = this.cityForm.get(fieldName);
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
        return this.isEditMode ? 'Edit City' : 'Add City';
    }
}
