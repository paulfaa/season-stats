import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Validators, FormBuilder, ReactiveFormsModule, FormArray, ValidatorFn, AbstractControl, ValidationErrors, FormGroup } from '@angular/forms';
import { ParsingService } from 'src/app/service/parsing.service';
import { ALL_NAMES, PlaylistData } from '../../models';
import { MatSelectModule } from '@angular/material/select';
import { LoadingSpinnerComponent } from "src/app/loading-spinner/loading-spinner.component";
import { PlaylistDataService } from 'src/app/service/playlist-data.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule, MatSelectModule, LoadingSpinnerComponent],
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent implements OnInit {

  lastUploaded: Observable<Date | undefined>;
  lastUploadedName: Observable<string | undefined>;
  uploadError: string | null = null;
  parseSuccess: boolean = false;
  // use single string to keep track of success/error etc
  isLoading: boolean = false;

  imageFile: File | null = null;
  fileName: string = '';

  uploadForm: FormGroup;
  allNames = ALL_NAMES;

  constructor(private formBuilder: FormBuilder, private parsingService: ParsingService, private playlistDataService: PlaylistDataService) {
    this.uploadForm = this.formBuilder.group({
      playlistName: [''],
      playlistDate: [],
      numberOfEvents: [0],
      numberOfPlayers: [0],
      players: this.formBuilder.array([]),
    });
    this.lastUploaded = this.playlistDataService.lastPlaylistDate$;
    this.lastUploadedName = this.playlistDataService.lastPlaylistName$;
  }

  ngOnInit(): void {}

  get playersLength(): number {
    const playersArray = this.uploadForm.get('players') as FormArray;
    return playersArray?.length ?? 0;
  }

  get playerControls() {
    const playersArray = this.uploadForm.get('players') as FormArray;
    return playersArray?.controls ?? [];
  }

  onFileSelected(event: Event): void {
    this.isLoading = true;
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.uploadError = 'Invalid file selected';
      return;
    }
    this.imageFile = input.files![0];
    this.fileName = this.imageFile.name;
    const formData = new FormData();
    formData.append('image', this.imageFile);

    this.parsingService.uploadImage(formData).subscribe({
      next: (parsedData) => {
        this.createForm(parsedData);
        this.parseSuccess = true;
      },
      complete: () => {
        this.isLoading = false;
        this.uploadError = null;
        console.log('Image upload successful:', this.fileName);
      },
      error: (error) => {
        this.isLoading = false;
        this.parseSuccess = false;
        console.error('Image upload failed:', error);
        this.uploadError = 'Image upload failed. Please try again.';
      }
    });
  }

  public addPlayer(): void {
    const playersArray = this.uploadForm.get('players') as FormArray;
    playersArray.push(this.createPlayerGroup({ name: '', lastEventPoints: 0, totalPoints: 0 }));
  }

  public removePlayer(): void {
    const playersArray = this.uploadForm.get('players') as FormArray;
    if (playersArray.length > 0) {
      playersArray.removeAt(playersArray.length - 1);
    }
  }

  public resetForm(): void {
    this.uploadForm.reset();
    this.parseSuccess = false;
    this.uploadError = null;
    this.imageFile = null;
    this.fileName = '';
  }

  isNameSelected(name: string, currentIndex: number): boolean {
    const playersArray = this.uploadForm.get('players') as FormArray;
    return playersArray.controls.some(
      (group, idx) => group.get('name')?.value === name && idx !== currentIndex
    );
  }

  private createForm(data: any): void {
  this.uploadForm = this.formBuilder.group({
    playlistName: [data.playlistName, Validators.required],
    playlistDate: [undefined, [Validators.required, this.dateValidator]],
    numberOfEvents: [data.numberOfEvents, Validators.required],
    numberOfPlayers: [data.numberOfPlayers, Validators.required],
    players: this.formBuilder.array(
      data.players.map((player: any) => this.createPlayerGroup(player)),
      [this.uniquePlayerNamesValidator]
    )
  });
}

  private createPlayerGroup(player: any) {
    return this.formBuilder.group({
      name: [player.name, Validators.required],
      lastEventPoints: [player.lastEventPoints, Validators.required],
      totalPoints: [player.totalPoints, Validators.required]
    });
  }

  onSubmit(): void {
    if (this.uploadForm.invalid) return;

    const formContents = this.uploadForm.value;
    const playlistData: PlaylistData = {
      playlistName: formContents.playlistName,
      playlistDate: formContents.playlistDate,
      numberOfEvents: formContents.numberOfEvents,
      numberOfPlayers: formContents.numberOfPlayers,
      uploadDate: new Date().toISOString().split('T')[0], //just need DD-MM-YYYY
      uploadedBy: this.parsingService.userRole,
      players: formContents.players.map((player: any) => ({
        name: player.name,
        lastEventPoints: player.lastEventPoints,
        totalPoints: player.totalPoints
      }))
    };

    this.parsingService.saveToDatabase(playlistData).subscribe({
      next: () => {
        console.log('Data saved successfully');
        this.resetForm();
        window.scrollTo(0, 0);
      },
      error: (error) => {
        console.error('Error saving data:', error);
        this.uploadError = 'Failed to save data. Please try again.';
      }
    });
  }

  uniquePlayerNamesValidator(formArray: AbstractControl): ValidationErrors | null {
    const names = (formArray.value as any[]).map(player => player.name);
    const hasDuplicates = names.some((name, idx) => name && names.indexOf(name) !== idx);
    return hasDuplicates ? { nonUniqueNames: true } : null;
  };

  dateValidator(control: AbstractControl): ValidationErrors | null {
    const today = new Date();
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(today.getDate() - 14);
    const selectedDate = new Date(control.value);

    today.setHours(0, 0, 0, 0);
    twoWeeksAgo.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    return selectedDate > today || selectedDate < twoWeeksAgo ? { invalidDate: true } : null;
  }

}