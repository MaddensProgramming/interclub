import { Component, OnInit } from '@angular/core';
import { GenerateService } from 'src/app/services/generate.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
})
export class UploadComponent implements OnInit {
  constructor(private generataService: GenerateService) {}

  upload(): void {
    this.generataService.sendData();
  }

  ngOnInit(): void {}
}
