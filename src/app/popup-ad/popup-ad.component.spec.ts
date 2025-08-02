import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAdComponent } from './popup-ad.component';

describe('PopupAdComponent', () => {
  let component: PopupAdComponent;
  let fixture: ComponentFixture<PopupAdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ PopupAdComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupAdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
