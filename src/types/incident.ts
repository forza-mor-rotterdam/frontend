// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2021 Vereniging van Nederlandse Gemeenten, Gemeente Amsterdam
import type { LatLngLiteral, LatLngTuple } from 'leaflet'
import type { Address } from './address'

export type ValueObject = {
  label: string
  value: boolean
}

export interface Incident {
  category: string
  classification: Classification | null
  datetime: Datetime
  description: string
  email: string
  handling_message: string
  images: string[]
  images_previews: string[]
  incident_date: string
  incident_time_hours: number
  incident_time_minutes: number
  location: Location
  phone?: string
  priority: Priority
  questions?: []
  sharing_allowed?: ValueObject
  source?: string
  subcategory: string
  type: Priority
}

export interface Classification {
  id: string
  name: string
  slug: string
}

export interface Datetime {
  id: string
  label: string
  info: string
}

export interface Location {
  coordinates: LatLngLiteral
  address?: Address
}

export interface Geometrie {
  type: string
  coordinates: LatLngTuple
}

export interface Priority {
  id: string
  label: string
}

export const mock: Incident = {
  priority: {
    id: 'normal',
    label: 'Normaal',
  },
  sharing_allowed: {
    label:
      'Ja, ik geef de gemeenten Amsterdam en Weesp toestemming om mijn melding door te sturen naar andere organisaties als de melding niet voor de gemeente is bestemd.',
    value: true,
  },
  classification: {
    id: 'https://acc.api.data.amsterdam.nl/signals/v1/public/terms/categories/openbaar-groen-en-water/sub_categories/overig-groen-en-water',
    name: 'Overig groen en water',
    slug: 'overig-groen-en-water',
  },
  incident_time_hours: 9,
  questions: [],
  handling_message:
    'Wij bekijken uw melding en zorgen dat het juiste onderdeel van de gemeente deze gaat behandelen. Heeft u contactgegevens achtergelaten? Dan nemen wij bij onduidelijkheid contact met u op.',
  phone: '14 020',
  images_previews: [],
  location: {
    coordinates: {
      lat: 52.38931218069618,
      lng: 4.933903676810628,
    },
    address: {
      openbare_ruimte: "'s-Gravenhekje",
      huisnummer: '9',
      postcode: '1011TG',
      woonplaats: 'Amsterdam',
    },
  },
  images: [],
  type: {
    id: 'SIG',
    label: 'Melding',
  },
  incident_time_minutes: 0,
  source: 'online',
  incident_date: 'Vandaag',
  datetime: {
    id: 'Nu',
    label: 'Nu',
    info: '',
  },
  email: 'noreply@amsterdam.nl',
  description: 'bomen',
  category: 'openbaar-groen-en-water',
  subcategory: 'overig-groen-en-water',
}
