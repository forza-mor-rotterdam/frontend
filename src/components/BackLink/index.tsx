// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2019 - 2021 Gemeente Amsterdam
import styled from 'styled-components'
import type { LinkProps } from 'react-router-dom'
import { Link } from 'react-router-dom'
import {
  Link as AscLink,
  Icon,
  Typography,
  themeColor,
  themeSpacing,
} from '@remcohoff/asc-ui'
import { ChevronLeft } from '@remcohoff/asc-assets'
import type { FunctionComponent } from 'react'

const LinkLabel = styled(Typography).attrs({
  forwardedAs: 'span',
})`
  font-size: 16px;
  font-weight: 700;
  color: ${themeColor('primary')};
`

const Chevron = styled(ChevronLeft)`
  display: inline-block;
`

const StyledLink = styled(AscLink)`
  &:hover {
    * {
      color: ${themeColor('secondary')};
    }

    path {
      fill: ${themeColor('secondary')} !important;
    }

    text-decoration: none;
  }
`

const StyledIcon = styled(Icon)`
  margin: 0 ${themeSpacing(2)} 0 0 !important;
  display: inline-block;

  svg > path {
    fill: ${themeColor('primary')} !important;
  }
`

/**
 * Component that renders a Link with a left chevron
 * To be used on detail pages for navigating back to its corresponding overview page
 */
const BackLink: FunctionComponent<
  LinkProps & { onClick?: (e: MouseEvent) => void }
> = (props) => (
  <StyledLink {...props} data-testid="backlink" forwardedAs={Link}>
    <StyledIcon size={12}>
      <Chevron />
    </StyledIcon>
    <LinkLabel>{props.children}</LinkLabel>
  </StyledLink>
)

export default BackLink
