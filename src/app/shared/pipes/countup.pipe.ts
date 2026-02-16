import { Pipe, PipeTransform, ChangeDetectorRef } from '@angular/core';
import { CountUp } from 'countup.js';

@Pipe({
  name: 'countup',
  standalone: true,
  pure: false
})
export class CountupPipe implements PipeTransform {
  constructor(private cdr: ChangeDetectorRef) {}

  transform(value: number | string, duration: number = 2, options: any = {}): string {
    const endValue = typeof value === 'string' ? parseFloat(value) : value;
    const defaultOptions = {
      decimalPlaces: 0,
      duration: duration,
      ...options
    };

    const countUpInstance = new CountUp(
      'countup-' + Math.random().toString(36).substr(2, 9),
      endValue,
      {
        startVal: 0,
        duration: duration,
        decimalPlaces: defaultOptions.decimalPlaces,
        separator: ',',
        decimal: '.'
      }
    );

    if (countUpInstance) {
      countUpInstance.start(() => {
        this.cdr.detectChanges();
      });
    }

    return '0';
  }
}
