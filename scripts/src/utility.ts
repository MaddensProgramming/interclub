import { ResultEnum } from './models';

export function getGameResult(result: string): ResultEnum {
  switch (result) {
    case '1-0':
      return ResultEnum.WhiteWins;
    case '0-1':
      return ResultEnum.BlackWins;
    case '½-½':
      return ResultEnum.Draw;
    case '1-0 FF':
      return ResultEnum.WhiteFF;
    case '0-1 FF':
      return ResultEnum.BlackFF;
    default:
      return ResultEnum.BothFF;
  }
}
export function revertResult(result: ResultEnum): ResultEnum {
  switch (result) {
    case ResultEnum.WhiteFF:
      return ResultEnum.BlackFF;
    case ResultEnum.BlackFF:
      return ResultEnum.WhiteFF;
    case ResultEnum.BlackWins:
      return ResultEnum.WhiteWins;
    case ResultEnum.WhiteWins:
      return ResultEnum.BlackWins;
    case ResultEnum.BothFF:
      return ResultEnum.BothFF;
    case ResultEnum.Draw:
      return ResultEnum.Draw;
  }
}
export function getScoreWhite(result: ResultEnum): number {
  switch (result) {
    case ResultEnum.WhiteFF:
    case ResultEnum.WhiteWins:
      return 1;
    case ResultEnum.BlackFF:
    case ResultEnum.BlackWins:
    case ResultEnum.BothFF:
      return 0;
    case ResultEnum.Draw:
      return 0.5;
  }
}
export function getScoreBlack(result: ResultEnum): number {
  switch (result) {
    case ResultEnum.WhiteFF:
    case ResultEnum.WhiteWins:
    case ResultEnum.BothFF:
      return 0;
    case ResultEnum.BlackFF:
    case ResultEnum.BlackWins:
      return 1;
    case ResultEnum.Draw:
      return 0.5;
  }
}
export function GetTpr(percentage: number): number {
  switch (percentage) {
    case 0:
      return -800;
    case 1:
      return -677;
    case 2:
      return -589;
    case 3:
      return -538;
    case 4:
      return -501;
    case 5:
      return -470;
    case 6:
      return -444;
    case 7:
      return -422;
    case 8:
      return -401;
    case 9:
      return -383;
    case 10:
      return -366;
    case 11:
      return -351;
    case 12:
      return -336;
    case 13:
      return -322;
    case 14:
      return -309;
    case 15:
      return -296;
    case 16:
      return -284;
    case 17:
      return -273;
    case 18:
      return -262;
    case 19:
      return -251;
    case 20:
      return -240;
    case 21:
      return -230;
    case 22:
      return -220;
    case 23:
      return -211;
    case 24:
      return -202;
    case 25:
      return -193;
    case 26:
      return -184;
    case 27:
      return -175;
    case 28:
      return -166;
    case 29:
      return -158;
    case 30:
      return -149;
    case 31:
      return -141;
    case 32:
      return -133;
    case 33:
      return -125;
    case 34:
      return -117;
    case 35:
      return -110;
    case 36:
      return -102;
    case 37:
      return -95;
    case 38:
      return -87;
    case 39:
      return -80;
    case 40:
      return -72;
    case 41:
      return -65;
    case 42:
      return -57;
    case 43:
      return -50;
    case 44:
      return -43;
    case 45:
      return -36;
    case 46:
      return -29;
    case 47:
      return -21;
    case 48:
      return -14;
    case 49:
      return -7;
    case 50:
      return 0;
    default:
      return -1 * GetTpr(100 - percentage);
  }
}
