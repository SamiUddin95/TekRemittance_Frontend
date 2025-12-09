import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PageTitleComponent } from '@app/components/page-title.component';
import { NgIcon } from '@ng-icons/core';
import Swal from 'sweetalert2';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';

function matchValidator(a: string, b: string, message = 'Passwords must match'): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const aa = group.get(a)?.value;
    const bb = group.get(b)?.value;
    if (aa && bb && aa !== bb) {
      group.get(b)?.setErrors({ mismatch: true });
      return { mismatch: message } as any;
    }
    if (group.get(b)?.hasError('mismatch')) {
      const errors = { ...group.get(b)!.errors };
      delete errors['mismatch'];
      if (Object.keys(errors).length === 0) group.get(b)?.setErrors(null);
    }
    return null;
  };
}

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageTitleComponent, NgIcon],
  templateUrl: './user-form.component.html'
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEditMode = false;
  userId: string | null = null;
  isSubmitting = false;
  isLoading = false;
  showPasswordChange = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.userForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.userId = params['id'];
        // In edit mode, remove password requirements by default
        this.setPasswordValidators(false);
        this.loadUser();
      }
    });
  }

  createForm(): FormGroup {
    const form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      phone: ['', [ Validators.maxLength(20)]],
      employeeId: ['', [Validators.required, Validators.maxLength(50)]],
      userType: ['', [Validators.required]],
      limitType: [0, [Validators.required, Validators.min(0)]],
      loginName: ['', [Validators.required, Validators.maxLength(100)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      isActive: [true],
    });
    form.setValidators(matchValidator('password', 'confirmPassword'));
    return form;
  }

  loadUser(): void {
    if (!this.userId) return;
    this.isLoading = true;
    this.userService.getUserById(this.userId).subscribe({
      next: (user) => {
        if (user) {
          this.userForm.patchValue({
            name: user.name,
            email: user.email,
            phone: user.phone,
            employeeId: user.employeeId,
            userType: (user as any).userType || '',
            limitType: user.limitType,
            loginName: user.loginName,
            isActive: user.isActive,
          });
        } else {
          Swal.fire('Error!', 'User not found.', 'error');
          this.router.navigate(['/users']);
        }
        this.isLoading = false;
      },
      error: (e) => { this.isLoading = false; }
    });
  }

  onSubmit(): void {
    if (this.userForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const value = this.userForm.value as any;

      if (this.isEditMode && this.userId) {
        const payload: Partial<User> = { ...value };
        delete (payload as any).confirmPassword;
        if (!payload.password) delete payload.password;
        this.userService.updateUser(this.userId, payload).subscribe({
          next: (u) => { Swal.fire('Success!', 'User updated successfully.', 'success'); this.router.navigate(['/users']); },
          error: () => { this.isSubmitting = false; }
        });
      } else {
        const payload: Omit<User, 'id'> = {
          name: value.name,
          email: value.email,
          phone: value.phone,
          employeeId: value.employeeId,
          userType: value.userType,
          limitType: Number(value.limitType || 0),
          loginName: value.loginName,
          password: value.password,
          isActive: value.isActive,
        } as any;
        this.userService.addUser(payload).subscribe({
          next: (u) => { Swal.fire('Success!', 'User created successfully.', 'success'); this.router.navigate(['/users']); },
          error: () => { this.isSubmitting = false; }
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void { this.router.navigate(['/users']); }

  private markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      this.userForm.get(key)?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field && (field.touched || field.dirty) && field.errors) {
      if (field.errors['required']) return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      if (field.errors['email']) return `Please enter a valid email address`;
      if (field.errors['minlength']) return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['maxlength']) return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} cannot exceed ${field.errors['maxlength'].requiredLength} characters`;
      if (field.errors['mismatch']) return `Passwords must match`;
    }
    return '';
  }

  getPageTitle(): string { return this.isEditMode ? 'Edit User' : 'Add User'; }

  onChangePassword(): void {
    if (!this.isEditMode) return;
    // If currently hidden, show fields and enable validators
    if (!this.showPasswordChange) {
      this.showPasswordChange = true;
      this.setPasswordValidators(true);
      return;
    }
    // If visible, validate and call API to update only name + password
    this.markFormGroupTouched();
    const name = this.userForm.get('name')?.value;
    const password = this.userForm.get('password')?.value;
    const confirmPassword = this.userForm.get('confirmPassword')?.value;
    if (!this.userId) return;
    // Ensure basic checks when changing password
    if (!password || password !== confirmPassword || this.userForm.get('password')?.invalid || this.userForm.get('confirmPassword')?.invalid) {
      return;
    }
    this.isSubmitting = true;
    this.userService.updateUserNamePassword(this.userId, name, password).subscribe({
      next: (u) => {
        Swal.fire('Success!', 'Password updated successfully.', 'success');
        // Reset password fields and hide section
        this.userForm.patchValue({ password: '', confirmPassword: '' });
        this.showPasswordChange = false;
        this.setPasswordValidators(false);
        this.isSubmitting = false;
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }

  private setPasswordValidators(enabled: boolean): void {
    const pwd = this.userForm.get('password');
    const cpwd = this.userForm.get('confirmPassword');
    if (!pwd || !cpwd) return;
    if (enabled) {
      pwd.setValidators([Validators.required, Validators.minLength(6)]);
      cpwd.setValidators([Validators.required]);
    } else {
      pwd.clearValidators();
      cpwd.clearValidators();
    }
    pwd.updateValueAndValidity();
    cpwd.updateValueAndValidity();
    // Ensure form-level match validator stays applied
    this.userForm.setValidators(matchValidator('password', 'confirmPassword'));
    this.userForm.updateValueAndValidity();
  }
}
