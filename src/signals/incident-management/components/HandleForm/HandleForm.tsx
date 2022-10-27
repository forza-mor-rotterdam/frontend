import type { FC } from 'react'
// import { useState } from "react"

import Input from 'components/Input'
import Label from 'components/Label'

import {
  Form,
  ControlsWrapper,
  Fieldset,
  FormFooterWrapper,
} from '../FilterForm/styled'
import TextArea from 'components/TextArea'
// import { makeSelectCategories } from "models/categories/selectors"

type FormProps = {
  onCancel: any
  onSubmitForm: any
  category?: string
  subcategory?: string
}

const HandleForm: FC<FormProps> = ({
  category,
  subcategory,
  onCancel,
  onSubmitForm,
}) => {
  // const [categoriesState, setCategoriesState] = useState(null)
  // // const categories = makeSelectCategories.resultFunc(categoriesState)
  // const categories = makeSelectCategories.resultFunc(setCategoriesState)

  return (
    <Form action="" noValidate>
      <ControlsWrapper>
        <Fieldset isSection={false}>
          <Label htmlFor="group">Groep</Label>
          <div className="invoer">
            <Input
              data-testid="group"
              defaultValue={category}
              id="group"
              name="group"
              // onBlur={onNameBlur}
              // onChange={onNameChange}
              type="text"
            />
          </div>
        </Fieldset>

        <Fieldset isSection={false}>
          <Label htmlFor="subject">Onderwerp</Label>
          <div className="invoer">
            <Input
              data-testid="subject"
              defaultValue={subcategory}
              id="subject"
              name="subject"
              // onBlur={onNameBlur}
              // onChange={onNameChange}
              type="text"
            />
          </div>
        </Fieldset>

        <Fieldset isSection={false}>
          <Label htmlFor="messageSelector">Tekst voor melder</Label>
          <div className="invoer">
            <Input
              data-testid="messageSelector"
              id="messageSelector"
              name="messageSelector"
              // onBlur={onNameBlur}
              // onChange={onNameChange}
              type="text"
            />
          </div>
          <span>&nbsp;</span>
          <div className="invoer">
            <TextArea
              data-testid="message"
              id="message"
              name="message"
              // onBlur={onNameBlur}
              // onChange={onNameChange}
            />
          </div>
        </Fieldset>
      </ControlsWrapper>
      <FormFooterWrapper
        cancelBtnLabel="Annuleren"
        onCancel={onCancel}
        onSubmitForm={onSubmitForm}
        submitBtnLabel="Afhandelen"
      />
    </Form>
  )
}

export default HandleForm
