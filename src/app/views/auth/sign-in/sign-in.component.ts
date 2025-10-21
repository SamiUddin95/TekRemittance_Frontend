import { credits, currentYear } from '@/app/constants';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { PopupService } from '@core/services/popup.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-sign-in',
    host: { 'data-component-id': 'auth2-sign-in' },
    imports: [RouterLink, NgIcon, ReactiveFormsModule],
    standalone: true,
    templateUrl: './sign-in.component.html',
    styles: ``,
})
export class SignInComponent {
    currentYear = currentYear
    credits = credits

    form!: FormGroup;

    constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private popup: PopupService) {
        this.form = this.fb.nonNullable.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.required]]
        });
    }

    signIn(){
        if (this.form.invalid) return;
        const { username, password } = this.form.getRawValue();
        this.auth.login({ loginName: username, password }).subscribe({
            next: (res) => {
                if (res?.statusCode === 200 && res?.data) {
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
