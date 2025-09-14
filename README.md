# Frames with Fabric.js ClipPath 🖼️

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-blue.svg)](https://www.javascript.com/)
[![Fabric.js](https://img.shields.io/badge/Fabric.js-5.3.1-blue.svg)](https://fabricjs.com/)

An interactive demonstration of implementing frames using Fabric.js with ClipPath. Create visual compositions by applying different frame shapes to your images with advanced editing capabilities.

## ✨ Features

- **Frame Shapes**
  - Basic: Circle, Rectangle, Ellipse
  - Geometric: Triangle, Hexagon
  - Special: Star, Heart, Cloud

- **Advanced Image Editing**
  - Custom image upload
  - Double-click edit mode with advanced cropping
  - Real-time crop adjustment with mouse controls
  - Checkerboard pattern background for better visibility
  - Semi-transparent backdrop for full image preview
  - Keyboard shortcuts (Delete key support)

## 🚀 How to Use

1. **Select a Frame**: Click one of the shape buttons to create a frame
2. **Add Image**: Click "Add Image" or upload your own image file
3. **Enter Edit Mode**: Double-click the frame+image group to enter advanced editing mode
4. **Advanced Cropping**: 
   - Drag the image to adjust the crop position
   - Use corner handles to resize the crop area
   - The semi-transparent backdrop shows the full image
5. **Exit Edit Mode**: Double-click the image or click outside the frame to exit edit mode
6. **Additional Controls**:
   - Press `Delete` key to remove selected objects
   - Drag frames to reposition and resize them
   - Rotate using the top rotation handle

## 💻 Technologies Used

- [Fabric.js v5.3.1](http://fabricjs.com/) - Canvas manipulation library
- HTML5 Canvas
- JavaScript ES6+
- CSS3 with responsive design

## 🔧 Technical Implementation

### Core Features

- **Frame Creation**: Shapes created using Fabric.js geometric objects with custom metadata
- **ClipPath System**: Dynamic ClipPath generation for each frame type
- **Image Processing**: Automatic scaling and positioning with aspect ratio preservation
- **Advanced Edit Mode**: Double-click editing with real-time crop adjustment
- **State Management**: Object locking and z-index preservation during editing

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/adrianohcampos/Frames-with-Fabric.js-ClipPath.git
```

2. Navigate to the project directory:
```bash
cd Frames-with-Fabric.js-ClipPath
```

3. Open `index.html` in your web browser

**Dependencies**: Fabric.js v5.3.1 (loaded via CDN)

## 📄 License

This project is under the MIT license. See the [LICENSE](LICENSE) file for more details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Developed with ❤️ using Fabric.js