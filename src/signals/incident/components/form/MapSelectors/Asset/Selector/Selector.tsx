// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2020 - 2021 Gemeente Amsterdam
import { useMemo, useContext, useState, useCallback, useEffect } from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import { breakpoint } from '@amsterdam/asc-ui'

import type { FunctionComponent } from 'react'
import type {
  MapOptions,
  LeafletMouseEvent,
  Marker as MarkerType,
  Map as MapType,
  LatLngTuple,
} from 'leaflet'
import type { ZoomLevel } from '@amsterdam/arm-core/lib/types'
import type { Variant } from '@amsterdam/arm-core/lib/components/MapPanel/MapPanelContext'
import type { PdokResponse } from 'shared/services/map-location'

import { Marker } from '@amsterdam/react-maps'
import { MapPanel, MapPanelDrawer, MapPanelProvider } from '@amsterdam/arm-core'
import { SnapPoint } from '@amsterdam/arm-core/lib/components/MapPanel/constants'
import { useMatchMedia } from '@amsterdam/asc-ui/lib/utils/hooks'
import { formatAddress } from 'shared/services/format-address'

import Map from 'components/Map'
import MapCloseButton from 'components/MapCloseButton'
import PDOKAutoSuggest from 'components/PDOKAutoSuggest'

import MAP_OPTIONS from 'shared/services/configuration/map-options'
import { markerIcon } from 'shared/services/configuration/map-markers'
import configuration from 'shared/services/configuration/configuration'
import AssetSelectContext from 'signals/incident/components/form/MapSelectors/Asset/context'

import { UNREGISTERED_TYPE } from '../../constants'
import { MapMessage, ZoomMessage } from '../../components/MapMessage'
import LegendToggleButton from './LegendToggleButton'
import LegendPanel from './LegendPanel'
import ViewerContainer from './ViewerContainer'
import AssetLayer from './WfsLayer/AssetLayer'
import WfsLayer from './WfsLayer'
import SelectionPanel from './SelectionPanel'
import ButtonBar from './ButtonBar/ButtonBar'

const MAP_PANEL_DRAWER_SNAP_POSITIONS = {
  [SnapPoint.Closed]: '90%',
  [SnapPoint.Halfway]: '50%',
  [SnapPoint.Full]: '0',
}
const MAP_PANEL_SNAP_POSITIONS = {
  [SnapPoint.Closed]: '30px',
  [SnapPoint.Halfway]: '400px',
  [SnapPoint.Full]: '100%',
}

const MAP_CONTAINER_ZOOM_LEVEL: ZoomLevel = {
  max: 13,
}

const MAP_LOCATION_ZOOM = 14
const MAP_NO_LOCATION_ZOOM = 9

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100%;
  width: 100%;
  box-sizing: border-box; // Override box-sizing: content-box set by Leaflet
  z-index: 2; // position over the site header
`

const StyledMap = styled(Map)`
  height: 100%;
  width: 100%;
`

const StyledPDOKAutoSuggest = styled(PDOKAutoSuggest)`
  @media screen and (max-width: 300px) {
    top: 60px;
    width: calc(100vw - 32px);
  }

  @media screen and (min-width: 300px) {
    width: calc(100vw - 92px);
  }

  @media screen and ${breakpoint('min-width', 'tabletM')} {
    width: calc(100vw - 492px);
    max-width: 375px;
  }
