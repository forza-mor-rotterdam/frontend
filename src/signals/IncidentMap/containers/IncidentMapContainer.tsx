// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2022 Gemeente Amsterdam
import { lazy, Suspense } from 'react'

import ReactDOM from 'react-dom'

import LoadingIndicator from 'components/LoadingIndicator'

import { Header } from '../components/Header'
import { Wrapper } from './styled'
// Not possible to properly test the async loading, setting coverage reporter to ignore lazy imports
// istanbul ignore next
const IncidentMap = lazy(() => import('../components/IncidentMap/IncidentMap'))

export const IncidentMapContainer = () => {
  // TODO: check with Oscar if this is the way to go. Same implementation as location map.

  const appHtmlElement = document.getElementById('app')!
  const map = (
    <Suspense fallback={<LoadingIndicator />}>
      <Wrapper>
        <Header />
        <IncidentMap />
      </Wrapper>
    </Suspense>
  )

  return ReactDOM.createPortal(map, appHtmlElement)
}
