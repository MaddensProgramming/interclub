import { Pipe, PipeTransform } from '@angular/core';
import { ColorEnum } from 'functions/src/models/ColorEnum';
import { ResultEnum } from 'functions/src/models/ResultEnum';

@Pipe({
  name: 'result',
})
export class ResultPipe implements PipeTransform {
  transform(value: ResultEnum): string {
    switch (value) {
      case ResultEnum.WhiteWins:
        return '1-0';
      case ResultEnum.Draw:
        return '1/2-1/2';
      case ResultEnum.BlackWins:
        return '0-1';
      case ResultEnum.WhiteFF:
        return '1-0F';
      case ResultEnum.BlackFF:
        return '0-1F';
      case ResultEnum.BothFF:
        return '0F-0F';
      default:
        return '?';
    }
  }
}

@Pipe({
  name: 'ownResult',
})
export class OwnResultPipe implements PipeTransform {
  transform(value: ResultEnum, color: ColorEnum): string {
    switch (value) {
      case ResultEnum.WhiteWins:
        return color === ColorEnum.Wit ? '1' : '0';
      case ResultEnum.Draw:
        return '1/2';
      case ResultEnum.BlackWins:
        return color === ColorEnum.Wit ? '0' : '1';
      case ResultEnum.WhiteFF:
        return color === ColorEnum.Wit ? '1F' : '0F';
      case ResultEnum.BlackFF:
        return color === ColorEnum.Wit ? '0F' : '1F';
      case ResultEnum.BothFF:
        return '0F';
      default:
        return '?';
    }
  }
}
