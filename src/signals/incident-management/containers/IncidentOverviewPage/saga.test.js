import { call, put, takeLatest, select, all } from 'redux-saga/effects';
import { push } from 'react-router-redux';
import { authCall } from 'shared/services/api/api';
import request from 'utils/request';

import { REQUEST_INCIDENTS, REQUEST_CATEGORIES, INCIDENT_SELECTED } from './constants';
import { requestIncidentsError, requestCategoriesSuccess, requestCategoriesError, filterIncidentsChanged, pageIncidentsChanged } from './actions';
import watchRequestIncidentSaga, { fetchIncidents, fetchCategories, openIncident } from './saga';
import { makeSelectFilterParams } from './selectors';
import mapCategories from './services/map-categories';

jest.mock('shared/services/api/api');
jest.mock('./selectors', () => {
  function mockedMakeSelectFilterParams() { }
  return ({
    makeSelectFilterParams: () => mockedMakeSelectFilterParams,
  });
});
jest.mock('./services/map-categories');

describe('IncidentOverviewPage saga', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });
  it('should watchRequestIncidentsSaga', () => {
    const gen = watchRequestIncidentSaga();
    expect(gen.next().value).toEqual(
      all([
        takeLatest(REQUEST_INCIDENTS, fetchIncidents),
        takeLatest(REQUEST_CATEGORIES, fetchCategories),
        takeLatest(INCIDENT_SELECTED, openIncident)
      ]
    )); // eslint-disable-line redux-saga/yield-effects
  });

  it('should openIncident success', () => {
    const id = 1000;
    const incident = { id };
    const action = { payload: incident };
    const navigateUrl = `incident/${incident.id}`;

    const gen = openIncident(action);
    expect(gen.next().value).toEqual(put(push(navigateUrl))); // eslint-disable-line redux-saga/yield-effects
  });

  it('should fetchIncidents success', () => {
    const filter = { name: 'filter' };
    const page = 2;
    const action = { payload: { filter, page } };

    const requestURL = 'https://acc.a pi.data.amsterdam.nl/signals/auth/signal';
    const params = { test: 'test' };

    const gen = fetchIncidents(action);
    expect(gen.next().value).toEqual(put(filterIncidentsChanged(filter))); // eslint-disable-line redux-saga/yield-effects
    expect(gen.next().value).toEqual(put(pageIncidentsChanged(page))); // eslint-disable-line redux-saga/yield-effects
    expect(gen.next().value).toEqual(select(makeSelectFilterParams())); // eslint-disable-line redux-saga/yield-effects
    expect(gen.next(params).value).toEqual(authCall(requestURL, params)); // eslint-disable-line redux-saga/yield-effects
  });

  it('should fetchIncidents error', () => {
    const id = 1000;
    const action = { payload: id };
    const error = new Error('404 Not Found');

    const gen = fetchIncidents(action);
    gen.next();
    expect(gen.throw(error).value).toEqual(put(requestIncidentsError(error))); // eslint-disable-line redux-saga/yield-effects
  });

  describe('fetchCategories', () => {
    it('should success', () => {
      const categories = { categories: [1], subcategorie: [2] };

      mapCategories.mockImplementation(() => categories);
      const requestURL = 'https://acc.api.data.amsterdam.nl/signals/v1/public/terms/categories';

      const gen = fetchCategories();
      expect(gen.next().value).toEqual(call(request, requestURL)); // eslint-disable-line redux-saga/yield-effects
      expect(gen.next(categories).value).toEqual(put(requestCategoriesSuccess(categories))); // eslint-disable-line redux-saga/yield-effects
    });

    it('should error', () => {
      const error = new Error('404 Not Found');

      const gen = fetchCategories();
      gen.next();
      expect(gen.throw(error).value).toEqual(put(requestCategoriesError(error))); // eslint-disable-line redux-saga/yield-effects
    });
  });
});
