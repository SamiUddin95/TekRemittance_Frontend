import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageTitleComponent } from '@app/components/page-title.component';
import { NgIcon } from '@ng-icons/core';
import Swal from 'sweetalert2';
import { AgentBranchService } from '../services/agent-branch.service';
import { GenericPaginationComponent } from '@/app/shared/generic-pagination/generic-pagination/generic-pagination.component';
import { SkeletonLoaderComponent } from '../../../shared/skeleton/skeleton-loader.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';


interface Branch {
  id: string;
  code?: string;
  name: string;
  agentName: string;
  isActive: boolean;
  approvalStatus?: boolean;
}

@Component({
  selector: 'app-agent-branch-list',
  standalone: true,
  imports: [CommonModule, PageTitleComponent, FormsModule,
  ReactiveFormsModule, NgIcon, GenericPaginationComponent, SkeletonLoaderComponent],
  templateUrl: './agent-branch-list.component.html'
})
export class AgentBranchListComponent implements OnInit {
      agentFilterForm: FormGroup;

  branches: Branch[] = [];
  totalRecord = 0;
  PaginationInfo: any = {
    Page: 1,
    RowsPerPage: 10
  };
  isLoading = false;
 

  constructor(
    private branchService: AgentBranchService,
    private router: Router,
    private fb: FormBuilder

  ) {
     this.agentFilterForm = this.fb.group({
            code: [''],
            agentname: [''],
            agentbranchname: [''] 
        });
  }

  ngOnInit(): void {
    this.loadBranches();
  }
  onSearch(): void{
    this.isLoading = true;
    const filters = this.agentFilterForm.value;
    this.loadBranches();
  }
  onClearFilters(): void{
     this.agentFilterForm.reset({
            code: '',
            agentname: '',
            agentbranchname: ''
        });
        this.loadBranches();
  }


loadBranches(): void {
  this.isLoading = true;
  const filters = this.agentFilterForm.value;

  this.branchService.getBranches(
    this.PaginationInfo.Page,
    this.PaginationInfo.RowsPerPage,
    {
      code: filters.code,
      agentname: filters.agentname,
      agentbranchname: filters.agentbranchname
    }
  ).subscribe({
    next: (res) => {
      this.branches = res.items;
      this.totalRecord = res.totalCount;
      this.isLoading = false;
    },
    error: (error) => {
      console.error('Error loading branches:', error);
      this.isLoading = false;
    }
  });
}


  addNewBranch(): void {
    this.router.navigate(['/agent-branches/add']);
  }

  editBranch(id: string): void {
    this.router.navigate(['/agent-branches/edit', id]);
  }

  deleteBranch(branch: Branch): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete ${branch.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed && branch.id) {
        this.branchService.deleteBranch(branch.id).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Branch has been deleted.', 'success');
            this.loadBranches();
          },
          error: (error) => {
            console.error('Error deleting branch:', error);
            Swal.fire('Error!', 'Failed to delete branch.', 'error');
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

  onBranchPageChanged(page: number): void {
    this.PaginationInfo.Page = page;
    this.loadBranches();
  }
}
