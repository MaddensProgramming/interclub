import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { Router } from '@angular/router';
import { filter, map, Observable, startWith, tap } from 'rxjs';
import { ClubOverviewItem } from 'src/app/models/club';
import { TreeNode } from 'src/app/models/tree-node';
import { DataBaseService } from '../../services/database.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public dataSource$ = new Observable<MatTreeNestedDataSource<TreeNode>>();
  public clubs: ClubOverviewItem[] ;
  form= new FormControl();
  filteredOptions: Observable<ClubOverviewItem[]>;
  treeControl = new NestedTreeControl<TreeNode>((node) => node.children);
  hasChild = (_: number, node: TreeNode) =>
    !!node.children && node.children.length > 0;

  constructor(private service: DataBaseService, private router: Router) {}


  ngOnInit(): void {

    this.filteredOptions = this.form.valueChanges.pipe(
      tap(value => {if(value?.id) this.router.navigate(['club/' + value.id])} ),
      startWith(''),
      map(value => (typeof value === 'string' ? value : value.name)),
      map(name => (name ? this._filter(name) : this.clubs.slice())),
    );

    this.dataSource$ = this.service.getOverview().pipe(
      map((cluboverview) => {
        this.clubs = cluboverview.provinces.reduce((previous:ClubOverviewItem[],newvalue) => previous.concat(newvalue.clubs), [] );

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
      })
    );
  }

  private _filter(name: string): ClubOverviewItem[] {
    const filterValue = name.toLowerCase();

    return this.clubs.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  display (club:ClubOverviewItem): string {
   return club?.name;
  }
}
