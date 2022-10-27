// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2022 Gemeente Rotterdam

import type { FC } from 'react'
import { useState, useCallback } from 'react'

import type { IncidentListItem } from 'types/api/incident-list'

import { Link, useHistory } from 'react-router-dom'
import { string2date, string2time } from 'shared/services/string-parser'
import AddressDisplay from 'signals/incident-management/components/AddressDisplay/AddressDisplay'
import type { Priority } from 'signals/incident-management/definitions/types'
import {
  SwipeableContainer,
  SignalImage,
  SignalInfo,
  StyledIcon,
} from './styles'
import { INCIDENT_URL } from 'signals/incident-management/routes'
import { getListIconByKey } from 'shared/services/list-helpers/list-helpers'
import Modal from 'components/Modal'
import HandleForm from 'signals/incident-management/components/HandleForm/HandleForm'

type SignalProps = {
  incident: Pick<
    IncidentListItem,
    'id' | 'priority' | 'category' | 'status' | 'created_at' | 'location'
  >
  priority: Priority[]
}

const SwipeableSignal: FC<SignalProps> = ({ incident, priority }) => {
  const [handleModalIsOpen, setHandleModalIsOpen] = useState(false)

  const openHandleModal = useCallback(() => {
    // disablePageScroll()
    setHandleModalIsOpen(true)
    // lastActiveElement = document.activeElement
  }, [setHandleModalIsOpen])

  const closeHandleModal = useCallback(() => {
    // enablePageScroll()
    setHandleModalIsOpen(false)
  }, [setHandleModalIsOpen])

  const history = useHistory()

  const navigateToIncident = (id: number) => {
    history.push(`${INCIDENT_URL}/${id}`)
  }

  const onSubmitForm = useCallback((event) => {
    event.preventDefault()
  }, [])

  const onCancelForm = useCallback(
    (event) => {
      event.preventDefault()
      closeHandleModal()
    },
    [closeHandleModal]
  )

  const detailLink = `/manage/incident/${incident.id}`
  const address = incident.location?.address

  return (
    <SwipeableContainer tabIndex={0}>
      {address && (
        <>
          <SignalImage onKeyPress={() => navigateToIncident(incident.id)}>
            <Link to={detailLink} tabIndex={-1}>
              image
            </Link>
          </SignalImage>
          <SignalInfo onClick={() => openHandleModal()}>
            <h2>
              <StyledIcon>
                {getListIconByKey(priority, incident.priority?.priority)}
              </StyledIcon>{' '}
              <AddressDisplay
                streetName={address.openbare_ruimte}
                streetNumber={address.huisnummer}
                suffix={address.huisletter}
                etage={address.huisnummer_toevoeging}
              />
            </h2>
            <span className="category">
              {incident.category?.sub} - {incident.status?.state_display}
            </span>
            <div>
              <span className="text-light">{incident.id}</span>
              <span className="text-light">
                {string2date(incident.created_at)}{' '}
                {string2time(incident.created_at)}
              </span>
            </div>
            {/* </Link> */}
          </SignalInfo>
        </>
      )}

      {handleModalIsOpen && (
        <Modal
          data-testid="handleModal"
          onClose={closeHandleModal}
          isOpen
          title="Melding afhandelen"
        >
          <HandleForm
            category={incident.category?.main}
            subcategory={incident.category?.sub}
            onCancel={onCancelForm}
            onSubmitForm={onSubmitForm}
          />
        </Modal>
      )}
    </SwipeableContainer>
  )
}

export default SwipeableSignal
