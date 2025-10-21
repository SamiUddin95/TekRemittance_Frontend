import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageTitleComponent } from '@app/components/page-title.component';
import { NgIcon } from '@ng-icons/core';
import Swal from 'sweetalert2';

interface UploadRow {
  id: number;
  fileName: string;
  fileFormat: string;
  fileStatus: string;
  content?: string;
}

@Component({
  selector: 'app-bulk-upload-list',
  standalone: true,
  imports: [CommonModule, PageTitleComponent, NgIcon],
  templateUrl: './bulk-upload-list.component.html'
})
export class BulkUploadListComponent implements OnInit {
  rows: UploadRow[] = [];
  currentPage = 1;
  totalPages = 3;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Static rows similar to screenshot
    this.rows = [
      { id: 415, fileName: '1119090402012121837ammar_export.xls', fileFormat: 'application/vnd.ms-excel', fileStatus: 'Data Read', content: 'A,B,C\n1,2,3' },
      { id: 414, fileName: '1119050402012153043Book1.xls', fileFormat: 'application/vnd.ms-excel', fileStatus: 'Data Read', content: 'X,Y\n9,8' },
      { id: 413, fileName: '111905040201245506Book1.xls', fileFormat: 'application/vnd.ms-excel', fileStatus: 'Data Read', content: 'foo,bar' },
      { id: 412, fileName: '... 29 march 2012 6dddd.xls', fileFormat: 'application/vnd.ms-excel', fileStatus: 'Data Read', content: '...' },
      { id: 411, fileName: '... 29 march 2012 ddddd.xls', fileFormat: 'application/vnd.ms-excel', fileStatus: 'Data Read', content: '...' },
      { id: 398, fileName: '... 29 march 2012 ddddd.xls', fileFormat: 'application/vnd.ms-excel', fileStatus: 'Data Read', content: '...' },
    ];
  }

  add(): void {
    this.router.navigate(['/bulk-upload/add']);
  }

  view(row: UploadRow): void {
    Swal.fire({
      title: `View File #${row.id}`,
      html: `<textarea id="fileContent" class="swal2-textarea" style="height:200px">${(row.content || '').replace(/</g, '&lt;')}</textarea>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Close',
      preConfirm: () => {
        const ta = document.getElementById('fileContent') as HTMLTextAreaElement | null;
        return ta ? ta.value : '';
      }
    }).then(res => {
      if (res.isConfirmed) {
        // static: persist in memory
        row.content = res.value as string;
        Swal.fire('Saved', 'File content updated (static).', 'success');
      }
    });
  }

  edit(row: UploadRow): void {
    // For now same as view; later you can navigate to a dedicated edit page
    this.view(row);
  }

  delete(row: UploadRow): void {
    Swal.fire({
      title: 'Delete File',
      text: `Are you sure you want to delete "${row.fileName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete'
    }).then(r => {
      if (r.isConfirmed) {
        this.rows = this.rows.filter(x => x.id !== row.id);
        Swal.fire('Deleted', 'File removed (static).', 'success');
      }
    });
  }

  previousPage(): void { if (this.currentPage > 1) this.currentPage--; }
  nextPage(): void { if (this.currentPage < this.totalPages) this.currentPage++; }
  goToPage(p: number): void { if (p >= 1 && p <= this.totalPages) this.currentPage = p; }
}
