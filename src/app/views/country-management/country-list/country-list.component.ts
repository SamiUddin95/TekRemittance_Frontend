import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageTitleComponent } from '@app/components/page-title.component';
import { CountryService } from '../services/country.service';
import { Country } from '../models/country.model';
import { NgIcon } from '@ng-icons/core';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-country-list',
    standalone: true,
    imports: [CommonModule, PageTitleComponent, NgIcon],
    templateUrl: './country-list.component.html'
})
export class CountryListComponent implements OnInit {
    countries: Country[] = [];
    currentPage = 1;
    totalPages = 1;
    totalItems = 0;
    itemsPerPage = 10;
    isLoading = false;

    constructor(
        private countryService: CountryService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadCountries();
    }

    loadCountries(): void {
        this.isLoading = true;
        this.countryService.getCountries(this.currentPage, this.itemsPerPage)
            .subscribe({
                next: (response) => {
                    this.countries = response.countries;
                    this.totalItems = response.total;
                    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
                    this.isLoading = false;
                },
                error: (error) => {
                    console.error('Error loading countries:', error);
                    this.isLoading = false;
                }
            });
    }

    addNewCountry(): void {
        this.router.navigate(['/country-management/add']);
    }

    editCountry(id: number): void {
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

    goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.loadCountries();
        }
    }

    previousPage(): void {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadCountries();
        }
    }

    nextPage(): void {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.loadCountries();
        }
    }

    getStatusBadgeClass(isActive: boolean): string {
        return isActive ? 'badge bg-success' : 'badge bg-danger';
    }

    getStatusText(isActive: boolean): string {
        return isActive ? 'Active' : 'Inactive';
    }
}
