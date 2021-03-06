import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/*
 * Service for Rest APIs
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient
  ) { }

  /**
   * [get description]
   * @param  uri :uri for requested resource
   * @return     observable
   */
  get(uri: String) {
    return this.http.get(environment.api_endpoint_base + uri);
  }
}
