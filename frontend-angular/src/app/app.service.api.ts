import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ConfigNode, ConfigResponse } from './app.types';

@Injectable()
export class AppApiService {

  private baseUrl: string = 'http://localhost:8000/v2/keys/';

  constructor(private http: HttpClient) {}

  getNodes(): Observable<ConfigResponse> {
    return this.http.get<ConfigResponse>(this.baseUrl);
  }

  saveNode(node: ConfigNode): Observable<void> {
    return this.http.put<void>(this.baseUrl, node);
  }
}
