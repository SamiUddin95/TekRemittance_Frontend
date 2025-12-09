import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PageTitleComponent } from '@app/components/page-title.component';
import { NgIcon } from '@ng-icons/core';
import { AgentService } from '../services/agent.service';
import { AgentBranchService } from '../services/agent-branch.service';
import Swal from 'sweetalert2';
import { CountryService } from '../../country-management/services/country.service';
import { ProvinceService } from '../../province-management/services/province.service';
import { CityService } from '../../city-management/services/city.service';
import { SkeletonLoaderComponent } from '../../../shared/skeleton/skeleton-loader.component';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

interface Agent {
  id: string;
  name: string;
}

function emailValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  const hasAt = value.includes('@');
  const hasComPk = value.endsWith('.com.pk');

  if (!hasAt || !hasComPk) {
    return { invalidEmail: true };
  }

  return null;
}

@Component({
  selector: 'app-agent-branch-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageTitleComponent,NgIcon, SkeletonLoaderComponent],
  templateUrl: './agent-branch-form.component.html'
})
export class AgentBranchFormComponent implements OnInit {
  form: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  editId?: any;
  agents: Agent[] = [];
  isAgentsLoading = false;
  isLoading = false;
  countries: Array<{ id: string; name: string }> = [];
  provinces: Array<{ id: string; name: string; countryId?: string }> = [];
  cities: Array<{ id: string; name: string; provinceId?: string }> = [];

  private stepFields: { [key: number]: string[] } = {
        0: ['agentId','code', 'name','email'],
        1: ['countryId', 'provinceId', 'cityId'],
        2: [],
        3: [],
        4: [],
        5: [],
    };
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private agentService: AgentService,
    private branchService: AgentBranchService,
    private countryService: CountryService,
    private provinceService: ProvinceService,
    private cityService: CityService
  ) {
    this.form = this.fb.group({

      agentId: ['', [Validators.required]],
      code: ['', [Validators.required, Validators.maxLength(20)]],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      //contactPerson: ['', [Validators.required, Validators.maxLength(100)]],
      phone1: [''],
      phone2: ['', [Validators.pattern('^[0-9-+()\s]*$'), Validators.maxLength(20)]],
      fax: ['', [Validators.maxLength(20)]],
      email: ['', [Validators.required, emailValidator, Validators.maxLength(255)]],

      // Location Details
      address: ['', [Validators.maxLength(500)]],
      countryId: ['', Validators.required],
      provinceId: ['', Validators.required],
      cityId: ['', Validators.required],

      // Acquisition Modes
      isOnlineAllow: [false],
      isFileUploadAllow: [false],
      isFtpAllow: [false],
      isEmailUploadAllow: [false],
      isWebServiceAllow: [false],
      isBeneficiarySmsAllow: [false],
      isActive: [false],

      // Disbursement Modes
      isOtcAllow: [false],
      isDirectCreditAllow: [false],
      isOtherCreditAllow: [false],
      isRemitterSmsAllow: [false]
    });
  }
selectOnlyOne(selected: string) {
  const controls = [
    'isOtcAllow',
    'isDirectCreditAllow',
    'isOtherCreditAllow',
    'isRemitterSmsAllow'
  ];

  controls.forEach(control => {
    if (control !== selected) {
      this.form.get(control)?.setValue(false, { emitEvent: false });
    }
  });
}

  ngOnInit(): void {
    this.loadAgents();
    this.loadCountries();
    this.setupExclusiveCheckboxes();


    this.form.get('countryId')?.valueChanges.subscribe((countryId) => {
      this.form.patchValue({ provinceId: '', cityId: '' }, { emitEvent: false });
      this.cities = [];
      if (countryId) {
        this.loadProvinces(String(countryId));
      } else {
        this.provinces = [];
      }
    });

    // Cascade: when province changes, reset city and load cities
    this.form.get('provinceId')?.valueChanges.subscribe((provinceId) => {
      this.form.patchValue({ cityId: '' }, { emitEvent: false });
      if (provinceId) {
        this.loadCities(String(provinceId));
      } else {
        this.cities = [];
      }
    });
    const stateId = history.state?.id ? String(history.state.id) : undefined;
    if (stateId) {
      this.isEditMode = true;
      this.editId = stateId;
      this.loadBranch(stateId);
    } else if (this.route.snapshot.params['id']) {
      this.isEditMode = true;
      this.editId = this.route.snapshot.params['id'];
      this.loadBranch(this.editId);
    }
  }

  private loadCountries(): void {
    this.countryService.getCountries(1, 100000).subscribe({
      next: (res) => {
        this.countries = (res.items || []).map((c: any) => ({ id: String(c.id), name: String(c.name) }));
      },
      error: () => {}
    });
  }

  private loadProvinces(countryId: string): void {
    this.provinceService.getProvinces(1, 100000).subscribe({
      next: (res) => {
        const all = (res.items || []).map((p: any) => ({ id: String(p.id), name: String(p.name), countryId: String(p.countryId) }));
        this.provinces = all.filter(p => String(p.countryId) === String(countryId));
      },
      error: () => { this.provinces = []; }
    });
  }

  private loadCities(provinceId: string): void {
    this.cityService.getCities(1, 100000).subscribe({
      next: (res) => {
        const all = (res.items || []).map((c: any) => ({ id: String(c.id), name: String(c.name), provinceId: String(c.provinceId) }));
        this.cities = all.filter(c => String(c.provinceId) === String(provinceId));
      },
      error: () => { this.cities = []; }
    });
  }

  private loadAgents(): void {
    this.isAgentsLoading = true;
    this.agentService.getAgents(1, 1000).subscribe({
      next: (res: any) => {
        this.agents = (res.items || []).map((a: any) => ({
          id: String(a.id || ''),
          name: String(a.name || '-')
        }));
        this.isAgentsLoading = false;
      },
      error: () => {
        this.isAgentsLoading = false;
      }
    });
  }

