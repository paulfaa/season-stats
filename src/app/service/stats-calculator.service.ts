import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ALL_NAMES, FIRST_APPEARANCES, IndividualResult, PlayerResult, Playlist, PlaylistData, TableData } from '../models';
import { Utils } from '../util/utils';
import { PlaylistDataService } from './playlist-data.service';

@Injectable({
  providedIn: 'root'
})
export class StatsCalculatorService {

  constructor(private playlistDataService: PlaylistDataService) { }

  public getAllStats(): Observable<IndividualResult[]> {
    return this.playlistDataService.playlistData$.pipe(
      map(playlistData => this.generateAllStats(playlistData))
    );
  }

  public getAllTables(): Observable<TableData[]> {
    return this.playlistDataService.playlistData$.pipe(
      map(playlistData => this.generateAllTables(playlistData))
    );
  }

  public generateAllStats(playlistData: PlaylistData[]): IndividualResult[] {
    const stats = [];
    stats.push(this.calculateTotalNumberOfPlaylists(playlistData));
    stats.push(this.calculateAveragePlaylistLength(playlistData));
    stats.push(this.calculateAverageSquadSize(playlistData));
    stats.push(...this.calculateMostPopularDays(playlistData));
    stats.push(this.calculateMostPlaylistsInOneWeek(playlistData));
    //stats.push(this.calculateLongestWinningStreak()); //needs fix
    return stats
  }

  private generateAllTables(playlistData: PlaylistData[]): TableData[] {
    const tables: TableData[] = [];
    tables.push({
      title: 'Days Without A Win',
      data: this.calculateDaysSinceLastWin(playlistData),
      columnHeaders: {
        playerName: 'Player',
        points: 'Days'
      }
    });
    tables.push({
      title: 'Days Without A Podium',
      data: this.calculateDaysSinceLastPodium(playlistData),
      columnHeaders: {
        playerName: 'Player',
        points: 'Days'
      }
    });
    /* tables.push({
      title: 'Days on Top of Leaderboard',
      data: this.calculateDaysOnTop(playlistData),
      columnHeaders: {
        playerName: 'Player',
        points: 'Days'
      }
    }); */
    return tables;
  }

  private calculateTotalNumberOfPlaylists(playlistData: PlaylistData[]): IndividualResult {
    return { title: 'Total Playlists', value: playlistData.length }
  }

  private calculateAveragePlaylistLength(playlistData: PlaylistData[]): IndividualResult {
    const avgLength = playlistData.reduce((acc, playlist) => acc + playlist.numberOfEvents, 0) / playlistData.length;
    return { title: 'Average Playlist Length', value: Utils.toTwoDecimalPlaces(avgLength) }
  }

  private calculateAverageSquadSize(playlistData: PlaylistData[]): IndividualResult {
    const avgSize = playlistData.reduce((acc, playlist) => acc + playlist.players.length, 0) / playlistData.length;
    return { title: 'Average Squad Size', value: Utils.toTwoDecimalPlaces(avgSize) }
  }

  private calculateMostPopularDays(playlistData: PlaylistData[]): IndividualResult[] {
    const dayCounts: Record<string, number> = {};

    playlistData.forEach(playlist => {
      const day = new Date(playlist.playlistDate).toLocaleDateString('en-US', { weekday: 'long' });
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });

    const sortedDays = Object.entries(dayCounts).sort((a, b) => b[1] - a[1]);
    const mostPopularDay = sortedDays[0][0];
    const sortedLeastPopular = Object.entries(dayCounts).sort((a, b) => a[1] - b[1]);
    const leastPopularDay = sortedLeastPopular[0][0];

    return [{ title: 'Most Popular Day', subtitle: mostPopularDay }, { title: 'Least Popular Day', subtitle: leastPopularDay }];
  }

