import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaceResultContainerComponent } from './race-result-container.component';

describe('RaceResultContainerComponent', () => {
  let component: RaceResultContainerComponent;
  let fixture: ComponentFixture<RaceResultContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RaceResultContainerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RaceResultContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
