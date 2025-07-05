import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaderboardResultComponent } from './leaderboard-result.component';

describe('LeaderboardResultComponent', () => {
  let component: LeaderboardResultComponent;
  let fixture: ComponentFixture<LeaderboardResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaderboardResultComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaderboardResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
