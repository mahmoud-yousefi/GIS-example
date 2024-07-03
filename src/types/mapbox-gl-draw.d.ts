declare module '@mapbox/mapbox-gl-draw' {
    import { IControl, Map, GeoJSONSourceRaw } from 'maplibre-gl';
  
    type DrawModes =
      | 'simple_select'
      | 'direct_select'
      | 'draw_point'
      | 'draw_line_string'
      | 'draw_polygon'
      | 'static';
  
    interface DrawOptions {
      displayControlsDefault?: boolean;
      controls?: {
        point?: boolean;
        line_string?: boolean;
        polygon?: boolean;
        trash?: boolean;
        combine_features?: boolean;
        uncombine_features?: boolean;
      };
      modes?: {
        [modeKey: string]: DrawModes;
      };
      defaultMode?: DrawModes;
      userProperties?: boolean;
    }
  
    export default class MapboxDraw implements IControl {
      constructor(options?: DrawOptions);
      onAdd(map: Map): HTMLElement;
      onRemove(map: Map): void;
      set(map: Map): void;
      getMode(): DrawModes;
      changeMode(mode: DrawModes, options?: any): void;
      getAll(): GeoJSON.FeatureCollection<GeoJSON.Geometry>;
      getSelectedIds(): string[];
      getSelected(): GeoJSON.FeatureCollection<GeoJSON.Geometry>;
      getSelectedPoints(): GeoJSON.FeatureCollection<GeoJSON.Geometry>;
      getFeatureIdsAt(point: { x: number; y: number }): string[];
      getFeature(id: string): GeoJSON.Feature<GeoJSON.Geometry> | null;
      select(id: string): void;
      delete(id: string): void;
      deleteAll(): void;
      add(geojson: GeoJSON.FeatureCollection<GeoJSON.Geometry> | GeoJSON.Feature<GeoJSON.Geometry>): string[];
      getModeOptions(): any;
      setFeatureProperty(featureId: string, property: string, value: any): void;
    }
  }
  