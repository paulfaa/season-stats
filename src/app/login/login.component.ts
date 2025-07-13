import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, Validators, AbstractControl, AsyncValidatorFn, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  form: FormGroup;

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router) {

    this.form = this.formBuilder.group({
      password: ['', {
        validators: [Validators.required],
        asyncValidators: [this.adminPasswordValidator()],
        updateOn: 'submit'
      }]
    });
  }

  adminPasswordValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return this.authService.loginAsAdmin(control.value).pipe(
        map(success => success ? null : { invalidPassword: true }),
        catchError(() => of({ invalidPassword: true }))
      );
    };
  }

  submit() {
    if (this.form?.valid) {
      this.router.navigate(['/upload']);
    } else {
      this.form?.markAllAsTouched();
    }
  }
}
