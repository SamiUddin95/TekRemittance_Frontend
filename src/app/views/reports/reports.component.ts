import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ReportsService } from './services/reports.service';
import { PageTitleComponent } from '@app/components/page-title.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { tablerFileReport, tablerEye, tablerFileText, tablerFileSpreadsheet, tablerDownload, tablerSearch, tablerX } from '@ng-icons/tabler-icons';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule, PageTitleComponent, NgIconComponent],
  templateUrl: './reports.component.html',
  providers: [ReportsService, provideIcons({ tablerFileReport, tablerEye, tablerFileText, tablerFileSpreadsheet, tablerDownload, tablerSearch, tablerX })]
})
export class ReportsComponent implements OnInit {
  transactions: any[] = [];
  totalTransactions = 0;
  currentPage = 1;
  pageSize = 50;
  loading = false;
  
  filterForm: FormGroup;
  
  // SSR Report properties
  reportPath = '/Report Project1/Report1';
  
  showPdfModal = false;
  pdfUrl: SafeResourceUrl | null = null;
  pdfLoading = false;
  private blobUrl: string | null = null;

  constructor(
    private reportsService: ReportsService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer
  ) {
    this.filterForm = this.fb.group({
      accountNumber: [''],
      status: ['']
    });
  }

  ngOnInit(): void {
    this.loadTransactions();
  }

  // Load transaction data
  loadTransactions(): void {
    this.loading = true;
    const filters = this.filterForm.value;
    this.reportsService.getTransactions(this.currentPage, this.pageSize, filters.status, filters.accountNumber).subscribe({
      next: (response) => {
        this.transactions = response.items || [];
        this.totalTransactions = response.total || 0;
      },
      error: () => {},
      complete: () => this.loading = false
    });
  }

  onClearFilters(): void {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadTransactions();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadTransactions();
  }

  getTotalPages(): number[] {
    const totalPages = Math.ceil(this.totalTransactions / this.pageSize);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Get end index for pagination display
  getEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalTransactions);
  }

  // Get start index for pagination display
  getStartIndex(): number {
    return ((this.currentPage - 1) * this.pageSize) + 1;
  }

  // View PDF in modal
  viewPdfModal(accountNumber?: string): void {
    const parameters: Record<string, string> = {
      'AccountNumber': accountNumber || ''
    };
    
    this.pdfLoading = true;
    this.showPdfModal = true;
    
    this.reportsService.download('/Report Project1/Report1', 'PDF', parameters, 'Report1')
      .subscribe(res => {
        const blob = res.body as Blob;
        this.blobUrl = URL.createObjectURL(blob);
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.blobUrl);
        this.pdfLoading = false;
      }, error => {
        this.pdfLoading = false;
        this.showPdfModal = false;
      });
  }
  
  closePdfModal(): void {
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
      this.blobUrl = null;
    }
    this.pdfUrl = null;
    this.showPdfModal = false;
    this.pdfLoading = false;
  }

  downloadReport(accountNumber?: string, format: 'PDF'|'EXCEL'|'CSV' = 'PDF'): void {
    const parameters: Record<string, string> = {
      'AccountNumber': accountNumber || ''  // Always send AccountNumber, empty string if not provided
    };
    
    this.reportsService.download('/Report Project1/Report1', format, parameters, 'Report1')
      .subscribe(res => {
        const blob = res.body as Blob;
        const cd = res.headers.get('Content-Disposition');
        const name = cd?.match(/filename="?([^";]+)"?/)?.[1] || 'Report1';
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = name;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(link.href);
      });
  }

  download(format: 'PDF'|'EXCEL', fileName = 'Report1'): void {
    if (this.transactions.length === 0) return;
     
    const allDataParams = {
      transactions: JSON.stringify(this.transactions),
      totalCount: this.totalTransactions.toString(),
      accountNumber: this.filterForm.value.accountNumber || '',
      currentPage: this.currentPage.toString(),
      pageSize: this.pageSize.toString()
    };
    
    this.reportsService.download(this.reportPath, format, allDataParams, fileName)
      .subscribe(res => {
        const blob = res.body as Blob;
        const cd = res.headers.get('Content-Disposition');
        const name = cd?.match(/filename="?([^";]+)"?/)?.[1] || fileName;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = name;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(link.href);
      });
  }
}
