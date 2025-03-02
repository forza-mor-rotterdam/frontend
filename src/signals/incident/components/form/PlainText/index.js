// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2018 - 2022 Gemeente Amsterdam
import { themeColor, themeSpacing } from '@remcohoff/asc-ui'
import Markdown from 'components/Markdown'
import get from 'lodash/get'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { getIsAuthenticated } from 'shared/services/auth/auth'
import mapDynamicFields from 'signals/incident/services/map-dynamic-fields'
import styled, { css } from 'styled-components'

import { makeSelectIncidentContainer } from '../../../containers/IncidentContainer/selectors'

const injectParent = (value, parent) =>
  mapDynamicFields(value, {
    incident: get(parent, 'meta.incidentContainer.incident'),
  })

const Label = styled.div`
  font-weight: 700;
  margin: 0;
`

const getStyle = (type) => {
  switch (type) {
    case 'alert':
      return css`
        color: ${themeColor('secondary')};
        border: 2px solid ${themeColor('secondary')};
        padding: ${themeSpacing(2, 5)};
        font-weight: 700;
        p {
          color: inherit;
        }
      `
    case 'info':
      return css`
        background-color: ${themeColor('primary')};
        padding: ${themeSpacing(5)};
        a:hover {
          color: ${themeColor('tint', 'level1')};
        }

        * {
          // Make sure links contrast with blue background
          color: ${themeColor('tint', 'level1')};
        }
      `
    case 'citation':
    case 'disclaimer':
      return css`
        background-color: ${themeColor('tint', 'level3')};
        padding: ${themeSpacing(5)};
      `
    case 'caution':
      return css`
        border-left: 3px solid ${themeColor('secondary')};
        padding-left: ${themeSpacing(3)};
      `
    case 'alert-inverted':
      return css`
        background-color: ${themeColor('secondary')};
        color: ${themeColor('tint', 'level1')};
        padding: ${themeSpacing(4)};
        p {
          color: inherit;
        }
      `
    case 'message':
      return css`
        color: ${themeColor('tint', 'level7')};
        a {
          color: inherit;
        }
      `
    default:
      return css`
        color: ${themeColor('tint', 'level5')};
        a,
        p {
          color: inherit;
        }
      `
  }
}

const Wrapper = styled.div`
  ul {
    padding: ${themeSpacing(0, 0, 0, 6)};
    margin: 0;

    li {
      list-style-type: square;
    }
  }

  > :first-child {
    margin-top: 0;
  }

  > :last-child {
    margin-bottom: 0;
  }

  ${({ type }) => getStyle(type)}
`

const PlainText = ({ className, meta, parent }) => {
  const { mapActive } = useSelector(makeSelectIncidentContainer)
  const valueAuthenticated = getIsAuthenticated() && meta?.valueAuthenticated
  const value = !valueAuthenticated && meta?.value
  return meta?.isVisible ? (
    <Wrapper className={className} type={meta.type} data-testid="plainText">
      {meta.label && (
        <Label>
          <Markdown hideTabindexLink={mapActive}>
            {injectParent(meta.label, parent)}
          </Markdown>
        </Label>
      )}
      {valueAuthenticated && (
        <Markdown>{injectParent(valueAuthenticated, parent)}</Markdown>
      )}
      {value && (
        <Markdown linkTarget="_blank">{injectParent(value, parent)}</Markdown>
      )}
    </Wrapper>
  ) : null
}

PlainText.defaultProps = {
  className: '',
}

PlainText.propTypes = {
  className: PropTypes.string,
  meta: PropTypes.object,
  parent: PropTypes.object,
}

export default PlainText
