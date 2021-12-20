import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AppService } from './app.service';
import { ConfigNode } from './app.types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'frontend-angular';
  nodes: Observable<ConfigNode[]>;
  selectedNode: ConfigNode;

  constructor(private appService: AppService) {
    this.nodes = new Observable();
  }

  ngOnInit(): void {
    this.nodes = this.appService.getNodes();
  }

  selectNode(node: ConfigNode): void {
    this.selectedNode = node;
    console.log('selectedNode', this.selectedNode)
  }

  saveNode(node: ConfigNode): void {
    this.appService.saveNode(node);
  }
}
