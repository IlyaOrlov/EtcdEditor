import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppApiService } from './app.service.api';
import { ConfigNode } from './app.types';

@Injectable()
export class AppService {

  constructor(private apiService: AppApiService) {}

  getNodes(): Observable<ConfigNode[]> {
    return this.apiService.getNodes().pipe(map((response) => [response.node]));
  }

  saveNode(key: string, node?: ConfigNode): Observable<void> {
    return this.apiService.saveNode(key, node);
  }

}
