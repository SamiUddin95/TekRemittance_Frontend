import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageTitleComponent } from '@app/components/page-title.component';
import { NgIcon } from '@ng-icons/core';

interface TemplateRow {
  id: string;
  name: string;
  format: '.txt' | '.xls' | '.xlsx';
  sheetName: string;
  fixLength: boolean;
  fieldDelimiter: string;
}

@Component({
  selector: 'app-bulk-upload-template-list',
  standalone: true,
  imports: [CommonModule, PageTitleComponent, NgIcon],
  templateUrl: './bulk-upload-template-list.component.html'
})
export class BulkUploadTemplateListComponent implements OnInit {
  rows: TemplateRow[] = [];
  isLoading = false;
  currentPage = 1;
  totalPages = 1;
  itemsPerPage = 10;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Static seed matching the screenshot
    this.rows = [
      { id: '1', name: 'Sales Data Q1', format: '.xls', sheetName: 'sheet1', fixLength: false, fieldDelimiter: 'Comma' },
      { id: '2', name: 'Customer Feedback', format: '.txt', sheetName: 'N/A', fixLength: true, fieldDelimiter: 'Tab' },
      { id: '3', name: 'Inventory Update', format: '.xlsx', sheetName: 'Products', fixLength: false, fieldDelimiter: 'Semicolon' },
      { id: '4', name: 'Marketing Leads', format: '.xls', sheetName: 'Leads', fixLength: false, fieldDelimiter: 'Comma' },
      { id: '5', name: 'Expense Reports', format: '.txt', sheetName: 'N/A', fixLength: true, fieldDelimiter: 'Fixed-Width' },
    ];
    this.totalPages = 3; // static pagination indicator like screenshot
  }

  addTemplate(): void {
    this.router.navigate(['/bulk-upload-template/add']);
  }

  editTemplate(id: string): void {
    // future: navigate to edit with id
    // this.router.navigate(['/bulk-upload-template/edit', id]);
  }

  deleteTemplate(row: TemplateRow): void {
    // static; no deletion for now
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }
  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }
}
