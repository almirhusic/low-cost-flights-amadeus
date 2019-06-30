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

  fetchData() {
    if(!funcs.checkIataCodes(this.origin, this.destination)){
      alert("Unesite ispravan IATA code.")
      return;
    }

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

    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/vnd.amadeus+json; charset=utf-8',
      'Accept': 'application/vnd.amadeus+json',
      'Authorization': `Bearer ${this.accessToken}`
    });

    this.http.get<Model.FlightOffers[]>(this.baseUrl + url, { headers: httpHeaders }).subscribe(result => {
      this.flights = result;
      this.flightsModel = funcs.getData(this.flights);
      this.loading = false;
    }, error => console.error(error));
  }
}

export interface FlightOffersModel {
  PolazniAerodrom: string;
  PolazniAerodromIataCode: string;
  DatumPolaska: string;
  VrijemePolaska: string;
  NazivAvionaPolazak: string; 
  PresjedanjaOdlazak: number;
  PresjedanjaOdlazakIataCodes: string;
  BrojZaustavljanja: number; 
  TrajanjeZaustavljanja: string; 
  ZaustavniAerodromIataCode: string; 

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