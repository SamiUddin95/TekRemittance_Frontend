import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PageTitleComponent } from '@app/components/page-title.component';
import { AgentService } from '../services/agent.service';
import { Agent } from '../models/agent.model';
import { NgIcon } from '@ng-icons/core';
import Swal from 'sweetalert2';
import { CountryService } from '@/app/views/country-management/services/country.service';
import { ProvinceService } from '@/app/views/province-management/services/province.service';
import { CityService } from '@/app/views/city-management/services/city.service';
import { Country } from '@/app/views/country-management/models/country.model';
import { Province } from '@/app/views/province-management/models/province.model';
import { City } from '@/app/views/city-management/models/city.model';

@Component({
    selector: 'app-agent-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, PageTitleComponent, NgIcon],
    templateUrl: './agent-form.component.html'
})
export class AgentFormComponent implements OnInit {
    agentForm: FormGroup;
    isEditMode = false;
    agentId: string | null = null;
    isSubmitting = false;
    isLoading = false;
    countries: Country[] = [];
    provinces: Province[] = [];
    cities: City[] = [];

    constructor(
        private fb: FormBuilder,
        private agentService: AgentService,
        private router: Router,
        private route: ActivatedRoute,
        private countryService: CountryService,
        private provinceService: ProvinceService,
        private cityService: CityService
    ) {
        this.agentForm = this.createForm();
    }

