import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PageTitleComponent } from '../../../components/page-title.component';
import { NgIcon } from '@ng-icons/core';
import { SkeletonLoaderComponent } from '../../../shared/skeleton/skeleton-loader.component';
import { Router, ActivatedRoute } from '@angular/router';
import { AmlService } from '../services/aml.service';
import { Aml } from '../models/aml.model';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

interface FileDataRow {
  cnic: string;
  accountName: string;
  address?: string;
}

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
  fileData: FileDataRow[] = [];
  selectedFileName: string = '';
  selectedFile: File | null = null;

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

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFileName = file.name;
    this.selectedFile = file;
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension === 'csv') {
      this.parseCSV(file);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      this.parseExcel(file);
    }
  }

  parseExcel(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        this.processFileData(jsonData);
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        Swal.fire({
          icon: 'error',
          title: 'File Parsing Error',
          text: 'Error parsing Excel file. Please check the file format.',
          confirmButtonColor: '#667eea'
        });
      }
    };
    reader.readAsArrayBuffer(file);
  }

  parseCSV(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n');
        const jsonData = lines.map((line: string) => line.split(','));
        
        this.processFileData(jsonData);
      } catch (error) {
        console.error('Error parsing CSV file:', error);
        Swal.fire({
          icon: 'error',
          title: 'File Parsing Error',
          text: 'Error parsing CSV file. Please check the file format.',
          confirmButtonColor: '#667eea'
        });
      }
    };
    reader.readAsText(file);
  }

  processFileData(jsonData: any[]): void {
    if (jsonData.length < 2) {
      Swal.fire({
        icon: 'warning',
        title: 'Empty File',
        text: 'File is empty or has no data rows.',
        confirmButtonColor: '#667eea'
      });
      return;
    }

    // Get headers (first row)
    const headers = jsonData[0].map((h: any) => String(h).toLowerCase().trim());
    
    // Find column indices
    const cnicIndex = headers.findIndex((h: string) => h.includes('cnic'));
    
    // Account name can have multiple possible labels
    const accountNameIndex = headers.findIndex((h: string) => {
      const normalized = h.replace(/[_\s-]/g, ''); // Remove spaces, underscores, hyphens
      return (
        h.includes('accountname') ||
        h.includes('account name') ||
        h.includes('accounttitle') ||
        h.includes('account title') ||
        h.includes('beneficiary') ||
        h.includes('beneficiaryname') ||
        h.includes('beneficiary name') ||
        normalized.includes('name') ||
        h === 'name' ||
        h === 'title'
      );
    });
    
    const addressIndex = headers.findIndex((h: string) => h.includes('address'));

    // Validate required columns
    const missingFields: string[] = [];
    if (cnicIndex === -1) missingFields.push('CNIC');
    if (accountNameIndex === -1) missingFields.push('Account Name');

    if (missingFields.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Required Columns',
        html: `Your file is missing required columns:<br><br><strong>${missingFields.join(', ')}</strong><br><br>Please ensure your file has these columns and try again.`,
        confirmButtonColor: '#667eea'
      });
      this.clearFileInput();
      return;
    }

    // Parse data rows
    const parsedData: FileDataRow[] = [];
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || row.length === 0 || !row[cnicIndex]) continue;

      const cnic = String(row[cnicIndex] || '').trim();
      const accountName = String(row[accountNameIndex] || '').trim();
      const address = addressIndex !== -1 ? String(row[addressIndex] || '').trim() : '';

      // Validate that CNIC and Account Name are not empty
      if (!cnic || !accountName) {
        continue; // Skip rows with missing required data
      }

      parsedData.push({
        cnic,
        accountName,
        address
      });
    }

    if (parsedData.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'No Valid Data',
        text: 'No valid data found in the file. Please check that CNIC and Account Name columns have data.',
        confirmButtonColor: '#667eea'
      });
      this.clearFileInput();
      return;
    }

    this.fileData = parsedData;
    console.log('Parsed file data:', this.fileData);
  }

  removeFile(): void {
    this.fileData = [];
    this.selectedFileName = '';
    this.selectedFile = null;
    this.clearFileInput();
  }

  bulkInsert(): void {
    if (this.fileData.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Data',
        text: 'No data to insert.',
        confirmButtonColor: '#667eea'
      });
      return;
    }

    Swal.fire({
      title: 'Confirm Bulk Insert',
      html: `Are you sure you want to insert <strong>${this.fileData.length}</strong> AML records?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#dc3545',
      confirmButtonText: 'Yes, Insert!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        if (!this.selectedFile) {
          Swal.fire({
            icon: 'error',
            title: 'File Missing',
            text: 'No file selected for upload.',
            confirmButtonColor: '#667eea'
          });
          return;
        }

        this.isSubmitting = true;
        
        // Call actual API to upload the file
        console.log('Uploading AML file:', this.selectedFile.name);
        
        this.amlService.uploadAmlFile(this.selectedFile).subscribe({
          next: (response) => {
            console.log('File upload completed successfully:', response);
            this.isSubmitting = false;
            
            // Clear file data after successful insertion
            this.removeFile();
            
            // Show success message
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: `File uploaded successfully. ${this.fileData.length} AML records processed.`,
              confirmButtonColor: '#667eea'
            }).then(() => {
              // Navigate back to list
              this.router.navigate(['/aml-list']);
            });
          },
          error: (error) => {
            console.error('File upload failed:', error);
            this.isSubmitting = false;
            
            // Show error message
            Swal.fire({
              icon: 'error',
              title: 'Upload Failed',
              text: error.error?.message || 'Failed to upload file. Please try again.',
              confirmButtonColor: '#667eea'
            });
          }
        });
      }
    });
  }

  clearFileInput(): void {
    const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}
