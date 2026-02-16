import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import { CountUp } from 'countup.js';

@Directive({
  selector: '[countup]',
  standalone: true
})
export class CountupDirective implements OnInit, OnDestroy {
  @Input('countup') endVal: number | string = 0;
  @Input('startVal') startVal: number | string = 0;
  @Input('duration') duration: number = 2;
  @Input('options') options: any = {};

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
