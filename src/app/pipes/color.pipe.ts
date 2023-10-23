import { Pipe, PipeTransform } from '@angular/core';
import { ColorEnum } from 'functions/src/models/ColorEnum';

@Pipe({
  name: 'color',
})
export class ColorPipe implements PipeTransform {
  transform(value: ColorEnum): string {
    switch (value) {
      case ColorEnum.Wit:
        return 'Wit';
      case ColorEnum.Zwart:
        return 'Zwart';
    }
  }
}
