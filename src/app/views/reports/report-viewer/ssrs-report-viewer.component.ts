import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '@/environments/environment';

@Component({
  selector: 'app-ssrs-report-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ssrs-viewer-wrap">
      @if (loading) {
        <div class="ssrs-loading">
          <div class="spinner-border mb-3" style="width:2.5rem;height:2.5rem;color:#FF5102;"></div>
          <p class="text-muted mb-0">Loading report...</p>
        </div>
      }
      @if (safeUrl) {
        <iframe
          [src]="safeUrl"
          (load)="onLoad()"
          class="ssrs-iframe"
          [class.invisible]="loading"
          frameborder="0">
        </iframe>
      }
    </div>
  `,
  styles: [`
    .ssrs-viewer-wrap {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .ssrs-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
     height: 600px;
    }
    .ssrs-iframe {
      width: 100%;
      height: 2000px;
      border: none;
    }
    .invisible {
      visibility: hidden;
      height: 0;
    }
  `]
})
export class SsrsReportViewerComponent implements OnChanges {
  @Input() params: any = {};
  @Input() reportPath: string = '/report/Report%20Project1/DailyRemittanceReport';

  safeUrl: SafeResourceUrl | null = null;
  loading = true;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['params'] && this.params) || changes['reportPath']) {
      this.buildUrl();
    }
  }

  private buildUrl(): void {
    this.loading = true;
    this.safeUrl = null;

    const base = environment.ssrsUrl;
    const startDate = this.params.startDate || '';
    const endDate   = this.params.endDate   || '';
    const settlementDate = this.params.settlementDate || '';
    const agentId   = this.params.agentId   || '';
    const accountNumber = this.params.accountNumber || '';
    const xpin = this.params.xpin || '';

    let url = `${base}${this.reportPath}?rs:Command=Render&rs:Embed=true&rc:Toolbar=true&rc:Parameters=false&rc:Zoom=WholePage`;

    if (settlementDate) {
      url += `&SettlementDate=${encodeURIComponent(settlementDate)}`;
    } else {
      url += `&StartDate=${encodeURIComponent(startDate)}`;
      url += `&EndDate=${encodeURIComponent(endDate)}`;
    }

    if (agentId) {
      url += `&AgentId=${encodeURIComponent(agentId)}`;
    }

    if (accountNumber) {
      url += `&AccountNumber=${encodeURIComponent(accountNumber)}`;
    }

    if (xpin) {
      url += `&Xpin=${encodeURIComponent(xpin)}`;
    }

    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  onLoad(): void {
    this.loading = false;
  }
}
