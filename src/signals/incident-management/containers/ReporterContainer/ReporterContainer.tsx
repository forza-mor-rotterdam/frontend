// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2021 Gemeente Amsterdam
import { themeColor, themeSpacing } from '@amsterdam/asc-ui'
import styled from 'styled-components'
import { useParams } from 'react-router-dom'
import type { FunctionComponent } from 'react'
import LoadingIndicator from 'components/LoadingIndicator'
import IncidentList from './components/IncidentList'
import Header from './components/Header'
import { useFetchReporter } from './useFetchReporter'

const Wrapper = styled.article`
  margin: 0 ${themeSpacing(11)};
`

const StyledHeader = styled(Header)`
  margin-top: ${themeSpacing(6)};
`

const Content = styled.div`
  margin-top: ${themeSpacing(6)};
  display: flex;
  border-top: 1px solid ${themeColor('tint', 'level3')};
`

const StyledIncidentList = styled(IncidentList)`
  width: 50%;
  margin: 0;
  padding: 0;
`

const Incident = styled.div`
  width: 50%;
  border-left: 1px solid ${themeColor('tint', 'level3')};
`

const ReporterContainer: FunctionComponent = () => {
  const { id } = useParams<{ id: string }>()

  const { incident, incidents, selectIncident } = useFetchReporter(id)

  const header = incident.data?.email && incidents.data?.count && (
    <StyledHeader
      id={id}
      email={incident.data.email}
      count={incidents.data.count}
    />
  )

  const loadingIncidator = (incident.isLoading || incidents.isLoading) && (
    <LoadingIndicator />
  )

  return (
    <Wrapper data-testid="reporterContainer">
      {header}

      {incident.data?.id && incidents.data?.list && (
        <Content>
          <StyledIncidentList
            list={incidents.data.list}
            selectedIncidentId={incident.data.id}
            selectIncident={selectIncident}
          />

          {/* TODO SIG-3675 */}
          <Incident>
            {incident.data.id && (
              <>
                {incident.data.id} {incident.data.text}
              </>
            )}
          </Incident>
        </Content>
      )}

      {loadingIncidator}
    </Wrapper>
  )
}

export default ReporterContainer
