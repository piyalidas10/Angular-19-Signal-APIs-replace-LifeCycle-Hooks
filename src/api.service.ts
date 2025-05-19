import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  http = inject(HttpClient);
  constructor() {}

  getUsers(): Observable<any> {
    return this.http.get<any>(
      'https://raw.githubusercontent.com/piyalidas10/dummy-json/refs/heads/main/users.json'
    );
  }
}

// url : https://jsonplaceholder.typicode.com/users
