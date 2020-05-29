import {Component, OnInit} from '@angular/core';
import {fromFetch} from 'rxjs/fetch';
import {map, switchMap} from 'rxjs/operators';
import {
  combineLatest, of, throwError, from, Observable
} from 'rxjs';
import load from 'ymaps-loader';
import {TranslateService} from '@ngx-translate/core';
import {TranslatePipe} from '@ngx-translate/core';

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
  title = 'fancy-weather-angular';
  myMap: any;
  api = 'd7f53ede-df5f-4048-b180-a767f8642bcc';
  weatherData: Observable<WeatherData>;
  coords;
  date: string;

  // weather
  constructor(public translate: TranslateService) {
    this.getUserLocation()
      .then((data) => {
        const coords = data.loc.split(',');
        this.mapInit(coords[0], coords[1]);
      });
    translate.addLangs(['en', 'ru', 'br']);
    translate.setDefaultLang('en');
    const browserLang = translate.getBrowserLang();
    translate.use('en');
  }

  ngOnInit() {
    this.getCurrentTime();
  }

  private getCurrentTime() {
    setInterval(() => {
      const dateNow = new Date();
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      this.date = `${dateNow.toLocaleString('ru', options)} ${dateNow.toLocaleTimeString()}`;
    }, 1000);
  }

  getWeekDay(data) {
    let date = data.forecast.forecastday[0].date.split('-');
    date = new Date(date[0], date[1] - 1, date[2], 0, 0, 0);
    const daysOfWeek = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

    return daysOfWeek[date.getDay()];
  }

  setWeather(city) {

    function getFormatDate(date) {
      return date < 10 ? `0${date}` : date;
    }

    const apiKey = '5c1b1eabad7f4b35af8144627202405';

    function makeReq(i) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateParse = `${date.getFullYear()}-${getFormatDate(date.getMonth() + 1)}-${getFormatDate(date.getDate())}`;
      return fromFetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&dt=${dateParse}`,
      );
    }

    // console.log([0, 0, 0, 0].map((v, i) => makeReq(i)));
    this.weatherData = combineLatest([0, 0, 0, 0].map((v, i) => makeReq(i))).pipe(
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
      map(([first, ...rest]: [any, any[]]) => ({first, rest}))
    );
    console.log(this.weatherData);
  }

  private setPositionOnMap(coords, lower, upper) {
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

  private getLocation(city) {
    const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${this.api}&format=json&geocode=${city}`;
    return fetch(url)
      .then((res) => res.json());
  }

  private getUserLocation() {
    const apiKey = 'eb5b90bb77d46a';
    return fetch(`https://ipinfo.io/json?token=${apiKey}`)
      .then((res) => res.json());
  }

  private mapInit(latitude, longitude) {
    load({apiKey: this.api})
      .then((maps) => {
        this.myMap = new maps.Map('map', {
          center: [latitude, longitude],
          zoom: 12,
          controls: [],
        });
      });
  }

  // setBackground(){
  //     const apiKey = 'h4mP-4wa51P8cSyCYVfzNhWbqskv0MtF-IOu1Mj9_Cg';
  //     const orientation = 'landscape';
  //     const url = `https://api.unsplash.com/photos/random?orientation=${orientation}&query=weather&client_id=${apiKey}`;
  //     fetch(url)
  //       .then((res) => res.json())
  //       .then((photo) => {
  //         body.style.background = `linear-gradient(rgba(8, 15, 26, 0.59) 0%, rgba(17, 17, 46, 0.46) 100%),
  //         url('${photo.urls.full}') center center / cover fixed`;
  //       });
  // }

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
}
