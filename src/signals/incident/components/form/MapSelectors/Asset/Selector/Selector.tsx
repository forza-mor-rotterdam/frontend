// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2020 - 2022 Gemeente Amsterdam
import {
  useMemo,
  useContext,
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
} from 'react'
import ReactDOM from 'react-dom'
import { Marker } from '@amsterdam/react-maps'
import { useMatchMedia } from '@remcohoff/asc-ui/lib/utils/hooks'
import { disablePageScroll, enablePageScroll } from 'scroll-lock'

import type { ReactElement, FC } from 'react'
import type {
  MapOptions,
  LeafletMouseEvent,
  Marker as MarkerType,
  Map as MapType,
  LatLngTuple,
} from 'leaflet'
import type { ZoomLevel } from '@amsterdam/arm-core/lib/types'
import type { LocationResult } from 'types/location'

import useDelayedDoubleClick from 'hooks/useDelayedDoubleClick'
import MAP_OPTIONS from 'shared/services/configuration/map-options'
import { markerIcon } from 'shared/services/configuration/map-markers'
import configuration from 'shared/services/configuration/configuration'
import AssetSelectContext from 'signals/incident/components/form/MapSelectors/Asset/context'
import MapCloseButton from 'components/MapCloseButton'
import GPSButton from 'components/GPSButton'

import { useDispatch, useSelector } from 'react-redux'
import { closeMap } from 'signals/incident/containers/IncidentContainer/actions'
import { makeSelectMaxAssetWarning } from 'signals/incident/containers/IncidentContainer/selectors'
import { selectionIsUndetermined } from '../../constants'
import { MapMessage, ZoomMessage } from '../../components/MapMessage'
import AssetLayer from './WfsLayer/AssetLayer'
import WfsLayer from './WfsLayer'
import NearbyLayer from './NearbyLayer'
import {
  StyledMap,
  StyledViewerContainer,
  TopLeftWrapper,
  Wrapper,
} from './styled'
import DetailPanel from './DetailPanel'

const MAP_CONTAINER_ZOOM_LEVEL: ZoomLevel = {
  max: 13,
}

export const MAP_LOCATION_ZOOM = 14

const Selector: FC = () => {
  // to be replaced with MOUNT_NODE
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const appHtmlElement = document.getElementById('app')!
  const { coordinates, layer, meta, selection, fetchLocation } =
    useContext(AssetSelectContext)
  const { maxAssetWarning } = useSelector(makeSelectMaxAssetWarning)
  const maxNumberOfAssets = meta?.maxNumberOfAssets || 1
  const [desktopView] = useMatchMedia({ minBreakpoint: 'laptop' })

  const dispatch = useDispatch()

  const center =
    coordinates || (configuration.map.options.center as LatLngTuple)

  const mapOptions: MapOptions = useMemo(
    () => ({
      minZoom: 7,
      maxZoom: 16,
      ...MAP_OPTIONS,
      center,
      dragging: true,
      zoomControl: false,
      scrollWheelZoom: true,
      zoom: coordinates
        ? Math.min(
            MAP_LOCATION_ZOOM,
            MAP_OPTIONS.maxZoom || Number.POSITIVE_INFINITY
          )
        : MAP_OPTIONS.zoom,
    }),
    [center, coordinates]
  )

  const [mapMessage, setMapMessage] = useState<ReactElement | string>()
  const [maxAssetWarningActive, setMaxAssetWarningActive] = useState(true)
  const [pinMarker, setPinMarker] = useState<MarkerType>()
  const [map, setMap] = useState<MapType>()
  const hasFeatureTypes = meta.featureTypes.length > 0

  const showMarker =
    coordinates && (!selection || selectionIsUndetermined(selection[0]))

  const mapClick = useCallback(
    ({ latlng }: LeafletMouseEvent) => {
      fetchLocation(latlng)
    },
    [fetchLocation]
  )

  const { click, doubleClick } = useDelayedDoubleClick(mapClick)

  const Layer = layer || AssetLayer

  useEffect(() => {
    if (!map || !pinMarker || !coordinates || selection) return

    pinMarker.setLatLng(coordinates)
  }, [map, coordinates, pinMarker, selection])

  useLayoutEffect(() => {
    if (!map || !coordinates) return

    const zoomLevel = mapOptions.zoom
      ? Math.max(map.getZoom(), mapOptions.zoom)
      : map.getZoom()

    map.flyTo(coordinates, zoomLevel)
  }, [coordinates, map, mapOptions.zoom])

  useEffect(() => {
    global.window.scrollTo(0, 0)

    disablePageScroll()

    return enablePageScroll
  }, [])

  useEffect(() => {
    if (maxAssetWarning && maxAssetWarningActive) {
      const number =
        maxNumberOfAssets === 1
          ? meta?.language?.objectTypeSingular || 'object'
          : meta?.language?.objectTypePlural || 'objecten'
      setMapMessage(`U kunt maximaal ${maxNumberOfAssets} ${number} kiezen.`)
    }
  }, [
    maxAssetWarning,
    maxAssetWarningActive,
    maxNumberOfAssets,
    mapMessage,
    meta?.language?.objectTypePlural,
    meta?.language?.objectTypeSingular,
  ])

  useEffect(() => {
    if (!maxAssetWarning || !selection || selection.length === 0) {
      setMaxAssetWarningActive(true)
    }
  }, [maxAssetWarningActive, maxAssetWarning, selection])

  const mapWrapper = (
    <Wrapper data-testid="assetSelectSelector">
      <DetailPanel language={meta.language} />

      <StyledMap
        hasZoomControls={desktopView}
        mapOptions={mapOptions}
        events={{ click, dblclick: doubleClick }}
        setInstance={setMap}
        hasGPSControl
      >
        <StyledViewerContainer
          topLeft={
            <TopLeftWrapper>
              <GPSButton
                tabIndex={0}
                onLocationSuccess={(location: LocationResult) => {
                  const coordinates = {
                    lat: location.latitude,
                    lng: location.longitude,
                  }
                  fetchLocation(coordinates)
                }}
                onLocationError={() => {
                  setMapMessage(
                    <>
                      <strong>
                        {`${configuration.language.siteAddress} heeft geen
                            toestemming om uw locatie te gebruiken.`}
                      </strong>
                      <p>
                        Dit kunt u wijzigen in de voorkeuren of instellingen van
                        uw browser of systeem.
                      </p>
                    </>
                  )
                }}
                onLocationOutOfBounds={() => {
                  setMapMessage(
                    'Uw locatie valt buiten de kaart en is daardoor niet te zien'
                  )
                }}
              />

              {hasFeatureTypes && (
                <ZoomMessage
                  data-testid="zoomMessage"
                  zoomLevel={MAP_CONTAINER_ZOOM_LEVEL}
                >
                  Zoom in om de {meta?.language?.objectTypePlural || 'objecten'}{' '}
                  te zien
                </ZoomMessage>
              )}

              {mapMessage && (
                <MapMessage
                  data-testid="mapMessage"
                  onClick={() => {
                    setMapMessage('')
                    setMaxAssetWarningActive(false)
                  }}
                >
                  {mapMessage}
                </MapMessage>
              )}
            </TopLeftWrapper>
          }
          topRight={
            <MapCloseButton onClick={() => dispatch(closeMap())} tabIndex={0} />
          }
        />

        <WfsLayer zoomLevel={MAP_CONTAINER_ZOOM_LEVEL}>
          <>
            <Layer />
            <NearbyLayer zoomLevel={MAP_CONTAINER_ZOOM_LEVEL} />
          </>
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
