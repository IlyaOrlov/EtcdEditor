import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ConfigNode, ConfigResponse } from './app.types';

@Injectable()
export class AppApiService {

  private baseUrl: string = '/api';

  constructor(private http: HttpClient) {}

  getNodes(): Observable<ConfigResponse> {
    return this.http.get<ConfigResponse>(`${this.baseUrl}/v2/keys/`);
  }

  saveNode(key: string, node?: ConfigNode): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/v2/keys/${key}`, {value: node || null});
  }
}
