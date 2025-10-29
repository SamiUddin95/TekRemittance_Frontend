import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageTitleComponent } from '@app/components/page-title.component';
import { NgIcon } from '@ng-icons/core';
import { GenericPaginationComponent } from '@/app/shared/generic-pagination/generic-pagination/generic-pagination.component';
import { AgentFileUploadService, AgentUploadedFile } from '@/app/views/processing-management/services/agent-file-upload.service';
import Swal from 'sweetalert2';

interface FileRow {
  id: string;
  templateId: string;
  fileName: string;
  status: string;
  errorMessage?: string;
  rowCount: number;
  processAt?: string;
}

@Component({
  selector: 'app-agent-file-upload-list',
  standalone: true,
  imports: [CommonModule, PageTitleComponent, NgIcon, GenericPaginationComponent],
  templateUrl: './agent-file-upload-list.component.html'
})
export class AgentFileUploadListComponent implements OnInit {
  rows: FileRow[] = [];
  isLoading = false;
  PaginationInfo: any = { Page: 1, RowsPerPage: 10 };
  totalRecord = 0;

  constructor(private router: Router, private service: AgentFileUploadService) {}

  ngOnInit(): void {
    this.loadFiles();
  }

  loadFiles(): void {
    this.isLoading = true;
    this.service.getFiles(this.PaginationInfo.Page, this.PaginationInfo.RowsPerPage).subscribe({
      next: (res: { items: AgentUploadedFile[]; totalCount: number; pageNumber: number; pageSize: number; totalPages: number; statusCode: number; status: string; }) => {
        this.rows = res.items.map((x: AgentUploadedFile) => ({
          id: x.id,
          templateId: x.templateId,
          fileName: x.fileName,
          status: x.status,
          errorMessage: x.errorMessage,
          rowCount: x.rowCount,
          processAt: x.processAt
        }));
        this.totalRecord = res.totalCount;
        this.isLoading = false;
      },
      error: (_err: unknown) => { this.isLoading = false; }
    });
  }

  addFile(): void { this.router.navigate(['/agent-file-upload/add']); }
  view(row: FileRow): void {}
  delete(row: FileRow): void {
    if (!row?.id) return;
    Swal.fire({ icon: 'warning', title: 'Delete file?', showCancelButton: true }).then((r) => {
      if (!r.isConfirmed) return;
      this.service.deleteFile(row.id).subscribe({
        next: (): void => { Swal.fire({ icon: 'success', title: 'Deleted', timer: 1200, showConfirmButton: false }); this.loadFiles(); },
        error: (err: any): void => { const body = (err?.error ?? err) as any; const msg = body?.errorMessage ?? body?.message ?? 'Delete failed'; Swal.fire({ icon: 'error', title: 'Error', text: msg }); }
      });
    });
  }

  onPageChanged(page: number): void {
    this.PaginationInfo.Page = page;
    this.loadFiles();
  }
}
