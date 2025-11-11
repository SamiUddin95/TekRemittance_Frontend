import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageTitleComponent } from '@app/components/page-title.component';
import { NgIcon } from '@ng-icons/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-repair-instruction-queue',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageTitleComponent, NgIcon],
  templateUrl: './repair-instruction-queue.component.html'
})
export class RepairInstructionQueueComponent implements OnInit {
  form!: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    const row = (history.state && history.state.row) ? history.state.row : null;

    this.form = this.fb.group({
      rin: [{ value: row?.rin || '', disabled: true }],
      agentName: [{ value: row?.agentName || '', disabled: true }],
      beneficiaryName: [row?.beneficiaryName || '', Validators.required],
      beneficiaryCnic: [''],
      beneficiaryAccountNumber: [row?.beneficiaryName ? row?.beneficiaryName : '', Validators.required],
      amount: [row?.amount ? String(row.amount).replace('$','') : '', [Validators.required]],
      remarks: ['']
    });
  }

  cancel(): void {
    this.router.navigate(['/repair-queue']);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    // TODO: Post repair payload to API
    this.router.navigate(['/repair-queue']);
    this.isSubmitting = false;
  }
}
