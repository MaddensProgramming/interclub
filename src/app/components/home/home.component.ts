import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { Router } from '@angular/router';
import { filter, map, Observable } from 'rxjs';
import { TreeNode } from 'src/app/models/tree-node';
import { DataBaseService } from '../../services/database.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public dataSource$ = new Observable<MatTreeNestedDataSource<TreeNode>>();
  treeControl = new NestedTreeControl<TreeNode>((node) => node.children);
  hasChild = (_: number, node: TreeNode) =>
    !!node.children && node.children.length > 0;

  constructor(private service: DataBaseService, private router: Router) {}

  ngOnInit(): void {
    this.dataSource$ = this.service.getOverview().pipe(
      filter((cluboverview) => {
        if (!cluboverview) this.router.navigate(['404']);
        return !!cluboverview;
      }),
      map((cluboverview) => {
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
}
