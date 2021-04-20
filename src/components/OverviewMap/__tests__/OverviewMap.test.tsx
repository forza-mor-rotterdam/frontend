// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2020 - 2021 Gemeente Amsterdam
import fetchMock from 'jest-fetch-mock'
import React from 'react'
import { render, act } from '@testing-library/react'

import type configurationType from 'shared/services/configuration/__mocks__/configuration'
import configuration from 'shared/services/configuration/configuration'
import { withMapContext } from 'test/utils'
import geographyJSON from 'utils/__tests__/fixtures/geography.json'

import OverviewMap from '..'
import { POLLING_INTERVAL } from '../OverviewMap'

const mockConfiguration = configuration as typeof configurationType
const createdAfter = '1999-01-01T00:00:00'
const createdBefore = '1999-01-05T00:00:00'

let mockFilterParams: { created_after: string; created_before: string }

jest.mock('shared/services/configuration/configuration')
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('signals/incident-management/selectors', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  ...jest.requireActual('signals/incident-management/selectors')!,
  makeSelectFilterParams: () => mockFilterParams,
}))

describe('OverviewMap', () => {
  beforeEach(() => {
    fetchMock.mockResponse(JSON.stringify(geographyJSON))

    mockFilterParams = {
      created_after: createdAfter,
      created_before: createdBefore,
    }
  })

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    mockConfiguration.__reset()
    fetchMock.resetMocks()
  })

  it('should render the map and the autosuggest', async () => {
    const { getByTestId, findByTestId } = render(
      withMapContext(<OverviewMap />)
    )

    await findByTestId('overviewMap')

    expect(getByTestId('autoSuggest')).toBeInTheDocument()
  })

  describe('request', () => {
    const reDateTime = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
    const expectedFilterParams: Record<string, RegExp> = {
      created_after: reDateTime,
      created_before: reDateTime,
      page_size: /4000/,
    }

    it('should fetch locations from private endpoint', async () => {
      const { findByTestId, rerender, unmount } = render(
        withMapContext(<OverviewMap />)
      )

      await findByTestId('overviewMap')

      expect(fetchMock.mock.calls).toHaveLength(1)

      const requestUrl = new URL(fetchMock.mock.calls[0][0] as string)
      const params = new URLSearchParams(requestUrl.search)
      const endpoint = `${configuration.apiBaseUrl}${requestUrl.pathname}`

      expect(endpoint).toBe(configuration.GEOGRAPHY_ENDPOINT)

      Object.keys(expectedFilterParams).forEach((expectedKey) => {
        const paramKeys = [...params.keys()]
        expect(paramKeys.includes(expectedKey)).toBeTruthy()

        const paramKey = paramKeys.find((key) => key === expectedKey)
        expect(paramKey && params.get(paramKey)).toMatch(
          expectedFilterParams[expectedKey]
        )
      })

      expect(params.get('created_after')).toEqual(createdAfter)
      expect(params.get('created_before')).toEqual(createdBefore)

      unmount()

      rerender(withMapContext(<OverviewMap />))

      await findByTestId('overviewMap')

      expect(fetchMock.mock.calls).toHaveLength(2)
    })

    it('should fetch locations from public endpoint', async () => {
      const { findByTestId, rerender, unmount } = render(
        withMapContext(<OverviewMap isPublic />)
      )

      await findByTestId('overviewMap')

      expect(fetchMock.mock.calls).toHaveLength(1)

      const requestUrl = new URL(fetchMock.mock.calls[0][0] as string)
      const params = new URLSearchParams(requestUrl.search)
      const endpoint = `${configuration.apiBaseUrl}${requestUrl.pathname}`

      expect(endpoint).toBe(configuration.MAP_SIGNALS_ENDPOINT)

      Object.keys(expectedFilterParams).forEach((expectedKey) => {
        const paramKeys = [...params.keys()]
        expect(paramKeys.includes(expectedKey)).toBeTruthy()

        const paramKey = paramKeys.find((key) => key === expectedKey)
        expect(paramKey && params.get(paramKey)).toMatch(
          expectedFilterParams[expectedKey]
        )
      })

      expect(params.get('created_after')).toEqual(createdAfter)
      expect(params.get('created_before')).toEqual(createdBefore)

      unmount()

      rerender(withMapContext(<OverviewMap />))

      await findByTestId('overviewMap')

      expect(fetchMock.mock.calls).toHaveLength(2)
    })

    it('should poll the endpoint', async () => {
      jest.useFakeTimers()

      const { findByTestId } = render(withMapContext(<OverviewMap />))

      await findByTestId('overviewMap')

      expect(fetchMock.mock.calls).toHaveLength(1)

      act(() => {
        jest.advanceTimersByTime(POLLING_INTERVAL)
      })

      await findByTestId('overviewMap')

      expect(fetchMock.mock.calls).toHaveLength(2)

      jest.useRealTimers()
    })
  })

  it('should overwrite date filter params with mapFilter24Hours enabled', async () => {
    configuration.featureFlags.mapFilter24Hours = true
    const { findByTestId } = render(withMapContext(<OverviewMap />))

    await findByTestId('overviewMap')

    const requestUrl = new URL(fetchMock.mock.calls[0][0] as string)
    const params = new URLSearchParams(requestUrl.search)

    expect(params.get('created_after')).not.toEqual(createdAfter)
    expect(params.get('created_before')).not.toEqual(createdBefore)
  })
})
