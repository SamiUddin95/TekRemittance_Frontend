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

  // Preview modal state
  previewVisible = false;
  previewLoading = false;
  previewFileId = '';
  previewHeaders: string[] = [];
  previewTableRows: string[][] = [];
  previewPage = 1;
  previewPageSize = 10;
  previewTotalCount = 0;
  previewTotalPages = 1;

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
  view(row: FileRow): void {
    if (!row?.id) {
      Swal.fire({ icon: 'info', title: 'No id', text: 'File id not found for this row.' });
      return;
    }
    this.openPreview(row.id, 1, this.PaginationInfo.RowsPerPage || 10);
  }

  private mapPreview(items: Array<{ key: string; value: string[] }>): void {
    this.previewHeaders = items.map((c) => String(c.key ?? ''));
    const rowsLen = Math.max(0, ...items.map((c) => (Array.isArray(c.value) ? c.value.length : 0)));
    const rows: string[][] = [];
    for (let r = 0; r < rowsLen; r++) {
      rows.push(items.map((col) => {
        const v = Array.isArray(col.value) && col.value[r] != null ? String(col.value[r]) : '';
        return v;
      }));
    }
    this.previewTableRows = rows;
  }

  private escape(v: string): string {
    return v
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private openPreview(fileId: string, page: number, pageSize: number): void {
    this.previewVisible = true;
    this.previewLoading = true;
    this.previewFileId = fileId;
    this.previewPage = page;
    this.previewPageSize = pageSize;
    this.previewHeaders = [];
    this.previewTableRows = [];
    this.service.getRemittancePreview(fileId, page, pageSize).subscribe({
      next: (res: any) => {
        const payload = res?.data ?? res;
        const items: Array<{ key: string; value: string[] }> = Array.isArray(payload?.items) ? payload.items : [];
        this.mapPreview(items);
        this.previewTotalCount = Number(payload?.totalCount ?? 0);
        this.previewPage = Number(payload?.pageNumber ?? page);
        this.previewPageSize = Number(payload?.pageSize ?? pageSize);
        this.previewTotalPages = Number(payload?.totalPages ?? Math.max(1, Math.ceil(this.previewTotalCount / (this.previewPageSize || 1))));
        this.previewLoading = false;
      },
      error: (err: any) => {
        this.previewLoading = false;
        const msg = err?.error?.errorMessage || err?.message || 'Failed to load preview';
        Swal.fire({ icon: 'error', title: 'Error', text: msg });
      }
    });
  }

  closePreview(): void {
    this.previewVisible = false;
  }

  onPreviewPageChanged(page: number): void {
    if (!this.previewFileId) return;
    this.openPreview(this.previewFileId, page, this.previewPageSize || 10);
  }
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

