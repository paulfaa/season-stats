import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { UpdateDateComponent } from './update-date/update-date.component';
import packageJson from '../../package.json';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PopupAdComponent } from './popup-ad/popup-ad.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatToolbarModule,
    MatTabsModule,
    MatIconModule,
    UpdateDateComponent,
    CommonModule,
    MatDialogModule,
    RouterModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  APP_VERSION: string = packageJson.version;
  showAds: boolean = false;
  tabs = [
    { icon: 'bar_chart', label: 'Podiums', route: '/podiums' },
    { icon: 'looks_one', label: 'Stats', route: '/stats' },
    { icon: 'show_chart', label: 'Charts', route: '/charts' },
    { icon: 'format_list_numbered', label: 'Leaderboard', route: '/leaderboard' },
    { icon: 'upload', label: 'Upload', route: '/upload' }
  ];

  constructor(private router: Router, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.showAds ? this.showPopupAd() : null;
  }

  get selectedTabIndex(): number {
    const url = this.router.url;
    console.log('Current URL:', url);
    if (url.includes('/podiums')) return 0;
    if (url.includes('/stats')) return 1;
    if (url.includes('/charts')) return 2;
    if (url.includes('/leaderboard')) return 3;
    if (url.includes('/upload')) return 4;
    return -1;
  }

  onTabChange(index: number): void {
    const routes = ['/podiums', '/stats', '/charts', '/leaderboard', '/upload'];
    if (index >= 0 && index < routes.length) {
      this.router.navigate([routes[index]]);
      window.scrollTo(0, 0);
    } else {
      console.warn(`Invalid tab index: ${index}`);
    }
  }

  public showPopupAd(): void {
    this.dialog.open(PopupAdComponent, {
      width: '95%',
      height: 'auto',
    });
  }
}
