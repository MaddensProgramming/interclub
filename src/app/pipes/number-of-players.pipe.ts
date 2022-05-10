import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberOfPlayers',
})
export class NumberOfPlayersPipe implements PipeTransform {
  transform(value: number): number {
    switch (value) {
      case 1:
      case 2:
        return 8;
      case 3:
        return 6;
      case 4:
      case 5:
        return 4;
      default:
        return 0;
    }
  }
}
