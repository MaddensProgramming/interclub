import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { Router } from '@angular/router';
import { filter, map, Observable, startWith, tap } from 'rxjs';
import { ClubOverviewItem } from 'src/app/models/club';
import { PlayerOverview, SimplePlayer } from 'src/app/models/player';
import { TreeNode } from 'src/app/models/tree-node';
import { DataBaseService } from '../../services/database.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public dataSource$ = new Observable<MatTreeNestedDataSource<TreeNode>>();
  public clubs: ClubOverviewItem[];
  public players: SimplePlayer[] = [];

  formClub = new FormControl();
  filteredOptionsClub: Observable<ClubOverviewItem[]>;

  formPlayer = new FormControl();
  filteredOptionsPlayer: Observable<SimplePlayer[]>;

  treeControl = new NestedTreeControl<TreeNode>((node) => node.children);
  hasChild = (_: number, node: TreeNode) =>
    !!node.children && node.children.length > 0;

  constructor(private service: DataBaseService, private router: Router) {}

  ngOnInit(): void {
    this.filteredOptionsClub = this.formClub.valueChanges.pipe(
      tap((value) => {
        if (value?.id) this.router.navigate(['club/' + value.id]);
      }),
      startWith(''),
      map((name) => this._filterClub(name))
    );

    this.filteredOptionsPlayer = this.formPlayer.valueChanges.pipe(
      tap((value) => {
        if (value?.id) this.router.navigate(['player/' + value.id]);
      }),
      startWith(''),
      map((name) => this._filterPlayer(name))
    );

    this.dataSource$ = this.service.getOverview().pipe(
      map((cluboverview) => {
        this.clubs = cluboverview.provinces.reduce(
          (previous: ClubOverviewItem[], newvalue) =>
            previous.concat(newvalue.clubs),
          []
        );

        const treeNodes: TreeNode[] = [];
        const dataSource = new MatTreeNestedDataSource<TreeNode>();

        cluboverview.provinces.forEach((province) => {
          const node: TreeNode = {
            id: province.id,
            children: province.clubs.map((club) => {
              return { id: club.id, name: club.name };
            }),
          };
          treeNodes.push(node);
        });
        dataSource.data = treeNodes;
        return dataSource;
      }),
      tap(() => this.getPlayers())
    );
  }

  getPlayers() {
    this.service
      .getSimplePlayerOverview()
      .pipe(map((overview) => overview.players))
      .subscribe((players) => (this.players = players));
  }

  private _filterClub(name: string): ClubOverviewItem[] {
    if (!name) return this.clubs;
    const filterValue = name.toLowerCase();

    return this.clubs.filter((option) =>
      option.name.toLowerCase().includes(filterValue)
    );
  }

  private _filterPlayer(name: string): SimplePlayer[] {
    if (!name || name.length < 2) return [];
    const filterValue = name.toLowerCase();

    return this.players.filter((option) =>
      option.name
        .toLowerCase()
        .split(' ')
        .some((str) => str.startsWith(filterValue))
    );
  }

  display(club: ClubOverviewItem): string {
    return club?.name;
  }
}
