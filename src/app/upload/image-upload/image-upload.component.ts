import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Validators, FormBuilder, ReactiveFormsModule, FormArray, AbstractControl, ValidationErrors, FormGroup } from '@angular/forms';
import { ParsingService } from 'src/app/service/parsing.service';
import { ALL_NAMES, PlaylistData } from '../../models';
import { MatSelectModule } from '@angular/material/select';
import { LoadingSpinnerComponent } from "src/app/loading-spinner/loading-spinner.component";
import { PlaylistDataService } from 'src/app/service/playlist-data.service';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import { ɵEmptyOutletComponent } from "@angular/router";
import { totalPointsOrderValidator } from '../form-validators';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { Utils } from 'src/app/util/utils';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule, MatButtonModule, ReactiveFormsModule, MatSelectModule, LoadingSpinnerComponent, MatSnackBarModule, MatIconModule],
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent implements OnInit {

  latestUploads$: Observable<PlaylistData[]>;
  parseSuccess: boolean = false;
  isLoading: boolean = false;
  imageFile: File | null = null;
  fileName: string | undefined;
  uploadForm: FormGroup;
  playlistDateFilter: (d: Date | null) => boolean = () => true;

  private allDates$: Observable<string[]>;
  private allNames = ALL_NAMES;
  private destroy$ = new Subject<void>();

  constructor(private formBuilder: FormBuilder, private parsingService: ParsingService, private playlistDataService: PlaylistDataService, private snackBar: MatSnackBar) {
    this.uploadForm = this.formBuilder.group({
      playlistName: [''],
      playlistDate: [],
      numberOfEvents: [0],
      numberOfPlayers: [0],
      players: this.formBuilder.array([]),
    });
    this.latestUploads$ = this.playlistDataService.lastThreePlaylists$;
    this.allDates$ = this.playlistDataService.playlistData$.pipe(
      map(playlists => playlists.map(p => p.playlistDate))
    );
  }

  ngOnInit(): void {
    this.allDates$.pipe(takeUntil(this.destroy$))
      .subscribe(dates => {
        const takenSet = new Set(dates || []);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        this.playlistDateFilter = (d: Date | null) => {
          if (!d) return false;
          const candidate = new Date(d);
          candidate.setHours(0, 0, 0, 0);
          const year = candidate.getFullYear();
          const dateStr = Utils.dateToYYYYMMDD(candidate);

          return year === 2025 && candidate <= today && !takenSet.has(dateStr);
        };
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get playersLength(): number {
    const playersArray = this.uploadForm.get('players') as FormArray;
    return playersArray?.length ?? 0;
  }

  get playerControls() {
    const playersArray = this.uploadForm.get('players') as FormArray;
    return playersArray?.controls ?? [];
  }

  public onFileSelected(event: Event): void {
    this.isLoading = true;
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }
    this.imageFile = input.files![0];
    this.fileName = this.imageFile.name;
    const formData = new FormData();
    formData.append('image', this.imageFile);

    this.parsingService.uploadImage(formData).subscribe({
      next: (parsedData) => {
        this.createFormFromParsedImage(parsedData);
        this.parseSuccess = true;
        this.showSnackBar('Image uploaded successfully');
      },
      complete: () => {
        this.isLoading = false;
        console.log('Image upload successful:', this.fileName);
      },
      error: (error) => {
        this.isLoading = false;
        this.parseSuccess = false;
        console.error('Image upload failed:', error);
        this.showSnackBar('Failed to scan. Double check if Mikey took the photo.');
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
    this.imageFile = null;
    this.fileName = undefined;
  }

  isNameSelected(name: string, currentIndex: number): boolean {
    const playersArray = this.uploadForm.get('players') as FormArray;
    return playersArray.controls.some(
      (group, idx) => group.get('name')?.value === name && idx !== currentIndex
    );
  }

  get sortedNames(): string[] {
    const playersArray = this.uploadForm.get('players') as FormArray;

    return this.allNames.slice().sort((a, b) => {
      const aSelected = playersArray.controls.some(group => group.get('name')?.value === a);
      const bSelected = playersArray.controls.some(group => group.get('name')?.value === b);

      if (aSelected === bSelected) {
        return a.localeCompare(b);
      }
      return aSelected ? 1 : -1;
    });
  }

  public showForm(): void {
    this.parseSuccess = true;
    this.imageFile = new File([], "New Playlist");
    this.createBlankForm()
  }

  onSubmit(): void {
    if (this.uploadForm.invalid) return;

    const formContents = this.uploadForm.value;
    const playlistData: PlaylistData = {
      playlistName: formContents.playlistName,
      playlistDate: Utils.dateToYYYYMMDD(formContents.playlistDate),
      numberOfEvents: formContents.numberOfEvents,
      numberOfPlayers: formContents.players.length,
      uploadDate: Utils.dateToYYYYMMDD(new Date()),
      uploadedBy: this.parsingService.username,
      players: formContents.players.map((player: any) => ({
        name: player.name,
        lastEventPoints: player.lastEventPoints,
        totalPoints: player.totalPoints
      }))
    };

    console.log('data:', playlistData)

    this.parsingService.saveToDatabase(playlistData).subscribe({
      next: () => {
        this.playlistDataService.refreshPlaylists();
        console.log('Data saved successfully');
        this.resetForm();
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        });
        this.showSnackBar(`${this.capitalizeFirstLetter(playlistData.playlistName)} uploaded to database successfully`);
      },
      error: (error) => {
        console.error('Error saving data:', error);
        this.showSnackBar(`Failed to upload ${playlistData.playlistName} to database`);
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
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
    const selectedDate = new Date(control.value);

    today.setHours(0, 0, 0, 0);
    oneMonthAgo.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    return selectedDate > today || selectedDate < oneMonthAgo ? { invalidDate: true } : null;
  }

  private createFormFromParsedImage(data: any): void {
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

  private createBlankForm(): void {
    this.uploadForm = this.formBuilder.group({
      playlistName: ['', Validators.required],
      playlistDate: [undefined, [Validators.required, this.dateValidator]],
      numberOfEvents: [null, Validators.required],
      numberOfPlayers: [4, Validators.required],
      players: this.formBuilder.array(
        Array.from({ length: 4 }).map(() =>
          this.createPlayerGroup({ name: '', lastEventPoints: null, totalPoints: null })
        ),
        [this.uniquePlayerNamesValidator]
      )
    });
  }

  private createPlayerGroup(player: any) {
    return this.formBuilder.group({
      name: [player.name, [Validators.required]],
      lastEventPoints: [player.lastEventPoints, [Validators.required, Validators.max(16)]],
      totalPoints: [player.totalPoints, [Validators.required, totalPointsOrderValidator()]]
    });
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: 3500,
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      panelClass: ['snackbar-style']
    });
  }

  private capitalizeFirstLetter(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

}