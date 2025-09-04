# Frames with Fabric.js ClipPath 🖼️

An interactive demonstration of implementing frames using Fabric.js with ClipPath. This project allows you to create interesting visual compositions by applying different frame shapes to your images.

## ✨ Features

- **Basic Shapes**
  - Circle 🔴
  - Rectangle 🟥
  - Ellipse 🔵

- **Geometric Shapes**
  - Triangle 🔺
  - Hexagon ⬢

- **Special Shapes**
  - Star ⭐
  - Heart ❤️

- **Image Manipulation**
  - Custom image upload
  - Intuitive resizing and positioning
  - Double-click edit mode
  - Dynamic image cropping

## 🚀 How to Use

1. Select a frame by clicking one of the shape buttons
2. Click "Add Image" or upload your own image
3. Double-click the image to enter edit mode
4. Adjust the image position and zoom as desired
5. Double-click again to exit edit mode

## 💻 Technologies Used

- [Fabric.js](http://fabricjs.com/) - Powerful canvas manipulation library
- HTML5 Canvas
- JavaScript ES6+
- CSS3 with responsive design

## 🔧 Technical Implementation

### Core Components

1. **Frame Creation**
   - Shapes are created using Fabric.js geometric objects
   - Each shape has custom properties for frame identification
   - Shapes are initially rendered with semi-transparency for preview

2. **ClipPath System**
   - Uses Fabric.js ClipPath feature to mask images
   - Each frame type has a corresponding ClipPath generator
   - ClipPaths are dynamically scaled to match frame dimensions

3. **Image Processing**
   - Images are loaded using Fabric.js image loader
   - Automatic scaling to fit frame dimensions
   - Maintains aspect ratio while filling frame
   - Supports both local uploads and URL sources

4. **Edit Mode Implementation**
   - Custom double-click handler for mode switching
   - Temporary removal of ClipPath during editing
   - Semi-transparent backdrop for full image visibility
   - Real-time position and crop updates

### Technical Features

- **Frame Management**
  ```javascript
  // Frame creation with metadata
  frame = new fabric.Circle({
    radius: 100,
    metadata: { frameType: 'circle' }
  });
  ```

- **ClipPath System**
  ```javascript
  // Dynamic ClipPath generation
  image.clipPath = createClipPath(
    frameType,
    width,
    height
  );
  ```

- **Image Handling**
  ```javascript
  // Image scaling and positioning
  const scale = Math.max(
    targetWidth / img.width,
    targetHeight / img.height
  );
  ```

- **Edit Mode**
  ```javascript
  // Edit mode activation
  group.on('mousedblclick', enterEditMode);
  img.on('mousedblclick', exitEditMode);
  ```

### Tools and Libraries

1. **Fabric.js Features Used**
   - Canvas manipulation
   - Object grouping
   - Event handling
   - ClipPath masking
   - Image loading and processing
   - Geometric shape generation

2. **Browser APIs**
   - File API for image uploads
   - Canvas API (via Fabric.js)
   - DOM Event handling
   - CSS3 transforms

3. **Development Tools**
   - Modern JavaScript (ES6+)
   - CSS3 with Flexbox
   - Responsive design principles
   - Event-driven architecture

## 🎨 Editing Features

- **View Mode**
  - Drag to move the frame + image set
  - Resize using border controls
  - Rotate using the top control

- **Edit Mode (Double Click)**
  - Adjust image framing
  - Precise zoom and positioning
  - Full image preview with transparency

## 📱 Responsiveness

The project is fully responsive and adapts to different screen sizes:
- Flexible layout that adjusts on large and small screens
- Adaptive controls for mobile devices
- Touch-optimized interface

## 🛠️ Local Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/Frames-with-Fabric.js-ClipPath.git
```

2. Open the `index.html` file in your browser

No additional installation is required as the project uses CDN to load Fabric.js.

## 📄 License

This project is under the MIT license. See the [LICENSE](LICENSE) file for more details.

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

---

Developed with ❤️ using Fabric.js