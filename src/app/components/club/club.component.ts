import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { map, Observable, switchMap } from 'rxjs';
import { Club } from 'src/app/models/club';
import { DataBaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-club',
  templateUrl: './club.component.html',
  styleUrls: ['./club.component.scss'],
})
export class ClubComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'rating', 'score', 'tpr'];

  public club$: Observable<Club>;

  constructor(
    private route: ActivatedRoute,
    private databaseService: DataBaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.club$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        this.databaseService.getClub(+params.get('id'))
      ),
      map((club) => {
        club.players.sort((a, b) => b.tpr - a.tpr);
        return club;
      })
    );
  }

  showPlayer(id: number) {
    this.router.navigate([`player/${id}`]);
  }
}
