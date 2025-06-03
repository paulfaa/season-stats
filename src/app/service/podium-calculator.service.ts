import { Injectable } from '@angular/core';
import { Player, Playlist, PodiumResult } from '../models';
import { BehaviorSubject, filter, Observable, switchMap, tap } from 'rxjs';
import { Utils } from '../util/utils';
import { PlaylistDataService } from './playlist-data.service';
import { DateTime } from 'luxon';
import { stat } from 'fs';

@Injectable({
  providedIn: 'root'
})
export class PodiumCalculatorService {

  private podiumDataSubject = new BehaviorSubject<PodiumResult[]>([]);
  public podiumData$ = this.podiumDataSubject.asObservable();
  private playlistData: Playlist[] = [];

  constructor(private playlistDataService: PlaylistDataService) {
    this.playlistDataService.playlistData$.subscribe(data => {
      this.playlistData = data;
    });
  }

  getAllPodiums(): Observable<PodiumResult[]> {
    return this.playlistDataService.playlistData$.pipe(
      filter(data => data.length > 0),
      tap(() => this.updateAllPodiums()),
      switchMap(() => this.podiumData$)
    );
  }

  public updateAllPodiums(): void {
    const stats = [];
    stats.push(this.calculateFlights());
    stats.push(this.calculateMostUninstalls());
    stats.push(this.calculateMostWins());
    stats.push(this.calculateMostDraws());
    stats.push(this.calculateMostSecondPlaces());
    stats.push(this.calculateMostLastPlaces());
    stats.push(this.calculateAverageLossMargins())
    const mostPlaylistsLost = this.calculateMostPlaylistsLostInFinalEvent();
    mostPlaylistsLost != null && stats.push(mostPlaylistsLost);
    //stats.push(this.lostMostChancesToWin());

    //methods returning multiple stats
    stats.push(...this.calculateWinRatios());
    stats.push(...this.calculateAverageFinishingPositions());
    stats.push(...this.calculateAverageScore());
    stats.push(...this.calculateAverageWinMargins());
    stats.push(...this.calculateDedicationRates());
    this.podiumDataSubject.next(stats)
  }

  private calculateMostPlaylistsLostInFinalEvent(): PodiumResult | undefined {
    const lossCounts: Record<string, number> = {};
    this.playlistData.forEach(playlist => {
      const pointsAvailable: number[] = [];
      var standingsInSecondLastEvent: Player[] = [];
      playlist.players.forEach(player => {
        const totalPointsInSecondLastEvent = player.totalPoints - player.lastEventPoints!;
        if (player.lastEventPoints! > 1) {
          pointsAvailable.push(player.lastEventPoints!)
        }
        standingsInSecondLastEvent.push({ name: player.name, totalPoints: totalPointsInSecondLastEvent })
      });
      standingsInSecondLastEvent.sort((a, b) => b.totalPoints - a.totalPoints);

      var leaderInSecondLastEvent: Player;
      if (standingsInSecondLastEvent[0].totalPoints == standingsInSecondLastEvent[1].totalPoints) {
        return
      }
      else {
        leaderInSecondLastEvent = standingsInSecondLastEvent[0];
      }

      const maxPointsAvailable = Math.max(...pointsAvailable);
      const minPointsAvailable = Math.min(...pointsAvailable);
      const overallWinner = playlist.players[0];
      const pointsToBeat = overallWinner.totalPoints - maxPointsAvailable + minPointsAvailable;
      const leaderName = leaderInSecondLastEvent.name;
      if (leaderName == overallWinner.name) {
        return;
      }
      if (leaderInSecondLastEvent.totalPoints + maxPointsAvailable > pointsToBeat) {
        lossCounts[leaderName] = (lossCounts[leaderName] || 0) + 1;
      }
    });

    const sortedPlayers = this.sortHighestToLowest(lossCounts)
    if (sortedPlayers.length > 0) {
      const result = this.generateTopThreePodium("Most playlists bottled", sortedPlayers);
      result.isNegative = true;
      result.subtitle = "leading the playlist in final event and lost";
      return result;
    }
    else {
      return undefined;
    }
  }

/*   private lostMostChancesToWin(): PodiumResult {
    const lossCounts: Record<string, number> = {};
  
    this.playlistData.forEach(playlist => {
      const players = [...playlist.players];
      if (players.length === 0) return;
  
      const finalEventPoints = players
        .map(p => p.lastEventPoints!)
        .filter(p => p > 0)
        .sort((a, b) => b - a); // e.g., [25, 18, 15, 12, ...]
  
      for (const candidate of players) {
        const actualIndex = players.findIndex(p => p.name === candidate.name);
        const actualPoints = candidate.lastEventPoints!;
        const positionNow = finalEventPoints.indexOf(actualPoints);
  
        // Try placing candidate in every better finishing position
        for (let newPosition = 0; newPosition < positionNow; newPosition++) {
          const simulatedOrder = [...players];
  
          // Move candidate to better position
          simulatedOrder.splice(actualIndex, 1); // remove candidate
          simulatedOrder.splice(newPosition, 0, candidate); // insert at new position
  
          const newEventPoints = simulatedOrder.map((_, i) => finalEventPoints[i]);
  
          // Recalculate total points with simulated final event results
          const simulatedTotals = simulatedOrder.map((p, i) => {
            const originalTotal = p.totalPoints;
            const originalLastPoints = p.lastEventPoints!;
            const newLastPoints = newEventPoints[i];
  
            return {
              name: p.name,
              total: originalTotal - originalLastPoints + newLastPoints,
            };
          });
  
          simulatedTotals.sort((a, b) => b.total - a.total);
          const topTotal = simulatedTotals[0].total;
          const winners = simulatedTotals.filter(p => p.total === topTotal).map(p => p.name);
  
          if (winners.length === 1 && winners[0] === candidate.name) {
            lossCounts[candidate.name] = (lossCounts[candidate.name] || 0) + 1;
            break; // Only count once per playlist
          }
        }
      }
    });
  
    const sortedLosses = this.sortHighestToLowest(lossCounts);
    const podium = this.generateTopThreePodium("Could have won playlist in final race", sortedLosses);
    podium.subtitle = "but didn't";
    podium.isNegative = true;
    return podium;
  } */
  
