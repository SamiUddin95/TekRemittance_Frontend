import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PageTitleComponent } from '../../../components/page-title.component';
import { NgIcon } from '@ng-icons/core';
import { SkeletonLoaderComponent } from '../../../shared/skeleton/skeleton-loader.component';
import { Router, ActivatedRoute } from '@angular/router';
import { AmlService } from '../services/aml.service';
import { Aml } from '../models/aml.model';

@Component({
  selector: 'app-aml-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageTitleComponent, NgIcon, SkeletonLoaderComponent],
  templateUrl: './aml-form.component.html',
  styleUrls: ['./aml-form.component.css']
})
export class AmlFormComponent implements OnInit {
  amlForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  isSubmitting = false;
  amlId: string | null = null;

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private amlService: AmlService
  ) {
    this.amlForm = this.fb.group({
      cnic: ['', [Validators.required, Validators.pattern('^[0-9]{13}$')]],
      accountName: ['', [Validators.required]],
      address: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.checkEditMode();
  }

  checkEditMode(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.amlId = id;
        this.loadAmlData(id);
      }
    });
  }

  loadAmlData(id: string): void {
    this.isLoading = true;
    this.amlService.getAmlById(id).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.amlForm.patchValue({
            cnic: response.data.cnic,
            accountName: response.data.accountName,
            address: response.data.address
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading AML data:', error);
        this.isLoading = false;
      }
    });
  }

  validateCnic(event: any): void {
    const value = event.target.value;
    // Remove any non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');
    // Limit to 13 digits
    const truncatedValue = numericValue.slice(0, 13);
    // Update the input value
    event.target.value = truncatedValue;
    // Update the form control
    this.amlForm.get('cnic')?.setValue(truncatedValue);
  }

  onSubmit(): void {
    if (this.amlForm.valid) {
      this.isSubmitting = true;
      
      const formData = this.amlForm.value;
      
      if (this.isEditMode && this.amlId) {
        // Update existing AML
        this.amlService.updateAml({
          id: this.amlId,
          cnic: formData.cnic,
          accountName: formData.accountName,
          address: formData.address,
          createdBy: 'current-user', // This should come from auth service
          createdOn: new Date().toISOString(),
          updatedBy: 'current-user',
          updatedOn: new Date().toISOString()
        }).subscribe({
          next: (response) => {
            if (response.status === 'success') {
              console.log('AML updated successfully');
              this.router.navigate(['/aml-list']);
            }
            this.isSubmitting = false;
          },
          error: (error) => {
            console.error('Error updating AML:', error);
            this.isSubmitting = false;
          }
        });
      } else {
        // Create new AML
        this.amlService.createAml({
          cnic: formData.cnic,
          accountName: formData.accountName,
          address: formData.address
        }).subscribe({
          next: (response) => {
            if (response.status === 'success') {
              console.log('AML created successfully');
              this.router.navigate(['/aml-list']);
            }
            this.isSubmitting = false;
          },
          error: (error) => {
            console.error('Error creating AML:', error);
            this.isSubmitting = false;
          }
        });
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.amlForm.controls).forEach(key => {
        this.amlForm.get(key)?.markAsTouched();
      });
    }
  }

  cancel(): void {
    console.log('Cancel operation');
    this.amlForm.reset();
    this.router.navigate(['/aml-list']);
  }

  getPageTitle(): string {
    return this.isEditMode ? 'Edit AML' : 'Add AML';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.amlForm.get(fieldName);
    return field ? field.invalid && (field.touched || field.dirty) : false;
  }

  getFieldError(fieldName: string): string {
    const field = this.amlForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return 'This field is required';
      }
      if (field.errors['pattern']) {
        return 'CNIC must be exactly 13 digits';
      }
    }
    return '';
  }

  setEditMode(): void {
    this.isEditMode = true;
    // Example: Set form values for editing
    this.amlForm.patchValue({
      cnic: '3520212345671',
      accountName: 'Muhammad Ahmed',
      address: '123 Main Street, Karachi, Pakistan'
    });
  }
}
