import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
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

@NgModule({
  declarations: [
    AppComponent,
    PodiumComponent,
    NumberDisplayComponent,
    ParallaxDirective,
    StatsContainerComponent,
    PodiumFormatPipe,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatDividerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
