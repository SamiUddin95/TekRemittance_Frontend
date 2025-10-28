import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { PageTitleComponent } from '@app/components/page-title.component';
import { NgIcon } from '@ng-icons/core';
import { AgentFileUploadService, AgentUploadedFile } from '@/app/views/processing-management/services/agent-file-upload.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-agent-file-upload-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageTitleComponent, NgIcon],
  templateUrl: './agent-file-upload-form.component.html'
})
export class AgentFileUploadFormComponent {
  form: FormGroup;
  isSubmitting = false;
  selectedFile?: File;

  rows: AgentUploadedFile[] = [];

  constructor(private fb: FormBuilder, private router: Router, private service: AgentFileUploadService) {
    this.form = this.fb.group({});
    this.loadRecent();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const f = input.files && input.files[0];
    this.selectedFile = f || undefined;
  }

  save(): void {
    if (!this.selectedFile || this.isSubmitting) return;
    this.isSubmitting = true;
    this.service.uploadFile(this.selectedFile).subscribe({
      next: (): void => {
        this.isSubmitting = false;
        Swal.fire({ icon: 'success', title: 'File uploaded', timer: 1200, showConfirmButton: false });
        this.selectedFile = undefined;
        this.loadRecent();
      },
      error: (err: any) => {
        const body = (err?.error ?? err) as any;
        const msg = body?.errorMessage ?? body?.message ?? 'Upload failed';
        this.isSubmitting = false;
        Swal.fire({ icon: 'error', title: 'Error', text: msg });
      }
    });
  }

  loadRecent(): void {
    this.service.getFiles(1, 10).subscribe({
      next: (res: { items: AgentUploadedFile[]; totalCount: number; pageNumber: number; pageSize: number; totalPages: number; statusCode: number; status: string; }) => { this.rows = res.items; },
      error: (_err: any) => {}
    });
  }

  cancel(): void { this.router.navigate(['/agent-file-upload']); }
}
