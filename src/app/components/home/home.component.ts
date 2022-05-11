import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { filter, Observable } from 'rxjs';
import { ClubOverview } from 'src/app/models/club';
import { DataBaseService } from '../../services/database.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public clubOverview$: Observable<ClubOverview>;

  constructor(private service: DataBaseService, private router: Router) {}

  ngOnInit(): void {
    this.clubOverview$ = this.service.getOverview().pipe(
      filter((cluboverview) => {
        if (!cluboverview) this.router.navigate(['404']);
        return !!cluboverview;
      })
    );
  }
}
