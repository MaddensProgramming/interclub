import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { Router } from '@angular/router';
import { combineLatest, filter, map, Observable, startWith, tap } from 'rxjs';
import { ClubOverview, ClubOverviewItem } from 'src/app/models/club';
import { PlayerOverview, SimplePlayer } from 'src/app/models/player';
import { TreeNode } from 'src/app/models/tree-node';
import { DataBaseService } from '../../../services/database.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public dataSource$ = new Observable<MatTreeNestedDataSource<TreeNode>>();
  public clubs: ClubOverviewItem[];

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

    this.setUpPlayerCombobox();

    this.dataSource$ = this.service.getOverview().pipe(
      tap((cluboverview) => this.fillClubSearchBox(cluboverview)),
      map((overview) => this.createDataSource(overview))
    );
  }

  private setUpPlayerCombobox() {
    const playerdb = this.service
      .getSimplePlayerOverview()
      .pipe(map((overview) => overview.players));

    this.filteredOptionsPlayer = combineLatest([
      this.formPlayer.valueChanges.pipe(startWith('')),
      playerdb,
    ]).pipe(
      tap(([value, players]) => {
        if (value?.id) this.router.navigate(['player/' + value.id]);
      }),
      map(([name, players]) => this._filterPlayer(name, players))
    );
  }

  private _filterClub(name: string): ClubOverviewItem[] {
    if (!name || typeof name !== 'string') return this.clubs;
    const filterValue = name.toLowerCase();

    return this.clubs.filter((option) =>
      option.name.toLowerCase().includes(filterValue)
    );
  }

  private _filterPlayer(name: string, players: SimplePlayer[]): SimplePlayer[] {
    if (!name || name.length < 2 || typeof name !== 'string') return [];
    const filterValues = name.toLowerCase().split(' ');

    return players.filter((option) =>
      filterValues.every((filterValue) =>
        option.name
          .toLowerCase()
          .split(' ')
          .some((str) => str.startsWith(filterValue))
      )
    );
  }

  display(club: ClubOverviewItem): string {
    return club?.name;
  }

  fillClubSearchBox(cluboverview: ClubOverview): void {
    this.clubs = cluboverview.provinces.reduce(
      (previous: ClubOverviewItem[], newvalue) =>
        previous.concat(newvalue.clubs),
      []
    );
    this.clubs = this.clubs.map((club) => {
      return { ...club, name: `${club.name} (${club.id})` };
    });

    this.formClub.setValue(this.formClub.value);
  }

  createDataSource(overview: ClubOverview): MatTreeNestedDataSource<TreeNode> {
    const treeNodes: TreeNode[] = [];
    const dataSource = new MatTreeNestedDataSource<TreeNode>();

    overview.provinces.forEach((province) => {
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
  }
}
