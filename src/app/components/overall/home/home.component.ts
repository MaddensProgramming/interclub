import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  MatTreeNestedDataSource,
  MatTree,
  MatTreeNodeDef,
  MatTreeNodeToggle,
  MatNestedTreeNode,
  MatTreeNodeOutlet,
} from '@angular/material/tree';
import { Router, RouterLink } from '@angular/router';
import { combineLatest, map, Observable, startWith, tap } from 'rxjs';
import { TreeNode } from 'src/app/models/tree-node';
import { DataBaseService } from '../../../services/database.service';
import { ClubOverviewItem } from 'functions/src/models/ClubOverviewItem';
import { ClubOverview } from 'functions/src/models/ClubOverview';
import { SimplePlayer } from 'functions/src/models/SimplePlayer';
import { MatFormField, MatLabel, MatInput } from '@angular/material/input';
import {
  MatAutocompleteTrigger,
  MatAutocomplete,
} from '@angular/material/autocomplete';
import { MatOption } from '@angular/material/select';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AsyncPipe, DatePipe } from '@angular/common';
import { ProvincePipe } from '../../../pipes/province.pipe';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    RouterLink,
    MatFormField,
    MatLabel,
    MatInput,
    ReactiveFormsModule,
    MatAutocompleteTrigger,
    MatAutocomplete,
    MatOption,
    MatButton,
    MatTree,
    MatTreeNodeDef,
    MatTreeNodeToggle,
    MatNestedTreeNode,
    MatIcon,
    MatTreeNodeOutlet,
    MatProgressSpinner,
    AsyncPipe,
    DatePipe,
    ProvincePipe,
  ],
})
export class HomeComponent implements OnInit {
  public dataSource$ = new Observable<MatTreeNestedDataSource<TreeNode>>();
  public clubs: ClubOverviewItem[] = [];
  public lastUpdate$: Observable<Date>;

  formClub = new FormControl<ClubOverviewItem | string | null>(null);
  filteredOptionsClub: Observable<ClubOverviewItem[]>;

  formPlayer = new FormControl<SimplePlayer | string | null>(null);
  filteredOptionsPlayer: Observable<SimplePlayer[]>;

  treeControl = new NestedTreeControl<TreeNode>((node) => node.children);
  hasChild = (_: number, node: TreeNode) =>
    !!node.children && node.children.length > 0;

  constructor(
    private service: DataBaseService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.filteredOptionsClub = this.formClub.valueChanges.pipe(
      tap((value) => {
        if (this.isClub(value)) this.router.navigate(['club/' + value.id]);
      }),
      startWith(''),
      map((name) => this._filterClub(name)),
    );

    this.setUpPlayerCombobox();

    this.lastUpdate$ = this.service.getLastUpdate();

    this.dataSource$ = this.service.getOverview().pipe(
      tap((cluboverview) => this.fillClubSearchBox(cluboverview)),
      map((overview) => this.createDataSource(overview)),
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
        if (this.isPlayer(value)) this.router.navigate(['player/' + value.id]);
      }),
      map(([name, players]) => this._filterPlayer(name, players)),
    );
  }

  private _filterClub(
    name: ClubOverviewItem | string | null,
  ): ClubOverviewItem[] {
    if (!name || typeof name !== 'string') return this.clubs;
    const filterValue = name.toLowerCase();

    return this.clubs.filter((option) =>
      option.name.toLowerCase().includes(filterValue),
    );
  }

  private _filterPlayer(
    name: SimplePlayer | string | null,
    players: SimplePlayer[],
  ): SimplePlayer[] {
    if (!name || typeof name !== 'string' || name.length < 2) return [];
    const filterValues = name.toLowerCase().split(' ');

    return players.filter((option) =>
      filterValues.every((filterValue) =>
        option.name
          .toLowerCase()
          .split(' ')
          .some((str) => str.startsWith(filterValue)),
      ),
    );
  }

  display(club: ClubOverviewItem | null): string {
    return club?.name ?? '';
  }

  private isClub(
    value: ClubOverviewItem | string | null,
  ): value is ClubOverviewItem {
    return typeof value === 'object' && !!value?.id;
  }

  private isPlayer(value: SimplePlayer | string | null): value is SimplePlayer {
    return typeof value === 'object' && !!value?.id;
  }

  fillClubSearchBox(cluboverview: ClubOverview): void {
    this.clubs = cluboverview.provinces.reduce(
      (previous: ClubOverviewItem[], newvalue) =>
        previous.concat(newvalue.clubs),
      [],
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
