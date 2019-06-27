import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Model } from './model';

export function selectPassengers(value) {
    this.selectedPassengers = value;
}
export function selectZaPrikaz(value) {
    this.zaPrikazSelected = value;
}
export function selectCurrency(value) {
    this.selectedCurrency = value;
}
export function getBrojPresijedanja(service: any) {
    return service.segments.length;
}
export function formatDate(date) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1 < 10 ? "0" + parseInt(date.getMonth() + 1) : (date.getMonth() + 1);
    var d = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();

    return y + "-" + m + "-" + d;
}
export function getBrojPutnika(segment: any[]) {
    let p = 0;

    if(segment[0].pricingDetailPerAdult != undefined) {
      p = segment[0].pricingDetailPerAdult.availability;
    } else if(segment[0].pricingDetailPerChild != undefined) {
      p = segment[0].pricingDetailPerChild.availability;
    } else if(segment[0].pricingDetailPerSenior != undefined) {
      p = segment[0].pricingDetailPerSenior.availability;
    } else if(segment[0].pricingDetailPerInfant != undefined) {
      p = segment[0].pricingDetailPerInfant.availability;
    } else {
      p = 0;
    }

    return p;
}
export function getTravelClass(segment: any) {
  let t = "";

  if(segment.pricingDetailPerAdult != undefined) {
    t = segment.pricingDetailPerAdult.travelClass;
  } else if(segment.pricingDetailPerChild != undefined) {
    t = segment.pricingDetailPerChild.travelClass;
  } else if(segment.pricingDetailPerSenior != undefined) {
    t = segment.pricingDetailPerSenior.travelClass;
  } else if(segment.pricingDetailPerInfant != undefined) {
    t = segment.pricingDetailPerInfant.travelClass;
  } 

  return t;
}
export function getCarrierName(segment: any, carriers: any) {
  let code = segment.flightSegment.carrierCode;
  let name = carriers[code];

  return name;
}
export function getTrajanjeZaustavljanja(segment: any) {
  if(segment.flightSegment.stops != undefined)
    return segment.flightSegment.stops[0].duration;
  else
    return "Non stop flight.";
}
export function getZaustavniAerodromCode(segment: any) {
  if(segment.flightSegment.stops != undefined)
    return segment.flightSegment.stops[0].iataCode;
  else
    return "Non stop flight.";
}
export function getBrojZaustavljanja(segment: any) {
  if(segment.flightSegment.stops != undefined)
    return segment.flightSegment.stops.length;
  else
    return 0;
}