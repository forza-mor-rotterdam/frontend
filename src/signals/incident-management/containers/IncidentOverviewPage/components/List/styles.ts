// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2021 Gemeente Amsterdam
import { Icon, themeColor } from '@remcohoff/asc-ui'
import styled from 'styled-components'

export const StyledList = styled.div<{ isLoading?: boolean }>`
  width: 100%;
  overflow: auto;

  ${({ isLoading }) => isLoading && 'opacity: 0.3;'}
`

export const SwipeableContainer = styled.div`
  display: flex;
  border-top: 2px solid grey;
  font-size: 0.8rem;

  &:last-child {
    border-bottom: 2px solid grey;
  }
  a {
    text-decoration: none;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    padding: 5px 0;
    color: inherit;
  }
`

export const SignalImage = styled.div`
  flex: 0 1 25%;
  min-height: 100px;
  background: gray;
  border: 10px solid white;
`

export const SignalInfo = styled.div`
  flex: 1;
  h2 {
    margin: 4px 0 0;

    span {
      display: inline;
    }
  }
  div {
    display: flex;
    justify-items: space-between;

    > span {
      flex: 1;

      &: last-child {
        text-align: right;
      }
    }
  }

  .text-light {
    color: gray;
  }
`

export const StyledIcon = styled(Icon).attrs({
  size: 16,
  role: 'img',
})`
  & svg {
    fill: ${themeColor('tint', 'level4')};
  }
`
