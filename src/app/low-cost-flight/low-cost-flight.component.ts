import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { DatePipe } from '@angular/common';
import { Model } from './model';

@Component({
  selector: 'app-low-cost-flight',
  templateUrl: './low-cost-flight.component.html',
  styleUrls: ['./low-cost-flight.component.scss']
})
export class LowCostFlightComponent implements OnInit {
  public flights: Model.FlightOffers[];
  public flightsModel: FlightOffersModel[];
  public accessToken: string;
  public loading: boolean = false;
  public origin: string = "";
  public destination: string = "";
  public departureDate: Date = new Date();
  public returnDate: Date = new Date();
  public baseUrl: string = "";
  public selectedCurrency: string = "EUR";
  public selectedPassengers: string = "1";
  public passengers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  public currency = ["EUR", "USD", "HRK", "BAM"];
  public zaPrikaz = ["5", "10", "15", "20", "25", "30", "35", "40", "45", "50"];
  public zaPrikazSelected = "10";

  constructor(private http: HttpClient, private datePipe: DatePipe) {
    this.baseUrl = "https://test.api.amadeus.com/v1/shopping/flight-offers";
  }

  ngOnInit() {
    this.getToken();
  }

  selectPassengers(value) {
    this.selectedPassengers = value;
  }
  selectZaPrikaz(value) {
    this.zaPrikazSelected = value;
  }
  
  selectCurrency(value) {
    this.selectedCurrency = value;
  }

  formatDate(date) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1 < 10 ? "0" + parseInt(date.getMonth() + 1) : (date.getMonth() + 1);
    var d = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();