  private calculateMostPlaylistsInOneWeek(playlistData: PlaylistData[]): IndividualResult {
    const weekCounts: Record<string, number> = {};
    const playlists = playlistData.map(playlist => ({
      ...playlist,
      dateObj: new Date(playlist.playlistDate)
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

  private calculateDaysSinceLastWin(playlistData: PlaylistData[]): PlayerResult[] {
    const mostRecentWin: Record<string, Date> = {};
    const today = new Date();

    for (let i = playlistData.length - 1; i >= 0; i--) {
      const playlist = playlistData[i];
      if (Utils.playlistWasDraw(playlist)) continue;

      const winner = playlist.players[0].name;
      if (!mostRecentWin[winner]) {
        mostRecentWin[winner] = new Date(playlist.playlistDate);
      }
    }

    const sorted = ALL_NAMES
      .map(player => {
        const referenceDate = mostRecentWin[player] || FIRST_APPEARANCES[player];
        const days = Math.floor((today.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));
        return { playerName: player, points: days };
      })
      .sort((a, b) => a.points - b.points);
    return sorted;
  }

  private calculateDaysSinceLastPodium(playlistData: PlaylistData[]): PlayerResult[] {
    const mostRecentPodium: Record<string, Date> = {};
    const today = new Date();

    for (let i = playlistData.length - 1; i >= 0; i--) {
      const playlist = playlistData[i];
      if (Utils.playlistWasDraw(playlist)) continue;

      const podiumFinishers = playlist.players.slice(0, 3).map(player => player.name);
      podiumFinishers.forEach(name => {
        if (!mostRecentPodium[name]) {
          mostRecentPodium[name] = new Date(playlist.playlistDate);
        }
      });
    }

    const sorted = ALL_NAMES
      .map(player => {
        const referenceDate = mostRecentPodium[player] || FIRST_APPEARANCES[player];
        const days = Math.floor((today.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));
        return { playerName: player, points: days };
      })
      .sort((a, b) => a.points - b.points);
    return sorted;
  }

  private calculateDaysOnTop(playlistData: PlaylistData[]): PlayerResult[] {
    const sortedPlaylists = [...playlistData].sort(
      (a, b) => new Date(a.playlistDate).getTime() - new Date(b.playlistDate).getTime()
    );

    const pointsPerPlayer: Record<string, number> = {};
    ALL_NAMES.forEach(name => pointsPerPlayer[name] = 0);

    const leaderByDate: Record<string, string> = {};
    let currentLeader: string | null = null;

    sortedPlaylists.forEach(playlist => {
      playlist.players.forEach((player, index) => {
        pointsPerPlayer[player.name] += Utils.calculateChampionshipPoints(index);
      });

      const sortedLeaders = Object.entries(pointsPerPlayer)
        .sort((a, b) => b[1] - a[1]);

      currentLeader = sortedLeaders[0][0];
      const dateKey = this.formatDateKey(new Date(playlist.playlistDate));
      leaderByDate[dateKey] = currentLeader;
    });

    const startDate = new Date(2025, 0, 7);
    const today = new Date();

    const daysOnTop: Record<string, number> = {};
    ALL_NAMES.forEach(name => daysOnTop[name] = 0);

    let dateCursor = new Date(startDate);

    while (dateCursor <= today) {
      const dateKey = this.formatDateKey(dateCursor);

      if (leaderByDate[dateKey]) {
        currentLeader = leaderByDate[dateKey];
      }

      if (currentLeader) {
        daysOnTop[currentLeader] += 1;
      }

      dateCursor.setDate(dateCursor.getDate() + 1);
    }

    return Object.entries(daysOnTop)
      .map(([playerName, points]) => ({ playerName, points }))
      .sort((a, b) => b.points - a.points);
  }


  private formatDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }


  private calculateLongestWinningStreak(playlistData: PlaylistData[]): IndividualResult {
    const sortedPlaylists = [...playlistData].sort(
      (a, b) => new Date(a.playlistDate).getTime() - new Date(b.playlistDate).getTime()
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
