/*
 * 🍂class ImageOverlay.Transform
 * 🍂inherits ImageOverlay.Rotated
 *
 * An image overlay that can be positioned using a transform object containing
 * center position, scale (in meters per pixel), and rotation angle.
 */

const R = 6378137;  // Earth Radius

L.ImageOverlay.Transform = L.ImageOverlay.Rotated.extend({
    initialize: function(image, transform, options) {
        this._transform = transform || {
            center: L.latLng(0, 0),
            scale: 1,  // meters per pixel
            rotation: 0 // degrees
        };

        // Create temporary corners - will be updated when map is available
        const tempCorners = {
            topLeft: this._transform.center,
            topRight: this._transform.center,
            bottomLeft: this._transform.center
        };
        
        // Call parent initialize with temporary corners
        L.ImageOverlay.Rotated.prototype.initialize.call(
            this, 
            image, 
            tempCorners.topLeft,
            tempCorners.topRight,
            tempCorners.bottomLeft,
            options
        );

        // Bind methods
        this._onDrag = this._onDrag.bind(this);
        this._onRotate = this._onRotate.bind(this);
        this._onScale = this._onScale.bind(this);
    },

    onAdd: function(map) {
        L.ImageOverlay.Rotated.prototype.onAdd.call(this, map);
        
        // Now that we have the map, update corners
        this._updateCorners();
        
        if (this.options.interactive) {
            // Wait for image to load before initializing handles
            if (this._rawImage.complete) {
                this._initializeHandles();
            } else {
                this._rawImage.addEventListener('load', () => {
                    this._updateCorners();
                    this._initializeHandles();
                });
            }
        }
    },

    onRemove: function(map) {
        if (this._rotationHandle) {
            this._rotationHandle.remove();
            this._scaleHandle.remove();
        }
        L.ImageOverlay.Rotated.prototype.onRemove.call(this, map);
    },

    setTransform: function(transform) {
        this._transform = transform;
        this._updateCorners();
    },

    getTransform: function() {
        return { ...this._transform };
    },

    _initializeHandles: function() {
        if (!this._map) return;

        // Create rotation handle with explicit div structure
        this._rotationHandle = L.marker(this._calculateRotationHandlePosition(), {
            draggable: true,
            icon: L.divIcon({
                className: '',  // Empty to prevent leaflet-div-icon class
                html: '<div class="leaflet-image-transform-handle leaflet-image-rotate-handle"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            })
        }).addTo(this._map);

        // Create scale handle with explicit div structure
        this._scaleHandle = L.marker(this._calculateScaleHandlePosition(), {
            draggable: true,
            icon: L.divIcon({
                className: '',  // Empty to prevent leaflet-div-icon class
                html: '<div class="leaflet-image-transform-handle leaflet-image-scale-handle"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            })
        }).addTo(this._map);

        // Add event listeners
        this._image.addEventListener('mousedown', this._onDragStart.bind(this));
        this._rotationHandle.on('drag', this._onRotate);
        this._scaleHandle.on('drag', this._onScale);

        // Debug logging
        console.log('Rotation handle created:', this._rotationHandle);
        console.log('Scale handle created:', this._scaleHandle);

        // Stop map drag when interacting with handles
        this._rotationHandle.on('mousedown', () => {
            this._map.dragging.disable();
        });
        this._scaleHandle.on('mousedown', () => {
            this._map.dragging.disable();
        });
    },


    _updateCorners: function() {
        if (!this._map || !this._rawImage) return;
        
        const corners = this._calculateCorners();
        this.reposition(corners.topLeft, corners.topRight, corners.bottomLeft);
        
        if (this._rotationHandle) {
            this._rotationHandle.setLatLng(this._calculateRotationHandlePosition());
            this._scaleHandle.setLatLng(this._calculateScaleHandlePosition());
        }
    },


    _metersToLatLng: function(centerLatLng, xMeters, yMeters) {
        
        const lat = centerLatLng.lat + (yMeters / R) * (180 / Math.PI);
        const lng = centerLatLng.lng + (xMeters / R) * (180 / Math.PI) / Math.cos(centerLatLng.lat * Math.PI / 180);
        
        return L.latLng(lat, lng);
    },

    _latLngToMeters: function(centerLatLng, point) {
        const latDiff = (point.lat - centerLatLng.lat) * Math.PI / 180;
        const lngDiff = (point.lng - centerLatLng.lng) * Math.PI / 180;
        
        const yMeters = R * latDiff;
        const xMeters = R * lngDiff * Math.cos(centerLatLng.lat * Math.PI / 180);
        
        return { x: xMeters, y: yMeters };
    },

    _calculateCorners: function() {
        const center = this._transform.center;
        
        // Image dimensions in meters
        const widthMeters = this._rawImage.width * this._transform.scale;
        const heightMeters = this._rawImage.height * this._transform.scale;
        
        // Convert rotation to radians
        const rotation = (this._transform.rotation * Math.PI) / 180;
        
        // Helper function to rotate a point around origin
        const rotatePoint = (x, y) => {
            const cos = Math.cos(rotation);
            const sin = Math.sin(rotation);
            return {
                x: x * cos - y * sin,
                y: x * sin + y * cos
            };
        };

        // Calculate corners in meters from center
        const halfWidth = widthMeters / 2;
        const halfHeight = heightMeters / 2;
        
        // Calculate rotated corners in meters
        const topLeft = rotatePoint(-halfWidth, -halfHeight);
        const topRight = rotatePoint(halfWidth, -halfHeight);
        const bottomLeft = rotatePoint(-halfWidth, halfHeight);
        
        // Convert meter offsets to LatLng
        return {
            topLeft: this._metersToLatLng(center, topLeft.x, topLeft.y),
            topRight: this._metersToLatLng(center, topRight.x, topRight.y),
            bottomLeft: this._metersToLatLng(center, bottomLeft.x, bottomLeft.y)
        };
    },

    _onScale: function(e) {
        const center = this._transform.center;
        const handle = e.target.getLatLng();
        
        // Convert the handle position to meters from center
        const handleMeters = this._latLngToMeters(center, handle);
        
        // Calculate distance in meters
        const distance = Math.sqrt(
            Math.pow(handleMeters.x, 2) + 
            Math.pow(handleMeters.y, 2)
        );
        
        // Update scale based on distance
        // This gives us meters per pixel
        const newScale = distance / (this._rawImage.width / 2);
        
        this.setTransform({
            ...this._transform,
            scale: newScale
        });
    },

    _onDragStart: function(e) {
        // Stop event propagation to prevent map dragging
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);

        // Disable map dragging
        if (this._map) {
            this._map.dragging.disable();
        }

        this._isDragging = true;
        this._startPos = this._map.mouseEventToLatLng(e);
        this._startTransform = { ...this._transform };

        document.addEventListener('mousemove', this._onDrag);
        document.addEventListener('mouseup', () => {
            this._isDragging = false;
            // Re-enable map dragging
            if (this._map) {
                this._map.dragging.enable();
            }
            document.removeEventListener('mousemove', this._onDrag);
        }, { once: true });
    },

    _onDrag: function(e) {
        if (!this._isDragging) return;

        // Convert mouse position to map coordinates
        const containerPoint = L.point(e.clientX, e.clientY)
            .subtract(this._map.getContainer().getBoundingClientRect());
        const newPos = this._map.containerPointToLatLng(containerPoint);
        
        const latDiff = newPos.lat - this._startPos.lat;
        const lngDiff = newPos.lng - this._startPos.lng;
        
        this.setTransform({
            ...this._transform,
            center: L.latLng(
                this._startTransform.center.lat + latDiff,
                this._startTransform.center.lng + lngDiff
            )
        });

        // Prevent default browser drag behavior
        e.preventDefault();
    },

    _onRotate: function(e) {
        const center = this._transform.center;
        const handle = e.target.getLatLng();
        
        // Calculate angle between center and handle
        const point1 = this._map.latLngToLayerPoint(center);
        const point2 = this._map.latLngToLayerPoint(handle);
        
        const angle = (Math.atan2(point2.y - point1.y, point2.x - point1.x) * 180) / Math.PI;
        
        this.setTransform({
            ...this._transform,
            rotation: angle
        });
    },

    _calculateRotationHandlePosition: function() {
        const heightMeters = this._rawImage.height * this._transform.scale;
        const handleOffset = heightMeters * 0.55;

        return this._metersToLatLng(this._transform.center, 0, -handleOffset);
    },

    _calculateScaleHandlePosition: function() {
        const corners = this._calculateCorners();
        return corners.topRight;
    }

});

// Factory methods
L.ImageOverlay.transform = function(imgSrc, transform, options) {
    return new L.ImageOverlay.Transform(imgSrc, transform, options);
};

// Add to the L.imageOverlay namespace for consistency with other Leaflet factory methods
L.imageOverlay.transform = L.ImageOverlay.transform;