private loadBranch(id: string): void {
this.isLoading = true;
this.branchService.getBranchById(id).subscribe({
next: (branch: any) => {
        this.form.patchValue({
            agentId: branch.agentId,
            code: branch.code,
            name: branch.name,
            phone1: branch.phone1,
            phone2: branch.phone2 || '',
            fax: branch.fax || '',
            email: branch.email || '',
            address: branch.address || '',
            countryId: branch.countryId || '',
            provinceId: branch.provinceId || '',
            cityId: branch.cityId || '',
            isOnlineAllow: branch.isOnlineAllow || false,
            isFileUploadAllow: branch.isFileUploadAllow || false,
            isFtpAllow: branch.isFtpAllow || false,
            isEmailUploadAllow: branch.isEmailUploadAllow || false,
            isWebServiceAllow: branch.isWebServiceAllow || false,
            isBeneficiarySmsAllow: branch.isBeneficiarySmsAllow || false,
            isOtcAllow: branch.isOtcAllow || false,
            isDirectCreditAllow: branch.isDirectCreditAllow || false,
            isOtherCreditAllow: branch.isOtherCreditAllow || false,
            isRemitterSmsAllow: branch.isRemitterSmsAllow || false,
            isActive: branch.isActive || false,

        });
        if (branch.countryId) this.loadProvinces(String(branch.countryId));
        if (branch.provinceId) this.loadCities(String(branch.provinceId));

        this.isLoading = false;
    },
    error: (err) => {
        console.error('Error loading branch:', err);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load branch details.'
        }).then(() => {
            this.onCancel();
        });

    }
});

}



