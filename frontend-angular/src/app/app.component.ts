import { Component, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppService } from './app.service';
import { ConfigNode } from './app.types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {

  title = 'frontend-angular';
  nodes: Observable<ConfigNode[]>;
  selectedNode: ConfigNode;
  destroed: Subject<boolean> = new Subject();

  constructor(private appService: AppService) {
    this.nodes = new Observable();
  }

  ngOnInit(): void {
    this.nodes = this.appService.getNodes();
  }

  ngOnDestroy(): void {
    this.destroed.next(true);
    this.destroed.complete();
  }

  selectNode(node: ConfigNode): void {
    this.selectedNode = node;
  }

  addNewNodeItem(key: string): void {
    this.appService.saveNode(key)
      .pipe(takeUntil(this.destroed))
      .subscribe();
  }

}
