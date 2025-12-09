import { GroupService } from './../services/group.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PageTitleComponent } from '@app/components/page-title.component';
import { NgIcon } from '@ng-icons/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { horizontalMenuItems } from '../../../layouts/components/data';
import { UserService } from '../services/user.service';
import Swal from 'sweetalert2';
import { User } from '../models/user.model';
import { Group } from './../models/group.model';
import { debug } from 'console';

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
    imports: [
        CommonModule,
        PageTitleComponent,
        NgIcon,
        ReactiveFormsModule,
        NgbNavModule,
    ],
    templateUrl: './group-form.component.html',
})
export class GroupFormComponent implements OnInit {
    Groupform!: FormGroup;
    activeTab: string = 'info';
    editId?: any;
    allUsers: User[] = [];
    users: User[] = [];
    selectedUsers: User[] = [];
    assignedUsers: User[] = [];
    showUserDialog = false;
    userSelections: { [id: string]: boolean } = {};
    selectAllUsers = false;
    isSubmitting = false;
    isLoading = false;
    isEditMode = false;
    Id: string | null = null;
    userSearchText: string = '';
    filteredUsers: any[] = [];
    tabsEnabled = {
        info: true,
        users: false,
        permissions: false,
    };
    totalRecord: number = 0;
    isUsersTabDisabled = true;
    isPermissionsTabDisabled = true;
    permissions: SecurityPermission[] = [
        {
            code: 'VIEW_DASHBOARD',
            name: 'View Dashboard',
            description: 'Access to dashboard screens',
        },
        {
            code: 'MANAGE_USERS',
            name: 'Manage Users',
            description: 'Create, edit and delete users',
        },
        {
            code: 'APPROVE_USERS',
            name: 'Approve Users',
            description: 'Approve or reject users',
        },
        {
            code: 'MANAGE_DISBURSEMENT',
            name: 'Disbursement Management',
            description: 'Access to disbursement queues',
        },
        {
            code: 'MANAGE_PROCESSING',
            name: 'Processing Management',
            description: 'Access to file upload and processing',
        },
    ];

    modulePermissions: ModulePermissionRow[] = [];

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private userService: UserService,
        private GroupService: GroupService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.Groupform = this.fb.group({
            name: ['', Validators.required],
            description: ['', Validators.required],
            isActive: [true],
            userSearchText: [''],
        });
        this.buildModulePermissions();
        this.filteredUsers = this.allUsers;

