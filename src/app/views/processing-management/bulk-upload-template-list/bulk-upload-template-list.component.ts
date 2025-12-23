import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageTitleComponent } from '@app/components/page-title.component';
import { NgIcon } from '@ng-icons/core';
import { GenericPaginationComponent } from '@/app/shared/generic-pagination/generic-pagination/generic-pagination.component';
import { TemplateService, TemplateListItem } from '@/app/views/processing-management/services/template.service';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { SkeletonLoaderComponent } from '../../../shared/skeleton/skeleton-loader.component';
// import { FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';



interface TemplateRow {
  id: string;
  name: string;
  agentName: string;
  agentId: string;
  format: '.txt' | '.xls' | '.xlsx' | '.csv' | string;
  sheetName: string;
  fixLength: boolean;
  fieldDelimiter: string;
}

@Component({
  selector: 'app-bulk-upload-template-list',
  standalone: true,
  imports: [CommonModule, PageTitleComponent, NgIcon, GenericPaginationComponent, SkeletonLoaderComponent, CommonModule,
  ReactiveFormsModule],
  templateUrl: './bulk-upload-template-list.component.html'
})
export class BulkUploadTemplateListComponent implements OnInit {

 agentaccountFilterForm: FormGroup;

  rows: TemplateRow[] = [];
  isLoading = false;
  PaginationInfo: any = { Page: 1, RowsPerPage: 10 };
  totalRecord = 0;
 

  constructor(private router: Router, private templateService: TemplateService, private fb: FormBuilder) {
this.agentaccountFilterForm = this.fb.group({
  name: [''],
  agentName: [''],
  sheetName: ['']
});


  }

  ngOnInit(): void {
    this.loadTemplates();
  }
onSearch(): void {
  this.loadTemplates();
}

  onClearFilters(): void{
 this.agentaccountFilterForm.reset({
            name: '',
            agentName: '',
            sheetName: ''
        });
        this.loadTemplates();
  }

  loadTemplates(): void {
    this.isLoading = true;
          const filters = this.agentaccountFilterForm.value;
    this.templateService.getTemplates(this.PaginationInfo.Page, this.PaginationInfo.RowsPerPage,filters)
      .subscribe({
        next: (res) => {
          this.rows = (res.items as TemplateListItem[]).map((t) => ({
            id: t.id,
            name: t.name,
            agentName: t.agentName ?? '-',
            agentId: t.agentId ?? '',
            format: t.format,
            sheetName: t.sheetName ?? 'N/A',
            fixLength: t.fixLength,
            fieldDelimiter: t.fieldDelimiter || '-'
          }));
          this.totalRecord = res.totalCount;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading templates:', err);
          this.isLoading = false;
        }
      });
  }

  addTemplate(): void {
    this.router.navigate(['/bulk-upload-template/add']);
  }

  editTemplate(row: TemplateRow): void {
    // future: navigate to edit with id
    // this.router.navigate(['/bulk-upload-template/edit', id]);
    forkJoin({
      template: this.templateService.getTemplateByAgent(row.agentId),
      fields: this.templateService.getTemplateFields(row.id)
    }).subscribe({
      next: (result) => {
        this.router.navigate(['/bulk-upload-template/add'], { state: result });
      },
      error: (err) => {
        console.error('Error loading template for edit', err);
      }
    });
  }

  deleteTemplate(row: TemplateRow): void {
    if (!row.agentId) return;
    Swal.fire({
      icon: 'warning',
      title: 'Delete template?',
      text: 'This will remove the template for this agent.',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    }).then((res) => {
      if (!res.isConfirmed) return;
      this.templateService.deleteTemplateByAgent(row.agentId).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: 'Template deleted', timer: 1200, showConfirmButton: false });
          this.loadTemplates();
        },
        error: (err) => {
          const body = (err?.error ?? err) as any;
          const msg = body?.errorMessage ?? body?.message ?? err?.message ?? 'Failed to delete template.';
          Swal.fire({ icon: 'error', title: 'Delete failed', text: msg });
        }
      });
    });
  }

  onPageChanged(page: number): void {
    this.PaginationInfo.Page = page;
    this.loadTemplates();
  }
}
