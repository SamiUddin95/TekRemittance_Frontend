import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PageTitleComponent } from '@app/components/page-title.component';
import { NgIcon } from '@ng-icons/core';
import { AgentService } from '../services/agent.service';
import { AgentAccountsService } from '../services/agent-accounts.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-agent-accounts-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageTitleComponent, NgIcon],
  templateUrl: './agent-accounts-form.component.html'
})
export class AgentAccountsFormComponent implements OnInit {
  form: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  editId?: string;

  agents: Array<{ id: string; name: string }> = [];
  isAgentsLoading = false;

  constructor(private fb: FormBuilder, private router: Router, private agentService: AgentService, private accountsService: AgentAccountsService, private route: ActivatedRoute) {
    this.form = this.fb.group({
      agentId: ['', Validators.required],
      accountNumber: ['', Validators.required],
      accountTitle: ['', Validators.required],
      type: ['Funded', Validators.required],
      isActive: [true]
    });
  }

  private loadAccount(id: string): void {
    this.accountsService.getAccountById(id).subscribe({
      next: (acc) => {
        // Prefill available fields
        this.form.patchValue({
          accountNumber: acc.accountNumber,
          accountTitle: acc.accountName || acc.agentName,
          // map accountType to radio: default Funded when unknown
          type: (acc as any).accountType === 'Non-Funded' ? 'Non-Funded' : 'Funded',
          isActive: acc.isActive,
        });
      }
    });
  }

  ngOnInit(): void {
    this.loadAgents();
    const stateId = (history.state && history.state.id) ? String(history.state.id) : undefined;
    if (stateId) {
      this.isEditMode = true;
      this.editId = stateId;
      this.loadAccount(stateId);
    }
  }

  private loadAgents(): void {
    this.isAgentsLoading = true;
    this.agentService.getAgents(1, 100000).subscribe({
      next: (res) => {
        this.agents = (res.items || []).map(a => ({ id: String((a as any).id ?? ''), name: String(a.name ?? '-') }));
        this.isAgentsLoading = false;
      },
      error: () => { this.isAgentsLoading = false; }
    });
  }

  fetch(): void {}
  save(): void {
    if (this.form.invalid || this.isSubmitting) return;
    this.isSubmitting = true;
    const v = this.form.value as { agentId: string; accountNumber: string; accountTitle: string; type: string; isActive: boolean };
    if (this.isEditMode && this.editId) {
      // Build update payload per API shape
      const selectedAgentName = this.agents.find(a => a.id === v.agentId)?.name || '';
      this.accountsService.updateAccountById({
        id: this.editId,
        agentAccountName: v.accountTitle, // using title as account display name
        accountNumber: (v.accountNumber),
        agentName: selectedAgentName,
        approve: false,
        accountTitle: v.accountTitle,
        accountType: v.type,
        isActive: !!v.isActive,
      }).subscribe({
        next: () => {
          this.isSubmitting = false;
          Swal.fire({ icon: 'success', title: 'Account updated', timer: 1200, showConfirmButton: false });
          this.router.navigate(['/agent-accounts']);
        },
        error: (err) => {
          const body = (err?.error ?? err) as any;
          const msg = body?.errorMessage ?? body?.message ?? err?.message ?? 'Failed to update account.';
          this.isSubmitting = false;
          Swal.fire({ icon: 'error', title: 'Update failed', text: msg });
        }
      });
    } else {
      this.accountsService.createAccount({
        agentId: v.agentId,
        accountNumber: v.accountNumber,
        accountTitle: v.accountTitle,
        accountType: v.type,
        isActive: !!v.isActive,
      }).subscribe({
        next: () => {
          this.isSubmitting = false;
          Swal.fire({ icon: 'success', title: 'Account created', timer: 1200, showConfirmButton: false });
          this.router.navigate(['/agent-accounts']);
        },
        error: (err) => {
          const body = (err?.error ?? err) as any;
          const msg = body?.errorMessage ?? body?.message ?? err?.message ?? 'Failed to create account.';
          this.isSubmitting = false;
          Swal.fire({ icon: 'error', title: 'Save failed', text: msg });
        }
      });
    }
  }
  cancel(): void { this.router.navigate(['/agent-accounts']); }
}
