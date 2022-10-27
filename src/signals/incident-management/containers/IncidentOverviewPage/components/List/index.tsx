// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2018 - 2021 Gemeente Amsterdam
import type { FunctionComponent } from 'react'
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays'
import parseISO from 'date-fns/parseISO'
import { statusList } from 'signals/incident-management/definitions'
import type { Priority } from 'signals/incident-management/definitions/types'
import type { IncidentListItem, IncidentList } from 'types/api/incident-list'
import { StyledList } from './styles'
import SwipeableSignal from './SwipeableSignal'

export const getDaysOpen = (incident: IncidentListItem) => {
  const statusesWithoutDaysOpen = statusList
    .filter(
      ({ shows_remaining_sla_days }) => shows_remaining_sla_days === false
    )
    .map(({ key }) => key)
  const hasDaysOpen =
    incident.status && !statusesWithoutDaysOpen.includes(incident.status.state)

  const createdAtDate = parseISO(incident.created_at)

  if (!hasDaysOpen || isNaN(createdAtDate.getTime())) return '-'

  return differenceInCalendarDays(new Date(), createdAtDate)
}

interface ListProps {
  className?: string
  incidents: IncidentList
  isLoading?: boolean
  priority: Priority[]
}

const List: FunctionComponent<ListProps> = ({
  className,
  incidents,
  isLoading = false,
  priority,
}) => {
  return (
    <StyledList
      isLoading={isLoading}
      className={className}
      data-testid="incidentOverviewListComponent"
    >
      <div>
        {incidents.map((incident) => {
          return (
            <SwipeableSignal
              incident={incident}
              priority={priority}
              key={incident.id}
            ></SwipeableSignal>
          )
        })}
      </div>
    </StyledList>
  )
}

export default List
