// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2020 - 2022 Gemeente Amsterdam
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import configuration from 'shared/services/configuration/configuration'
import { formatAddress } from 'shared/services/format-address'

import { contextValue as assetSelectContextValue } from 'signals/incident/components/form/MapSelectors/Asset//__tests__/withAssetSelectContext'
import { withAppContext } from 'test/utils'
import { AssetSelectProvider } from 'signals/incident/components/form/MapSelectors/Asset/context'
import type { Address } from 'types/address'
import type { SummaryProps } from 'signals/incident/components/form/MapSelectors/Asset/types'
import type { Item } from 'signals/incident/components/form/MapSelectors/types'

import * as reactRedux from 'react-redux'
import * as reactRouterDom from 'react-router-dom'
import { showMap } from 'signals/incident/containers/IncidentContainer/actions'
import Summary from './Summary'
import MockInstance = jest.MockInstance

jest.mock('shared/services/configuration/configuration')
jest.mock('react-router-dom', () => ({
  __esModule: true,
  ...jest.requireActual('react-router-dom'),
}))

const selection: Item[] = [
  {
    id: 'PL734',
    type: 'plastic',
    description: 'Plastic asset',
    location: {},
    label: 'Plastic container - PL734',
  },
]
const featureType = {
  label: 'Plastic',
  description: 'Plastic asset',
  icon: {
    iconUrl: 'plasticIconUrl',
  },
  idField: 'id_nummer',
  typeField: 'fractie_omschrijving',
  typeValue: 'plastic',
}

export const address = {
  postcode: '1000 AA',
  huisnummer: 100,
  woonplaats: 'Amsterdam',
  openbare_ruimte: 'West',
}

export const summaryProps: SummaryProps = {
  selection,
  featureTypes: [featureType],
  address,
  coordinates: { lat: 0, lng: 0 },
}

export const withContext = (
  Component: JSX.Element,
  context = assetSelectContextValue
) =>
  withAppContext(
    <AssetSelectProvider value={context}>{Component}</AssetSelectProvider>
  )

const dispatch = jest.fn()

describe('signals/incident/components/form/AssetSelect/Summary', () => {
  beforeEach(() => {
    jest.spyOn(reactRedux, 'useDispatch').mockImplementation(() => dispatch)
    const dispatchEventSpy: MockInstance<any, any> = jest.spyOn(
      global.document,
      'dispatchEvent'
    )
    dispatch.mockReset()
    dispatchEventSpy.mockReset()
  })

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    configuration.__reset()
    jest.resetAllMocks()
  })

  it('renders interactive map correctly', () => {
    render(withContext(<Summary {...summaryProps} />))

    expect(screen.getByTestId('assetSelectSummary')).toBeInTheDocument()
    expect(
      screen.getByTestId('assetSelectSummaryDescription')
    ).toBeInTheDocument()
    expect(screen.getByTestId('assetSelectSummaryAddress')).toBeInTheDocument()
    expect(screen.getByText(/wijzigen/i)).toBeInTheDocument()
    expect(screen.queryByTestId('typeIcon')).toBeInTheDocument()
    expect(screen.queryByTestId('map-base')).toBeInTheDocument()
  })

  it('does not render empty values', () => {
    const propsNoFeatureTypes = {
      ...summaryProps,
      featureTypes: [],
    }
    render(withContext(<Summary {...propsNoFeatureTypes} />))

    const idRe = new RegExp(`${selection[0].id}$`)
    const undefinedRe = new RegExp('undefined')

    expect(screen.getByText(idRe)).toBeInTheDocument()
    expect(screen.queryByTestId('typeIcon')).not.toBeInTheDocument()
    expect(screen.queryByText(undefinedRe)).not.toBeInTheDocument()
  })

  it('renders without selection', () => {
    const propsNoSelection = {
      ...summaryProps,
      selection: undefined,
    }
    render(withContext(<Summary {...propsNoSelection} />))

    expect(
      screen.queryByTestId('assetSelectSummaryDescription')
    ).not.toBeInTheDocument()
    expect(screen.getByText(formatAddress(address))).toBeInTheDocument()
  })

  it('should call edit by mouse click', () => {
    render(withContext(<Summary {...summaryProps} />))
    expect(dispatch).not.toHaveBeenCalledWith(showMap())

    const element = screen.getByText(/wijzigen/i)

    expect(dispatch).not.toHaveBeenCalledWith(showMap())

    userEvent.click(element)

    expect(dispatch).toHaveBeenCalledWith(showMap())
  })

  it('should call edit by return key', () => {
    render(withContext(<Summary {...summaryProps} />))
    expect(dispatch).not.toHaveBeenCalledWith(showMap())

    const element = screen.getByText(/wijzigen/i)
    element.focus()

    userEvent.keyboard('a')

    expect(dispatch).not.toHaveBeenCalledWith(showMap())

    userEvent.keyboard('{Enter}')

    expect(dispatch).toHaveBeenCalledWith(showMap())
  })

  it('renders summary address', () => {
    const address = summaryProps.address as Address
    const propsNoAddress = {
      ...summaryProps,
      address: undefined,
    }

    const { rerender } = render(withContext(<Summary {...summaryProps} />))
    expect(
      screen.queryByText('Locatie is gepind op de kaart')
    ).not.toBeInTheDocument()
    expect(screen.getByText(formatAddress(address))).toBeInTheDocument()

    rerender(withContext(<Summary {...propsNoAddress} />))

    expect(
      screen.getByText('Locatie is gepind op de kaart')
    ).toBeInTheDocument()
    expect(screen.queryByText(formatAddress(address))).not.toBeInTheDocument()
  })

  it('renders a Map component with the correct iconSrc prop', () => {
    render(withContext(<Summary {...summaryProps} />))
    expect(
      screen
        .getByTestId('map-base')
        .querySelector(`img[src='/assets/images/icon-select-marker.svg']`)
    ).toBeInTheDocument()
  })

  it("renders the mapEditButton at 'incident/vulaan'", () => {
    jest.spyOn(reactRouterDom, 'useLocation').mockImplementation(() => ({
      pathname: '/incident/vulaan',
      referrer: '/',
      search: '',
      state: {},
      hash: '',
    }))

    render(withContext(<Summary {...summaryProps} />))

    expect(screen.getByTestId('mapEditButton')).toBeInTheDocument()
  })

  it("does not render the mapEditButton at 'incident/summary'", () => {
    jest.spyOn(reactRouterDom, 'useLocation').mockImplementation(() => ({
      pathname: '/incident/summary',
      referrer: '/',
      search: '',
      state: {},
      hash: '',
    }))

    render(withContext(<Summary {...summaryProps} />))

    expect(screen.queryByTestId('mapEditButton')).not.toBeInTheDocument()
  })
})
