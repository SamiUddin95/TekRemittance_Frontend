import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageTitleComponent } from '@app/components/page-title.component';
import { AgentService } from '../services/agent.service';
import { Agent } from '../models/agent.model';
import { NgIcon } from '@ng-icons/core';
import Swal from 'sweetalert2';
import { GenericPaginationComponent } from '@/app/shared/generic-pagination/generic-pagination/generic-pagination.component';
import { SkeletonLoaderComponent } from '../../../shared/skeleton/skeleton-loader.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
@Component({
    selector: 'app-agent-list',
    standalone: true,
    imports: [CommonModule, PageTitleComponent, NgIcon,ReactiveFormsModule, GenericPaginationComponent, SkeletonLoaderComponent],
    templateUrl: './agent-list.component.html'
})
export class AgentListComponent implements OnInit {

    agentFilterForm: FormGroup;
    agents: Agent[] = [];
    PaginationInfo: any = { Page: 1, RowsPerPage: 10 };
    totalRecord = 0;
    isLoading = false;

    constructor(
        private agentService: AgentService,
        private router: Router,
        private fb: FormBuilder
    ) {
        this.agentFilterForm = this.fb.group({
            code: [''],
            agentname: [''],
            status: [''] // optional, e.g., 'Active'/'Inactive'
        });
    }

    ngOnInit(): void {
        this.loadAgents();
    }

    loadAgents(): void {
    this.isLoading = true;
    const filters = this.agentFilterForm.value;

    this.agentService.getAgents(
        this.PaginationInfo.Page,
        this.PaginationInfo.RowsPerPage,
        filters.code,
        filters.agentname,
        filters.status
    ).subscribe({
        next: (res) => {
            this.agents = res.items;
            this.totalRecord = res.totalCount;
            this.isLoading = false;
        },
        error: (error) => {
            console.error('Error loading agents:', error);
            this.isLoading = false;
        }
    });
}


    addNewAgent(): void {
        this.router.navigate(['/acquisition-management/add']);
    }

    editAgent(id: string): void {
        this.router.navigate(['/acquisition-management/edit', id]);
    }

    deleteAgent(agent: Agent): void {
        Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to delete ${agent.name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed && agent.id) {
                this.agentService.deleteAgent(agent.id).subscribe({
                    next: (success) => {
                        if (success) {
                            Swal.fire('Deleted!', 'Agent has been deleted.', 'success');
                            this.loadAgents();
                        }
                    },
                    error: (error) => {
                        console.error('Error deleting agent:', error);
                        Swal.fire('Error!', 'Agent could not be deleted.', 'error');
                    }
                });
            }
        });
    }

    getStatusBadgeClass(isActive: boolean | undefined): string {
        return isActive ? 'badge bg-success' : 'badge bg-danger';
    }

    getStatusText(isActive: boolean | undefined): string {
        return isActive ? 'Active' : 'Inactive';
    }

    onAgentPageChanged(page: number): void {
        this.PaginationInfo.Page = page;
        this.loadAgents();
    }

       onClearFilters(): void {
        this.agentFilterForm.reset({
            code: '',
            agentname: '',
            status: ''
        });
        this.loadAgents();
    }
}
