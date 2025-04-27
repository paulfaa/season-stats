import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, Observable, switchMap, tap } from 'rxjs';
import { IndividualResult, Playlist } from '../models';
import { Utils } from '../util/utils';
import { PlaylistDataService } from './playlist-data.service';

@Injectable({
  providedIn: 'root'
})
export class StatsCalculatorService {

  private individualDataSubject = new BehaviorSubject<IndividualResult[]>([]);
  public individualData$ = this.individualDataSubject.asObservable();
  private playlistData: Playlist[] = [];

  constructor(private playlistDataService: PlaylistDataService) {
    this.playlistDataService.playlistData$.subscribe(data => {
      this.playlistData = data;
    });
  }

  public getAllStats(): Observable<IndividualResult[]> {
    return this.playlistDataService.playlistData$.pipe(
      filter(data => data.length > 0),
      tap(() => this.updateAllStats()),
      switchMap(() => this.individualData$)
    );
  }

  public updateAllStats(): void {
    const stats = [];
    stats.push(this.calculateTotalNumberOfPlaylists());
    stats.push(this.calculateAveragePlaylistLength());
    stats.push(this.calculateAverageSquadSize());
    stats.push(...this.calculateMostPopularDays());
    stats.push(this.calculateMostPlaylistsInOneWeek());
    stats.push(this.calculateLongestWinningStreak());
    this.individualDataSubject.next(stats);
  }

  private calculateTotalNumberOfPlaylists(): IndividualResult {
    return { title: 'Total Playlists', value: this.playlistData.length }
  }

  private calculateAveragePlaylistLength(): IndividualResult {
    const avgLength = this.playlistData.reduce((acc, playlist) => acc + playlist.length, 0) / this.playlistData.length;
    return { title: 'Average Playlist Length', value: Utils.toTwoDecimalPlaces(avgLength) }
  }

  private calculateAverageSquadSize(): IndividualResult {
    const avgSize = this.playlistData.reduce((acc, playlist) => acc + playlist.players.length, 0) / this.playlistData.length;
    return { title: 'Average Squad Size', value: Utils.toTwoDecimalPlaces(avgSize) }
  }

  private calculateMostPopularDays(): IndividualResult[] {
    const dayCounts: Record<string, number> = {};

    this.playlistData.forEach(playlist => {
      const day = new Date(playlist.date).toLocaleDateString('en-US', { weekday: 'long' });
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });

    const sortedDays = Object.entries(dayCounts).sort((a, b) => b[1] - a[1]);
    const mostPopularDay = sortedDays[0][0];
    const sortedLeastPopular = Object.entries(dayCounts).sort((a, b) => a[1] - b[1]);
    const leastPopularDay = sortedLeastPopular[0][0];

    return [{ title: 'Most Popular Day', subtitle: mostPopularDay }, { title: 'Least Popular Day', subtitle: leastPopularDay }];
  }

  private calculateMostPlaylistsInOneWeek(): IndividualResult {
    const weekCounts: Record<string, number> = {};
    const playlists = this.playlistData.map(playlist => ({
      ...playlist,
      dateObj: new Date(playlist.date)
    }));

    const startOfYear = new Date('2025-01-01');
    const endOfYear = new Date('2025-12-31');

    while (startOfYear.getDay() !== 1) {
      startOfYear.setDate(startOfYear.getDate() + 1);
    }

    let currentWeekStart = new Date(startOfYear);

    while (currentWeekStart <= endOfYear) {
      const currentWeekEnd = new Date(currentWeekStart);
      currentWeekEnd.setDate(currentWeekStart.getDate() + 6);

      const weekKey = `${currentWeekStart.toLocaleDateString('en-CA')} - ${currentWeekEnd.toLocaleDateString('en-CA')}`;

      weekCounts[weekKey] = playlists.filter(({ dateObj }) =>
        dateObj >= currentWeekStart && dateObj <= currentWeekEnd
      ).length;

      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }

    const [mostPlaylistsWeek, mostPlaylistsCount] = Object.entries(weekCounts)
      .sort(([, countA], [, countB]) => countB - countA)[0];

    const [weekStartStr, weekEndStr] = mostPlaylistsWeek.split(' - ');
    const formattedWeekRange = `${new Date(weekStartStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${new Date(weekEndStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;

    return { title: 'Most Playlists in One Week', subtitle: formattedWeekRange, value: mostPlaylistsCount };
  }

  private calculateLongestWinningStreak(): IndividualResult {
    const sortedPlaylists = [...this.playlistData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let longestStreak = 0;
    let currentStreak = 0;
    let currentWinner = "";
    let bestPlayers: string[] = [];

    sortedPlaylists.forEach(playlist => {
      if (Utils.playlistWasDraw(playlist)) {
        currentStreak = 0;
        return;
      }

      const winner = playlist.players[0].name;

      if (winner === currentWinner) {
        currentStreak++;
      } else {
        currentWinner = winner;
        currentStreak = 1;
      }

      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
        bestPlayers = [currentWinner];
      }
      else if (currentStreak === longestStreak) {
        if (!bestPlayers.includes(currentWinner)) {
          bestPlayers.push(currentWinner);
        }
      }
    });

    const bestPlayer = bestPlayers.length > 1 ? bestPlayers.join(', ') : bestPlayers[0];
    return { title: 'Longest Winning Streak:', subtitle: bestPlayer, value: longestStreak };
  }
}
