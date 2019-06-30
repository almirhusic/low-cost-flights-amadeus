import { FlightOffersModel } from "./low-cost-flight.component";
import { DatePipe } from '@angular/common';

const datePipe: DatePipe = new DatePipe('en');

export function checkIataCodes(o: string, d: string) {
  if(o.length != 3) {
    return false;
  } 
  if(d.length != 3) {
    return false;
  }
  return true;
}

export function getBrojPresijedanja(service: any) {
    return service.segments.length - 1;
}

export function formatDate(date) {
    let y = date.getFullYear();
    let m = date.getMonth() + 1 < 10 ? "0" + parseInt(date.getMonth() + 1) : (date.getMonth() + 1);
    let d = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();

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

export function getIataCodesPresjedanja(segments: any[], o: string, d: string) {
  let codes: string = "";
  let counter: number = 0;
  if(segments.length > 1){
    segments.forEach(s => {
      if(counter != 0) {
        let t = s.flightSegment.departure.iataCode;
        codes += t;
        codes += ", ";
      }
      counter++;
    });
    
  }

  if(codes != ""){
    codes = codes.substring(0, codes.length-2);
  }

  return codes;
}

export function getAerodromName(segments: any[], at: string, location: any) {
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

export function getDatumLeta(segments: any[], at: string) {
  if(at == "departure") {
    return segments[0].flightSegment.departure.at;
  }else{
    return segments[segments.length - 1].flightSegment.arrival.at;
  }
}

export function getData(result) {
  let data: FlightOffersModel[] = [];
  
  result.data.forEach(d => {
    let temp: FlightOffersModel = {} as any;
    
    d.offerItems.forEach(item => {
      item.services.forEach(service => {
        if(item.services.indexOf(service) < 1) {
          temp.PresjedanjaOdlazak = getBrojPresijedanja(item.services[0]);
          temp.SlobodnaMjesta = getBrojPutnika(service.segments);
          temp.Cijena = item.price.total;
          temp.Valuta = result.meta.currency;
          temp.PolazniAerodrom = getAerodromName(service.segments, "departure", result.dictionaries.locations);
          temp.PolazniAerodromIataCode = temp.PolazniAerodrom.substring(temp.PolazniAerodrom.indexOf('(')+1, temp.PolazniAerodrom.length-1);
          temp.DatumPolaska = datePipe.transform(getDatumLeta(service.segments, "departure"), "dd-MM-yyyy hh:mm");
          temp.Klasa = getTravelClass(service.segments[0]);
          temp.NazivAvionaPolazak = getCarrierName(service.segments[0], result.dictionaries.carriers);
          temp.BrojZaustavljanja = getBrojZaustavljanja(service.segments[0]);
          temp.TrajanjeZaustavljanja = getTrajanjeZaustavljanja(service.segments[0]);
          temp.ZaustavniAerodromIataCode = getZaustavniAerodromCode(service.segments[0]);
          temp.VrijemePolaska = datePipe.transform(getDatumLeta(service.segments, "departure"), "hh:mm");
          temp.VrijemePolaska += " - " + datePipe.transform(getDatumLeta(service.segments, "arrival"), "hh:mm");
          temp.Return = item.services.length > 1 ? true : false;
          temp.TrajanjeLeta = '1h 53m';
          temp.PresjedanjaOdlazakIataCodes = getIataCodesPresjedanja(service.segments, this.origin, this.destination);
          temp.OdredisniAerodrom = getAerodromName(service.segments, "arrival", result.dictionaries.locations);
          temp.OdredisniAerodromIataCode = temp.OdredisniAerodrom.substring(temp.OdredisniAerodrom.indexOf('(')+1, temp.OdredisniAerodrom.length-1);
          temp.DatumPovratka = datePipe.transform(getDatumLeta(service.segments, "arrival"), "dd-MM-yyyy hh:mm");
            
          if(item.services.length > 1) {
            temp.PresjedanjaPovratak = item.services.length > 1 ? getBrojPresijedanja(item.services[1]) : 0;
            temp.VrijemePovratka = datePipe.transform(getDatumLeta(item.services[1].segments, "departure"), "hh:mm");
            temp.VrijemePovratka += " - " + datePipe.transform(getDatumLeta(item.services[1].segments, "arrival"), "hh:mm");
            temp.PresjedanjaPovratakIataCodes = getIataCodesPresjedanja(item.services[1].segments, this.origin, this.destination);
            temp.NazivAvionaPovratak = getCarrierName(item.services[1].segments[0], result.dictionaries.carriers);
          }

          data = [...data, temp];
        }
      });        
    });
  });
  return data;
}