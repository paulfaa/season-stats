import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { PlaylistData } from '../models';

@Injectable({ providedIn: 'root' })
export class ParsingService {

  private apiUrl = environment.apiUrl;
  private usernameSubject = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) { }

  public get username(): string {
    return this.usernameSubject.getValue() || 'user';
  }

  public getAllPlaylists(): Observable<PlaylistData[]> {
    return this.http.get<PlaylistData[]>(`${this.apiUrl}/playlists`)
      .pipe(
        catchError(error => {
          console.error('Error fetching playlists:', error);
          return throwError(() => error);
        })
      );
  }

  public login(username: string, password: string): Observable<{ success: boolean, role: string, token: string }> {
    return this.http.post<{ success: boolean, role: string, token: string }>(`${this.apiUrl}/login`, { password })
      .pipe(
        tap(response => {
          var name = username;
          if (response.role === 'admin') {
            name = 'admin';
          }
          localStorage.setItem('authToken', response.token);
          this.usernameSubject.next(name);
        }),
        catchError(error => {
          console.error('Error connecting to authentication server:', error);
          return throwError(() => error);
        })
      );
  }

  public checkAuth(): Observable<{ role: string }> {
    return this.http.get<{ role: string }>(`${this.apiUrl}/check`).pipe(
      catchError(error => {
        console.error('Error connecting to authentication server:', error);
        return throwError(() => error);
      })
    );
  }

  public uploadImage(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  public saveToDatabase(playlistData: PlaylistData): Observable<any> {
    return this.http.post(`${this.apiUrl}/save`, playlistData);
  }
}
