import { credits, currentYear } from '@/app/constants';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { PopupService } from '@core/services/popup.service';
import { LicenseService } from '../../../services/license.service';
import Swal from 'sweetalert2';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-sign-in',
    host: { 'data-component-id': 'auth2-sign-in' },
    imports: [RouterLink, NgIcon, ReactiveFormsModule],
    standalone: true,
    templateUrl: './sign-in.component.html',
    styles: ``,
})
export class SignInComponent implements OnInit {
    currentYear = currentYear
    credits = credits

    form!: FormGroup;
    isSubmitting = false;
    showUpdateLicenseBtn = false;
    licenseMessage = '';

    constructor(
        private fb: FormBuilder,
        private auth: AuthService,
        private router: Router,
        private popup: PopupService,
        private licenseService: LicenseService
    ) {
        this.form = this.fb.nonNullable.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.required]]
        });
    }

    ngOnInit(): void {
        this.licenseService.getLicenseStatus().subscribe({
            next: (res) => {
                const status = res?.data;
                if (status) {
                    if (status.isExpired) {
                        this.router.navigate(['/update-license']);
                    } else if (status.daysRemaining <= LicenseService.WARNING_THRESHOLD_DAYS) {
                        this.showUpdateLicenseBtn = true;
                        this.licenseMessage = this.licenseService.buildWarningMessage(status);
                    }
                }
            },
            error: () => {}
        });
    }

    openUpdateLicense(): void {
        this.router.navigate(['/update-license']);
    }

    signIn(){
        if (this.form.invalid || this.isSubmitting) return;
        const { username, password } = this.form.getRawValue();
        this.isSubmitting = true;
        this.auth.login({ loginName: username, password })
            .pipe(finalize(() => { this.isSubmitting = false; }))
            .subscribe({
                next: (res) => {
                    if (res?.statusCode === 200 && res?.data) {
                        this.licenseService.getLicenseStatus().subscribe({
                            next: (licenseRes) => {
                                const status = licenseRes?.data;
                                if (status && this.licenseService.shouldShowWarning(status)) {
                                    this.showUpdateLicenseBtn = true;
                                    this.licenseMessage = this.licenseService.buildWarningMessage(status);
                                }
                            },
                            error: () => {}
                        });
                        this.popup.success('Login successful', 'You have successfully logged in.')
                        this.router.navigate(['/dashboard']);
                    }
                },
                error: (err) => {
                    const msg = err?.error?.errorMessage || err?.message || 'Invalid credentials';
                    this.popup.error('Login failed', msg);
                }
            });
    }
}
