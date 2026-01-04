import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../service/api.service';
import { ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatInputModule, MatButtonModule, MatFormFieldModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  errorMessage: string | undefined;
  hidePassword = true;
  loginForm = this.formBuilder.group({
    usernameInput: ['', Validators.required],
    passwordInput: ['', Validators.required]
  });

  constructor(private formBuilder: FormBuilder, private parsingService: ApiService, private router: Router) { }

  submit() {
    this.parsingService.login(this.loginForm.value.usernameInput!, this.loginForm.value.passwordInput!).subscribe({
      next: () => {
        this.errorMessage = undefined;
        this.router.navigate(['/upload']);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status >= 400 && err.status < 500) {
          this.errorMessage = 'Invalid credentials. Please try again.';
        } else if (err.status >= 500) {
          this.errorMessage = 'Server error. Please try again later.';
        } else {
          this.errorMessage = 'An unexpected error occurred.';
        }
      }
    });
  }
}
