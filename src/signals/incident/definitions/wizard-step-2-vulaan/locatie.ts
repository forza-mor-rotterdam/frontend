import { QuestionFieldType } from 'types/question'

const locatie = {
  meta: {
    featureTypes: [],
    label: 'Waar is het?',
    language: {
      title: 'Locatie',
      subTitle: 'Waar is het?',
      description:
        'Typ het dichtstbijzijnde adres, klik de locatie aan op de kaart of gebruik "Mijn locatie"',
      submit: 'Gebruik deze locatie',
    },
    shortLabel: 'Waar is het?',
  },
  render: QuestionFieldType.LocationSelect,
  options: {
    validators: ['required'],
  },
}

export default locatie