    private setupDirectIntegrationValidation(): void {
        const diCtrl = this.agentForm.get('directIntegration');
        const inquiryCtrl = this.agentForm.get('inquiryUrl');
        const paymentCtrl = this.agentForm.get('paymentUrl');

        const apply = (isOn: boolean) => {
            if (isOn) {
                inquiryCtrl?.setValidators([Validators.required]);
                paymentCtrl?.setValidators([Validators.required]);
            } else {
                inquiryCtrl?.clearValidators();
                paymentCtrl?.clearValidators();
            }
            inquiryCtrl?.updateValueAndValidity({ emitEvent: false });
            paymentCtrl?.updateValueAndValidity({ emitEvent: false });
        };

        // initial sync
        apply(!!diCtrl?.value);

        diCtrl?.valueChanges.subscribe((val: boolean) => apply(!!val));
    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEditMode = true;
                this.agentId = params['id'];
                this.loadAgent();
            }
        });
        this.setupExclusiveCheckboxes();
        this.setupLocationCascades();
        this.loadCountries();
        this.setupDirectIntegrationValidation();
    }

    createForm(): FormGroup {
        return this.fb.group({
            code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
            name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
            phone1: ['', [Validators.maxLength(20)]],
            phone2: ['', [Validators.maxLength(20)]],
            fax: ['', [Validators.maxLength(20)]],
            email: ['', [Validators.email, Validators.maxLength(255)]],
            address: ['', [Validators.maxLength(255)]],
            countryId: [''],
            provinceId: [''],
            cityId: [''],
            cutOffStart: ['09:00'],
            cutOffEnd: ['17:00'],
            brnByApplication: [false],
            brnByAgent: [false],
            autoProcess: [false],
            manualProcess: [false],
            isOnlineAllow: [false],
            isFileUploadAllow: [false],
            isFtpAllow: [false],
            isEmailUploadAllow: [false],
            isWebServiceAllow: [false],
            isBeneficiarySmsAllow: [false],
            isActive: [false],
            isOtcAllow: [false],
            isDirectCreditAllow: [false],
            isOtherCreditAllow: [false],
            isRemitterSmsAllow: [false],
            directIntegration: [false],
            inquiryUrl: [''],
            paymentUrl: [''],
            unlockUrl: ['']
        });
    }

    loadAgent(): void {
        if (!this.agentId) return;
        this.isLoading = true;
        this.agentService.getAgentById(this.agentId).subscribe({
            next: (agent) => {
                if (agent) {
                    this.agentForm.patchValue(agent);
                } else {
                    Swal.fire('Error!', 'Agent not found.', 'error');
                    this.router.navigate(['/acquisition-management']);
                }
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading agent:', error);
                Swal.fire('Error!', 'Failed to load agent.', 'error');
                this.isLoading = false;
            }
        });
    }

    onSubmit(): void {
        if (this.agentForm.valid && !this.isSubmitting) {
            this.isSubmitting = true;
            const formValue = this.agentForm.value as Omit<Agent, 'id'>;
            if (this.isEditMode && this.agentId) {
                this.updateAgent(formValue);
            } else {
                this.createAgent(formValue);
            }
        } else {
            this.markFormGroupTouched();
        }
    }

    createAgent(agentData: Omit<Agent, 'id'>): void {
        this.agentService.addAgent(agentData).subscribe({
            next: () => {
                Swal.fire('Success!', 'Agent has been created successfully.', 'success');
                this.router.navigate(['/acquisition-management']);
            },
            error: (error) => {
                console.error('Error creating agent:', error);
                Swal.fire('Error!', 'Failed to create agent.', 'error');
                this.isSubmitting = false;
            }
        });
    }

    updateAgent(agentData: Partial<Agent>): void {
        if (!this.agentId) return;
        this.agentService.updateAgent(this.agentId, agentData).subscribe({
            next: () => {
                Swal.fire('Success!', 'Agent has been updated successfully.', 'success');
                this.router.navigate(['/acquisition-management']);
            },
            error: (error) => {
                console.error('Error updating agent:', error);
                Swal.fire('Error!', 'Failed to update agent.', 'error');
                this.isSubmitting = false;
            }
        });
    }

    onCancel(): void {
        this.router.navigate(['/acquisition-management']);
    }

    private markFormGroupTouched(): void {
        Object.keys(this.agentForm.controls).forEach(key => {
            const control = this.agentForm.get(key);
            control?.markAsTouched();
        });
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.agentForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    getFieldError(fieldName: string): string {
        const field = this.agentForm.get(fieldName);
        if (field?.errors) {
            if (field.errors['required']) return `${fieldName} is required`;
            if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
            if (field.errors['maxlength']) return `${fieldName} cannot exceed ${field.errors['maxlength'].requiredLength} characters`;
            if (field.errors['email']) return `Invalid email`;
        }
        return '';
    }

    getPageTitle(): string {
        return this.isEditMode ? 'Edit Acquisition Agent' : 'Add New Acquisition Agent';
    }

    private setupExclusiveCheckboxes(): void {
        const exPairs: Array<[string, string]> = [
            ['brnByApplication', 'brnByAgent'],
            ['autoProcess', 'manualProcess'],
        ];

        exPairs.forEach(([a, b]) => {
            const ca = this.agentForm.get(a);
            const cb = this.agentForm.get(b);
            ca?.valueChanges.subscribe((val: boolean) => {
                if (val) {
                    cb?.patchValue(false, { emitEvent: false });
                }
            });
            cb?.valueChanges.subscribe((val: boolean) => {
                if (val) {
                    ca?.patchValue(false, { emitEvent: false });
                }
            });
        });

        // Single-selection (radio-like) behavior for groups
        this.setupExclusiveGroup([
            'isOnlineAllow',
            'isFileUploadAllow',
            'isFtpAllow',
            'isEmailUploadAllow',
            'isWebServiceAllow',
            'isBeneficiarySmsAllow',
        ]);

        this.setupExclusiveGroup([
            'isOtcAllow',
            'isDirectCreditAllow',
            'isOtherCreditAllow',
            'isRemitterSmsAllow',
        ]);
    }

    private setupExclusiveGroup(controlNames: string[]): void {
        controlNames.forEach((name) => {
            const ctrl = this.agentForm.get(name);
            ctrl?.valueChanges.subscribe((val: boolean) => {
                if (val) {
                    controlNames
                        .filter((n) => n !== name)
                        .forEach((other) => this.agentForm.get(other)?.patchValue(false, { emitEvent: false }));
                }
            });
        });
    }

    private setupLocationCascades(): void {
        this.agentForm.get('countryId')?.valueChanges.subscribe((countryId: string) => {
            this.provinces = [];
            this.cities = [];
            this.agentForm.patchValue({ provinceId: '', cityId: '' }, { emitEvent: false });
            if (countryId) {
                this.loadProvinces(countryId);
            }
        });

        this.agentForm.get('provinceId')?.valueChanges.subscribe((provinceId: string) => {
            this.cities = [];
            this.agentForm.patchValue({ cityId: '' }, { emitEvent: false });
            if (provinceId) {
                this.loadCities(provinceId);
            }
        });
    }

    private loadCountries(): void {
        this.countryService.getCountries().subscribe({
            next: (res) => {
                this.countries = (res.items || []).filter(c => c.isActive);
                const cid = this.agentForm.get('countryId')?.value;
                if (cid) this.loadProvinces(cid);
            }
        });
    }

    private loadProvinces(countryId: string): void {
        this.provinceService.getProvinces(1, 100000).subscribe({
            next: (res) => {
                this.provinces = (res.items || []).filter(p => p.isActive && String(p.countryId) === String(countryId));
                const pid = this.agentForm.get('provinceId')?.value;
                if (pid) this.loadCities(pid);
            }
        });
    }

    private loadCities(provinceId: string): void {
        this.cityService.getCities(1, 100000).subscribe({
            next: (res) => {
                this.cities = (res.items || []).filter(c => c.isActive && String(c.provinceId) === String(provinceId));
            }
        });
    }
}
