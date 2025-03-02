// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2020 - 2021 Gemeente Amsterdam
import type SubCategory from 'types/api/sub-category'
import type { ExtendedCategory } from 'models/categories/selectors'
import type { Punctuality } from 'signals/incident-management/definitions/punctualityList'
import type { Feedback } from 'signals/incident-management/definitions/feedbackList'

import {
  DEFAULT_SUBMIT_BUTTON_LABEL,
  RESET,
  SAVE_SUBMIT_BUTTON_LABEL,
  SET_ADDRESS,
  SET_CATEGORIES,
  SET_DATE,
  SET_GROUP_OPTIONS,
  SET_MAIN_CATEGORY,
  SET_NAME,
  SET_NOTE_KEYWORD,
  SET_REFRESH,
  SET_SAVE_BUTTON_LABEL,
} from './constants'

import type { Actions } from './actions'

type Filter = {
  name?: string
  refresh: boolean
  id?: string
}

type CategoryOption = {
  key: string
  value: string
}

type Options = {
  address_text: string
  area: []
  assigned_user_email: ''
  category_slug: Array<SubCategory>
  directing_department: Array<string>
  feedback?: Feedback['key']
  has_changed_children: []
  maincategory_slug: Array<ExtendedCategory>
  note_keyword: string
  priority: Array<string>
  punctuality?: Punctuality['key']
  routing_department: Array<string>
  source: Array<CategoryOption>
  stadsdeel: Array<CategoryOption>
  status: Array<CategoryOption>
}

type FilterState = {
  submitBtnLabel:
    | typeof DEFAULT_SUBMIT_BUTTON_LABEL
    | typeof SAVE_SUBMIT_BUTTON_LABEL
  filter: Filter
  options: Options
}

export const initialState: FilterState = {
  submitBtnLabel: DEFAULT_SUBMIT_BUTTON_LABEL,
  filter: {
    name: '',
    refresh: false,
    id: undefined,
  },
  options: {
    address_text: '',
    area: [],
    assigned_user_email: '',
    category_slug: [],
    directing_department: [],
    feedback: undefined,
    has_changed_children: [],
    maincategory_slug: [],
    note_keyword: '',
    priority: [],
    punctuality: undefined,
    routing_department: [],
    source: [],
    stadsdeel: [],
    status: [],
  },
}

type InitParams = {
  options: Options
  filter: Array<Record<keyof Filter, Filter[keyof Filter]>>
}

/**
 * State init function
 *
 * Merges incoming filter data with the initial state value
 */
export const init = ({ options, ...filter }: InitParams): FilterState => ({
  ...initialState,
  filter: {
    ...initialState.filter,
    ...filter,
  },
  options: {
    ...initialState.options,
    ...options,
  },
})

export default (state: FilterState, action: Actions): FilterState => {
  switch (action.type) {
    case RESET:
      return initialState

    case SET_ADDRESS:
      return {
        ...state,
        options: {
          ...state.options,
          address_text: action.payload,
        },
      }

    case SET_NOTE_KEYWORD:
      return {
        ...state,
        options: {
          ...state.options,
          note_keyword: action.payload,
        },
      }

    case SET_NAME:
      return {
        ...state,
        filter: {
          ...state.filter,
          name: action.payload,
        },
      }

    case SET_REFRESH:
      return {
        ...state,
        filter: {
          ...state.filter,
          refresh: action.payload,
        },
      }

    case SET_DATE:
    case SET_GROUP_OPTIONS:
      return {
        ...state,
        options: {
          ...state.options,
          ...action.payload,
        },
      }

    case SET_SAVE_BUTTON_LABEL:
      return {
        ...state,
        submitBtnLabel: action.payload
          ? SAVE_SUBMIT_BUTTON_LABEL
          : DEFAULT_SUBMIT_BUTTON_LABEL,
      }

    case SET_MAIN_CATEGORY:
      return {
        ...state,
        options: {
          ...state.options,
          category_slug: state.options.category_slug.filter(
            ({ _links }) =>
              _links?.['sia:parent']?.public.endsWith(
                action.payload.category.slug
              ) === false
          ),
          maincategory_slug: state.options.maincategory_slug
            .filter(({ slug }) => slug !== action.payload.category.slug)
            .concat(action.payload.isToggled ? action.payload.category : [])
            .filter(Boolean),
        },
      }

    case SET_CATEGORIES:
      return {
        ...state,
        options: {
          ...state.options,
          category_slug: state.options.category_slug
            .filter(
              ({ _links }) =>
                _links?.['sia:parent']?.public.endsWith(action.payload.slug) ===
                false
            )
            .concat(action.payload.subCategories)
            .filter(Boolean),
          maincategory_slug: state.options.maincategory_slug.filter(
            ({ _links }) =>
              _links.self.public.endsWith(action.payload.slug) === false
          ),
        },
      }
  }
}
