import { Directive, ElementRef, HostListener, Input, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[parallax]'
})
export class ParallaxDirective implements AfterViewInit {

  @Input('ratio') parallaxRatio: number = 1;
  @Input('fadeStart') fadeStart: number = 100; // Start fading at this scroll position
  @Input('fadeEnd') fadeEnd: number = 500; // Fully transparent at this position

  private initialTop: number = 0;
  private documentHeight: number = 0;

  constructor(private eleRef: ElementRef) {}

  ngAfterViewInit() {
    this.initialTop = this.eleRef.nativeElement.offsetTop;
    this.documentHeight = document.body.scrollHeight - window.innerHeight;
  }

  @HostListener("window:scroll", ["$event"])
  onWindowScroll() {
    const scrollY = window.scrollY;
    const distanceFromBottom = this.documentHeight - scrollY;

    // Apply parallax effect
    this.eleRef.nativeElement.style.transform = `translateY(${scrollY * this.parallaxRatio}px)`;

    // Calculate opacity for scrolling **down**
    let opacity = 1;
    if (scrollY > this.fadeStart) {
      opacity = Math.max(0, 1 - (scrollY - this.fadeStart) / (this.fadeEnd - this.fadeStart));
    }

    // Calculate opacity for scrolling **up** (distance from bottom)
    if (distanceFromBottom < this.fadeEnd) {
      opacity = Math.max(opacity, (distanceFromBottom - this.fadeStart) / (this.fadeEnd - this.fadeStart));
    }

    // Apply fade effect
    this.eleRef.nativeElement.style.opacity = `${Math.max(0, Math.min(1, opacity))}`;
  }
}
