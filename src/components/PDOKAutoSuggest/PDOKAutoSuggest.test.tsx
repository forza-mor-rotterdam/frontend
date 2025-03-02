// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2020 - 2021 Gemeente Amsterdam
import { render, fireEvent, act, screen } from '@testing-library/react'
import fetch from 'jest-fetch-mock'

import { withAppContext } from 'test/utils'
import JSONResponse from 'utils/__tests__/fixtures/PDOKResponseData.json'
import { INPUT_DELAY } from 'components/AutoSuggest'
import { pdokResponseFieldList } from 'shared/services/map-location'
import PDOKAutoSuggest from '.'

const mockResponse = JSON.stringify(JSONResponse)

const onSelect = jest.fn()
const municipalityQs = 'fq=gemeentenaam:'
const fieldListQs = 'fl='

const renderAndSearch = async (value = 'Dam', props = {}) => {
  render(withAppContext(<PDOKAutoSuggest onSelect={onSelect} {...props} />))
  const input = screen.getByRole('textbox') as HTMLInputElement

  input.focus()

  fireEvent.change(input, { target: { value } })

  act(() => {
    jest.advanceTimersByTime(INPUT_DELAY)
  })

  await screen.findByTestId('autoSuggest')
}

describe('components/PDOKAutoSuggest', () => {
  beforeEach(() => {
    fetch.mockResponse(mockResponse)
    jest.useFakeTimers()
  })

  afterEach(() => {
    fetch.mockReset()
    onSelect.mockReset()

    jest.useRealTimers()
  })

  it('should render an AutoSuggest', () => {
    const { getByTestId } = render(
      withAppContext(<PDOKAutoSuggest onSelect={onSelect} />)
    )

    expect(getByTestId('autoSuggest')).toBeInTheDocument()
  })

  describe('fetch', () => {
    it('should not be called on focus', () => {
      render(withAppContext(<PDOKAutoSuggest onSelect={onSelect} />))
      const input = screen.getByRole('combobox')

      input.focus()

      expect(fetch).not.toHaveBeenCalled()
    })

    it('should be called on change', async () => {
      await renderAndSearch()
      expect(fetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('municipality', () => {
    it('should call fetch with municipality', async () => {
      await renderAndSearch('Dam', { municipality: 'amsterdam' })
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`${municipalityQs}(amsterdam)`),
        expect.objectContaining({ method: 'GET' })
      )
    })

    it('should work with multiple municipalities', async () => {
      await renderAndSearch('Dam', { municipality: 'utrecht amsterdam' })
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`${municipalityQs}(utrecht amsterdam)`),
        expect.objectContaining({ method: 'GET' })
      )
    })

    it('should work with quotes and negations', async () => {
      await renderAndSearch('Dam', {
        municipality: '"den bosch" -amsterdam',
      })
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`${municipalityQs}("den bosch" -amsterdam)`),
        expect.objectContaining({ method: 'GET' })
      )
    })

    it('should ignore an empty string', async () => {
      await renderAndSearch('Dam', {
        municipality: '',
      })
      expect(fetch).toHaveBeenCalledWith(
        expect.not.stringContaining(municipalityQs),
        expect.objectContaining({ method: 'GET' })
      )
    })
  })

  describe('fieldList', () => {
    it('should call fetch with default field list', async () => {
      await renderAndSearch()
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`${fieldListQs}${pdokResponseFieldList}`),
        expect.objectContaining({ method: 'GET' })
      )
    })

    it('should call fetch with extra fields', async () => {
      await renderAndSearch('Dam', { fieldList: ['name', 'type'] })
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          `${fieldListQs}${pdokResponseFieldList},name,type`
        ),
        expect.objectContaining({ method: 'GET' })
      )
    })
  })

  it('should pass on props to underlying component', () => {
    const placeholder = 'Foo bar'
    const { container } = render(
      withAppContext(
        <PDOKAutoSuggest onSelect={onSelect} placeholder={placeholder} />
      )
    )

    expect(
      container.querySelector(`[placeholder="${placeholder}"]`)
    ).toBeInTheDocument()
  })
})