  private calculateFlights(): PodiumResult {
    const flightCounts: Record<string, number> = {};
    flightCounts["mikc95"] = 1;
    const sortedPlayers = this.sortHighestToLowest(flightCounts)
    const podium = this.generateTopThreePodium("Most Flights To Switzerland", sortedPlayers);
    podium.subtitle = "cause he couldn't handle the smoke"
    return podium;
  }

  private calculateMostUninstalls(): PodiumResult {
    const uninstallCounts: Record<string, number> = {};
    uninstallCounts["BarizztaButzy"] = 4;
    const sortedPlayers = this.sortHighestToLowest(uninstallCounts)
    const podium = this.generateTopThreePodium("Most times GTA uninstalled", sortedPlayers);
    podium.subtitle = "i'm never playing this bullshit game again";
    podium.isNegative = true;
    return podium;
  }

  private calculateMostWins(): PodiumResult {
    const winCounts: Record<string, number> = {};

    this.playlistData.forEach(playlist => {
      var winners = [];
      if (Utils.playlistWasDraw(playlist)) {
        return;
      }
      else {
        winners.push(playlist.players[0]);
      }
      winners.forEach(winner => {
        winCounts[winner.name] = (winCounts[winner.name] || 0) + 1;
      });
    });

    const sortedPlayers = this.sortHighestToLowest(winCounts)
    const podium = this.generateTopThreePodium("Most Wins", sortedPlayers);
    podium.subtitle = "wachow";
    return podium;
  }

  private calculateMostSecondPlaces(): PodiumResult {
    const secondPlaceCounts: Record<string, number> = {};

    this.playlistData.forEach(playlist => {
      const winningScore = playlist.players[0].totalPoints;
      const winners = this.getPlayersWithScore(winningScore, playlist.players);
      if (winners.length > 1) {
        winners.forEach(winner => {
          secondPlaceCounts[winner.name] = (secondPlaceCounts[winner.name] || 0) + 1
        })
      }
      else {
        const winnerRemoved = playlist.players.slice(1);
        const secondPlaceScore = winnerRemoved[0].totalPoints;
        const secondPlacePlayers = this.getPlayersWithScore(secondPlaceScore, winnerRemoved);
        secondPlacePlayers.forEach(player => {
          secondPlaceCounts[player.name] = (secondPlaceCounts[player.name] || 0) + 1
        }
        )
      }
    });
    const sortedPlayers = this.sortHighestToLowest(secondPlaceCounts);
    return this.generateTopThreePodium("Most Second Place Finishes", sortedPlayers);
  }

  private calculateMostLastPlaces(): PodiumResult {
    const lastPlaceCounts: Record<string, number> = {};

    this.playlistData.forEach(playlist => {
      const lastPlayer = playlist.players[playlist.players.length - 1];
      lastPlaceCounts[lastPlayer.name] = (lastPlaceCounts[lastPlayer.name] || 0) + 1;
    });

    const sortedPlayers = this.sortHighestToLowest(lastPlaceCounts);

    const result = this.generateTopThreePodium("Most Last Place Finishes", sortedPlayers);
    result.subtitle = "king of the sewers";
    result.isNegative = true;
    return result;
  }

