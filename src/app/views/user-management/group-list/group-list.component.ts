import { GroupService } from './../services/group.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageTitleComponent } from '@app/components/page-title.component';
import { NgIcon } from '@ng-icons/core';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { Group } from '../models/group.model';
import Swal from 'sweetalert2';
import { GenericPaginationComponent } from '@/app/shared/generic-pagination/generic-pagination/generic-pagination.component';

interface SecurityGroup {
    id: string;
    name: string;
    description?: string;
    usersCount?: number;
}

@Component({
    selector: 'app-group-list',
    standalone: true,
    imports: [
        CommonModule,
        PageTitleComponent,
        GenericPaginationComponent,
        NgIcon,
        NgbCollapseModule,
    ],
    templateUrl: './group-list.component.html',
})
export class GroupListComponent implements OnInit {
    groups: Group[] = [];
    isLoading = false;
    islistFiltered: boolean = true;

    totalRecord = 0;
    PaginationInfo: any = {
        Page: 1,
        RowsPerPage: 10,
    };

    constructor(private router: Router, private GroupService: GroupService) {}

    ngOnInit(): void {
        this.loadGroups();
    }

    loadGroups(): void {
        this.isLoading = true;
        this.GroupService.getGroups(
            this.PaginationInfo.Page,
            this.PaginationInfo.RowsPerPage
        ).subscribe({
            next: (res) => {
                this.groups = res.items || [];
                this.totalRecord = res.totalCount || 0;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading groups:', err);
                this.isLoading = false;
            },
        });
    }

    addNewGroup(): void {
        this.router.navigate(['/users/groups/add']);
    }

    deletegroup(Group: Group): void {
        Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to delete ${Group.name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.isConfirmed && Group.id) {
                this.GroupService.deleteGroup(Group.id).subscribe({
                    next: () => {
                        Swal.fire(
                            'Deleted!',
                            'Branch has been deleted.',
                            'success'
                        );
                        this.loadGroups();
                    },
                    error: (error) => {
                        console.error('Error deleting branch:', error);
                        Swal.fire(
                            'Error!',
                            'Failed to delete branch.',
                            'error'
                        );
                    },
                });
            }
        });
    }

    editGroup(id: string): void {
        this.router.navigate(['/users/groups/edit', id]);
    }

    getStatusBadgeClass(isActive: boolean): string {
        return isActive ? 'badge bg-success' : 'badge bg-danger';
    }

    getStatusText(isActive: boolean): string {
        return isActive ? 'Active' : 'Inactive';
    }

    onGroupPageChanged(page: number) {
        this.PaginationInfo.Page = page;
        this.loadGroups();
    }
}
