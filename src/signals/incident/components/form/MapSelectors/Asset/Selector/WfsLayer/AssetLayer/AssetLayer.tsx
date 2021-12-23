// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2021 Gemeente Amsterdam
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import L from 'leaflet'
import { useMapInstance } from '@amsterdam/react-maps'
import isEqual from 'lodash/isEqual'

import type {
  LatLng,
  MarkerCluster as LeafletMarkerCluster,
  LatLngLiteral,
} from 'leaflet'
import type {
  Point,
  Feature as GeoJSONFeature,
  FeatureCollection,
} from 'geojson'
import type { FunctionComponent } from 'react'
import type { Item } from 'signals/incident/components/form/MapSelectors/Asset/types'
import type { Geometrie } from 'types/incident'

import reverseGeocoderService from 'shared/services/reverse-geocoder'
import AssetSelectContext from 'signals/incident/components/form/MapSelectors/Asset/context'
import { featureTolocation } from 'shared/services/map-location'
import MarkerCluster from 'components/MarkerCluster'

import configuration from 'shared/services/configuration/configuration'
import featureSelectedUrl from 'shared/images/featureSelected.svg?url'
import WfsDataContext from '../context'
import type { DataLayerProps, Feature } from '../../../types'

const SELECTED_CLASS_MODIFIER = '--selected'

export interface ClusterLayer extends L.GeoJSON<Point> {
  _maxZoom?: number
}

export interface ClusterMarker extends L.Layer {
  __parent: ClusterMarker
  _zoom: number
  _childCount: number
  _childClusters: ClusterMarker[]
  getLatLng: () => LatLng
  spiderfy: () => void
  unspiderfy: () => void
  zoomToBounds: (options: any) => void
}

/**
 * @description Recursive function that searches for the correct marker for a zoom level inside the cluster
 */
export const getMarkerByZoomLevel = (
  parent: ClusterMarker,
  zoom: number
): ClusterMarker | undefined => {
  if (parent._zoom === zoom) return parent
  if (!parent.__parent) return undefined
  return getMarkerByZoomLevel(parent.__parent, zoom)
}
/**
 * @description Depending on the zoomlevel, a cluster should be:
 *              - spyderfied when the current zoom level is the max zoom level
 *              - zoomed to when the zoom level is not max zoom level.
 */
export const shouldSpiderfy = (
  cluster: ClusterMarker,
  maxZoom?: number
): boolean => {
  let bottomCluster = cluster
  while (bottomCluster._childClusters.length === 1) {
    bottomCluster = bottomCluster._childClusters[0]
  }

  return (
    bottomCluster._zoom === maxZoom &&
    bottomCluster._childCount === cluster._childCount
  )
}

