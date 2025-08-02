import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from "@angular/material/dialog";

@Component({
  selector: 'app-popup-ad',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './popup-ad.component.html',
  styleUrls: ['./popup-ad.component.scss']
})
export class PopupAdComponent implements OnInit {
  closeDisabled = true;
  displayTimeInSecs = 8;
  private intervalId: any;

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      this.displayTimeInSecs--;
      if (this.displayTimeInSecs <= 0) {
        this.closeDisabled = false;
        clearInterval(this.intervalId);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}


