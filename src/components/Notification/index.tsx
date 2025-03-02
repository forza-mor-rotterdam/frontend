// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2019 - 2021 Gemeente Amsterdam
import type { FunctionComponent } from 'react'
import { useEffect, useState, useCallback, useRef } from 'react'
import { Column, Row } from '@remcohoff/asc-ui'
import { Close } from '@remcohoff/asc-assets'
import { useHistory } from 'react-router-dom'
import {
  SITE_HEADER_HEIGHT_SHORT,
  SITE_HEADER_HEIGHT_TALL,
} from 'containers/SiteHeader/constants'

import {
  ONCLOSE_TIMEOUT,
  SLIDEUP_TIMEOUT,
  TYPE_GLOBAL,
  TYPE_LOCAL,
  VARIANT_ERROR,
  VARIANT_NOTICE,
} from 'containers/Notification/constants'
import { getIsAuthenticated } from 'shared/services/auth/auth'
import useIsFrontOffice from 'hooks/useIsFrontOffice'
import type { Type, Variant } from 'containers/Notification/types'

import { Wrapper, Title, Message, CloseButton } from './styled'

interface NotificationProps {
  className?: string
  message?: string
  onClose?: () => void
  title: string
  type?: Type
  variant?: Variant
}

/**
 * Component that shows a title, a close button and, optionally, a message in a full-width bar with
 * a coloured background. The component slides up automatically after eight seconds, but only when
 * its variant is not VARIANT_ERROR and its type is not TYPE_GLOBAL.
 */
const Notification: FunctionComponent<NotificationProps> = ({
  title,
  message = '',
  onClose,
  className,
  type = TYPE_LOCAL,
  variant = VARIANT_NOTICE,
}) => {
  const [hasFocus, setHasFocus] = useState(false)
  const [shouldHide, setShouldHide] = useState(false)
  const isFrontOffice = useIsFrontOffice()
  const tall = isFrontOffice && !getIsAuthenticated()
  const history = useHistory()

  // persisting timeout IDs across renders
  const onCloseTimeoutRef = useRef<number>()
  const slideUpTimeoutRef = useRef<number>()

  /**
   * Subscribe to history changes
   * Will reset the notification whenever a navigation action occurs and only when the type of the
   * notifcation is TYPE_LOCAL
   */
  useEffect(() => {
    if (type !== TYPE_LOCAL || typeof onClose !== 'function') {
      return undefined
    }

    const unlisten = history.listen(() => {
      onClose()
    })

    return () => {
      unlisten()
    }
  }, [history, type, title, onClose])

  useEffect(() => {
    if (
      variant === VARIANT_ERROR ||
      type === TYPE_GLOBAL ||
      typeof onClose !== 'function'
    ) {
      return undefined
    }

    if (hasFocus) {
      window.clearTimeout(onCloseTimeoutRef.current)
      window.clearTimeout(slideUpTimeoutRef.current)
    } else {
      const slideUpTimeoutId = window.setTimeout(() => {
        window.clearTimeout(slideUpTimeoutRef.current)

        setShouldHide(true)
      }, SLIDEUP_TIMEOUT)

      slideUpTimeoutRef.current = slideUpTimeoutId

      const onCloseTimeoutId = window.setTimeout(() => {
        window.clearTimeout(onCloseTimeoutRef.current)

        onClose()
      }, ONCLOSE_TIMEOUT + SLIDEUP_TIMEOUT)

      onCloseTimeoutRef.current = onCloseTimeoutId
    }

    return () => {
      window.clearTimeout(onCloseTimeoutRef.current)
      window.clearTimeout(slideUpTimeoutRef.current)
    }
  }, [hasFocus, onClose, type, variant])

  const onCloseNotification = useCallback(() => {
    setShouldHide(true)

    const slideUpTimeoutId = window.setTimeout(() => {
      window.clearTimeout(slideUpTimeoutRef.current)

      /* istanbul ignore else */
      if (typeof onClose === 'function') {
        onClose()
      }
    }, ONCLOSE_TIMEOUT)

    slideUpTimeoutRef.current = slideUpTimeoutId
  }, [onClose])

  const transformClassName = tall ? 'fadeout' : 'slideup'

  return (
    <Wrapper
      className={`${className} ${shouldHide && transformClassName}`}
      data-testid="notification"
      onMouseEnter={() => setHasFocus(true)}
      onMouseLeave={() => setHasFocus(false)}
      top={tall ? SITE_HEADER_HEIGHT_TALL : SITE_HEADER_HEIGHT_SHORT}
      variant={variant}
    >
      <Row>
        <Column span={12}>
          <div>
            <Title hasMargin={Boolean(message)}>{title}</Title>
            {message && <Message>{message}</Message>}
          </div>
          <CloseButton
            alignTop={Boolean(message)}
            data-testid="notificationClose"
            icon={<Close />}
            onClick={onCloseNotification}
            size={20}
            type="button"
            variant="blank"
          />
        </Column>
      </Row>
    </Wrapper>
  )
}

export default Notification
