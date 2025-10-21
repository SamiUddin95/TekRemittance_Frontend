import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageTitleComponent } from '@app/components/page-title.component';
import { NgIcon } from '@ng-icons/core';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';
import Swal from 'sweetalert2';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, PageTitleComponent, NgIcon, NgbCollapseModule, ReactiveFormsModule],
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  isLoading = false;
  isCollapsed: boolean = true;
  islistFiltered: boolean = true;
  filterForm!: FormGroup;

  constructor(private userService: UserService, private router: Router, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      employeeId: [''],
      name: [''],
      loginName: ['']
    });
    this.loadUsers();
  }
 
  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (users) => { this.users = users; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  addNewUser(): void { this.router.navigate(['/users/add']); }
  editUser(id: string): void { this.router.navigate(['/users/edit', id]); }

  toggleApproved(user: User): void {
    this.userService.updateUser(user.id!, { isApproved: !user.isApproved }).subscribe();
  }

  deleteUser(user: User): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete ${user.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((r) => {
      if (r.isConfirmed && user.id) {
        this.userService.deleteUser(user.id).subscribe({ next: (ok) => { if (ok) { Swal.fire('Deleted!', 'User has been deleted.', 'success'); this.loadUsers(); } } });
      }
    });
  }

  filter(){
    const raw = this.filterForm.value;
    const params: any = {};
    if (raw.name) params['Name'] = raw.name;
    if (raw.employeeId) params['EmployeeId'] = raw.employeeId;
    if (raw.loginName) params['LoginName'] = raw.loginName;
    this.isLoading = true;
    this.userService.getUsers(params).subscribe({
      next: (users) => { this.users = users; this.isLoading = false; this.islistFiltered = true; },
      error: () => { this.isLoading = false; }
    });
  }

  onCancel(){
    this.filterForm.reset();
    this.isCollapsed = true;
    this.islistFiltered = false;
    this.loadUsers();
  }
}
