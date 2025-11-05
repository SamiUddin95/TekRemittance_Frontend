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

interface Agent {
  id: string;
  name: string;
}

@Component({
  selector: 'app-agent-branch-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageTitleComponent, NgIcon],
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
      // Basic Information
      agentId: ['', [Validators.required]],
      code: ['', [Validators.required, Validators.maxLength(20)]],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      contactPerson: ['', [Validators.required, Validators.maxLength(100)]],
      phone1: ['', [Validators.required, Validators.pattern('^[0-9-+()\s]*$'), Validators.maxLength(20)]],
      phone2: ['', [Validators.pattern('^[0-9-+()\s]*$'), Validators.maxLength(20)]],
      fax: ['', [Validators.maxLength(20)]],
      email: ['', [Validators.email, Validators.maxLength(255)]],
      
      // Location Details
      address: ['', [Validators.maxLength(500)]],
      countryId: [''],
      provinceId: [''],
      cityId: [''],
      
      // Acquisition Modes
      isOnlineAllow: [false],
      isFileUploadAllow: [false],
      isFtpAllow: [false],
      isEmailUploadAllow: [false],
      isWebServiceAllow: [false],
      isBeneficiarySmsAllow: [false],
      
      // Disbursement Modes
      isOtcAllow: [false],
      isDirectCreditAllow: [false],
      isOtherCreditAllow: [false],
      isRemitterSmsAllow: [false],
      
      // Status
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadAgents();
    this.loadCountries();

    // Cascade: when country changes, reset province/city and load provinces
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
          contactPerson: branch.contactPerson,
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
          isActive: branch.isActive !== undefined ? branch.isActive : true
        });
        // After patching values, load dependent dropdowns if we have country/province
        if (branch.countryId) {
          this.loadProvinces(String(branch.countryId));
        }
        if (branch.provinceId) {
          this.loadCities(String(branch.provinceId));
        }
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
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
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

    const disb: string[] = [];
    if (formValue.isOtcAllow) disb.push('IsOtcAllow');
    if (formValue.isDirectCreditAllow) disb.push('IsDirectCreditAllow');
    if (formValue.isOtherCreditAllow) disb.push('IsOtherCreditAllow');
    if (formValue.isRemitterSmsAllow) disb.push('IsRemitterSmsAllow');

    const branchData: any = {
      id: this.editId,
      agentId: formValue.agentId,
      countryId: formValue.countryId || null,
      provinceId: formValue.provinceId || null,
      cityId: formValue.cityId || null,
      code: trim(formValue.code),
      name: trim(formValue.name),
      agentBranchName: trim(formValue.name),
      contactPerson: trim(formValue.contactPerson),
      phone1: trim(formValue.phone1),
      phone2: trim(formValue.phone2),
      fax: trim(formValue.fax),
      email: trim(formValue.email),
      address: trim(formValue.address),
      isActive: !!formValue.isActive,
      acquisitionModes: acq.length ? acq.join(',') : 'None',
      disbursementModes: disb.length ? disb.join(',') : 'None'
    };

    const saveObservable = this.isEditMode && this.editId
      ? this.branchService.updateBranch(this.editId, branchData)
      : this.branchService.createBranch(branchData);

    saveObservable.subscribe({
      next: () => {
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

  onCancel(): void {
    this.router.navigate(['/agent-branches']);
  }

  getPageTitle(): string {
        return this.isEditMode ? 'Edit Bank Branch' : 'Add New Bank Branch';
    }
}
