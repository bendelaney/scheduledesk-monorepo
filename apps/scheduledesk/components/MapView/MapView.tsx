'use client'

import React, { FC, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './MapView.scss';

type MapProps = {
  position: { lat: number, lng: number };
};

const MapView: FC<MapProps> = ({ position }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "?";

    map.current = new mapboxgl.Map({
      container: mapContainer.current as HTMLElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [position.lng, position.lat],
      zoom: 14
    });

    new mapboxgl.Marker().setLngLat([position.lng, position.lat]).addTo(map.current);
  }, [position]);

  return <div className="map-view" ref={mapContainer} />;
};

export default MapView;
