import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'province'
})
export class ProvincePipe implements PipeTransform {

  transform(value:number): string {
    switch(value){
      case 1: return "Antwerpen";
      case 2: return "Brussel en Vlaams-Brabant";
      case 3: return "West-Vlaanderen";
      case 4: return "Oost-Vlaanderen";
      case 5: return "Henegouwen";
      case 6: return "Luik";
      case 7: return "Limburg";
      case 8: return "Luxemburg";
      case 9: return "Namen/Waals-Brabant";
      default: return "";
    }
  }

}