export const AssetLayer: FunctionComponent<DataLayerProps> = ({
  featureTypes,
  desktopView,
  allowClusters,
}) => {
  const mapInstance = useMapInstance()
  const [layerInstance, setLayerInstance] = useState<ClusterLayer>()
  const selectedCluster = useRef<ClusterMarker>()
  const data = useContext<FeatureCollection>(WfsDataContext)
  const { selection, removeItem, setItem } = useContext(AssetSelectContext)

  /* istanbul ignore next */
  useEffect(() => {
    function onMoveEnd() {
      selectedCluster.current = undefined
    }

    mapInstance.on('moveend', onMoveEnd)

    return () => {
      mapInstance.off('moveend', onMoveEnd)
    }
  }, [mapInstance])

  const iconCreateFunction = useCallback(
    /* istanbul ignore next */ (cluster: LeafletMarkerCluster) => {
      const childCount = cluster.getChildCount()
      const hasSelectedChildren = cluster
        .getAllChildMarkers()
        .some((marker) =>
          marker.options.icon?.options.className?.includes(
            SELECTED_CLASS_MODIFIER
          )
        )

      return new L.DivIcon({
        html: `<div data-testid="markerClusterIcon"><span>${childCount}</span></div>`,
        className: `marker-cluster${
          hasSelectedChildren ? ` marker-cluster${SELECTED_CLASS_MODIFIER}` : ''
        }`,
        iconSize: new L.Point(40, 40),
      })
    },
    []
  )

  const clusterOptions = useMemo(
    () => ({
      disableClusteringAtZoom: allowClusters
        ? configuration.map.options.maxZoom
        : configuration.map.options.minZoom,
      zoomToBoundsOnClick: true,
      iconCreateFunction,
    }),
    [iconCreateFunction, allowClusters]
  )

  const getFeatureType = useCallback(
    (feature: Feature) => {
      return featureTypes.find(
        ({ typeField, typeValue }) =>
          feature.properties[typeField] === typeValue
      )
    },
    [featureTypes]
  )

  const options = useMemo(
    () => ({
      pointToLayer: (feature: Feature, latlng: LatLngLiteral) => {
        const featureType = getFeatureType(feature)
        if (!featureType) return L.marker({ ...latlng, lat: 0, lng: 0 })

        const { description, typeValue, idField } = featureType
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const id = feature.properties[idField]!
        const isSelectedItem = selection?.id === id

        const iconUrl = isSelectedItem
          ? featureSelectedUrl
          : featureType.icon.iconUrl

        const marker = L.marker(latlng, {
          icon: L.icon({
            ...featureType.icon.options,
            /* istanbul ignore next */
            className: `marker-icon${
              isSelectedItem ? SELECTED_CLASS_MODIFIER : ''
            }`,
            iconUrl,
          }),
          alt: `${featureType.description} - ${
            feature.properties[featureType.idField]
          }`,
        })

        marker.on(
          'click',
          /* istanbul ignore next */ async () => {
            if (typeValue === 'reported') {
              return
            }

            if (isSelectedItem) {
              removeItem()
              return
            }

            const coordinates = featureTolocation(feature.geometry as Geometrie)

            const item: Item = {
              location: {
                coordinates,
              },
              description,
              id,
              type: typeValue,
              isReported: feature.properties.meldingstatus === 1,
            }

            const response = await reverseGeocoderService(coordinates)

            if (response) {
              item.location.address = response.data.address
            }

            setItem(item)
          }
        )

        return marker
      },
    }),
    [getFeatureType, removeItem, selection, setItem]
  )

  useEffect(() => {
    if (layerInstance) {
      layerInstance.clearLayers()
      data.features.forEach((feature) => {
        const pointFeature: GeoJSONFeature<Point, any> = {
          ...feature,
          geometry: { ...(feature.geometry as Point) },
        }
        const latlng = featureTolocation(feature.geometry as Geometrie)
        const marker = options.pointToLayer(pointFeature, latlng)

        /* istanbul ignore else */
        if (marker) {
          layerInstance.addLayer(marker)
        }
      })

      layerInstance.on(
        'clusterclick',
        /* istanbul ignore next */ (event: { layer: ClusterMarker }) => {
          const { _maxZoom: maxZoom } = layerInstance
          if (shouldSpiderfy(event.layer, maxZoom)) {
            if (selectedCluster.current) {
              event.layer.spiderfy()
              const latlng = event.layer.getLatLng()
              const selectedLatLng = selectedCluster.current.getLatLng()

              if (!isEqual(latlng, selectedLatLng))
                selectedCluster.current = event.layer
            } else {
              selectedCluster.current = event.layer
              selectedCluster.current.spiderfy()
            }
          } else {
            // use this offset (x, y form the bottom right corner of the map)
            // when zooming to bounds to keep the markers above the panel in mobile view
            const zoomOffset = desktopView ? [0, 0] : [0, 300]
            event.layer.zoomToBounds({ paddingBottomRight: zoomOffset })
          }
        }
      )

      /* istanbul ignore next */
      if (selectedCluster.current) {
        const selectedLatLng = selectedCluster.current.getLatLng()
        const cluster = (layerInstance.getLayers() as ClusterMarker[]).find(
          (layer) => {
            const latlng = layer.__parent.getLatLng()
            return isEqual(latlng, selectedLatLng)
          }
        )

        const parent = getMarkerByZoomLevel(
          cluster as any,
          mapInstance.getZoom()
        )

        if (parent) {
          selectedCluster.current = parent
          selectedCluster.current.spiderfy()
        }
      }
    }

    return () => {
      if (layerInstance) {
        layerInstance.off('clusterclick')
      }
    }
  }, [layerInstance, data, options, selectedCluster, mapInstance, desktopView])

  return (
    <MarkerCluster
      clusterOptions={clusterOptions}
      setInstance={setLayerInstance}
    />
  )
}

export default AssetLayer
