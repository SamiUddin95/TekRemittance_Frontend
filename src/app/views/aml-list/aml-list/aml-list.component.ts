import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PageTitleComponent } from '../../../components/page-title.component';
import { NgIcon } from '@ng-icons/core';
import { GenericPaginationComponent } from '../../../shared/generic-pagination/generic-pagination/generic-pagination.component';
import { SkeletonLoaderComponent } from '../../../shared/skeleton/skeleton-loader.component';
import { Router } from '@angular/router';
import { AmlService } from '../services/aml.service';
import { Aml, AmlFilter } from '../models/aml.model';

@Component({
  selector: 'app-aml-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageTitleComponent, NgIcon, GenericPaginationComponent, SkeletonLoaderComponent],
  templateUrl: './aml-list.component.html',
  styleUrls: ['./aml-list.component.css']
})
export class AmlListComponent implements OnInit {
  filterForm: FormGroup;
  isLoading = false;
  totalRecord = 0;
  PaginationInfo = {
    RowsPerPage: 10,
    Page: 1
  };
  
  amlList: Aml[] = [];

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private amlService: AmlService
  ) {
    this.filterForm = this.fb.group({
      cnic: [''],
      accountName: [''],
      address: ['']
    });
  }

  ngOnInit(): void {
    this.loadAmlList();
  }

  loadAmlList(): void {
    this.isLoading = true;
    const filters: AmlFilter = {
      cnic: this.filterForm.get('cnic')?.value || undefined,
      accountName: this.filterForm.get('accountName')?.value || undefined,
      address: this.filterForm.get('address')?.value || undefined
    };

    this.amlService.getAmlList(
      this.PaginationInfo.Page, 
      this.PaginationInfo.RowsPerPage, 
      filters
    ).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.amlList = response.data.items;
          this.totalRecord = response.data.totalCount;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading AML list:', error);
        this.isLoading = false;
      }
    });
  }

  addNewAml(): void {
    this.router.navigate(['/aml-list/add']);
  }

  editAml(aml: Aml): void {
    this.router.navigate(['/aml-list/edit', aml.id]);
  }

  deleteAml(aml: Aml): void {
    if (confirm(`Are you sure you want to delete AML record for ${aml.accountName}?`)) {
      this.isLoading = true;
      this.amlService.deleteAml(aml.id).subscribe({
        next: (response) => {
          if (response.status === 'success') {
            console.log('AML deleted successfully');
            this.loadAmlList(); // Reload the list
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error deleting AML:', error);
          this.isLoading = false;
        }
      });
    }
  }

  searchAml(): void {
    this.PaginationInfo.Page = 1; // Reset to first page when searching
    this.loadAmlList();
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.PaginationInfo.Page = 1;
    this.loadAmlList();
  }

  onAmlPageChanged(event: any): void {
    console.log('Page changed:', event);
    this.PaginationInfo.Page = event;
    this.loadAmlList();
  }
}
