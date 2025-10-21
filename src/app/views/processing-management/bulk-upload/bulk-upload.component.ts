import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageTitleComponent } from '@app/components/page-title.component';
import { NgIcon } from '@ng-icons/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-bulk-upload',
  standalone: true,
  imports: [CommonModule, PageTitleComponent, NgIcon],
  templateUrl: './bulk-upload.component.html'
})
export class BulkUploadComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  fileName = '';
  file?: File;
  isSubmitting = false;

  constructor(private router: Router) {}

  browse(): void {
    this.fileInput?.nativeElement?.click();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const f = input.files && input.files[0];
    this.file = f ?? undefined;
    this.fileName = f ? f.name : '';
  }

  cancel(): void {
    this.router.navigate(['/bulk-upload']);
  }

  save(): void {
    // static: just show success
    Swal.fire('Saved', this.file ? `Uploaded: ${this.file.name}` : 'No file selected (demo)', 'success');
  }
}
