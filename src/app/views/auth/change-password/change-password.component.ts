import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIcon],
  templateUrl: './change-password.component.html',
  styles: ``,
})
export class ChangePasswordComponent {
  form!: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.nonNullable.group({
      loginName: ['', [Validators.required]],
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  get passwordsDoNotMatch(): boolean {
    const { newPassword, confirmPassword } = this.form.getRawValue();
    return !!newPassword && !!confirmPassword && newPassword !== confirmPassword;
  }

  submit(): void {
    if (this.form.invalid || this.passwordsDoNotMatch || this.isSubmitting) return;

    const { loginName, oldPassword, newPassword } = this.form.getRawValue();

    // TODO: Wire this up to AuthService change password endpoint when available
    console.log('Change password payload', { loginName, oldPassword, newPassword });

    // For now, simply navigate back to sign-in
    this.router.navigate(['/sign-in']);
  }
}

