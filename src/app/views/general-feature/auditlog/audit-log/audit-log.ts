import { Component } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { PageTitleComponent } from '@app/components/page-title.component';
import { GenericPaginationComponent } from '@/app/shared/generic-pagination/generic-pagination/generic-pagination.component';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SkeletonLoaderComponent } from '@/app/shared/skeleton/skeleton-loader.component';
import { ReactiveFormsModule } from '@angular/forms';
import { GeneralFeatureService } from '../../services/general-feature.services';
import { CommonModule, DatePipe } from '@angular/common';


interface AuditLog {
    id: string;
    entityName: string;
    entityId: string;
    action: string;
    oldValues: string;
    newValues: string;
    performedBy: string;
    performedOn: string;
    oldValuesParsed?: any;
    newValuesParsed?: any;
}
@Component({
    selector: 'app-audit-log',
    standalone: true,
    imports: [
        NgIcon,
        NgbAlertModule,
        FormsModule,
        PageTitleComponent,
        ReactiveFormsModule,
        GenericPaginationComponent,
        SkeletonLoaderComponent,
        CommonModule,
        DatePipe,
    ],
    templateUrl: './audit-log.html',
    styleUrls: ['./audit-log.scss'],
})
export class AuditLogComponent {
    searchForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private generalFeatureService: GeneralFeatureService
    ) {
        this.searchForm = this.fb.group({
            searchText: [''],
        });
    }

    ngOnInit(): void {
        this.loadAuditLogs();
        this.searchForm.get('searchText')?.valueChanges.subscribe((search) => {
            this.filterAuditLogs(search);
        });
    }

    isLoading = false;
    PaginationInfo: any = { Page: 1, RowsPerPage: 10 };
    totalLogs = 0;
    pageSize = 10;
    currentPage = 1;
    searchText = '';
    filteredLogs: any[] = [];
    auditLogs: any[] = [];

    loadAuditLogs(searchText: string = ''): void {
    this.isLoading = true;
    this.generalFeatureService.getAuditLogs(
        this.PaginationInfo.Page,
        this.PaginationInfo.RowsPerPage,
        searchText
    ).subscribe({
        next: (res: any) => {
            this.auditLogs = res.items || [];
            this.filteredLogs = [...this.auditLogs];
            this.totalLogs = res.totalCount || 0;
            this.isLoading = false;
        },
        error: (err) => {
            console.error('Error fetching audit logs:', err);
            this.isLoading = false;
        }
    });
}

onAuditPageChanged(page: number): void {
    this.PaginationInfo.Page = page;
    const currentSearch = this.searchForm.get('searchText')?.value || '';
    this.loadAuditLogs(currentSearch);
}

filterAuditLogs(search: string) {
    this.PaginationInfo.Page = 1;
    this.loadAuditLogs(search);
}

    getAuditMessage(details: any[]): string {
        const messageObj = details.find((d) => d.field === 'Message');
        if (!messageObj) return '';
        let actionMessage = messageObj.newValue;
        actionMessage = actionMessage
            .replace(/Modified successfully/gi, 'updated successfully')
            .replace(/Created successfully/gi, 'created successfully')
            .replace(/Failed login attempt/gi, 'Failed login attempt')
            .replace(/Logged In Successfully/gi, 'Logged in successfully')
            .replace(
                /ChangePassword successful/gi,
                'Change password successful'
            );
        return actionMessage;
    }
}
