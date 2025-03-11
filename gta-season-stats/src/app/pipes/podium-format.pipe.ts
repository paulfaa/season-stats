import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'podiumFormat'
})
export class PodiumFormatPipe implements PipeTransform {
    transform(value: number, type: 'points' | 'percentage' | 'ordinal' | 'default' = 'default'): string {
        if (value == null) return '0';
        switch (type) {
          case 'points':
            return `${value} points`;
          case 'percentage':
            return `${value}%`;
          case 'ordinal':
            return this.getOrdinal(value);
          default:
            return `${value}`;
        }
  }

  private getOrdinal(num: number): string {
    switch (num % 10) {
      case 1: return `${num}st`;
      case 2: return `${num}nd`;
      case 3: return `${num}rd`;
      default: return `${num}th`;
    }
  }
}