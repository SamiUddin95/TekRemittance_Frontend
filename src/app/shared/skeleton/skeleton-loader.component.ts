import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton-loader.component.html',
  styleUrls: ['./skeleton-loader.component.scss']
})
export class SkeletonLoaderComponent {
  @Input() isLoading = true;
  @Input() variant: 'table' | 'form' | 'card' | 'list' = 'table';
  @Input() rows = 8;
  @Input() cols = 6;
  @Input() width: string | null = null; // e.g. '100%'
  @Input() height: string | null = null; // e.g. '16px'
  @Input() lineHeight = '14px';
  @Input() gap = '12px';
  @Input() ariaLabel = 'Loading content';

  trackByIndex(_i: number, _item: any) { return _i; }

  get rowArray() { return Array.from({ length: this.rows }); }
  get colArray() { return Array.from({ length: this.cols }); }
}
