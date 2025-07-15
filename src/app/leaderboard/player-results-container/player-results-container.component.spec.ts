import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerResultsContainerComponent } from './player-results-container.component';

describe('PlayerResultsContainerComponent', () => {
  let component: PlayerResultsContainerComponent;
  let fixture: ComponentFixture<PlayerResultsContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayerResultsContainerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerResultsContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
