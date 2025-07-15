import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaderboardInfoComponent } from './leaderboard-info.component';

describe('LeaderboardInfoComponent', () => {
  let component: LeaderboardInfoComponent;
  let fixture: ComponentFixture<LeaderboardInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaderboardInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaderboardInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
