import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-version-history',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './version-history.component.html',
  styleUrls: ['./version-history.component.scss']
})
export class VersionHistoryComponent {

  public versionHistory = ([
    { version: '0.1.0', changes: 'Add upload functionality' },
    { version: '0.2.0', changes: 'Add cwolin to stats & create version history page' },
    { version: '0.3.0', changes: 'Fix upload page' },
    { version: '0.4.0', changes: 'UI changes' },
    { version: '0.5.0', changes: 'Add sort mode to podiums page' },
    { version: '0.6.0', changes: 'Add filters to charts' },
    { version: '0.7.0', changes: 'Fix chart CSS and prorate participation calculation' },
    { version: '0.8.0', changes: '2026 Update. Upload all playlist photos to Google cloud storage' },
  ]).reverse();
}