        const stateId = history.state?.id
            ? String(history.state.id)
            : undefined;
        if (stateId) {
            this.isEditMode = true;
            this.editId = stateId;
            this.Id = this.editId;
            this.loadGroup(stateId);
        } else if (this.route.snapshot.params['id']) {
            this.isEditMode = true;
            this.editId = this.route.snapshot.params['id'];
            this.loadGroup(this.editId);
        }
    }

    filterUsers() {
        const search = this.Groupform.get('userSearchText')?.value?.toLowerCase().trim() || '';

        if (!search || search.length < 3) {
            this.filteredUsers = [...this.allUsers];
            return;
        }
        this.filteredUsers = this.allUsers.filter(u =>
            (u.name?.toLowerCase().includes(search)) ||
            (u.email?.toLowerCase().includes(search))
        );
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
                    canDelete: false,
                });
                module.children!.forEach((child: any) => {
                    this.modulePermissions.push({
                        key: `component_${module.label}_${child.label}`,
                        moduleLabel: module.label,
                        componentLabel: child.label,
                        canView: false,
                        canCreate: false,
                        canEdit: false,
                        canDelete: false,
                    });
                });
            } else {
                this.modulePermissions.push({
                    key: `module_${module.label}`,
                    moduleLabel: module.label,
                    canView: false,
                    canCreate: false,
                    canEdit: false,
                    canDelete: false,
                });
            }
        });
    }


    openUserDialog(): void {
        this.showUserDialog = true;
        this.userSelections = {};
        this.selectAllUsers = false;
        this.GroupService.getAssignedUsers(this.editId!).subscribe({
            next: (assigned) => {
                this.assignedUsers = assigned || [];
                this.assignedUsers.forEach(u => {
                    if (u.id) this.userSelections[u.id] = true;
                });
                this.loadUsers();
            },
            error: () => {
                this.assignedUsers = [];
                this.loadUsers();
            }
        });
    }

    closeUserDialog(): void {
        this.showUserDialog = false;
    }

    toggleSelectAllUsers(): void {
        this.selectAllUsers = !this.selectAllUsers;
        this.allUsers.forEach((u) => {
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
        if (!this.editId) {
            Swal.fire('Error', 'Group ID missing!', 'error');
            return;
        }
        const selectedUsersFromDialog = this.allUsers.filter(
            u => u.id && this.userSelections[u.id]
        );
        const finalUserIds = selectedUsersFromDialog.map(u => u.id!);
        if (finalUserIds.length === 0) {
            Swal.fire('Info', 'No users selected for this group.', 'info');
            return;
        }
        this.isSubmitting = true;
        this.GroupService.assignUsersToGroup(this.editId, finalUserIds).subscribe({
            next: () => {
                Swal.fire('Success', 'Users updated successfully.', 'success');
                this.assignedUsers = [...selectedUsersFromDialog];
                this.selectedUsers = [...selectedUsersFromDialog];
                this.showUserDialog = false;
                this.isSubmitting = false;
            },
            error: () => {
                Swal.fire('Error', 'Failed to update users.', 'error');
                this.isSubmitting = false;
            }
        });
    }

    togglePermission(p: SecurityPermission): void {
        p.selected = !p.selected;
    }

    toggleModulePermission(
        row: ModulePermissionRow,
        type: 'view' | 'create' | 'edit' | 'delete'
    ): void {
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
        const target = !(
            row.canView &&
            row.canCreate &&
            row.canEdit &&
            row.canDelete
        );
        this.modulePermissions.forEach((r) => {
            if (r.moduleLabel === row.moduleLabel) {
                r.canView = target;
                r.canCreate = target;
                r.canEdit = target;
                r.canDelete = target;
            }
        });
    }

    updateGroup(groupData: Partial<Group>): void {
        if (!this.Id) return;
        this.isSubmitting = true;
        this.GroupService.updateGroup(this.Id, groupData).subscribe({
            next: (res) => {
                Swal.fire(
                    'Success!',
                    'Group has been updated successfully.',
                    'success'
                );
                this.router.navigate(['/group-management']);
                this.isSubmitting = false;
            },
            error: (error) => {
                console.error('Error updating group:', error);
                Swal.fire('Error!', 'Failed to update group.', 'error');
                this.isSubmitting = false;
            },
        });
    }

    createGroup(groupData: Omit<Group, 'id'>): void {
        this.isSubmitting = true;

        this.GroupService.addGroup(groupData).subscribe({
            next: (res) => {
                Swal.fire(
                    'Success!',
                    'Group has been created successfully.',
                    'success'
                );
                this.router.navigate(['/group-list']);
                this.isSubmitting = false;
            },
            error: (error) => {
                const backendMessage = error?.error?.message || '';

                if (backendMessage.includes('Cannot insert duplicate key')) {
                    Swal.fire(
                        'Duplicate!',
                        'A group with this name already exists.',
                        'warning'
                    );
                } else {
                    Swal.fire(
                        'Error!',
                        backendMessage || 'Failed to create group.',
                        'error'
                    );
                }

                this.isSubmitting = false;
            },
        });
    }

    submit(): void {
        if (this.Groupform.invalid || this.isSubmitting) return;
        this.isSubmitting = true;
        const formValue = this.Groupform.value;
        const GroupData: Partial<Group> = {
            id: this.editId || null,
            name: formValue.name,
            description: formValue.description,
            isActive: formValue.isActive,
            createdBy: formValue.loggedInUserName,
            updatedBy: formValue.loggedInUserName,
        };
        const saveObservable =
            this.isEditMode && this.editId
                ? this.GroupService.updateGroup(this.editId, GroupData)
                : this.GroupService.addGroup(GroupData);
        saveObservable.subscribe({
            next: (res) => {
                if (!this.isEditMode) {
                    this.editId = res.data.id;
                    this.Id = res.data.id;
                }
                Swal.fire({
                    icon: 'success',
                    title: this.isEditMode ? 'Updated' : 'Saved',
                    text: this.isEditMode
                        ? 'Group updated successfully.'
                        : 'Group created successfully.',
                    timer: 1500,
                    showConfirmButton: false,
                });
                this.isUsersTabDisabled = false;
                this.isPermissionsTabDisabled = false;
                this.activeTab = 'users';
                this.isSubmitting = false;
            },
            error: (err) => {
                console.error(err);
                Swal.fire(
                    'Error',
                    this.isEditMode
                        ? 'Failed to update group.'
                        : 'Failed to create group.',
                    'error'
                );
                this.isSubmitting = false;
            },
        });
    }

    beforeTabChange(event: any) {
        if (event.nextId === 'users' && this.isUsersTabDisabled) {
            event.preventDefault();
            return;
        }
        if (event.nextId === 'permissions' && this.isPermissionsTabDisabled) {
            event.preventDefault();
            return;}
        this.activeTab = event.nextId;
    }

    cancel(): void {
        this.router.navigate(['/users/groups']);
    }

    loadGroup(groupId: string): void {
        this.isLoading = true;
        this.GroupService.getGroupById(groupId).subscribe({
            next: (Group: any) => {
                this.Groupform.patchValue({
                    name: Group.name,
                    description: Group.description,
                    isActive: Group.isActive,
                });
                this.isUsersTabDisabled = false;
                this.isPermissionsTabDisabled = false;
                this.loadAssignedUsers(groupId);
                if (this.isEditMode) this.activeTab = 'info';
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading group:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load group details.',
                }).then(() => this.cancel());
            },
        });
    }

    loadUsers() {
        this.userService.getUsers(1, 100000).subscribe({
            next: (res) => {
                this.allUsers = res.items || [];
                this.filteredUsers = [...this.allUsers];
                this.allUsers.forEach(u => {
                    if (u.id) {
                        this.userSelections[u.id] = this.assignedUsers.some(a => a.id === u.id);
                    }
                });
                this.filteredUsers = [...this.allUsers];
                this.cdr.detectChanges();
            }
        });
    }

    loadAssignedUsers(groupId: string): void {
        this.isLoading = true;
        this.GroupService.getAssignedUsers(groupId).subscribe({
            next: (users: User[]) => {
                this.assignedUsers = users;
                this.selectedUsers = [...users];
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error loading assigned users:', err);
                this.isLoading = false;
            },
        });
    }

    getFieldError(fieldName: string): string {
        const field = this.Groupform.get(fieldName);
        if (field && (field.touched || field.dirty) && field.errors) {
            if (field.errors['required'])
                return `${
                    fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
                } is required`;
        }
        return '';
    }
}