onSubmit(): void {
this.form.markAllAsTouched();


if (this.form.invalid) {
    Swal.fire({
        icon: 'warning',
        title: 'Validation Required',
        text: 'Please fill all required fields before saving.',
        confirmButtonText: 'OK'
    });
    return;
}

if (this.isSubmitting) {
    console.warn('Submission already in progress.');
    return;
}

this.isSubmitting = true;
const formValue = this.form.value;
const trim = (v: any) => (typeof v === 'string' ? v.trim() : (v ?? ''));

const acq: string[] = [];
if (formValue.isOnlineAllow) acq.push('IsOnlineAllow');
if (formValue.isFileUploadAllow) acq.push('IsFileUploadAllow');
if (formValue.isFtpAllow) acq.push('IsFtpAllow');
if (formValue.isEmailUploadAllow) acq.push('IsEmailUploadAllow');
if (formValue.isWebServiceAllow) acq.push('IsWebServiceAllow');
if (formValue.isBeneficiarySmsAllow) acq.push('IsBeneficiarySmsAllow');
if (formValue.isActive) acq.push('IsActive');

const disb: string[] = [];
if (formValue.isOtcAllow) disb.push('IsOtcAllow');
if (formValue.isDirectCreditAllow) disb.push('IsDirectCreditAllow');
if (formValue.isOtherCreditAllow) disb.push('IsOtherCreditAllow');
if (formValue.isRemitterSmsAllow) disb.push('IsRemitterSmsAllow');


const branchData: any = {
    id: this.editId || null,
    agentId: formValue.agentId,
    countryId: formValue.countryId || null,
    provinceId: formValue.provinceId || null,
    cityId: formValue.cityId || null,
    code: trim(formValue.code),
    name: trim(formValue.name),
    agentName: formValue.name,
    agentBranchName: trim(formValue.name),
    phone1: trim(formValue.phone1),
    phone2: trim(formValue.phone2),
    fax: trim(formValue.fax),
    email: trim(formValue.email),
    address: trim(formValue.address),
    acquisitionModes: acq.length ? acq.join(',') : 'None',
    disbursementModes: disb.length ? disb.join(',') : 'None'
};
    const saveObservable = (this.isEditMode && this.editId != null)
      ? this.branchService.updateBranch(this.editId, branchData)
      : this.branchService.createBranch(branchData);

saveObservable.subscribe({
    next: (res) => {
        console.log('Save successful:', res);
        this.isSubmitting = false;
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: `Branch ${this.isEditMode ? 'updated' : 'created'} successfully!`,
            timer: 1500,
            showConfirmButton: false
        }).then(() => {
            this.router.navigate(['/agent-branches']);
        });
    },
    error: (err) => {
        this.isSubmitting = false;
        const errorMsg = err.error?.message || 'An error occurred while saving the branch.';
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMsg
        });
    }
});


}


  private setupExclusiveCheckboxes(): void {
    const exPairs: Array<[string, string]> = [

    ];

        exPairs.forEach(([a, b]) => {
            const ca = this.form.get(a);
            const cb = this.form.get(b);
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

        this.setupExclusiveGroup([
            'isOnlineAllow',
            'isFileUploadAllow',
            'isFtpAllow',
            'isEmailUploadAllow',
            'isWebServiceAllow',
            'isBeneficiarySmsAllow',
            'isActive'

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
            const ctrl = this.form.get(name);
            ctrl?.valueChanges.subscribe((val: boolean) => {
                if (val) {
                    controlNames
                        .filter((n) => n !== name)
                        .forEach((other) => this.form.get(other)?.patchValue(false, { emitEvent: false }));
                }
            });
        });
    }

  onCancel(): void {
    this.router.navigate(['/agent-branches']);
  }

  getPageTitle(): string {
        return this.isEditMode ? 'Edit Branch' : 'Add New Branch';
    }

       currentStep = 0;
    steps: Array<{ title: string; subtitle: string; icon: string }> = [
        { title: 'Basic Information', subtitle: 'Agent basics', icon: 'tablerUserPlus' },
        { title: 'Location Details', subtitle: 'Address & area', icon: 'tablerMapPin' },
        { title: 'Acquisition Modes', subtitle: 'Acquisition channels', icon: 'tablerPlugConnected' },
        { title: 'Disbursement Modes', subtitle: 'Payout methods', icon: 'tablerCurrencyDollar' },

    ];
        nextStep(): void {
        if (this.currentStep < this.steps.length - 1) {
            if (this.validateCurrentStep()) {
                this.currentStep++;
            }
        }
    }
        isStepValid(stepIndex: number): boolean {
        const requiredFields = this.stepFields[stepIndex] || [];

        for (const field of requiredFields) {
            const control = this.form.get(field);
            if (control && control.invalid) {
                return false;
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

    previousStep(): void {
        if (this.currentStep > 0) this.currentStep--;
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

    private validateCurrentStep(): boolean {
        const requiredFields = this.stepFields[this.currentStep] || [];

        for (const field of requiredFields) {
            const control = this.form.get(field);
            if (control) {
                control.markAsTouched();
                if (control.invalid) {
                    this.showValidationWarning();
                    return false;
                }
            }
        }
        return true;
    }

      isFieldInvalid(fieldName: string): boolean {
        const field = this.form.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    getFieldError(fieldName: string): string {
        const field = this.form.get(fieldName);
        if (field?.errors) {
            if (field.errors['required']) return `${fieldName} is required`;
            if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
            if (field.errors['maxlength']) return `${fieldName} cannot exceed ${field.errors['maxlength'].requiredLength} characters`;
            // if (field.errors['required']) return `Invalid email`;
            if (field.errors['invalidEmail']) return `Please enter a valid email with @ and .com.pk`;
        }
        return '';
    }
    goToStep(index: number): void {
        if (index >= 0 && index < this.steps.length) {
            if (index < this.currentStep || this.validateCurrentStep()) {
                this.currentStep = index;
            }
        }
    }
}
