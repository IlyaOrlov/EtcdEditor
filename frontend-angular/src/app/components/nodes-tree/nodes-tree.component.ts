import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import { ConfigNode } from 'src/app/app.types';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-nodes-tree',
  templateUrl: './nodes-tree.component.html',
  styleUrls: ['./nodes-tree.component.scss']
})
export class NodesTreeComponent implements OnChanges {
  @Input() nodes: ConfigNode[] | null = null;
  @Output() onSelectNode: EventEmitter<ConfigNode> = new EventEmitter();
  @Output() onAddNewNode: EventEmitter<string> = new EventEmitter();

  treeControl = new NestedTreeControl<ConfigNode>(node => node?.nodes);
  dataSource = new MatTreeNestedDataSource<ConfigNode>();
  selectedNode: ConfigNode | null = null;
  nodeName: FormControl = new FormControl(null);
  isFormOpened = false;

  hasChild = (_: number, node: ConfigNode) => !!node.nodes && node.nodes.length > 0;

  ngOnChanges(): void {
    if (this.nodes) {
      this.dataSource.data = this.nodes;
    }
  }

  selectNode(node: ConfigNode): void {
    if (this.selectedNode?.key !== node?.key) {
      this.onSelectNode.emit(node);
      this.selectedNode = node;
    }
  }

  addNewNode(): void {
    this.onAddNewNode.emit(this.nodeName.value);
    this.isFormOpened = false;
  }

  openForm(): void {
    this.isFormOpened = true;
  }

  cancel(): void {
    this.isFormOpened = false;
    this.nodeName.reset();
  }

}
