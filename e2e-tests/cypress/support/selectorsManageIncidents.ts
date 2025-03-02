// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2020 - 2021 Gemeente Amsterdam

export const DASHBOARD = {
  bar: '[data-testid=bar]',
  barSignalcount: '[data-testid=value]',
  barSubcategory: '[data-testid=description]',
  checkmarkIcon: '[data-testid=checkmark]',
  graphDescription: '[data-testid=graph-description]',
  graphTitle: '[data-testid=graph-title]',
  graphTotalSignals: '[data-testid=total-open]',
  emptyText: '[data-testid=empty-text]',
  heading: '[data-testid=heading]',
  noSignalsText: '[data-testid=empty-text]',
};

export const FILTER = {
  buttonSubmitFilter: '[data-testid=submitBtn]',
  buttonNieuwFilter: '[data-testid=resetBtn]',
  buttonCancel: '[data-testid=cancelBtn]',
  checkboxASC: '[data-testid="checkbox-directing_department_ASC"]',
  checkboxBronInterswitch: '[data-testid="checkbox-source_Telefoon – Interswitch"]',
  checkboxDeelmelding: '[data-testid="checkbox-kind_child_signal"]',
  checkboxGemeld: '#status_m',
  checkboxHoofdmelding: '[data-testid="checkbox-kind_parent_signal"]',
  checkboxHoofdmeldingWijzigingDeelmelding: '[data-testid="checkbox-has_changed_children_true"]',
  checkboxHoofdmeldingGeenWijzigingDeelmelding: '[data-testid="checkbox-has_changed_children_false"]',
  checkboxMelding: '[data-testid="checkbox-kind_signal"]',
  checkboxRefresh: '#filter_refresh',
  checkboxTypeKlacht: '[data-testid="checkbox-type_COM"]',
  checkboxUrgentieHoog: '[data-testid="checkbox-priority_high"]',
  checkboxVerantwoordelijkeAfdeling: '[data-testid="checkbox-directing_department_null"]',
  inputFilterAddres: '[data-testid="filterAddress"]',
  inputFilterDayBefore: '#filter_created_before',
  inputFilterDayFrom: '#filter_created_after',
  inputFilterName: '#filter_name',
  inputSearchInNote: '#filter_notes',
};

export const FILTER_ALL_ITEMS = {
  selectAllStatus: '[data-testid=statusCheckboxGroup] > [data-testid=checkboxList] > [class*=CheckboxList__Toggle]',
  selectAllStadsdelen:
    '[data-testid=stadsdeelCheckboxGroup] > [data-testid=checkboxList] > [class*=CheckboxList__Toggle]',
  selectAllSource: '[data-testid=sourceCheckboxGroup] > [data-testid=checkboxList] > [class*=CheckboxList__Toggle]',
  selectAllGarbage: '[class*=CheckboxList__Toggle] > [data-id*=afval]',
  selectAllCivilConstructs: '[class*=CheckboxList__Toggle] > [data-id*=civiele-constructies]',
  selectAllSubversion: '[class*=CheckboxList__Toggle] > [data-id*=ondermijning]',
  selectAllPublicParksWater: '[class*=CheckboxList__Toggle] > [data-id*=openbaar-groen-en-water]',
  selectAllOther: '[class*=CheckboxList__Toggle] > [data-id*=overig]',
  selectAllDisturbanceCompanies: '[class*=CheckboxList__Toggle] > [data-id*=overlast-bedrijven-en-horeca]',
  selectAllDisturbancePublicSpace: '[class*=CheckboxList__Toggle] > [data-id*=overlast-in-de-openbare-ruimte]',
  selectAllDisturbanceWater: '[class*=CheckboxList__Toggle] > [data-id*=overlast-op-het-water]',
  selectAllDisturbanceAnimals: '[class*=CheckboxList__Toggle] > [data-id*=overlast-van-dieren]',
  selectAllDisturbancePersonsGroups:
    '[class*=CheckboxList__Toggle] > [data-id*=overlast-van-en-door-personen-of-groepen]',
  selectAllClean: '[class*=CheckboxList__Toggle] > [data-id*=schoon]',
  selectAllRoadsTraffic: '[class*=CheckboxList__Toggle] > [data-id*=wegen-verkeer-straatmeubilair]',
  selectAllLiving: '[class*=CheckboxList__Toggle] > [data-id*=wonen]',
};

export const MANAGE_SIGNALS = {
  buttonMijnFilters: '[data-testid=myFiltersModalBtn]',
  buttonCloseMijnFilters: '[data-testid=closeBtn]',
  buttonFilter: '[data-testid=filterModalBtn]',
  clearSearchTerm: '[aria-label="Close"]',
  signalAdres: '[data-testid="incidentAddress"]',
  signalDag: '[data-testid="incidentDaysOpen"]',
  signalDatumTijd: '[data-testid=incidentCreatedAt]',
  signalParentIcon: '[data-testid=parentIcon]',
  signalId: '[data-testid=incidentId]',
  signalStadsdeelName: '[data-testid=incidentArea]',
  signalStatus: '[data-testid=incidentStatus]',
  signalSubcategorie: '[data-testid=incidentSubcategory]',
  signalUrgentie: '[data-testid=incidentUrgency]',
  filterTagList: '[data-testid=filterTagListTag]',
  labelHoofmelding: '[aria-label="Hoofdmelding"]',
  paginationPages: '[data-testid="pagination"] > ul > li',
  refreshIcon: '[data-testid=refreshIcon]',
  searchBar: '[data-testid="searchBar"]',
  searchResultsTag: '[class*=PageHeader__SubTitle]',
  spinner: '[data-testid="loadingIndicator"]',
  stadsdeelFromSignal: 'tr td:nth-child(4)',
};

export const MY_FILTERS = {
  buttonDeleteFilter: '[data-testid=handleRemoveFilterButton]',
};

export const OVERVIEW_MAP = {
  autoSuggest: '[data-testid=autoSuggest]',
  buttonBack: '[data-testid=backlink]',
  buttonZoomOut: '[title="Uitzoomen"]',
  buttonZoomIn: '[title="Inzoomen"]',
  clusterIcon: '[data-testid=markerClusterIcon]',
  detailPane: '[data-testid=mapDetailPanel]',
  markerCluster: '.leaflet-marker-icon',
  markerSignal: '.map-marker-incident',
  overViewMap: '[data-testid="overviewMap"]',
  signalDetails: '[data-testid=mapDetailPanel]',
};
