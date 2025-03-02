// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2020 - 2021 Gemeente Amsterdam
import styled from 'styled-components'

import {
  Heading,
  Label,
  RadioGroup,
  themeColor,
  themeSpacing,
  Row,
} from '@remcohoff/asc-ui'

import Button from 'components/Button'
import InfoText from 'components/InfoText'

export const ThinLabel = styled.span`
  font-weight: 400;
`

export const StyledDefinitionList = styled.dl`
  margin: 0;
  display: grid;
  grid-row-gap: 0;
  padding-bottom: ${themeSpacing(4)};

  @media (min-width: ${({ theme }) => theme.layouts.medium.max}px) {
    grid-template-columns: 3fr 3fr;
  }

  @media (min-width: ${({ theme }) => theme.layouts.large.min}px) {
    grid-template-columns: 3fr 2fr;
  }

  dt,
  dd {
    @media (min-width: ${({ theme }) => theme.layouts.medium.max}px) {
      padding: ${themeSpacing(2)} 0;
    }
  }

  dt {
    color: ${themeColor('tint', 'level5')};
    margin: 0;
    font-weight: 400;
  }

  dd {
    padding-bottom: ${themeSpacing(2)};
    font-weight: 600;
    width: 100%;
  }
`

export const StyledSubmitButton = styled(Button)`
  margin-right: ${themeSpacing(5)};
`

export const StyledRadioGroup = styled(RadioGroup)`
  display: inline-flex;
`

export const StyledRadioLabel = styled(Label)`
  align-self: baseline;

  * {
    font-weight: normal;
  }
`

export const StyledLabel = styled(Label)`
  > span {
    margin-top: 0;
  }
`

export const StyledFieldset = styled.fieldset`
  scroll-margin-top: ${themeSpacing(15)};
`

export const StyledHeading = styled(Heading)`
  margin-bottom: 0;
`

export const StyledWrapper = styled.div`
  padding-top: ${themeSpacing(6)};
  padding-bottom: ${themeSpacing(6)};
`

export const FormWrapper = styled(Row)`
  display: grid;

  @media (min-width: ${({ theme }) => theme.layouts.large.max}px) {
    column-gap: ${({ theme }) => theme.layouts.large.gutter}px;
    grid-template-columns: 7fr 5fr;
  }
`

export const StyledGrid = styled.div`
  display: grid;
  grid-row-gap: ${themeSpacing(8)};
`

export const StyledSelect = styled.div`
  max-width: 420px;

  strong {
    font-size: 16px;
  }
`

export const StyledInfoText = styled(InfoText)`
  margin: ${themeSpacing(2, 0, 0)};
`

export const StyledForm = styled.form`
  padding-top: ${themeSpacing(8)};

  display: grid;
  grid-row-gap: ${themeSpacing(8)};

  fieldset {
    padding: ${themeSpacing(0, 0, 8)};
    position: relative;
    border: 0;
    border-bottom: 2px solid ${themeColor('tint', 'level3')};
    margin: 0;
  }
`
