import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../service/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
  return this.auth.checkAuth().pipe(
    map(() => {
      console.log('AuthGuard: Authenticated');
      return true;
    }),
    catchError((err) => {
      console.log('AuthGuard: Not authenticated or server unreachable', err);
      return of(this.router.createUrlTree(['/login']));
    })
  );
}
}
