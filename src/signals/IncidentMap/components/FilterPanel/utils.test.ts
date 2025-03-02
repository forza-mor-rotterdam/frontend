import type Categories from 'types/api/categories'

import { fetchCategoriesResponse } from '../__test__'
import { getFilterCategoriesWithIcons } from './utils'

describe('getFilterCategoriesWithIcon', () => {
  const mockData =
    fetchCategoriesResponse.results as unknown as Categories['results']

  it('should return only public accessible categories as filter', () => {
    const results = getFilterCategoriesWithIcons(mockData)

    expect(
      results.find(
        (filter) => filter.slug === 'container-voor-plastic-afval-is-vol'
      )
    ).toBeUndefined()

    expect(results.find((filter) => filter.slug === 'afval')).toBeTruthy()
  })

  it('should return filters with icon if available', () => {
    const results = getFilterCategoriesWithIcons(mockData)

    expect(
      results.find((filter) => filter.slug === 'overig')?.icon
    ).toBeUndefined()

    expect(
      results.find((filter) => filter.slug === 'overlast-bedrijven-en-horeca')
        ?.icon
    ).toEqual(
      'https://ae70d54aca324d0480ca01934240c78f.objectstore.eu/signals/icons/categories/overlast-bedrijven-en-horeca/bedrijven.svg?temp_url_sig=44addc6725e4523b2115f0285d9312c35d006533aee756b3b77344b71c75b98d&temp_url_expires=1665401495'
    )
  })
})