`

const Selector = () => {
  // to be replaced with MOUNT_NODE
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const appHtmlElement = document.getElementById('app')!
  const {
    address,
    close,
    coordinates,
    layer,
    meta,
    selection,
    setLocation,
    fetchLocation,
  } = useContext(AssetSelectContext)
  const [desktopView] = useMatchMedia({ minBreakpoint: 'tabletM' })
  const { Panel, panelVariant } = useMemo<{
    Panel: FunctionComponent
    panelVariant: Variant
  }>(
    () =>
      desktopView
        ? { Panel: MapPanel, panelVariant: 'panel' }
        : { Panel: MapPanelDrawer, panelVariant: 'drawer' },
    [desktopView]
  )
  const center =
    coordinates || (configuration.map.options.center as LatLngTuple)

  const mapOptions: MapOptions = useMemo(
    () => ({
      ...MAP_OPTIONS,
      center,
      dragging: true,
      zoomControl: false,
      minZoom: 7,
      maxZoom: 16,
      zoom: coordinates ? MAP_LOCATION_ZOOM : MAP_NO_LOCATION_ZOOM,
    }),
    [center]
  )

  const [showLegendPanel, setShowLegendPanel] = useState(false)
  const [pinMarker, setPinMarker] = useState<MarkerType>()
  const [map, setMap] = useState<MapType>()
  const addressValue = address ? formatAddress(address) : ''
  const hasLegend = meta.featureTypes.length > 0

  const showMarker =
    coordinates && (!selection || selection.type === UNREGISTERED_TYPE)

  const mapClick = useCallback(
    ({ latlng }: LeafletMouseEvent) => {
      fetchLocation(latlng)
    },
    [fetchLocation]
  )

  const toggleLegend = useCallback(() => {
    setShowLegendPanel(!showLegendPanel)
  }, [showLegendPanel])

  const handleLegendCloseButton = () => {
    setShowLegendPanel(false)
  }

  const onAddressSelect = useCallback(
    (option: PdokResponse) => {
      const { location, address } = option.data
      setLocation({ coordinates: location, address })

      map?.flyTo(option.data.location, MAP_LOCATION_ZOOM)
    },
    [setLocation, map]
  )

  const Layer = layer || AssetLayer

  useEffect(() => {
    if (!map || !pinMarker || !coordinates || selection) return

    pinMarker.setLatLng(coordinates)
  }, [map, coordinates, pinMarker, selection])

  const mapWrapper = (
    <Wrapper data-testid="assetSelectSelector">
      <StyledMap
        hasZoomControls={desktopView}
        mapOptions={mapOptions}
        events={{ click: mapClick }}
        setInstance={setMap}
        hasGPSControl
      >
        <MapPanelProvider
          mapPanelSnapPositions={MAP_PANEL_SNAP_POSITIONS}
          mapPanelDrawerSnapPositions={MAP_PANEL_DRAWER_SNAP_POSITIONS}
          variant={panelVariant}
          initialPosition={SnapPoint.Halfway}
        >
          <ViewerContainer
            topLeft={
              <StyledPDOKAutoSuggest
                onSelect={onAddressSelect}
                placeholder="Zoek adres"
                value={addressValue}
              />
            }
            bottomLeft={
              hasLegend ? (
                <ButtonBar zoomLevel={MAP_CONTAINER_ZOOM_LEVEL}>
                  <LegendToggleButton
                    onClick={toggleLegend}
                    isRenderingLegendPanel={showLegendPanel}
                  />
                </ButtonBar>
              ) : null
            }
            topRight={
              <ButtonBar zoomLevel={MAP_CONTAINER_ZOOM_LEVEL}>
                <MapCloseButton onClick={close} />
              </ButtonBar>
            }
          />

          <Panel data-testid={`panel${desktopView ? 'Desktop' : 'Mobile'}`}>
            <SelectionPanel
              featureTypes={meta.featureTypes}
              language={meta.language}
              variant={panelVariant}
            />

            {showLegendPanel ? (
              <LegendPanel
                onClose={handleLegendCloseButton}
                variant={panelVariant}
                items={meta.featureTypes
                  .filter(({ typeValue }) => typeValue !== UNREGISTERED_TYPE) // Filter the unknown icon from the legend
                  .map((featureType) => ({
                    label: featureType.label,
                    iconUrl: featureType.icon.iconUrl,
                    id: featureType.typeValue,
                  }))}
              />
            ) : null}
          </Panel>
        </MapPanelProvider>

        <MapMessage />

        <ZoomMessage zoomLevel={MAP_CONTAINER_ZOOM_LEVEL}>
          Zoom in om de {meta?.language?.objectTypePlural || 'objecten'} te zien
        </ZoomMessage>

        <WfsLayer zoomLevel={MAP_CONTAINER_ZOOM_LEVEL}>
          <Layer featureTypes={meta.featureTypes} desktopView={desktopView} />
        </WfsLayer>

        {showMarker && (
          <span data-testid="assetPinMarker">
            <Marker
              key={Object.values(coordinates).toString()}
              setInstance={setPinMarker}
              args={[coordinates]}
              options={{
                icon: markerIcon,
                keyboard: false,
              }}
            />
          </span>
        )}
      </StyledMap>
    </Wrapper>
  )

  return ReactDOM.createPortal(mapWrapper, appHtmlElement)
}

export default Selector
