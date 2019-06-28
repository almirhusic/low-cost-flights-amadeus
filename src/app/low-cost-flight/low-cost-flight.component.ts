import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { DatePipe } from '@angular/common';
import { Model } from './model';
import * as funcs from "./functions";

@Component({
  selector: 'app-low-cost-flight',
  templateUrl: './low-cost-flight.component.html',
  styleUrls: ['./low-cost-flight.component.scss']
})
export class LowCostFlightComponent implements OnInit {
  public flights: Model.FlightOffers[];
  public flightsModel: FlightOffersModel[];
  public flightsModel2: FlightOffersModel2[];
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
  public zaPrikazSelected = "5";
  public returnFlight: boolean = false;

  constructor(private http: HttpClient, private datePipe: DatePipe) {
    this.baseUrl = "https://test.api.amadeus.com/v1/shopping/flight-offers";
  }

  ngOnInit() {
    this.getToken();
  }

  selectPassengers(value){
    funcs.selectPassengers(value);
  }

  selectZaPrikaz(value){
    funcs.selectZaPrikaz(value);
  }

  selectCurrency(value){
    funcs.selectCurrency(value);
  }

  formatDate(date) {
    return funcs.formatDate(date);
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

  getData2(result) {
    let data: FlightOffersModel2[] = [];
    
    result.data.forEach(d => {
      let temp: FlightOffersModel2 = {} as any;
      
      d.offerItems.forEach(item => {
        item.services.forEach(service => {
          if(item.services.indexOf(service) < 1) {
            temp.PresjedanjaOdlazak = funcs.getBrojPresijedanja(item.services[0]);
            temp.SlobodnaMjesta = funcs.getBrojPutnika(service.segments);
            temp.Cijena = item.price.total;
            temp.Valuta = result.meta.currency;
            temp.PolazniAerodrom = this.getAerodromName(service.segments, "departure", result.dictionaries.locations);
            temp.PolazniAerodromIataCode = temp.PolazniAerodrom.substring(temp.PolazniAerodrom.indexOf('(')+1, temp.PolazniAerodrom.length-1);
            temp.DatumPolaska = this.datePipe.transform(this.getDatumLeta(service.segments, "departure"), "dd-MM-yyyy hh:mm");
            temp.Klasa = funcs.getTravelClass(service.segments[0]);
            temp.NazivAvionaPolazak = funcs.getCarrierName(service.segments[0], result.dictionaries.carriers);
            temp.BrojZaustavljanja = funcs.getBrojZaustavljanja(service.segments[0]);
            temp.TrajanjeZaustavljanja = funcs.getTrajanjeZaustavljanja(service.segments[0]);
            temp.ZaustavniAerodromIataCode = funcs.getZaustavniAerodromCode(service.segments[0]);
            temp.VrijemePolaska = this.datePipe.transform(this.getDatumLeta(service.segments, "departure"), "hh:mm");
            temp.VrijemePolaska += " - " + this.datePipe.transform(this.getDatumLeta(service.segments, "arrival"), "hh:mm");
            temp.Return = this.returnFlight;
            temp.TrajanjeLeta = '1h 53m';
            temp.PresjedanjaOdlazakIataCodes = funcs.getIataCodesPresjedanja(service.segments, this.origin, this.destination);
            
            if(item.services.length > 1) {
              temp.PresjedanjaPovratak = item.services.length > 1 ? funcs.getBrojPresijedanja(item.services[1]) : 0;
              temp.OdredisniAerodrom = this.getAerodromName(service.segments, "arrival", result.dictionaries.locations);
              temp.OdredisniAerodromIataCode = temp.OdredisniAerodrom.substring(temp.OdredisniAerodrom.indexOf('(')+1, temp.OdredisniAerodrom.length-1);
              temp.DatumPovratka = this.datePipe.transform(this.getDatumLeta(service.segments, "arrival"), "dd-MM-yyyy hh:mm");
              temp.VrijemePovratka = this.datePipe.transform(this.getDatumLeta(item.services[1].segments, "departure"), "hh:mm");
              temp.VrijemePovratka += " - " + this.datePipe.transform(this.getDatumLeta(item.services[1].segments, "arrival"), "hh:mm");
              temp.PresjedanjaPovratakIataCodes = funcs.getIataCodesPresjedanja(item.services[1].segments, this.origin, this.destination);
              temp.NazivAvionaPovratak = funcs.getCarrierName(item.services[1].segments[0], result.dictionaries.carriers);
            }

            data = [...data, temp];
          }
          console.log(temp);
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

    if(returnDateQueryParam != "") {
      this.returnFlight = true;
    }

    this.loading = true;
    
    var url = originQueryParam + destinationQueryParam + departureDateQueryParam + returnDateQueryParam + passengersQueryParam + currencyQueryParam + maxQueryParam;

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
        this.flightsModel2 = this.getData2(this.flights);
        this.loading = false;
      }, error => console.error(error));
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

interface FlightOffersModel2 {
  PolazniAerodrom: string;
  PolazniAerodromIataCode: string;
  DatumPolaska: string;
  VrijemePolaska: string;
  NazivAvionaPolazak: string; //Polazak
  PresjedanjaOdlazak: number;
  PresjedanjaOdlazakIataCodes: string;
  BrojZaustavljanja: number; //Polazak
  TrajanjeZaustavljanja: string; //Polazak
  ZaustavniAerodromIataCode: string; //Polazak


  OdredisniAerodrom: string;
  OdredisniAerodromIataCode: string;  
  DatumPovratka: string;
  VrijemePovratka: string;
  NazivAvionaPovratak: string;
  Return: boolean;
  TrajanjeLeta: string;
  Cijena: string;
  Klasa: string;
  Valuta: string;
  SlobodnaMjesta: number;
  PresjedanjaPovratak: number;
  PresjedanjaPovratakIataCodes: string;
}