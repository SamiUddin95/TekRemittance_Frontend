import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
import { SkeletonLoaderComponent } from '../../../shared/skeleton/skeleton-loader.component';

@Component({
    selector: 'app-agent-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, PageTitleComponent, NgIcon, SkeletonLoaderComponent],
    templateUrl: './agent-form.component.html',
    styleUrls: ['./agent-form.component.scss']
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

    // Wizard state
    currentStep = 0;
    steps: Array<{ title: string; subtitle: string; icon: string }> = [
        { title: 'Basic Information', subtitle: 'Agent basics', icon: 'tablerUserPlus' },
        { title: 'Location Details', subtitle: 'Address & area', icon: 'tablerMapPin' },
        { title: 'Operational Preferences', subtitle: 'Working options', icon: 'tablerSettings' },
        { title: 'Acquisition Modes', subtitle: 'Acquisition channels', icon: 'tablerPlugConnected' },
        { title: 'Disbursement Modes', subtitle: 'Payout methods', icon: 'tablerCurrencyDollar' },
        { title: 'Direct Integration', subtitle: 'URLs & toggles', icon: 'tablerLink' },
    ];

    // Define required fields for each step
    private stepFields: { [key: number]: string[] } = {
        0: ['code', 'name'],
        1: ['countryId', 'provinceId', 'cityId'],
        2: [],
        3: [],
        4: [],
        5: [],
    };

    constructor(
        private fb: FormBuilder,
        private agentService: AgentService,
        private router: Router,
        private route: ActivatedRoute,
        private countryService: CountryService,
        private provinceService: ProvinceService,
        private cityService: CityService,
        private cdr: ChangeDetectorRef
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
        this.setupFormValueChanges();
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
            countryId: ['', Validators.required],
            provinceId: ['', Validators.required],
            cityId: ['', Validators.required],
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
        if (this.validateAllRequiredFields() && this.agentForm.valid && !this.isSubmitting) {
            this.isSubmitting = true;
            const formValue = this.agentForm.value as Omit<Agent, 'id'>;
            if (this.isEditMode && this.agentId) {
                this.updateAgent(formValue);
            } else {
                this.createAgent(formValue);
            }
        } else {
            this.markFormGroupTouched();
            this.showAllFieldsWarning();
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

    // Wizard navigation methods
    nextStep(): void {
        if (this.currentStep < this.steps.length - 1) {
            if (this.validateCurrentStep()) {
                this.currentStep++;
            }
        }
    }

    previousStep(): void {
        if (this.currentStep > 0) this.currentStep--;
    }

    goToStep(index: number): void {
        if (index >= 0 && index < this.steps.length) {
            if (index < this.currentStep || this.validateCurrentStep()) {
                this.currentStep = index;
            }
        }
    }

    // Validation methods
    private validateCurrentStep(): boolean {
        const requiredFields = this.stepFields[this.currentStep] || [];
        
        for (const field of requiredFields) {
            const control = this.agentForm.get(field);
            if (control) {
                control.markAsTouched();
                if (control.invalid) {
                    this.showValidationWarning();
                    return false;
                }
            }
        }
        
        // Special validation for Operational Preferences step (cut off time range)
        if (this.currentStep === 2 && this.isCutOffRangeInvalid()) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Cut-Off Time',
                text: 'Cut off time start must be less than cut off time end.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3b82f6'
            });
            return false;
        }
        
        // Special validation for Direct Integration step
        if (this.currentStep === 5) {
            const diCtrl = this.agentForm.get('directIntegration');
            if (diCtrl?.value) {
                const inquiryCtrl = this.agentForm.get('inquiryUrl');
                const paymentCtrl = this.agentForm.get('paymentUrl');
                
                inquiryCtrl?.markAsTouched();
                paymentCtrl?.markAsTouched();
                
                if (inquiryCtrl?.invalid || paymentCtrl?.invalid) {
                    this.showValidationWarning();
                    return false;
                }
            }
        }
        
        return true;
    }

    private showValidationWarning(): void {
        Swal.fire({
            icon: 'warning',
            title: 'Validation Required',
            text: 'Please fill in all required fields before proceeding to the next step.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3b82f6'
        });
    }

    isStepValid(stepIndex: number): boolean {
        const requiredFields = this.stepFields[stepIndex] || [];
        
        for (const field of requiredFields) {
            const control = this.agentForm.get(field);
            if (control && control.invalid) {
                return false;
            }
        }
        
        // Special validation for Direct Integration step
        if (stepIndex === 5) {
            const diCtrl = this.agentForm.get('directIntegration');
            if (diCtrl?.value) {
                const inquiryCtrl = this.agentForm.get('inquiryUrl');
                const paymentCtrl = this.agentForm.get('paymentUrl');
                
                if (inquiryCtrl?.invalid || paymentCtrl?.invalid) {
                    return false;
                }
            }
        }
        
        return true;
    }

    getStepValidationIcon(stepIndex: number): string {
        if (this.isStepValid(stepIndex)) {
            return 'tablerCircleCheck';
        } else if (stepIndex < this.currentStep) {
            return 'tablerCircleX';
        } else {
            return '';
        }
    }

    private setupFormValueChanges(): void {
        this.agentForm.valueChanges.subscribe(() => {
            this.cdr.detectChanges();
        });
    }

    private validateAllRequiredFields(): boolean {
        // Get all required fields from all steps
        const allRequiredFields: string[] = [];
        Object.values(this.stepFields).forEach(fields => {
            allRequiredFields.push(...fields);
        });

        for (const field of allRequiredFields) {
            const control = this.agentForm.get(field);
            if (control && control.invalid) {
                return false;
            }
        }

        // Special validation for Direct Integration step
        const diCtrl = this.agentForm.get('directIntegration');
        if (diCtrl?.value) {
            const inquiryCtrl = this.agentForm.get('inquiryUrl');
            const paymentCtrl = this.agentForm.get('paymentUrl');
            
            if (inquiryCtrl?.invalid || paymentCtrl?.invalid) {
                return false;
            }
        }

        // Cross-field validation for cut off time range
        if (this.isCutOffRangeInvalid()) {
            return false;
        }

        return true;
    }

    private getMissingRequiredFields(): string[] {
        const missingFields: string[] = [];
        
        // Check all required fields from all steps
        Object.entries(this.stepFields).forEach(([stepIndex, fields]) => {
            fields.forEach(field => {
                const control = this.agentForm.get(field);
                if (control && control.invalid) {
                    const fieldName = this.getFieldDisplayName(field);
                    missingFields.push(fieldName);
                }
            });
        });

        // Special validation for Direct Integration step
        const diCtrl = this.agentForm.get('directIntegration');
        if (diCtrl?.value) {
            const inquiryCtrl = this.agentForm.get('inquiryUrl');
            const paymentCtrl = this.agentForm.get('paymentUrl');
            
            if (inquiryCtrl?.invalid) {
                missingFields.push('Inquiry URL');
            }
            if (paymentCtrl?.invalid) {
                missingFields.push('Payment URL');
            }
        }

        return missingFields;
    }

    private getFieldDisplayName(fieldName: string): string {
        const fieldNames: { [key: string]: string } = {
            'code': 'Code',
            'name': 'Name',
            'countryId': 'Country',
            'provinceId': 'Province',
            'cityId': 'City'
        };
        return fieldNames[fieldName] || fieldName;
    }

    private showAllFieldsWarning(): void {
        const missingFields = this.getMissingRequiredFields();
        const fieldsList = missingFields.join(', ');
        
        Swal.fire({
            icon: 'warning',
            title: 'Required Fields Missing',
            text: `Please fill in the following required fields before saving: ${fieldsList}`,
            confirmButtonText: 'OK',
            confirmButtonColor: '#3b82f4'
        });
    }

    // Cross-field helper: ensures cutOffStart < cutOffEnd
    isCutOffRangeInvalid(): boolean {
        const start = this.agentForm.get('cutOffStart')?.value as string | null | undefined;
        const end = this.agentForm.get('cutOffEnd')?.value as string | null | undefined;

        if (!start || !end) return false;

        // Both are in HH:mm format so string comparison is safe
        return start >= end;
    }
}
