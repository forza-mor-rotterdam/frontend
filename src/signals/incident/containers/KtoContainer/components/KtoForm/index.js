// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2019 - 2021 Gemeente Amsterdam
import { useCallback, useReducer, useRef } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { Heading, Paragraph, themeColor, themeSpacing } from '@amsterdam/asc-ui'

import RadioButtonList from 'signals/incident-management/components/RadioButtonList'
import TextArea from 'components/TextArea'
import Label from 'components/Label'
import Button from 'components/Button'
import Checkbox from 'components/Checkbox'
import ErrorMessage from 'components/ErrorMessage'
import { useParams } from 'react-router-dom'
import configuration from 'shared/services/configuration/configuration'

const Form = styled.form`
  display: grid;
  grid-row-gap: 32px;
  margin-top: ${themeSpacing(8)};
`

const GridArea = styled.div``

const FieldSet = styled.fieldset`
  border: 0;
  padding: 0;
`

const StyledLabel = styled(Label)`
  margin-bottom: 0;
`

const CheckboxWrapper = styled(Label)`
  display: block;
`

const Optional = styled.span`
  font-weight: 400;
`

const HelpText = styled.p`
  color: ${themeColor('tint', 'level5')};
  margin-top: 0;
  margin-bottom: 0;
  line-height: ${themeSpacing(6)};
`

const StyledTextArea = styled(TextArea)`
  margin-top: ${themeSpacing(3)};
`

const initialState = {
  areaVisibility: false,
  errors: {},
  formData: {
    allows_contact: undefined,
    is_satisfied: undefined,
    text_extra: '',
    text: '',
  },
  formOptions: undefined,
  numChars: 0,
  renderSection: undefined,
  shouldRender: false,
}

const init = (formData) => ({
  ...initialState,
  formData: {
    ...initialState.formData,
    ...formData,
  },
})

// eslint-disable-next-line consistent-return
const reducer = (state, action) => {
  // eslint-disable-next-line default-case
  switch (action.type) {
    case 'SET_AREA_VISIBILITY': {
      const text = action.payload.key !== 'anders' ? action.payload.value : ''

      return {
        ...state,
        areaVisibility: action.payload.key === 'anders',
        formData: { ...state.formData, text },
        errors: { ...state.errors, text: undefined },
      }
    }

    case 'SET_FORM_DATA':
      return { ...state, formData: { ...state.formData, ...action.payload } }

    case 'SET_TEXT_EXTRA':
      return {
        ...state,
        numChars: action.payload.length,
        formData: { ...state.formData, text_extra: action.payload },
      }

    case 'SET_TEXT': {
      return {
        ...state,
        formData: { ...state.formData, text: action.payload },
        errors: { ...state.errors, text: undefined },
      }
    }

    case 'SET_ERRORS':
      return { ...state, errors: action.payload }
  }
}

