export namespace Model {
    export class AccessToken
    {
        Type: string;
        Username: string;
        Application_name: string;
        Client_id: string;
        Token_type: string;
        Access_token: string;
        Expires_in: string;
        State: string;
        Scope: string;
    }

    export interface FlightOffers {
        data:         Data[];
        dictionaries: Dictionaries;
        meta:         Meta;
        warnings:     Warning[];
    }
    
    export interface Data {
        type:       string;
        id:         string;
        offerItems: OfferItem[];
    }
    
    export interface OfferItem {
        services:       Service[];
        price:          Price;
        pricePerAdult:  Price;
        pricePerInfant: Price;
        pricePerChild:  Price;
        pricePerSenior: Price;
    }
    
    export interface Price {
        total:      string;
        totalTaxes: string;
    }
    
    export interface Service {
        segments: Segment[];
    }
    
    export interface Segment {
        flightSegment:          FlightSegment;
        pricingDetailPerAdult:  PricingDetailPer;
        pricingDetailPerInfant: PricingDetailPer;
        pricingDetailPerChild:  PricingDetailPer;
        pricingDetailPerSenior: PricingDetailPer;
    }
    
    export interface FlightSegment {
        departure:   Arrival;
        arrival:     Arrival;
        carrierCode: string;
        number:      string;
        aircraft:    Aircraft;
        operating:   Operating;
        duration:    string;
        stops:       Stop[];
    }
    
    export interface Aircraft {
        code: string;
    }
    
    export interface Arrival {
        iataCode: string;
        terminal: string;
        at:       Date;
    }
    
    export interface Operating {
        carrierCode: string;
        number:      string;
    }
    
    export interface Stop {
        iataCode:    string;
        newAircraft: Aircraft;
        duration:    string;
        arrivalAt:   Date;
        departureAt: Date;
    }
    
    export interface PricingDetailPer {
        travelClass:  string;
        fareClass:    string;
        availability: number;
        fareBasis:    string;
    }
    
    export interface Dictionaries {
        carriers:   Aircraft;
        currencies: Aircraft;
        aircraft:   Aircraft;
        locations:  Locations;
    }
    
    export interface Locations {
        key: string;
    }
    
    export interface Meta {
        links:    Links;
        currency: string;
        defaults: Defaults;
    }
    
    export interface Defaults {
        nonStop: boolean;
        adults:  number;
    }
    
    export interface Links {
        self: string;
    }
    
    export interface Warning {
        status: string;
        code:   string;
        title:  string;
    }
}