import { filter } from 'rxjs';
import { Component } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { PageTitleComponent } from '@app/components/page-title.component';
import { GenericPaginationComponent } from '@/app/shared/generic-pagination/generic-pagination/generic-pagination.component';
import { FormGroup,FormBuilder } from '@angular/forms';
import { SkeletonLoaderComponent } from '@/app/shared/skeleton/skeleton-loader.component';
import { ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [NgIcon, NgbAlertModule, FormsModule, PageTitleComponent, ReactiveFormsModule,GenericPaginationComponent,SkeletonLoaderComponent],
  templateUrl: './audit-log.html',
  styleUrls: ['./audit-log.scss']
})
export class AuditLogComponent {



  filterForm: FormGroup;


  dataRows: any[] = [];



  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
        searchText: ['']
    });
  }

  isLoading = false;
  PaginationInfo: any = { Page: 1, RowsPerPage: 10 };
  totalLogs = 0;
  pageSize = 10;
  currentPage = 1;
  searchText = '';

  auditLogs: any[] = [];



    onAgentPageChanged(page: number): void {
        this.PaginationInfo.Page = page;
    }

    onClearFilters(): void {
    this.filterForm.reset();
    }


    onSearch(): void {
    this.searchText = this.filterForm.get('searchText')?.value || '';
    this.PaginationInfo.Page = 1;
    }
}
