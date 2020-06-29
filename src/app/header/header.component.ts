import {Component, ElementRef, EventEmitter, OnInit, Output, Renderer2, ViewChild} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {WeatherService} from '../services/weather/weather.service';
import {FormsModule, NgForm} from '@angular/forms';
import * as mapboxgl from 'mapbox-gl/dist/mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Output() submited = new EventEmitter();

  constructor(public translate: TranslateService,
              private renderer: Renderer2,
              private weatherService: WeatherService) {
  }

  ngOnInit(): void {
    this.setBackground(null);
  }

  submit(f: NgForm): void {
    this.weatherService.weatherTrigger(f.form.controls.city.value);
  }

  clickRefreshBtn(element: ElementRef): void {
    this.renderer.addClass(element, 'refresh-animation');
    this.setBackground(element);
  }

  changeLanguage(language: string): void {
    localStorage.setItem('language', language);
    this.translate.use(language);
  }

  private setBackground(btn: any): void {
    const apiKey = 'h4mP-4wa51P8cSyCYVfzNhWbqskv0MtF-IOu1Mj9_Cg';
    const orientation = 'landscape';
    const url = `https://api.unsplash.com/photos/random?orientation=${orientation}&query=weather&client_id=${apiKey}`;
    fetch(url)
      .then((res) => res.json())
      .then((photo) => {
        const image = new Image();
        image.src = `${photo.urls.full}`;
        image.onload = () => {
          this.renderer.setStyle(document.body, 'background', `linear-gradient(rgba(8, 15, 26, 0.59) 0%, rgba(17, 17, 46, 0.46) 100%),url('${photo.urls.full}') center center / cover fixed`);
          if (btn != null) {
            this.renderer.removeClass(btn, 'refresh-animation');
          }
        };
      });
  }
}
