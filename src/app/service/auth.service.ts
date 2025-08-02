import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = 'http://localhost:3000';
  private userRoleSubject = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) { }

  public get userRole$(): Observable<string | null> {
    return this.userRoleSubject.asObservable();
  }

  public login(password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { password }, { withCredentials: true });
  }

  checkAuth(): Observable<{ role: string }> {
    return this.http.get<{ role: string }>(`${this.apiUrl}/check`, { withCredentials: true })
      .pipe(
        tap(response => {
          this.userRoleSubject.next(response.role);
        }),
        catchError(error => {
        console.error('Error connecting to authentication server:', error);
        return throwError(() => error);
      })
      );
  }
}
