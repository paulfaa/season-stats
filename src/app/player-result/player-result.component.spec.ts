import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerResultComponent } from './player-result.component';

describe('PlayerResultComponent', () => {
  let component: PlayerResultComponent;
  let fixture: ComponentFixture<PlayerResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayerResultComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
