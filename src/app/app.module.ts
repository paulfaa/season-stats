import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { PodiumComponent } from './podium/podium.component';
import { NumberDisplayComponent } from './number-display/number-display.component';
import { HttpClientModule } from '@angular/common/http';
import { ParallaxDirective } from './parallax.directive';
import { StatsContainerComponent } from './stats-container/stats-container.component';
import { PodiumFormatPipe } from './pipes/podium-format.pipe';
import { MatDividerModule } from '@angular/material/divider';
import { ChartContainerComponent } from './chart-container/chart-container.component';
import { ChartComponent } from './chart/chart.component';
import { NgChartsModule } from 'ng2-charts';
import { UpdateDateComponent } from './update-date/update-date.component';
import { LeaderboardContainerComponent } from './leaderboard-container/leaderboard-container.component';
import { ShortNamePipe } from './pipes/name-format.pipe';
import { PlayerResultComponent } from './player-result/player-result.component';
import { PlayerResultsContainerComponent } from './player-results-container/player-results-container.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AppRoutingModule } from './app-routing.module';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [
    AppComponent,
    PodiumComponent,
    NumberDisplayComponent,
    ParallaxDirective,
    StatsContainerComponent,
    PodiumFormatPipe,
    ShortNamePipe,
    ChartContainerComponent,
    ChartComponent,
    UpdateDateComponent,
    LeaderboardContainerComponent,
    PlayerResultComponent,
    PlayerResultsContainerComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatDividerModule,
    NgChartsModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTableModule,
    MatCardModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
