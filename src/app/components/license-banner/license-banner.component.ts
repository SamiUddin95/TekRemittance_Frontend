import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { LicenseService, LicenseStatusData } from '../../services/license.service';

@Component({
  selector: 'app-license-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './license-banner.component.html',
  styleUrls: ['./license-banner.component.scss']
})
export class LicenseBannerComponent implements OnInit, OnDestroy {
  status: LicenseStatusData | null = null;
  visible = false;
  dismissed = false;

  private sub?: Subscription;

  constructor(private licenseService: LicenseService) {}

  ngOnInit(): void {
    this.sub = this.licenseService.licenseStatus$.subscribe((status) => {
      this.status = status;
      this.visible = this.licenseService.shouldShowWarning(status);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get message(): string {
    return this.licenseService.buildWarningMessage(this.status);
  }

  dismiss(): void {
    this.dismissed = true;
  }
}
