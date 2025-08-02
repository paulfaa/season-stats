import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent implements OnInit {

  uploadError: string | null = null;
  uploadSuccess: boolean = false;
  imageFile: File | null = null;
  imageTitle: string = '';
  uploadForm = this.formBuilder.group({
      password: ['', Validators.required]
    });

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imageFile = input.files[0];
    }
  }

  onSubmit(): void {
    if (this.uploadForm.invalid) return;

    // todo...
    if (this.imageFile && this.imageTitle) {
      console.log('Uploading:', this.imageTitle, this.imageFile);
    }
  }
}