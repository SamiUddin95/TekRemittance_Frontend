import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageTitleComponent } from '@app/components/page-title.component';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-bulk-upload-template-form',
  standalone: true,
  imports: [CommonModule, PageTitleComponent, ReactiveFormsModule, NgIcon],
  templateUrl: './bulk-upload-template-form.component.html'
})
export class BulkUploadTemplateFormComponent {
  form!: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.nonNullable.group({
      name: ['', [Validators.required]],
      sheetName: ['', [Validators.required]],
      format: ['.txt' as '.txt' | '.xls' | '.xlsx', [Validators.required]],
      fixLength: [false],
      fieldDelimiter: [false],
      delimiterText: ['']
    });
  }

  save(): void {
    // static; later wire to API
    this.router.navigate(['/bulk-upload-template']);
  }

  // cancel(): void {
  //   this.router.navigate(['/bulk-upload-template']);
  // }

  onCancel(): void {
    this.router.navigate(['/bulk-upload-template']);
  }
}
