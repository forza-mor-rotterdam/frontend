// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2018 - 2021 Gemeente Amsterdam
import { screen, render, fireEvent } from '@testing-library/react'

import { StatusCode } from 'signals/incident-management/definitions/types'

import type { DefaultText as DefaultTextType } from 'types/api/default-text'
import type { DefaulTextsProps } from './DefaultTexts'

import DefaultTexts from '.'

describe('<DefaultTexts />', () => {
  let props: DefaulTextsProps

  beforeEach(() => {
    props = {
      status: StatusCode.Afgehandeld,
      defaultTexts: [
        {
          state: StatusCode.Afgehandeld,
          templates: [
            {
              title: 'Titel 1',
              text: 'Er is een accu gevonden en deze is meegenomen',
              is_active: true,
            },
            {
              title: '222',
              text: 'sdfsdfsdf',
              is_active: true,
            },
            {
              title: 'Asbest',
              text: 'Er is asbest gevonden en dit zal binnen 3 werkdagen worden opgeruimd.',
              is_active: true,
            },
          ],
        },
      ],
      onHandleUseDefaultText: jest.fn(),
    }
  })

  it('should render correctly', () => {
    const { queryAllByTestId } = render(<DefaultTexts {...props} />)

    expect(screen.getByTestId('modalTitle')).toHaveTextContent(
      /^Standaardtekst$/
    )

    expect(queryAllByTestId('defaultTextsItemText')).toHaveLength(3)
    expect(queryAllByTestId('defaultTextsItemTitle')[0]).toHaveTextContent(
      /^Titel 1$/
    )
    expect(queryAllByTestId('defaultTextsItemText')[0]).toHaveTextContent(
      /^Er is een accu gevonden en deze is meegenomen$/
    )
    expect(queryAllByTestId('defaultTextsItemTitle')[1]).toHaveTextContent(
      /^222$/
    )
    expect(queryAllByTestId('defaultTextsItemText')[1]).toHaveTextContent(
      /^sdfsdfsdf$/
    )
    expect(queryAllByTestId('defaultTextsItemTitle')[2]).toHaveTextContent(
      /^Asbest$/
    )
    expect(queryAllByTestId('defaultTextsItemText')[2]).toHaveTextContent(
      /^Er is asbest gevonden en dit zal binnen 3 werkdagen worden opgeruimd\.$/
    )
  })

  it('should not render when wrong status is used', () => {
    const { queryAllByTestId } = render(
      <DefaultTexts {...props} status={StatusCode.Ingepland} />
    )

    expect(queryAllByTestId('defaultTextsItemText')).toHaveLength(0)
  })

  it('should not render when list is empty', () => {
    const defaultTexts: Array<DefaultTextType> = []

    const { queryAllByTestId } = render(
      <DefaultTexts {...props} defaultTexts={defaultTexts} />
    )

    expect(queryAllByTestId('defaultTextsItemText')).toHaveLength(0)
  })

  it('should render notification when list has no templates', () => {
    const defaultTexts = [...props.defaultTexts]
    defaultTexts[0].templates = []

    const { getByText } = render(
      <DefaultTexts {...props} defaultTexts={defaultTexts} />
    )

    expect(
      getByText(
        'Er is geen standaard tekst voor deze subcategorie en status combinatie.'
      )
    ).toBeInTheDocument()
  })

  it('should call the callback function when button clicked', () => {
    const { queryAllByTestId } = render(<DefaultTexts {...props} />)
    fireEvent.click(queryAllByTestId('defaultTextsItemButton')[0])

    expect(props.onHandleUseDefaultText).toHaveBeenCalledTimes(1)
  })
})
