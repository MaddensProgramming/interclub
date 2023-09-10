"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorEnum = exports.ResultEnum = void 0;
var ResultEnum;
(function (ResultEnum) {
    ResultEnum[ResultEnum["WhiteWins"] = 1] = "WhiteWins";
    ResultEnum[ResultEnum["Draw"] = 2] = "Draw";
    ResultEnum[ResultEnum["BlackWins"] = 3] = "BlackWins";
    ResultEnum[ResultEnum["WhiteFF"] = 4] = "WhiteFF";
    ResultEnum[ResultEnum["BlackFF"] = 5] = "BlackFF";
    ResultEnum[ResultEnum["BothFF"] = 6] = "BothFF";
})(ResultEnum || (exports.ResultEnum = ResultEnum = {}));
var ColorEnum;
(function (ColorEnum) {
    ColorEnum[ColorEnum["Wit"] = 1] = "Wit";
    ColorEnum[ColorEnum["Zwart"] = 2] = "Zwart";
})(ColorEnum || (exports.ColorEnum = ColorEnum = {}));
