import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'gta-season-stats';
  podiums = [
    { title: 'Most wins', data: [{ username: 'Alice', points: 200 }, { username: 'Bob', points: 150 }, { username: 'Charlie', points: 120 }] },
    { title: 'Most second places', data: [{ username: 'Alice', points: 200 }, { username: 'Bob', points: 150 }, { username: 'Charlie', points: 120 }] },
    { title: 'Most appearances', data: [{ username: 'Alice', points: 200 }, { username: 'Bob', points: 150 }, { username: 'Charlie', points: 120 }] }
  ];
}

// {
//   name: 'Playlist name',
//   date : '2021-01-01',
//   length: 12,
//   players: [
//     { name: 'Alice', points: 100 },
//     { name: 'Bob', points: 50 },
//     { name: 'Charlie', points: 20 }
//   ]
// }