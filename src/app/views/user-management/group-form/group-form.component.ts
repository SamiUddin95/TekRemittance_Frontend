import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PageTitleComponent } from '@app/components/page-title.component';
import { NgIcon } from '@ng-icons/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { horizontalMenuItems } from '../../../layouts/components/data';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';
import Swal from 'sweetalert2';

interface SecurityPermission {
  code: string;
  name: string;
  description?: string;
  selected?: boolean;
}

interface ModulePermissionRow {
  key: string;
  moduleLabel: string;
  componentLabel?: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

@Component({
  selector: 'app-group-form',
  standalone: true,
  imports: [CommonModule, PageTitleComponent, NgIcon, ReactiveFormsModule, NgbNavModule],
  templateUrl: './group-form.component.html'
})
export class GroupFormComponent implements OnInit {
  form!: FormGroup;
  activeTab: string = 'info';

  allUsers: User[] = [];
  selectedUsers: User[] = [];
  showUserDialog = false;
  userSelections: { [id: string]: boolean } = {};
  selectAllUsers = false;

  permissions: SecurityPermission[] = [
    { code: 'VIEW_DASHBOARD', name: 'View Dashboard', description: 'Access to dashboard screens' },
    { code: 'MANAGE_USERS', name: 'Manage Users', description: 'Create, edit and delete users' },
    { code: 'APPROVE_USERS', name: 'Approve Users', description: 'Approve or reject users' },
    { code: 'MANAGE_DISBURSEMENT', name: 'Disbursement Management', description: 'Access to disbursement queues' },
    { code: 'MANAGE_PROCESSING', name: 'Processing Management', description: 'Access to file upload and processing' },
  ];

  modulePermissions: ModulePermissionRow[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [''],
      description: ['']
    });

    this.loadAvailableUsers();

    this.buildModulePermissions();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // TODO: Load existing group details when API is available
    }
  }

  private buildModulePermissions(): void {
    this.modulePermissions = [];

    horizontalMenuItems.forEach((module: any) => {
      const hasChildren = !!module.children && module.children.length > 0;

      if (hasChildren) {
        this.modulePermissions.push({
          key: `module_${module.label}`,
          moduleLabel: module.label,
          canView: false,
          canCreate: false,
          canEdit: false,
          canDelete: false
        });

        module.children!.forEach((child: any) => {
          this.modulePermissions.push({
            key: `component_${module.label}_${child.label}`,
            moduleLabel: module.label,
            componentLabel: child.label,
            canView: false,
            canCreate: false,
            canEdit: false,
            canDelete: false
          });
        });
      } else {
        this.modulePermissions.push({
          key: `module_${module.label}`,
          moduleLabel: module.label,
          canView: false,
          canCreate: false,
          canEdit: false,
          canDelete: false
        });
      }
    });
  }

  loadAvailableUsers(): void {
    this.userService.getUsers(1, 100).subscribe({
      next: (res) => {
        this.allUsers = res.items || [];
      },
      error: () => {
        this.allUsers = [];
      }
    });
  }

  openUserDialog(): void {
    this.showUserDialog = true;
    this.userSelections = {};
    this.selectAllUsers = false;
  }

  closeUserDialog(): void {
    this.showUserDialog = false;
  }

  toggleSelectAllUsers(): void {
    this.selectAllUsers = !this.selectAllUsers;
    this.allUsers.forEach(u => {
      if (u.id) {
        this.userSelections[u.id] = this.selectAllUsers;
      }
    });
  }

  toggleUserSelection(user: User): void {
    if (!user.id) return;
    this.userSelections[user.id] = !this.userSelections[user.id];
  }

  saveSelectedUsers(): void {
    this.selectedUsers = this.allUsers.filter(u => u.id && this.userSelections[u.id]);
    this.showUserDialog = false;
  }

  togglePermission(p: SecurityPermission): void {
    p.selected = !p.selected;
  }

  toggleModulePermission(row: ModulePermissionRow, type: 'view' | 'create' | 'edit' | 'delete'): void {
    switch (type) {
      case 'view':
        row.canView = !row.canView;
        break;
      case 'create':
        row.canCreate = !row.canCreate;
        break;
      case 'edit':
        row.canEdit = !row.canEdit;
        break;
      case 'delete':
        row.canDelete = !row.canDelete;
        break;
    }
  }

  toggleModuleRowAll(row: ModulePermissionRow): void {
    const target = !(row.canView && row.canCreate && row.canEdit && row.canDelete);

    this.modulePermissions.forEach(r => {
      if (r.moduleLabel === row.moduleLabel) {
        r.canView = target;
        r.canCreate = target;
        r.canEdit = target;
        r.canDelete = target;
      }
    });
  }

  // selectAllPermissions(): void {
  //   this.permissions.forEach(p => p.selected = true);
  // }

  // clearAllPermissions(): void {
  //   this.permissions.forEach(p => p.selected = false);
  // }

  // selectAllModulePermissions(): void {
  //   this.modulePermissions.forEach(r => {
  //     r.canView = true;
  //     r.canCreate = true;
  //     r.canEdit = true;
  //     r.canDelete = true;
  //   });
  // }

  // clearAllModulePermissions(): void {
  //   this.modulePermissions.forEach(r => {
  //     r.canView = false;
  //     r.canCreate = false;
  //     r.canEdit = false;
  //     r.canDelete = false;
  //   });
  // }
 

  submit(): void {
    const payload = {
      ...this.form.value,
      users: this.selectedUsers.map(u => u.id),
      permissions: this.permissions.filter(p => p.selected).map(p => p.code),
      modulePermissions: this.modulePermissions.map(r => ({
        key: r.key,
        module: r.moduleLabel,
        component: r.componentLabel,
        view: r.canView,
        create: r.canCreate,
        edit: r.canEdit,
        delete: r.canDelete
      }))
    };

    Swal.fire('Saved', 'Security group has been saved (UI only).', 'success');
    // TODO: call API to persist when backend is ready
    this.router.navigate(['/users/groups']);
  }

  cancel(): void {
    this.router.navigate(['/users/groups']);
  }
}
