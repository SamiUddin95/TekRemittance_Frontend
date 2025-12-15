import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageTitleComponent } from '@app/components/page-title.component';
import { NgIcon } from '@ng-icons/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { AgentService } from '@/app/views/acquisition-management/services/agent.service';
import { CountUpModule } from "ngx-countup";

interface SearchResult {
  trackingNumber: string;
  rin: string;
  beneficiaryName: string;
  name: string;
  cnicPassport: string;
  amount: string;
  contactNo: string;
  accountNumber: string;
  accountTitle?: string;
}

interface Denomination {
  value: number;
  quantity: number;
  total: number;
}

@Component({
  selector: 'app-coc-payout',
  standalone: true,
  imports: [CommonModule, PageTitleComponent, NgIcon, ReactiveFormsModule, CountUpModule],
  templateUrl: './coc-payout.component.html'
})
export class CocPayoutComponent implements OnInit {
  searchForm: FormGroup;
  denominationsForm: FormGroup;
  showResults = false;
  agents: Array<{ id: string; name: string }> = [];

  // Static search result data
  searchResult: SearchResult = {
    trackingNumber: 'TRK1234567890',
    rin: '20250828000001',
    beneficiaryName: 'Ahmed Khan',
    name: 'Waji Khan',
    cnicPassport: '42289-8549975-8',
    amount: '1000 USD',
    contactNo: '0335-8777985',
    accountNumber: '1234567890123',
    accountTitle: 'Waji Khan'
    
  };

  // Denominations array
  denominations: Denomination[] = [
    { value: 5000, quantity: 0, total: 0 },
    { value: 1000, quantity: 0, total: 0 },
    { value: 500, quantity: 0, total: 0 },
    { value: 100, quantity: 0, total: 0 },
    { value: 50, quantity: 0, total: 0 },
    { value: 20, quantity: 0, total: 0 },
    { value: 10, quantity: 0, total: 0 },
    { value: 5, quantity: 0, total: 0 },
    { value: 2, quantity: 0, total: 0 },
    { value: 1, quantity: 0, total: 0 }
  ];

  grandTotal = 0;

  constructor(private fb: FormBuilder, private agentService: AgentService) {
    this.searchForm = this.fb.group({
      agentId: ['', Validators.required],
      inquiryPin: ['', Validators.required]
    });

    // Build denominations form dynamically
    const denominationsControls: any = {};
    this.denominations.forEach(denom => {
      denominationsControls[`qty_${denom.value}`] = [0];
    });
    this.denominationsForm = this.fb.group(denominationsControls);
  }

  ngOnInit(): void {
    this.loadAgents();
  }

  private loadAgents(): void {
    this.agentService.getAgents(1, 100).subscribe({
      next: (res) => {
        this.agents = (res.items || []).map(a => ({ id: String(a.id), name: a.name || '-' }));
      },
      error: () => { /* ignore for now */ }
    });
  }

  onSearch(): void {
    if (this.searchForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Required Fields',
        text: 'Please select Agent and enter Inquiry x pin',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Show the search results (static data for now)
    this.showResults = true;
    
    Swal.fire({
      icon: 'success',
      title: 'Search Successful',
      text: 'Transaction details loaded successfully',
      timer: 1500,
      showConfirmButton: false
    });
  }

  onClear(): void {
    this.searchForm.reset({
      agentId: '',
      inquiryPin: ''
    });
    this.showResults = false;
    this.resetDenominations();
  }

  calculateDenomination(denomValue: number): void {
    const quantity = this.denominationsForm.get(`qty_${denomValue}`)?.value || 0;
    const denom = this.denominations.find(d => d.value === denomValue);
    
    if (denom) {
      denom.quantity = parseInt(quantity) || 0;
      denom.total = denom.value * denom.quantity;
    }

    this.calculateGrandTotal();
  }

  calculateGrandTotal(): void {
    this.grandTotal = this.denominations.reduce((sum, denom) => sum + denom.total, 0);
  }

  onClearDenominations(): void {
    this.resetDenominations();
  }

  onCancelDenominations(): void {
    this.resetDenominations();
  }

  onSaveDenominations(): void {
    if (this.grandTotal === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Denominations',
        text: 'Please enter denomination quantities',
        confirmButtonText: 'OK'
      });
      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'Saved',
      text: `Denominations saved. Total: ${this.grandTotal}`,
      confirmButtonText: 'OK'
    });
  }

  onCancel(): void {
    this.onClear();
  }

  onPay(): void {
    if (!this.showResults) {
      Swal.fire({
        icon: 'warning',
        title: 'No Transaction',
        text: 'Please search for a transaction first',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (this.grandTotal === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Denominations',
        text: 'Please enter denomination details before payment',
        confirmButtonText: 'OK'
      });
      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'Payment Processed',
      text: `Payment of ${this.grandTotal} has been processed successfully`,
      confirmButtonText: 'OK'
    }).then(() => {
      this.onClear();
    });
  }

  private resetDenominations(): void {
    this.denominations.forEach(denom => {
      denom.quantity = 0;
      denom.total = 0;
      this.denominationsForm.patchValue({
        [`qty_${denom.value}`]: 0
      });
    });
    this.grandTotal = 0;
  }
}
