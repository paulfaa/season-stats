import { Injectable } from '@angular/core';
import { Player, Playlist, PlaylistData, PodiumResult } from '../models';
import { map, Observable } from 'rxjs';
import { Utils } from '../util/utils';
import { PlaylistDataService } from './playlist-data.service';
import { FIRST_APPEARANCES } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PodiumCalculatorService {

  constructor(private playlistDataService: PlaylistDataService) { }

  public getAllPodiums(): Observable<PodiumResult[]> {
    return this.playlistDataService.playlistData$.pipe(
      map(playlistData => this.generateAllPodiums(playlistData))
    );
  }

  public generateAllPodiums(playlistData: PlaylistData[]): PodiumResult[] {
    const singleStatFunctions: Array<() => PodiumResult> = [
      () => this.calculateFlights(),
      () => this.calculateMostUninstalls(),
      () => this.calculateLongestAppearanceStreak(playlistData),
      () => this.calculateMostWins(playlistData),
      () => this.calculateMostDraws(playlistData),
      () => this.calculateMostSecondPlaces(playlistData),
      () => this.calculateMostLastPlaces(playlistData),
      () => this.calculateLongestLosingStreak(playlistData),
    ];

    const multiStatFunctions: Array<() => PodiumResult[]> = [
      () => this.calculateWinRatios(playlistData),
      () => this.calculateAverageFinishingPositions(playlistData),
      () => this.calculateAverageScore(playlistData),
      () => this.calculateAverageWinMargins(playlistData),
      () => this.calculateAverageLossMargins(playlistData),
      () => this.calculateDedicationRates(playlistData),
    ];

    const stats: PodiumResult[] = [
      ...singleStatFunctions.map(fn => fn()),
      ...multiStatFunctions.flatMap(fn => fn())
    ];

    const mostPlaylistsLost = this.calculateMostPlaylistsLostInFinalEvent(playlistData);
    if (mostPlaylistsLost) stats.push(mostPlaylistsLost);
    return stats;
  }

  private calculateMostPlaylistsLostInFinalEvent(playlistData: PlaylistData[]): PodiumResult | undefined {
    const lossCounts: Record<string, number> = {};
    playlistData.forEach(playlist => {
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
      const result = this.generateTopThreePodium("Most playlists bottled 🍼", sortedPlayers, new Date(2025,5,28).toISOString());
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
    const podium = this.generateTopThreePodium("Most Flights To Switzerland ✈️", sortedPlayers, new Date(2025,6,8).toISOString());
    podium.subtitle = "he couldn't handle the smoke"
    return podium;
  }

  private calculateMostUninstalls(): PodiumResult {
    const uninstallCounts: Record<string, number> = {};
    uninstallCounts["BarizztaButzy"] = 4;
    const sortedPlayers = this.sortHighestToLowest(uninstallCounts)
    const podium = this.generateTopThreePodium("Most times GTA uninstalled 🤬", sortedPlayers, new Date(2025,6,8).toISOString());
    podium.subtitle = "i'm never playing this bullshit game again";
    podium.isNegative = true;
    return podium;
  }

  private calculateMostWins(playlistData: PlaylistData[]): PodiumResult {
    const winCounts: Record<string, number> = {};

    playlistData.forEach(playlist => {
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
    const podium = this.generateTopThreePodium("Most Wins 🥇", sortedPlayers, new Date(2025,5,8).toISOString(), 2);
    podium.subtitle = "wachow";
    return podium;
  }

  private calculateMostSecondPlaces(playlistData: PlaylistData[]): PodiumResult {
    const secondPlaceCounts: Record<string, number> = {};

    playlistData.forEach(playlist => {
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
    return this.generateTopThreePodium("Most Second Places 🥈", sortedPlayers, new Date(2025,5,8).toISOString());
  }

  private calculateMostLastPlaces(playlistData: PlaylistData[]): PodiumResult {
    const lastPlaceCounts: Record<string, number> = {};

    playlistData.forEach(playlist => {
      const lastPlayer = playlist.players[playlist.players.length - 1];
      lastPlaceCounts[lastPlayer.name] = (lastPlaceCounts[lastPlayer.name] || 0) + 1;
    });

    const sortedPlayers = this.sortHighestToLowest(lastPlaceCounts);

    const result = this.generateTopThreePodium("Most Last Place Finishes 👑", sortedPlayers, new Date(2025,5,8).toISOString(), 5);
    result.subtitle = "king of the sewers";
    result.isNegative = true;
    return result;
  }

  private calculateMostDraws(playlistData: PlaylistData[]): PodiumResult {
    const drawCounts: Record<string, number> = {};
    playlistData.forEach(playlist => {
      const maxPoints = Math.max(...playlist.players.map(p => p.totalPoints));
      const winners = playlist.players.filter(p => p.totalPoints === maxPoints);
      if (winners.length > 1) {
        winners.forEach(winner => {
          drawCounts[winner.name] = (drawCounts[winner.name] || 0) + 1;
        });
      }
    })
    const sortedPlayers = this.sortHighestToLowest(drawCounts);
    const result = this.generateTopThreePodium("Most Draws", sortedPlayers, new Date(2025,5,8).toISOString(), 7);
    result.subtitle = "stoppable force meets movable object";
    result.isNegative = true;
    return result;
  }

  private calculateWinRatios(playlistData: PlaylistData[]): PodiumResult[] {
    const winsAndAppearances: Record<string, { wins: number; appearances: number }> = {};

    playlistData.forEach(playlist => {
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

    const highestWinRatio = this.generateTopThreePodium("Highest Win Ratio", winRatios, new Date(2025,5,8).toISOString());
    const lowestWinRatio = this.generateBottomThreePodium("Lowest Win Ratio 🌟", winRatios, new Date(2025,5,8).toISOString());
    lowestWinRatio.subtitle = "make a wish";
    return [highestWinRatio, lowestWinRatio];
  }

  private calculateLongestAppearanceStreak(playlistData: PlaylistData[]): PodiumResult {
    const appearanceStreaks: Record<string, number> = {};
    const maxAppearanceStreaks: Record<string, number> = {};
    const allPlayers = Array.from(
      new Set(playlistData.flatMap(pl => pl.players.map(p => p.name)))
    );

    allPlayers.forEach(name => {
      appearanceStreaks[name] = 0;
      maxAppearanceStreaks[name] = 0;
    });
    playlistData.forEach(playlist => {
      const present = new Set(playlist.players.map(p => p.name));

      allPlayers.forEach(name => {
        if (present.has(name)) {
          appearanceStreaks[name] += 1;
          if (appearanceStreaks[name] > maxAppearanceStreaks[name]) {
            maxAppearanceStreaks[name] = appearanceStreaks[name];
          }
        } else {
          appearanceStreaks[name] = 0;
        }
      });
    });
    const sortedStreaks = Object.entries(maxAppearanceStreaks)
      .map(([name, streak]) => ({ name, totalPoints: streak }))
      .sort((a, b) => b.totalPoints - a.totalPoints);
    const podium = this.generateTopThreePodium("Longest Appearance Streak", sortedStreaks, new Date(2025,7,8).toISOString(), 4);
    podium.subtitle = "most nights on in a row";
    return podium;
  }

  private calculateAverageFinishingPositions(playlistData: PlaylistData[]): PodiumResult[] {
    const playerStats: Record<string, { totalPosition: number; appearances: number }> = {};

    playlistData.forEach(playlist => {
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
    const bestAveragePositions = this.generateBottomThreePodium("Highest Average Position 🎯", averagePositions, new Date(2025,5,27).toISOString());
    bestAveragePositions.isNegative = false;
    bestAveragePositions.invertOrder = true;
    const worstAveragePositions = this.generateTopThreePodium("Lowest Average Position", averagePositions, new Date(2025,5,27).toISOString());
    worstAveragePositions.subtitle = "started from the bottom now we're still here";
    worstAveragePositions.isNegative = true;
    return [bestAveragePositions, worstAveragePositions];
  }

  private calculateAverageWinMargins(playlistData: PlaylistData[]): PodiumResult[] {
    const totalWinMargins: Record<string, { totalWinMargin: number; wins: number }> = {};
    const subtitle = "points finished ahead of second place";

    playlistData.forEach(playlist => {
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

    const bestAverageWinMargin = this.generateTopThreePodium("Best Average Win Margin", averageWinMargins, new Date(2025,5,27).toISOString());
    bestAverageWinMargin.subtitle = subtitle;
    const worstAverageWinMargin = this.generateBottomThreePodium("Worst Average Win Margin", averageWinMargins, new Date(2025,5,27).toISOString());
    worstAverageWinMargin.subtitle = subtitle;
    return [bestAverageWinMargin, worstAverageWinMargin];
  }

  private calculateAverageLossMargins(playlistData: PlaylistData[]): PodiumResult[] {
    const totalLossMargins: Record<string, { totalLossMargin: number; appearances: number }> = {};
    var index = 1;
    playlistData.forEach(playlist => {
      const winningPoints = playlist.players[0].totalPoints;
      if (Utils.playlistWasDraw(playlist)) {
        index = 0;
      }
      for (var x = index; x < playlist.players.length; x++) {
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
    const worstAverageLossMargins = this.generateTopThreePodium("Highest Average Loss Margin", averageLossMargins, new Date(2025,5,8).toISOString());
    worstAverageLossMargins.subtitle = "points finished behind playlist winner"
    worstAverageLossMargins.isNegative = true;
    const bestAverageLossMargins = this.generateBottomThreePodium("Lowest Average Loss Margin", averageLossMargins, new Date(2025,5,8).toISOString());
    bestAverageLossMargins.subtitle = "points finished behind playlist winner";
    bestAverageLossMargins.isNegative = false;
    return [worstAverageLossMargins, bestAverageLossMargins];
  }

  private calculateLongestLosingStreak(playlistData: PlaylistData[]): PodiumResult {
    const losingStreaks: Record<string, number> = {};
    const maxLosingStreaks: Record<string, number> = {};

    const allPlayers = Array.from(
      new Set(playlistData.flatMap(pl => pl.players.map(p => p.name)))
    );

    allPlayers.forEach(name => {
      losingStreaks[name] = 0;
      maxLosingStreaks[name] = 0;
    });

    playlistData.forEach(playlist => {
      const winnerName = playlist.players[0].name;
      const present = new Set(playlist.players.map(p => p.name));

      allPlayers.forEach(name => {
        if (present.has(name)) {
          if (name === winnerName) {
            losingStreaks[name] = 0;
          } else {
            losingStreaks[name] = (losingStreaks[name] || 0) + 1;
          }
          if (losingStreaks[name] > (maxLosingStreaks[name] || 0)) {
            maxLosingStreaks[name] = losingStreaks[name];
          }
        }
      });
    });

    const sortedStreaks = Object.entries(maxLosingStreaks)
      .map(([name, streak]) => ({ name, totalPoints: streak }))
      .sort((a, b) => b.totalPoints - a.totalPoints);

    const podium = this.generateTopThreePodium("Longest Losing Streak 🔥", sortedStreaks, new Date(2025,7,19).toISOString());
    podium.subtitle = "most playlists lost in a row";
    podium.isNegative = true;
    return podium;
  }

  private calculateDedicationRates(playlistData: PlaylistData[]): PodiumResult[] {
    const joinDates = FIRST_APPEARANCES;

    const totalPlaylistsByPlayer: Record<string, number> = {};
    Object.entries(joinDates).forEach(([player, joinDate]) => {
      totalPlaylistsByPlayer[player] = playlistData.filter(
        playlist => new Date(playlist.playlistDate + "T00:00:00Z") >= joinDate
      ).length;
    });

    const defaultTotalPlaylists = playlistData.length;

    const attendanceCounts: Record<string, number> = {};
    playlistData.forEach(playlist => {
      const playlistDate = new Date(playlist.playlistDate + "T00:00:00Z");
      playlist.players.forEach(player => {
        const joinDate = joinDates[player.name];
        if (joinDate && playlistDate < joinDate) return;
        attendanceCounts[player.name] = (attendanceCounts[player.name] || 0) + 1;
      });
    });

    const attendanceRates = Object.entries(attendanceCounts).map(([name, count]) => {
      const total = totalPlaylistsByPlayer[name] ?? defaultTotalPlaylists;
      const totalPoints = total > 0 ? (count / total) * 100 : 0;
      return { name, totalPoints };
    });

    const subtitle = "total participation in playlists since joining";
    const mostDedicated = this.generateTopThreePodium("Most Dedicated 💪", attendanceRates, new Date(2025,5,1).toISOString(), 1);
    mostDedicated.subtitle = subtitle;
    const leastDedicated = this.generateBottomThreePodium("Most Cowardly 💤", attendanceRates, new Date(2025,5,9).toISOString());
    leastDedicated.subtitle = subtitle;
    return [mostDedicated, leastDedicated];
  }

  private calculateAverageScore(playlistData: PlaylistData[]): PodiumResult[] {
    const playerStats: Record<string, { totalPoints: number; count: number }> = {};

    playlistData.forEach(playlist => {
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
      totalPoints: stats.totalPoints / stats.count
    }));
    const highestAveragePoints = this.generateTopThreePodium("Highest Average Points", avgPointsArray, new Date(2025, 5, 8).toISOString());
    const lowestAveragePoints = this.generateBottomThreePodium("Lowest Average Points", avgPointsArray, new Date(2025, 5, 8).toISOString());
    return [highestAveragePoints, lowestAveragePoints];
  }

  private sortHighestToLowest(stats: Record<string, number>) {
    return Object.entries(stats)
      .map(([name, count]) => ({ name, totalPoints: count }))
      .sort((a, b) => b.totalPoints - a.totalPoints);
  }

  private generateTopThreePodium(podiumTitle: string, players: Player[], dateCreated: string, popularity?: number): PodiumResult {
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
      dateCreated: dateCreated,
      popularity: popularity || 0
    };
  }

  private generateBottomThreePodium(podiumTitle: string, players: Player[], dateCreated: string, popularity?: number): PodiumResult {
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
      isNegative: true,
      dateCreated: dateCreated,
      popularity: popularity || 0
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
