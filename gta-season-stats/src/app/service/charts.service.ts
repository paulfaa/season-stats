import { Injectable } from '@angular/core';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
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
    const wins: { [playerName: string]: number[] } = {};
    const cumulativeWins: { [playerName: string]: number } = {};
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
      }
    };

    this.playlistDataSubject.value.forEach((playlist) => {
      const [year, month, day] = playlist.date.split('-'); // Split YYYY-MM-DD
      labels.push(`${day}-${month}-${year}`);

      const maxPoints = Math.max(...playlist.players.map(p => p.totalPoints));
      const winners = playlist.players.filter(p => p.totalPoints === maxPoints);

      winners.forEach(winner => {
        if (!cumulativeWins[winner.name]) {
          cumulativeWins[winner.name] = 0;
          wins[winner.name] = [];
        }
        cumulativeWins[winner.name]++;
      });

      Object.keys(cumulativeWins).forEach(player => {
        wins[player] = wins[player] || [];
        wins[player].push(cumulativeWins[player]);
      });
    });

    const chart = {
      labels,
      datasets: Object.keys(wins).map(player => ({
        label: player,
        data: wins[player],
        borderColor: this.getRandomColor(),
        backgroundColor: this.getRandomColor(0.3),
        fill: false,
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
            label: function (context) {
              return `${context.dataset.label}: ${(context.parsed.y * 100).toFixed(1)}%`;
            }
          }
        }
      }
    };
    
    this.playlistDataSubject.value.forEach((playlist, index) => {
      const [year, month, day] = playlist.date.split('-');
      labels.push(`${day}-${month}-${year}`);

      const maxPoints = Math.max(...playlist.players.map(p => p.totalPoints));
      const winners = playlist.players.filter(p => p.totalPoints === maxPoints);
      
      playlist.players.forEach(player => {
        const name = player.name;

        if (!(name in playerStats)) {
          playerStats[name] = {
            winRate: [],
            winCount: 0,
            gamesPlayed: 0
          };
        }

        playerStats[name].gamesPlayed += 1;

        if (winners.some(w => w.name === name)) {
          playerStats[name].winCount += 1;
        }

        const currentRate = playerStats[name].winCount / playerStats[name].gamesPlayed;
        playerStats[name].winRate.push(+currentRate.toFixed(2));
      });

      Object.keys(playerStats).forEach(name => {
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
        borderColor: this.getRandomColor(),
        backgroundColor: this.getRandomColor(0.3),
        fill: false,
      }))
    };
    return {
      chartData: chart,
      chartOptions: winRateChartOptions,
      title: 'Win Rate Over Time'
    };
  }

  private getRandomColor(opacity: number = 1): string {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
}
