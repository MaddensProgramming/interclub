import { Component, OnInit } from '@angular/core';
import { DataBaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {

  constructor(private dataBaseService: DataBaseService) { }

  upload(): void {
    this.dataBaseService.sendData();
  }

  ngOnInit(): void {
  }

}
