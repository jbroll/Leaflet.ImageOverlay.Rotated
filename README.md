# Leaflet ImageOverlay Transform

A Leaflet plugin that provides enhanced image overlay capabilities, allowing you to transform (rotate, scale, and move) images on Leaflet maps with interactive controls.

## Features

- **Rotated Image Overlays**: Display images at any angle on your map
- **Transform Controls**: Interactive handles for rotating and scaling images
- **Draggable**: Move images by dragging
- **Scale Control**: Adjust image size using meters per pixel
- **Center-based Positioning**: Position images using center point and transformation parameters
- **TypeScript Support**: Includes TypeScript type definitions

## Installation

You can install the package via npm:

```bash
npm install leaflet-imageoverlay-transform
```

Or include it directly in your HTML:

```html
<link rel="stylesheet" href="path/to/leaflet-imageoverlay-transform.css" />
<script src="path/to/leaflet-imageoverlay-rotated.js"></script>
<script src="path/to/leaflet-imageoverlay-transform.js"></script>
```

## Basic Usage

```javascript
// Create a map
var map = L.map('map').setView([51.505, -0.09], 13);

// Add your tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Define transform parameters
var transform = {
    center: L.latLng(51.505, -0.09),
    scale: 0.5,  // meters per pixel
    rotation: 45 // degrees
};

// Create and add the transform overlay
var overlay = L.imageOverlay.transform("path/to/image.jpg", transform, {
    opacity: 0.8,
    interactive: true
}).addTo(map);
```

## API Reference

### L.ImageOverlay.Transform

#### Creation

```javascript
L.imageOverlay.transform(<String|HTMLImageElement|HTMLCanvasElement> image, 
                        <Transform> transform, 
                        <ImageOverlayOptions> options?)
```

#### Transform Object

```typescript
interface Transform {
    center: L.LatLng;    // Center position of the image
    scale: number;       // Scale in meters per pixel
    rotation: number;    // Rotation in degrees
}
```

#### Methods

- `setTransform(transform: Transform)`: Update the image transformation
- `getTransform()`: Get current transform parameters
- `setInteractive(interactive: boolean)`: Enable/disable transform controls
- `setOpacity(opacity: number)`: Set the overlay opacity

#### Options

Extends standard Leaflet's `ImageOverlay` options with:

- `interactive: boolean` - Enable transform controls (default: false)
- All standard L.ImageOverlay options are supported

## Interactive Controls

When `interactive: true` is set, the overlay provides three ways to transform the image:

1. **Drag**: Click and drag the image to move it
2. **Rotate**: Use the handle above the image to rotate
3. **Scale**: Use the handle at the top-right corner to scale the image

## Events

The overlay extends Leaflet's ImageOverlay events and includes:

- Standard Leaflet events (`click`, `dblclick`, etc.)
- Mouse events for interaction with transform handles

## Browser Support

- Supports all modern browsers
- Requires Leaflet 1.0.0 or newer

## Building and Development

```bash
# Install dependencies
npm install

# Run development server
npm start

# Build for production
npm run build
```

## Examples

Check out the demo files included in the project:
- `demo.html`: Basic rotated image overlay demo
- `demo-transform.html`: Interactive transform controls demo

## License

This project is licensed under the Beerware License. See the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Credits

This plugin builds upon the work of:
- Original Leaflet.ImageOverlay.Rotated by Iván Sánchez Ortega
- Contributions from Julius Buset Asplin and other community members

## Support

For questions and support:
- Open an issue in the GitHub repository
- Check existing issues for similar problems
- Read the documentation carefully