  private calculateMostDraws(): PodiumResult {
    const drawCounts: Record<string, number> = {};
    this.playlistData.forEach(playlist => {
      const maxPoints = Math.max(...playlist.players.map(p => p.totalPoints));
      const winners = playlist.players.filter(p => p.totalPoints === maxPoints);
      if (winners.length > 1) {
        winners.forEach(winner => {
          drawCounts[winner.name] = (drawCounts[winner.name] || 0) + 1;
        });
      }
    })
    const sortedPlayers = this.sortHighestToLowest(drawCounts);
    const result = this.generateTopThreePodium("Most Draws", sortedPlayers);
    result.isNegative = true;
    return result;
  }

  private calculateWinRatios(): PodiumResult[] {
    const winsAndAppearances: Record<string, { wins: number; appearances: number }> = {};

    this.playlistData.forEach(playlist => {
      if (Utils.playlistWasDraw(playlist)) {
        return
      }

      const winner = playlist.players[0];
      playlist.players.forEach(player => {
        if (!winsAndAppearances[player.name]) {
          winsAndAppearances[player.name] = { wins: 0, appearances: 0 };
        }
        winsAndAppearances[player.name].appearances += 1;
      });

      winsAndAppearances[winner.name].wins += 1;
    });

    const winRatios = Object.entries(winsAndAppearances)
      .map(([name, stats]) => ({
        name,
        totalPoints: (stats.wins / stats.appearances) * 100
      }));

    const highestWinRatio = this.generateTopThreePodium("Highest Win Ratio", winRatios);
    const lowestWinRatio = this.generateBottomThreePodium("Lowest Win Ratio", winRatios);
    return [highestWinRatio, lowestWinRatio];
  }

  private calculateAverageFinishingPositions(): PodiumResult[] {
    const playerStats: Record<string, { totalPosition: number; appearances: number }> = {};

    this.playlistData.forEach(playlist => {
      let currentPosition = 1; 
      let tieCount = 0;
      playlist.players.forEach((player, index) => {
        if (index > 0 && player.totalPoints === playlist.players[index - 1].totalPoints) {
          tieCount++;
        } else {
          currentPosition += tieCount;
          tieCount = 0;
          currentPosition = index + 1;
        }
        if (!playerStats[player.name]) {
          playerStats[player.name] = { totalPosition: 0, appearances: 0 };
        }
        playerStats[player.name].totalPosition += currentPosition;
        playerStats[player.name].appearances += 1;
      });
    });

    const averagePositions = Object.entries(playerStats)
      .map(([name, stats]) => ({
        name,
        totalPoints: stats.totalPosition / stats.appearances
      }));

    //The lower the average the better  
    const bestAveragePositions = this.generateBottomThreePodium("Highest Average Finishing Position", averagePositions, true);
    bestAveragePositions.isNegative = false;
    const worstAveragePositions = this.generateTopThreePodium("Lowest Average Finishing Position", averagePositions);
    worstAveragePositions.isNegative = true;
    return [bestAveragePositions, worstAveragePositions];
  }

  private calculateAverageWinMargins(): PodiumResult[] {
    const totalWinMargins: Record<string, { totalWinMargin: number; wins: number }> = {};
    const subtitle = "points finished ahead of second place";

    this.playlistData.forEach(playlist => {
      if (Utils.playlistWasDraw(playlist)) {
        return
      }
      const winner = playlist.players[0];
      const winMargin = winner.totalPoints - playlist.players[1].totalPoints;

      if (!totalWinMargins[winner.name]) {
        totalWinMargins[winner.name] = { totalWinMargin: 0, wins: 0 };
      }
      totalWinMargins[winner.name].totalWinMargin += winMargin;
      totalWinMargins[winner.name].wins += 1;
    });

    const averageWinMargins = Object.entries(totalWinMargins)
      .map(([name, stats]) => ({
        name,
        totalPoints: stats.totalWinMargin / stats.wins
      }));

    const bestAverageWinMargin = this.generateTopThreePodium("Best Average Win Margin", averageWinMargins);
    bestAverageWinMargin.subtitle = subtitle;
    const worstAverageWinMargin = this.generateBottomThreePodium("Worst Average Win Margin", averageWinMargins);
    worstAverageWinMargin.subtitle = subtitle;
    return [bestAverageWinMargin, worstAverageWinMargin];
  }

