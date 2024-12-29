import * as L from 'leaflet';

declare module 'leaflet' {
    interface ImageOverlayTransformOptions extends ImageOverlayOptions {
        interactive?: boolean;
    }

    interface Transform {
        center: L.LatLng;
        scale: number;  // meters per pixel
        rotation: number;  // degrees
    }

    namespace ImageOverlay {
        class Transform extends L.ImageOverlay.Rotated {
            constructor(
                image: string | HTMLImageElement | HTMLCanvasElement,
                transform: L.Transform,
                options?: ImageOverlayTransformOptions
            );

            setTransform(transform: L.Transform): void;
            getTransform(): L.Transform;
            setInteractive(interactive: boolean): void;
        }
    }

    namespace imageOverlay {
        function transform(
            image: string | HTMLImageElement | HTMLCanvasElement,
            transform: L.Transform,
            options?: ImageOverlayTransformOptions
        ): L.ImageOverlay.Transform;
    }
}