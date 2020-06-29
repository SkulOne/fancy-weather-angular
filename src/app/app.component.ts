import {Component, OnInit, QueryList, Renderer2, ViewChildren} from '@angular/core';
import {fromFetch} from 'rxjs/fetch';
import {map, switchMap} from 'rxjs/operators';
import {
  combineLatest, of, throwError, from, Observable
} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';

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

  constructor(public translate: TranslateService, private renderer: Renderer2) {
    this.initLanguages(translate);
    this.weatherUnit = localStorage.getItem('weatherUnit') ? localStorage.getItem('weatherUnit') : 'c';
  }

  weatherUnit: string;


  ngOnInit() {
  }

  private initLanguages(translate: TranslateService): void {
    translate.addLangs(['en', 'ru', 'be']);
    translate.setDefaultLang('en');
    translate.use(localStorage.getItem('language'));
  }
}
