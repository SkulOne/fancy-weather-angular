import {Component, ElementRef, EventEmitter, OnInit, Output, QueryList, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import {fromFetch} from 'rxjs/fetch';
import {map, switchMap} from 'rxjs/operators';
import {
  combineLatest, of, throwError, from, Observable
} from 'rxjs';
import load from 'ymaps-loader';
import {TranslateService} from '@ngx-translate/core';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {split} from 'ts-node';

interface WeatherData {
  first: any;
  rest: any[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  @ViewChildren('temp') temps: QueryList<any>;

  title = 'fancy-weather-angular';
  myMap: any;
  weatherData: Observable<WeatherData>;
  coords;
  date: string;
  apiYandex = 'd7f53ede-df5f-4048-b180-a767f8642bcc';
  weatherUnit: string;

  constructor(public translate: TranslateService, private renderer: Renderer2) {
    this.getUserLocation()
      .then((data) => {
        const coords = data.loc.split(',');
        this.mapInit(coords[0], coords[1]);
      });
    this.initLanguages(translate);
    this.setBackground(null);
    this.weatherUnit = localStorage.getItem('weatherUnit') ? localStorage.getItem('weatherUnit') : 'c';
  }

  ngOnInit() {
    this.getCurrentTime('en');
    this.getUserLocation().then((data) => {
      this.setWeather(data.city);
      this.getLocation(data.city)
        .then((geo) => {
          const coords = geo.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos.split(' ');
          const lower = geo.response.GeoObjectCollection.featureMember[0].GeoObject.boundedBy.Envelope.lowerCorner.split(' ');
          const upper = geo.response.GeoObjectCollection.featureMember[0].GeoObject.boundedBy.Envelope.upperCorner.split(' ');
          this.setPositionOnMap(coords, lower, upper);
        });
    });
  }

  private getWeatherUnit(): string {
    return localStorage.getItem('weatherUnit');
  }

  private getCurrentTime(locale: string): void {
    setInterval(() => {
      const dateNow = new Date();
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      console.log(this.translate.currentLang);
      const localDate = dateNow.toLocaleString(this.translate.currentLang, options).split(',');
      localDate[0] = this.getWeekDay(dateNow.getDay());
      this.date = `${localDate.join(',')} ${dateNow.toLocaleTimeString()}`;
    }, 1000);
  }

  private setPositionOnMap(coords, lower, upper): void {
    const latitude = coords[1];
    const longitude = coords[0];
    this.coords = {
      latitude: {
        int: Math.trunc(latitude),
        frac: Math.trunc(latitude % 1 * 100),
      },
      longitude: {
        int: Math.trunc(longitude),
        frac: Math.trunc(longitude % 1 * 100),
      }
    };
    this.myMap.setBounds([lower.reverse(), upper.reverse()]);
  }

  private getLocation(city: string): any {
    const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${this.apiYandex}&format=json&geocode=${city}`;
    return fetch(url)
      .then((res) => res.json());
  }

  private getUserLocation(): any {
    const apiKey = 'eb5b90bb77d46a';
    return fetch(`https://ipinfo.io/json?token=${apiKey}`)
      .then((res) => res.json());
  }

  private mapInit(latitude: number, longitude: number): void {
    load({apiKey: this.apiYandex})
      .then((maps) => {
        this.myMap = new maps.Map('map', {
          center: [latitude, longitude],
          zoom: 12,
          controls: [],
        });
      });
  }

  private initLanguages(translate: TranslateService): void {
    translate.addLangs(['en', 'ru', 'be']);
    translate.setDefaultLang('en');
    translate.use(localStorage.getItem('language'));
  }

  private getFormatDate(date: number): string {
    return date < 10 ? `0${date}` : date.toString();
  }

  private makeReq(i: number, city: string) {
    const apiKey = '5c1b1eabad7f4b35af8144627202405';
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateParse = `${date.getFullYear()}-${this.getFormatDate(date.getMonth() + 1)}-${this.getFormatDate(date.getDate())}`;
    return fromFetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&dt=${dateParse}`,
    );
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


  getWeekDay(day: number): string {
    // let date = data.forecast.forecastday[0].date.split('-');
    // date = new Date(date[0], date[1] - 1, date[2], 0, 0, 0);
    const daysOfWeek = {
      ru: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
      en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturdsy'],
      be: ['Нядзеля', 'Панядзелак', 'Аўторак', 'Серада', 'Чацвер', 'Пятніца'],
    };
    switch (this.translate.currentLang) {
      case 'ru': return daysOfWeek.ru[day];
      case 'en': return daysOfWeek.en[day];
      case 'be': return daysOfWeek.be[day];
      default: return daysOfWeek.en[day];
    }
  }

  setWeather(city: string) {
    this.weatherData = combineLatest([0, 0, 0, 0].map((v, i) => this.makeReq(i, city))).pipe(
      switchMap((responses) => combineLatest(
        responses.map((rsp) => from(
          rsp.ok
            ? rsp.json()
            : (rsp.status === 400
              ? of(null)
              : throwError(`${rsp.status}`)
            ),
        )),
      )),
      map(([first, ...rest]: [any, any[]]) => {
        return {first, rest};
      })
    );
  }

  searchButtonClick(query: string) {
    this.setWeather(query);
    this.getLocation(query)
      .then((data) => {
        const coords = data.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos.split(' ');
        const lower = data.response.GeoObjectCollection.featureMember[0].GeoObject.boundedBy.Envelope.lowerCorner.split(' ');
        const upper = data.response.GeoObjectCollection.featureMember[0].GeoObject.boundedBy.Envelope.upperCorner.split(' ');
        this.setPositionOnMap(coords, lower, upper);
      });
  }

  changeWeatherUnit(unit: string): void {
    localStorage.setItem('weatherUnit', unit);
    this.changeTempValues();
    // return localStorage.getItem('weatherUnit') === 'c'
  }

  getWeatherTemp(value): number {
    return this.weatherUnit === 'c'
      ? value.temp_c
      : value.temp_f;
  }

  getTempNextThree(value: any): number {
    return this.weatherUnit === 'c' ? value.avgtemp_c : value.avgtemp_f;
  }

  clickRefreshBtn(element): void {
    this.renderer.addClass(element, 'refresh-animation');
    this.setBackground(element);
  }

  changeTempValues(): void {
    this.weatherData.subscribe((weather) => {
      console.log(weather);
      console.log(weather.first.current.temp_c);
      if (this.getWeatherUnit() === 'c') {
          this.temps.first.nativeElement.textContent = Math.trunc(weather.first.current.temp_c);
          for (let i = 1; i < this.temps.length; i++) {
            // @ts-ignore
            this.temps._results[i].nativeElement.textContent = Math.trunc(weather.rest[i - 1].forecast.forecastday[0].day.avgtemp_c);
          }
        } else {
          this.temps.first.nativeElement.textContent = Math.trunc(weather.first.current.temp_f);
          for (let i = 1; i < this.temps.length; i++) {
            // @ts-ignore
            this.temps._results[i].nativeElement.textContent = Math.trunc(weather.rest[i - 1].forecast.forecastday[0].day.avgtemp_f);
          }
        }
      }
    );
  }

  changeLanguage(language: string){
    localStorage.setItem('language', language);
    this.translate.use(language);
    this.getCurrentTime(language);
  }

  getWeekDayNextThree(day: any): string {
    let date = day.forecast.forecastday[0].date.split('-');
    date = new Date(date[0], date[1] - 1, date[2], 0, 0, 0);
    return this.getWeekDay(date.getDate());
  }

  getWeatherIcon(value: any) {
  const values = value.split('/').pop();
  const numbers = values[0] + values[1] + values[2];
  switch (+numbers) {
      case 119:
      case 122:
      case 248:
      case 260:
      case 143: return '../assets/icons/cloudy.svg';
      case 116: return '../assets/icons/cloudy-day-2.svg';
      case 113: return '../assets/icons/day.svg';
      case 293:
      case 229:
      case 353:
      case 299:
      case 305: return '../assets/icons/rainy-1.svg';
      case 176: return '../assets/icons/rainy-2.svg';
      case 311:
      case 356:
      case 308: return '../assets/icons/rainy-6.svg';
      case 359:
      case 314:
      case 284: return '../assets/icons/rainy-7.svg';
      case 227:
      case 335: return '../assets/icons/snowy-1.svg';
      case 389:
      case 386:
      case 392:
      case 395:
      case 200: return '../assets/icons/thunder.svg';
      case 329:
      case 179:
      case 323:
      case 374:
      case 350:
      case 368: return '../assets/icons/snowy-2.svg';
      case 182: return '../assets/icons/snowy-1.svg';
      case 362: return '../assets/icons/snowy-3.svg';
      case 263:
      case 266:
      case 281:
      case 185: return '../assets/icons/rainy-2.svg';
      case 332:
      case 326: return '../assets/icons/snowy-4.svg';
      case 371:
      case 365:
      case 377: return '../assets/icons/snowy-3.svg';
      case 302:
      case 296: return '../assets/icons/rainy-5.svg';
      case 230: return '../assets/icons/snowy-6.svg';
      case 312:
      case 320: return '../assets/icons/snowy-5.svg';
    }
  }
}
