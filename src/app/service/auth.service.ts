import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  public loginAsAdmin(password: string): Observable<boolean> {
    return of(password === 'admin123').pipe(
      delay(1000)
    );
  }
}
