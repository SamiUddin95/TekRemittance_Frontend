import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageTitleComponent } from '@app/components/page-title.component';
import { CountryService } from '../services/country.service';
import { Country } from '../models/country.model';
import { NgIcon } from '@ng-icons/core';
import Swal from 'sweetalert2';
import { GenericPaginationComponent } from '@/app/shared/generic-pagination/generic-pagination/generic-pagination.component';
import { SkeletonLoaderComponent } from '../../../shared/skeleton/skeleton-loader.component';

@Component({
    selector: 'app-country-list',
    standalone: true,
    imports: [CommonModule, PageTitleComponent, NgIcon, GenericPaginationComponent, SkeletonLoaderComponent],
    templateUrl: './country-list.component.html'
})

export class CountryListComponent implements OnInit {
    countries: Country[] = [];
    currentPage = 1;
    totalPages = 1;
    totalItems = 0;
    itemsPerPage = 10;
    totalRecord = 0;
    PaginationInfo: any = {
        Page: 1,
        RowsPerPage: 10
    }
    isLoading = false;

private mapDtoToCountry(dto: any): Country {
        return {
            id: dto.id ?? dto.Id ?? dto.countryId,
            code: dto.countryCode ?? dto.code,
            name: dto.countryName ?? dto.name,
            isActive: dto.isActive ?? true,
            createdAt: dto.createdOn ? new Date(dto.createdOn) : undefined,
            updatedAt: dto.updatedOn ? new Date(dto.updatedOn) : undefined,
        } as Country;
    }

    constructor(
        private countryService: CountryService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadCountries();
    }

    async loadCountries() {
        this.isLoading = true;
        const res =  await this.countryService.getCountries(this.PaginationInfo.Page, this.PaginationInfo.RowsPerPage)
            .subscribe({
                next: (response: any) => {
                    debugger
                    if(response.statusCode === 200  && response.items){
                        this.countries = response.items.map((item: any) => this.mapDtoToCountry(item));
                        this.totalRecord = response.totalCount;
                        this.isLoading = false; 
                    }
                this.isLoading = false;
                },
                error: (error) => {
                    console.error('Error loading countries:', error);
                    this.isLoading = false;
                }
            });
            console.log(res);
            
            this.isLoading = false;
    }

    addNewCountry(): void {
        this.router.navigate(['/country-management/add']);
    }

    editCountry(id: string): void {
        this.router.navigate(['/country-management/edit', id]);
    }

    deleteCountry(country: Country): void {
        Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to delete ${country.name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed && country.id) {
                this.countryService.deleteCountry(country.id).subscribe({
                    next: (success) => {
                        if (success) {
                            Swal.fire('Deleted!', 'Country has been deleted.', 'success');
                            this.loadCountries();
                        }
                    },
                    error: (error) => {
                        console.error('Error deleting country:', error);
                        Swal.fire('Error!', 'Failed to delete country.', 'error');
                    }
                });
            }
        });
    }

    async oncountryPageChanged(page: number) {
    this.PaginationInfo.Page = page;
    this.loadCountries();
    }
    getStatusBadgeClass(isActive: boolean): string {
        return isActive ? 'badge bg-success' : 'badge bg-danger';
    }

    getStatusText(isActive: boolean): string {
        return isActive ? 'Active' : 'Inactive';
    }
}