const KtoForm = ({ options, onSubmit }) => {
  const firstLabelRef = useRef(null)
  const { satisfactionIndication } = useParams()
  const isSatisfied = satisfactionIndication === 'ja'
  const [state, dispatch] = useReducer(
    reducer,
    {
      is_satisfied: isSatisfied,
      allows_contact:
        configuration.featureFlags.reporterMailHandledNegativeContactEnabled,
    },
    init
  )

  const extraTextMaxLength = 1000

  const onChangeOption = useCallback((groupName, option) => {
    dispatch({ type: 'SET_AREA_VISIBILITY', payload: option })
  }, [])

  const onChangeText = useCallback(
    (type) => (event) => {
      const { value } = event.target

      dispatch({ type, payload: value })
    },
    []
  )

  const negativeContactEnabled =
    satisfactionIndication === 'nee' &&
    configuration.featureFlags.reporterMailHandledNegativeContactEnabled

  const onChangeAllowsContact = useCallback(
    (event) => {
      let { checked } = event.target
      if (negativeContactEnabled) {
        checked = !checked
      }
      dispatch({ type: 'SET_FORM_DATA', payload: { allows_contact: checked } })
    },
    [negativeContactEnabled]
  )

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault()

      const { formData } = state

      const errors = {}

      if (!formData.text) {
        errors.text = 'Dit veld is verplicht'
      }

      dispatch({ type: 'SET_ERRORS', payload: errors })

      // scrollIntoView not available in unit tests
      /* istanbul ignore next */
      if (firstLabelRef.current?.scrollIntoView && Object.keys(errors).length) {
        firstLabelRef.current.scrollIntoView()
      }

      if (!Object.keys(errors).length) {
        onSubmit(formData)
      }
    },
    [onSubmit, state]
  )

  return (
    <Form data-testid="ktoForm" onSubmit={handleSubmit}>
      <GridArea>
        <FieldSet>
          <StyledLabel as="legend" ref={firstLabelRef}>
            Waarom bent u {!isSatisfied ? 'on' : ''}tevreden?
          </StyledLabel>
          <HelpText id="subtitle-kto">
            Een antwoord mogelijk, kies de belangrijkste reden
          </HelpText>

          <RadioButtonList
            aria-describedby="subtitle-kto"
            error={Boolean(state.errors.text)}
            groupName="kto"
            hasEmptySelectionButton={false}
            onChange={onChangeOption}
            options={options}
          />
          {state.areaVisibility && (
            <StyledTextArea
              data-testid="ktoText"
              maxRows={5}
              name="text"
              onChange={onChangeText('SET_TEXT')}
              rows="2"
            />
          )}

          <div role="status">
            {state.errors.text && <ErrorMessage message={state.errors.text} />}
          </div>
        </FieldSet>
      </GridArea>

      <GridArea>
        <StyledLabel htmlFor="text_extra">
          Wilt u verder nog iets vermelden of toelichten?{' '}
          <Optional>(niet verplicht)</Optional>
        </StyledLabel>
        <StyledTextArea
          id="text_extra"
          data-testid="ktoTextExtra"
          infoText={`${state.numChars}/${extraTextMaxLength} tekens`}
          maxLength={extraTextMaxLength}
          name="text_extra"
          onChange={onChangeText('SET_TEXT_EXTRA')}
        />
      </GridArea>

      {(negativeContactEnabled ||
        configuration.featureFlags.reporterMailHandledNegativeContactEnabled ===
          false) && (
        <GridArea>
          {negativeContactEnabled ? (
            <>
              <Heading forwardedAs="h2">Contact</Heading>
              <Paragraph id="subtitle-allows-contact">
                Uw reactie is belangrijk voor ons. Wij laten u graag weten wat
                wij ermee doen. En misschien willen wij u nog iets vragen of
                vertellen. Wij bellen u dan of sturen een e-mail.{' '}
              </Paragraph>
            </>
          ) : (
            <StyledLabel id="subtitle-allows-contact">
              Mogen wij contact met u opnemen naar aanleiding van uw feedback?{' '}
              <Optional>(niet verplicht)</Optional>
            </StyledLabel>
          )}

          <CheckboxWrapper
            inline
            htmlFor="allows-contact"
            data-testid="allowsContact"
          >
            <Checkbox
              data-testid="ktoAllowsContact"
              id="allows-contact"
              aria-describedby="subtitle-allows-contact"
              name="allows-contact"
              onChange={onChangeAllowsContact}
            />

            {negativeContactEnabled
              ? 'Nee, bel of e-mail mij niet meer over deze melding of over mijn reactie.'
              : 'Ja'}
          </CheckboxWrapper>
        </GridArea>
      )}

      <GridArea>
        <Button data-testid="ktoSubmit" type="submit" variant="secondary">
          Verstuur
        </Button>
      </GridArea>
    </Form>
  )
}

KtoForm.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })
  ).isRequired,
  onSubmit: PropTypes.func.isRequired,
}

export default KtoForm
