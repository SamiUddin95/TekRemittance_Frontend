import { Component, Input, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { CountUp } from 'countup.js';

@Component({
  selector: 'app-countup',
  standalone: true,
  template: `<span>{{ currentValue }}</span>`
})
export class CountupComponent implements OnInit, OnDestroy {
  @Input() endVal: number | string = 0;
  @Input() startVal: number | string = 0;
  @Input() duration: number = 2;
  @Input() options: any = {};
  
  currentValue: string = '0';
  private countUpInstance: CountUp | null = null;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    const endValue = typeof this.endVal === 'string' ? parseFloat(this.endVal) : this.endVal;
    const startValue = typeof this.startVal === 'string' ? parseFloat(this.startVal) : this.startVal;
    
    const defaultOptions = {
      decimalPlaces: 0,
      duration: this.duration,
      ...this.options
    };

    this.countUpInstance = new CountUp(
      this.el.nativeElement,
      endValue,
      {
        startVal: startValue,
        duration: this.duration,
        decimalPlaces: defaultOptions.decimalPlaces,
        separator: ',',
        decimal: '.'
      }
    );

    if (this.countUpInstance) {
      this.countUpInstance.start();
    }
  }

  ngOnDestroy(): void {
    if (this.countUpInstance) {
      this.countUpInstance.reset();
    }
  }
}