  private calculateAverageLossMargins(): PodiumResult {
    const totalLossMargins: Record<string, { totalLossMargin: number; appearances: number }> = {};
    this.playlistData.forEach(playlist => {
      if (Utils.playlistWasDraw(playlist)) {
        return
      }
      const winningPoints = playlist.players[0].totalPoints;
      for (var x = 1; x < playlist.players.length; x++) {
        const player = playlist.players[x];
        const lossMargin = winningPoints - player.totalPoints;
        if (!totalLossMargins[player.name]) {
          totalLossMargins[player.name] = { totalLossMargin: 0, appearances: 0 };
        }
        totalLossMargins[player.name].totalLossMargin += lossMargin;
        totalLossMargins[player.name].appearances += 1;
      }
    });
    const averageLossMargins = Object.entries(totalLossMargins)
      .map(([name, stats]) => ({
        name,
        totalPoints: stats.totalLossMargin / stats.appearances
      }));
    const result = this.generateTopThreePodium("Highest Average Loss Margin", averageLossMargins);
    result.subtitle = "points difference to playlist winner"
    result.isNegative = true;
    return result;
  }

  private calculateDedicationRates(): PodiumResult[] {
    const galwayboy7JoinDate = new Date("2025-05-12T00:00:00Z");
    const totalPlaylists = this.playlistData.length;
    const attendanceCounts: Record<string, number> = {};
    const subtitle = "total participation in playlists since joining";
    const galwayboy7Playlists = this.playlistData.filter(
      playlist => new Date(playlist.date + "T00:00:00Z") >= galwayboy7JoinDate
    ).length;

    this.playlistData.forEach(playlist => {
      playlist.players.forEach(player => {
        if (player.name === "galwayboy7" && new Date(playlist.date + "T00:00:00Z") < galwayboy7JoinDate) {
          return;
        }
        attendanceCounts[player.name] = (attendanceCounts[player.name] || 0) + 1;
      });
    });

    const attendanceRates = Object.entries(attendanceCounts).map(([name, count]) => {
      const total = name === "galwayboy7" ? galwayboy7Playlists : totalPlaylists;
      const totalPoints = (count / total) * 100;
    
      return { name, totalPoints };
    });

    console.log("debug: ", attendanceRates);

    const mostDedicated = this.generateTopThreePodium("Most Dedicated", attendanceRates);
    mostDedicated.subtitle = subtitle;
    const leastDedicated = this.generateBottomThreePodium("Least Dedicated", attendanceRates);
    leastDedicated.subtitle = subtitle;
    return [mostDedicated, leastDedicated];
  }

  private calculateAverageScore(): PodiumResult[] {
    const playerStats: Record<string, { totalPoints: number; count: number }> = {};

    this.playlistData.forEach(playlist => {
      playlist.players.forEach(player => {
        if (!playerStats[player.name]) {
          playerStats[player.name] = { totalPoints: 0, count: 0 };
        }
        playerStats[player.name].totalPoints += player.totalPoints;
        playerStats[player.name].count += 1;
      });
    });

    const avgPointsArray = Object.entries(playerStats).map(([name, stats]) => ({
      name,
      totalPoints: stats.totalPoints / stats.count  // Compute average
    }));
    const highestAveragePoints = this.generateTopThreePodium("Highest Average Points", avgPointsArray);
    const lowestAveragePoints = this.generateBottomThreePodium("Lowest Average Points", avgPointsArray);
    return [highestAveragePoints, lowestAveragePoints];
  }

  private sortHighestToLowest(stats: Record<string, number>) {
    return Object.entries(stats)
      .map(([name, count]) => ({ name, totalPoints: count }))
      .sort((a, b) => b.totalPoints - a.totalPoints);
  }

  private generateTopThreePodium(podiumTitle: string, players: Player[], invertOrder?: boolean): PodiumResult {
    return {
      title: podiumTitle,
      players: players
        .map(player => ({
          ...player,
          totalPoints: Number.isInteger(player.totalPoints)
            ? player.totalPoints
            : parseFloat(player.totalPoints.toFixed(2))
        }))
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, 3),
      invertOrder: invertOrder
    };
  }

  private generateBottomThreePodium(podiumTitle: string, players: Player[], invertOrder?: boolean): PodiumResult {
    return {
      title: podiumTitle,
      players: players
        .map(player => ({
          ...player,
          totalPoints: Number.isInteger(player.totalPoints)
            ? player.totalPoints
            : parseFloat(player.totalPoints.toFixed(2))
        }))
        .sort((a, b) => a.totalPoints - b.totalPoints)
        .slice(0, 3),
      invertOrder: invertOrder,
      isNegative: true
    };
  }

  private getPlayersWithScore(score: number, playersToSearch: Player[]): Player[] {
    var foundPlayers: Player[] = [];
    playersToSearch.forEach(player => {
      if (player.totalPoints == score) {
        foundPlayers.push(player);
      }
    })
    return foundPlayers;
  }
}
