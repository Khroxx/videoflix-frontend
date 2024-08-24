import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoOffersComponent } from './video-offers.component';

describe('VideoOffersComponent', () => {
  let component: VideoOffersComponent;
  let fixture: ComponentFixture<VideoOffersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoOffersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoOffersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
