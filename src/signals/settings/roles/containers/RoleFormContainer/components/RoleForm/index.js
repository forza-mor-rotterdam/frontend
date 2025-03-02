// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2019 - 2021 Gemeente Amsterdam
import { useEffect, useCallback, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { Label, themeSpacing } from '@remcohoff/asc-ui'
import useFormValidation from 'hooks/useFormValidation'

import Checkbox from 'components/Checkbox'
import Input from 'components/Input'
import FormFooter, { FORM_FOOTER_HEIGHT } from 'components/FormFooter'

import { ROLES_URL } from 'signals/settings/routes'

const StyledForm = styled.form`
  margin-bottom: ${FORM_FOOTER_HEIGHT}px;
`

const GroupLabel = styled(Label)`
  display: block;
  font-weight: bold;
  margin-bottom: ${themeSpacing(3)};
`

const StyledInput = styled(Input)`
  margin-bottom: ${themeSpacing(8)};
`

export const RoleForm = ({
  role,
  permissions,
  onPatchRole,
  onSaveRole,
  readOnly,
}) => {
  const formRef = useRef(null)
  const { isValid, validate, errors, event } = useFormValidation(formRef)
  const [rolePermissions, setRolePermissions] = useState(role.permissions)

  const handleChange = useCallback(
    (id) => (onChangeEvent) => {
      const { checked } = onChangeEvent.target
      if (checked) {
        setRolePermissions([
          ...rolePermissions,
          permissions.find((p) => p.id === id),
        ])
      } else {
        setRolePermissions([...rolePermissions.filter((p) => p.id !== id)])
      }
    },
    [setRolePermissions, permissions, rolePermissions]
  )

  useEffect(() => {
    if (isValid && !readOnly) {
      handleSubmit(event)
    }
  }, [event, isValid, handleSubmit, errors, readOnly])

  const history = useHistory()

  const handleSubmit = useCallback(
    (submitEvent) => {
      const {
        target: {
          form: { elements },
        },
      } = submitEvent
      const permission_ids = []
      permissions.forEach((permission) => {
        if (elements[`permission${permission.id}`].checked) {
          permission_ids.push(permission.id)
        }
      })

      const updatedRole = {
        name: elements.name.value,
        permission_ids,
      }

      if (role.id) {
        onPatchRole({
          id: role.id,
          ...updatedRole,
        })
      } else {
        onSaveRole(updatedRole)
      }
    },
    [onPatchRole, onSaveRole, permissions, role.id]
  )

  const handleCancel = useCallback(() => {
    history.push(ROLES_URL)
  }, [history])

  return (
    <div data-testid="rolesForm">
      <StyledForm ref={formRef} noValidate>
        <StyledInput
          data-testid="rolesFormFieldName"
          defaultValue={role.name}
          disabled={readOnly}
          error={errors.name || null}
          id="name"
          label="Naam"
          name="name"
          required
          type="text"
        />

        <GroupLabel label="Rechten" />
        {permissions.map((permission) => (
          <div key={permission.id}>
            <Label
              disabled={readOnly}
              htmlFor={`permission${permission.id}`}
              label={permission.name}
              noActiveState
            >
              <Checkbox
                data-testid={`checkbox-permissions_${permission.id}`}
                id={`permission${permission.id}`}
                checked={rolePermissions.find(
                  (item) => item.id === permission.id
                )}
                onChange={handleChange(permission.id)}
              />
            </Label>
          </div>
        ))}

        {!readOnly && (
          <FormFooter
            cancelBtnLabel="Annuleer"
            onCancel={handleCancel}
            onSubmitForm={validate}
            submitBtnLabel="Opslaan"
          />
        )}
      </StyledForm>
    </div>
  )
}

RoleForm.defaultProps = {
  readOnly: false,
  role: {
    name: '',
    permissions: [],
  },
}

RoleForm.propTypes = {
  role: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    permissions: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
      })
    ),
  }),
  permissions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,

  onPatchRole: PropTypes.func.isRequired,
  onSaveRole: PropTypes.func.isRequired,
  /** When true, will not allow to submit the form and render all fields disabled */
  readOnly: PropTypes.bool,
}

export default RoleForm
