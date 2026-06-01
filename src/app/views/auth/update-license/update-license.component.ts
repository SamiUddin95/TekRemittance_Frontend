import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { LicenseService } from '../../../services/license.service';

@Component({
  selector: 'app-update-license',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-license.component.html',
  styleUrls: ['./update-license.component.scss']
})
export class UpdateLicenseComponent {
  encryptedKey = '';
  isSubmitting = false;

  constructor(private licenseService: LicenseService, private router: Router) {}

  onSubmit(): void {
    const key = (this.encryptedKey || '').trim();
    if (!key) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing License Key',
        text: 'Please paste the encrypted license key you received in your email.',
        confirmButtonText: 'OK'
      });
      return;
    }

    this.isSubmitting = true;
    this.licenseService.updateLicense(key).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if ((res?.status || '').toLowerCase() === 'success' || res?.statusCode === 200) {
          Swal.fire({
            icon: 'success',
            title: 'License Updated',
            text: res?.data || 'License has been updated successfully.',
            timer: 2000,
            showConfirmButton: false
          }).then(() => {
            this.router.navigate(['/sign-in']);
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: res?.errorMessage || 'Failed to update the license. Please try again.',
            confirmButtonText: 'OK'
          });
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: err?.error?.errorMessage || err?.message || 'Failed to update the license. Please try again.',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  onCancel(): void {
    this.encryptedKey = '';
    this.router.navigate(['/sign-in']);
  }
}
