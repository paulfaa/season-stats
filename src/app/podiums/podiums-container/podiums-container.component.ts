import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { LoadingSpinnerComponent } from 'src/app/loading-spinner/loading-spinner.component';
import { PodiumResult } from 'src/app/models';
import { PodiumCalculatorService } from 'src/app/service/podium-calculator.service';
import { PodiumComponent } from '../podium/podium.component';
import { MatSelectModule } from '@angular/material/select';

interface SortMode {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'podiums-container',
  standalone: true,
  imports: [
    CommonModule,
    MatDividerModule,
    PodiumComponent,
    LoadingSpinnerComponent,
    MatSelectModule
  ],
  templateUrl: './podiums-container.component.html',
  styleUrls: ['./podiums-container.component.scss']
})
export class PodiumsContainerComponent {

  sortModes: SortMode[] = [
    { value: 'popular', viewValue: 'Popularity' },
    { value: 'newest', viewValue: 'Newest First' },
    { value: 'oldest', viewValue: 'Oldest First' },
  ];

  private sortModeSubject = new BehaviorSubject<string>('popular');
  sortMode$ = this.sortModeSubject.asObservable();
  sortedPodiums$: Observable<PodiumResult[]>;

  constructor(
    private podiumCalculator: PodiumCalculatorService) {
    const podiums$ = this.podiumCalculator.getAllPodiums();

    this.sortedPodiums$ = combineLatest([podiums$, this.sortMode$]).pipe(
      map(([podiums, sortMode]) => {
        if (!podiums) return [];

        const sorted = [...podiums];

        if (sortMode === 'popular') {
          return sorted.sort((a, b) => {
            if (a.popularity === 0 && b.popularity !== 0) return 1;
            if (b.popularity === 0 && a.popularity !== 0) return -1;
            return a.popularity - b.popularity;
          });
        }

        if (sortMode === 'newest') {
          return sorted.sort((a, b) =>
            new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
          );
        }

        if (sortMode === 'oldest') {
          return sorted.sort((a, b) =>
            new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime()
          );
        }

        return sorted;
      })
    );
  }

  onSortModeChange(mode: string) {
    this.sortModeSubject.next(mode);
  }
}
