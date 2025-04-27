import { Injectable } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { BehaviorSubject } from 'rxjs';
import { StatsCalculatorService } from './stats-calculator.service';
import { ChartResult, Playlist } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ChartsService {

  private playlistDataSubject = new BehaviorSubject<Playlist[]>([]);
  public playlistData$ = this.playlistDataSubject.asObservable();
  private chartDataSubject = new BehaviorSubject<ChartResult[]>([]);
  public chartData$ = this.chartDataSubject.asObservable();
  private allPlayers: string[] = ['BarizztaButzy', 'mikc95', 'meas_taibhse', 'iiCiaran', 'cooooney95', 'kendy232', 'hurling1', 'jackw2610'];

  constructor(private statsCalculatorService: StatsCalculatorService) {
    this.statsCalculatorService.playlistData$.subscribe({
      next: (data) => {
        this.playlistDataSubject.next(data);
        this.generateAllCharts();
      }
    });
  }

  public generateAllCharts(): void {
    const charts = [];
    charts.push(this.generateTotalWinsChart());
    charts.push(this.generateWinRateChart())
    this.chartDataSubject.next(charts);
  }

  private generateTotalWinsChart(): ChartResult {
    const labels: string[] = [];
    const cumulativeWins: { [playerName: string]: number[] } = {};
    const totalWinsChartOptions: ChartOptions = {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      elements: {
        point: {
          radius: 0
        }
      },
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: {
            autoSkip: false
          },
          title: {
            display: true,
            text: 'Playlist Date'
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
          title: {
            display: true,
            text: 'Total Wins'
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            labelColor: (context) => this.getLabelColor(context),
          }
        }
      }
    };

    this.playlistDataSubject.value.forEach((playlist) => {
      const [year, month, day] = playlist.date.split('-'); // Split YYYY-MM-DD
      labels.push(`${day}-${month}`);

      const maxPoints = Math.max(...playlist.players.map(p => p.totalPoints));
      var winners = playlist.players.filter(p => p.totalPoints === maxPoints);

      //If draw, no one wins
      if (winners.length > 1) {
        winners = []
      }

      this.allPlayers.forEach(player => {
        if (!cumulativeWins[player]) {
          cumulativeWins[player] = [];
        }
        const currentWins = cumulativeWins[player][cumulativeWins[player].length - 1] || 0;
        if (winners.some(w => w.name === player)) {
          cumulativeWins[player].push(currentWins + 1);
        }
        else {
          cumulativeWins[player].push(currentWins);
        }
      });
    });

    const chart = {
      labels,
      datasets: Object.keys(cumulativeWins).map(player => ({
        label: player,
        data: cumulativeWins[player],
        borderColor: this.playerColors[player],
        backgroundColor: this.playerColors[player],
        fill: false
      }))
    };
    return {
      chartData: chart,
      chartOptions: totalWinsChartOptions,
      title: 'Total Wins'
    };
  }

  private generateWinRateChart(): ChartResult {
    type PlayerWinStats = {
      winRate: number[];
      winCount: number;
      gamesPlayed: number;
    };

    const playerStats: Record<string, PlayerWinStats> = {};
    const labels: string[] = [];

    const winRateChartOptions: ChartOptions<'line'> = {
      responsive: true,
      scales: {
        y: {
          min: 0,
          max: 1,
          ticks: {
            stepSize: 0.1,
            callback: (value) => `${(value as number * 100).toFixed(0)}%`
          },
          title: {
            display: true,
            text: 'Win Rate'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Playlist Date'
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            labelColor: (context) => this.getLabelColor(context),
            label: function (context) {
              return `${context.dataset.label}: ${(context.parsed.y * 100).toFixed(1)}%`;
            }
          }
        }
      }
    };

    this.playlistDataSubject.value.forEach((playlist, index) => {
      const [year, month, day] = playlist.date.split('-');
      labels.push(`${day}-${month}`);

      const maxPoints = Math.max(...playlist.players.map(p => p.totalPoints));
      const winners = playlist.players.filter(p => p.totalPoints === maxPoints);

      this.allPlayers.forEach(playerName => {
        if (!(playerName in playerStats)) {
          playerStats[playerName] = {
            winRate: [],
            winCount: 0,
            gamesPlayed: 0
          };
        }

        playerStats[playerName].gamesPlayed += 1;

        if (winners.some(w => w.name === playerName)) {
          playerStats[playerName].winCount += 1;
        }

        const currentRate = playerStats[playerName].winCount / playerStats[playerName].gamesPlayed;
        playerStats[playerName].winRate.push(+currentRate.toFixed(2));
      });

      this.allPlayers.forEach(name => {
        if (!playlist.players.some(p => p.name === name)) {
          const prev = playerStats[name].winRate[index - 1] ?? 0;
          playerStats[name].winRate.push(prev);
        }
      });
    });

    const chart = {
      labels,
      datasets: Object.keys(playerStats).map(player => ({
        label: player,
        data: playerStats[player].winRate,
        borderColor: this.playerColors[player],
        backgroundColor: this.playerColors[player],
        fill: false,
      }))
    };
    return {
      chartData: chart,
      chartOptions: winRateChartOptions,
      title: 'Win Rate Over Time'
    };
  }

  private playerColors: { [name: string]: string } = {
    'BarizztaButzy': 'rgb(173, 10, 202)',
    'mikc95': 'rgb(234, 234, 4)',
    'meas_taibhse': 'rgb(231, 228, 229)',
    'iiCiaran': 'rgb(238, 31, 52)',
    'cooooney95': 'rgb(255, 86, 218)',
    'kendy232': 'rgb(17, 229, 45)',
    'hurling1': 'rgb(249, 151, 5)',
    'jackw2610': 'rgb(0, 0, 0)'
  };

  private getLabelColor(context: any): { borderColor: string; backgroundColor: string } {
    const label = context.dataset.label || '';
    const color = this.playerColors[label] || '#aaa';
    return {
      borderColor: color,
      backgroundColor: color
    };
  }
}
