import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageTitleComponent } from '@app/components/page-title.component';
import { CityService } from '../services/city.service';
import { City } from '../models/city.model';
import { NgIcon } from '@ng-icons/core';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-city-list',
    standalone: true,
    imports: [CommonModule, PageTitleComponent, NgIcon],
    templateUrl: './city-list.component.html'
})
export class CityListComponent implements OnInit {
    cities: City[] = [];
    currentPage = 1;
    totalPages = 1;
    totalItems = 0;
    itemsPerPage = 10;
    isLoading = false;

    constructor(
        private cityService: CityService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadCities();
    }

    loadCities(): void {
        this.isLoading = true;
        this.cityService.getCities(this.currentPage, this.itemsPerPage)
            .subscribe({
                next: (response) => {
                    this.cities = response.cities;
                    this.totalItems = response.total;
                    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
                    this.isLoading = false;
                },
                error: (error) => {
                    console.error('Error loading cities:', error);
                    this.isLoading = false;
                }
            });
    }

    addNewCity(): void {
        this.router.navigate(['/city-management/add']);
    }

    editCity(id: number): void {
        this.router.navigate(['/city-management/edit', id]);
    }

    deleteCity(city: City): void {
        Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to delete ${city.name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed && city.id) {
                this.cityService.deleteCity(city.id).subscribe({
                    next: (success) => {
                        if (success) {
                            Swal.fire('Deleted!', 'City has been deleted.', 'success');
                            this.loadCities();
                        }
                    },
                    error: (error) => {
                        console.error('Error deleting city:', error);
                        Swal.fire('Error!', 'Failed to delete city.', 'error');
                    }
                });
            }
        });
    }

    goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.loadCities();
        }
    }

    previousPage(): void {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadCities();
        }
    }

    nextPage(): void {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.loadCities();
        }
    }

    getStatusBadgeClass(isActive: boolean): string {
        return isActive ? 'badge bg-success' : 'badge bg-danger';
    }

    getStatusText(isActive: boolean): string {
        return isActive ? 'Active' : 'Inactive';
    }
}