    return y + "-" + m + "-" + d;
  }

  getToken() {
    var client_id = "oqsIlG0xAbnlGwFmCz48lfg7GdYwemI5";
    var client_secret = "lAcXdrsSTAZf5AD0";
    var baseUrlToken = "https://test.api.amadeus.com/v1/security/oauth2/token";
    
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    let body = new HttpParams({
      fromObject : {
        'grant_type': 'client_credentials',
        'client_id': client_id,
        'client_secret': client_secret
      }
    })

    let options = {
      headers: httpHeaders
    };

    this.http.post<Model.AccessToken>(baseUrlToken, body, options).subscribe(res => {
      this.accessToken = res["access_token"];
    }, error => console.error(error));
  }

  getBrojPresijedanja(service: any) {
    return service.segments.length;
  }
  
  getBrojPutnika(segment: any[]){
    let p = 0;

    if(segment[0].pricingDetailPerAdult != undefined){
      p = segment[0].pricingDetailPerAdult.availability;
    }else if(segment[0].pricingDetailPerChild != undefined){
      p = segment[0].pricingDetailPerChild.availability;
    }else if(segment[0].pricingDetailPerSenior != undefined){
      p = segment[0].pricingDetailPerSenior.availability;
    }else if(segment[0].pricingDetailPerInfant != undefined){
      p = segment[0].pricingDetailPerInfant.availability;
    }else{
      p = 0;
    }

    return p;
}

  getAerodromName(segments: any[], at: string, location: any) {
    let loc: any;
    let iataCode: string;

    if(at == "departure"){
      iataCode = segments[0].flightSegment.departure.iataCode;
    } else {
      iataCode = segments[segments.length - 1].flightSegment.arrival.iataCode;
    }

    loc = location[iataCode].detailedName;

    return loc + ' (' + iataCode + ')';
  }

  getDatumLeta(segments: any[], at: string) {
    if(at == "departure") {
      return segments[0].flightSegment.departure.at;
    }else{
      return segments[segments.length - 1].flightSegment.arrival.at;
    }
  }

  getData(result) {
    let data: FlightOffersModel[] = [];
    
    result.data.forEach(d => {
      let temp: FlightOffersModel = {} as any;
      
      d.offerItems.forEach(item => {
        item.services.forEach(service => {
          if(item.services.indexOf(service) < 1) {
            temp.BrojPresjedanjaPovratak = item.services.length > 1 ? this.getBrojPresijedanja(item.services[1]) : 0;
            temp.BrojPresjedanjaOdlazak = this.getBrojPresijedanja(item.services[0]);
            temp.BrojPutnika = this.getBrojPutnika(service.segments);
            temp.UkupnaCijena = item.price.total;
            temp.Valuta = result.meta.currency;
            temp.PolazniAerodrom = this.getAerodromName(service.segments, "departure", result.dictionaries.locations);
            temp.OdredisniAerodrom = this.getAerodromName(service.segments, "arrival", result.dictionaries.locations);
            temp.DatumPolaska = this.datePipe.transform(this.getDatumLeta(service.segments, "departure"), "dd-MM-yyyy hh:mm");
            temp.DatumPovratka = this.datePipe.transform(this.getDatumLeta(service.segments, "arrival"), "dd-MM-yyyy hh:mm");

            data = [...data, temp];
          }
        });
        
      });
    });
    return data;
  }


  fetchData() {
    let checkToken: string;
    this.http.get(`https://test.api.amadeus.com/v1/security/oauth2/token/${this.accessToken}`).subscribe(res => {
      checkToken = res["state"];
      if(checkToken == "expired"){
        this.getToken();
      }    
    });
    
    this.origin = this.origin.toUpperCase();
    this.destination = this.destination.toUpperCase();
    var departureDateFormated = this.formatDate(this.departureDate);
    var returnDateFormated = this.formatDate(this.returnDate);
    var depDateParsed = Date.parse(departureDateFormated);
    var retDateParsed = Date.parse(returnDateFormated);
    
    var originQueryParam = this.origin ? `?origin=${this.origin}` : '';
    var destinationQueryParam = this.destination ? `&destination=${this.destination}` : '';
    var passengersQueryParam = this.selectedPassengers ? `&adults=${this.selectedPassengers}` : '';
    var currencyQueryParam = this.selectedCurrency ? `&currency=${this.selectedCurrency}` : '';
    var departureDateQueryParam = departureDateFormated ? `&departureDate=${departureDateFormated}` : '';
    var returnDateQueryParam = returnDateFormated ? `&returnDate=${returnDateFormated}` : '';
    var maxQueryParam = `&max=${this.zaPrikazSelected}`;
    if (departureDateFormated === returnDateFormated) {
      returnDateQueryParam = "";
    }

    if (depDateParsed > retDateParsed) {
      alert("Datum povratka ne može biti manji od datuma polaska");
      return;
    }

    this.loading = true;
    
    var url = originQueryParam + destinationQueryParam + departureDateQueryParam + returnDateQueryParam + passengersQueryParam + currencyQueryParam + maxQueryParam;
    var ls = localStorage.getItem(url);
    
    if (ls != null) {
      this.flights = JSON.parse(ls);
      this.loading = false;
    } else {
      if (this.origin == "" || this.destination == "") {
        alert("Polja označena * su obavezna.");
        this.loading = false;
      } else {

        let httpHeaders = new HttpHeaders({
          'Content-Type': 'application/vnd.amadeus+json; charset=utf-8',
          'Accept': 'application/vnd.amadeus+json',
          'Authorization': `Bearer ${this.accessToken}`
        });

        this.http.get<Model.FlightOffers[]>(this.baseUrl + url, { headers: httpHeaders }).subscribe(result => {
          this.flights = result;
          this.flightsModel = this.getData(this.flights);
          this.loading = false;
          if (this.flights.length > 0) {
            localStorage.setItem(url, JSON.stringify(this.flights));
          }
        }, error => console.error(error));
      }    
    }
  }
}

interface FlightOffersModel {
  PolazniAerodrom: string;
  OdredisniAerodrom: string;
  DatumPolaska: string;
  DatumPovratka: string;
  BrojPresjedanjaOdlazak: number;
  BrojPresjedanjaPovratak: number;
  BrojPutnika: number;
  Valuta: string;
  UkupnaCijena: string;
}