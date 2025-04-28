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

@NgModule({
  declarations: [
    AppComponent,
    PodiumComponent,
    NumberDisplayComponent,
    ParallaxDirective,
    StatsContainerComponent,
    PodiumFormatPipe,
    ChartContainerComponent,
    ChartComponent,
    UpdateDateComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatDividerModule,
    NgChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
