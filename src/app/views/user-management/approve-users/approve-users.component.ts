import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageTitleComponent } from '@app/components/page-title.component';
import { NgIcon } from '@ng-icons/core';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';
import Swal from 'sweetalert2';
import { GenericPaginationComponent } from '@/app/shared/generic-pagination/generic-pagination/generic-pagination.component';

@Component({
  selector: 'app-approve-users',
  standalone: true,
  imports: [CommonModule, PageTitleComponent, NgIcon, NgbCollapseModule, ReactiveFormsModule, GenericPaginationComponent],
  templateUrl: './approve-users.component.html'
})
export class ApproveUsersComponent implements OnInit {
  users: User[] = [];
  isLoading = false;
  isCollapsed: boolean = true;
  islistFiltered: boolean = false;
  filterForm!: FormGroup;
  totalRecord = 0;
  PaginationInfo: any = {
    Page: 1,
    RowsPerPage: 10
  };
  private lastFilterParams: any | undefined;

  constructor(private userService: UserService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      employeeId: [''],
      name: [''],
      loginName: ['']
    });
    this.loadUsers();
  }

  loadUsers(params?: any): void {
    this.isLoading = true;
    if (params) this.lastFilterParams = params;
    const effectiveParams = this.lastFilterParams;
    this.userService.getUsers(this.PaginationInfo.Page, this.PaginationInfo.RowsPerPage, effectiveParams).subscribe({
      next: (res) => { this.users = res.items; this.totalRecord = res.totalCount; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  filter(): void {
    const raw = this.filterForm.value;
    const params: any = {};
    if (raw.name) params['Name'] = raw.name;
    if (raw.employeeId) params['EmployeeId'] = raw.employeeId;
    if (raw.loginName) params['LoginName'] = raw.loginName;
    this.islistFiltered = true;
    this.PaginationInfo.Page = 1;
    this.loadUsers(params);
  }

  onCancel(): void {
    this.filterForm.reset();
    this.isCollapsed = true;
    this.islistFiltered = false;
    this.lastFilterParams = undefined;
    this.PaginationInfo.Page = 1;
    this.loadUsers();
  }

  approveUser(user: User): void {
    if (!user.id) return;
    // Optimistic UI update
    user.isSupervise = true;
    this.userService.superviseUser(user.id, true).subscribe({
      next: () => {
        Swal.fire('Approved', `${user.name} has been approved.`, 'success');
        this.loadUsers();
      }
    });
  }

  rejectUser(user: User): void {
    if (!user.id) return;
    // Optimistic UI update
    user.isSupervise = false;
    this.userService.superviseUser(user.id, false).subscribe({
      next: () => {
        Swal.fire('Rejected', `${user.name} has been rejected.`, 'info');
        this.loadUsers();
      }
    });
  }

  onApproveUsersPageChanged(page: number): void {
    this.PaginationInfo.Page = page;
    this.loadUsers();
  }
}
