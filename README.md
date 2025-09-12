# Frames with Fabric.js ClipPath 🖼️

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-blue.svg)](https://www.javascript.com/)
[![Fabric.js](https://img.shields.io/badge/Fabric.js-5.3.1-blue.svg)](https://fabricjs.com/)

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

## 📋 Requirements

- Modern web browser with HTML5 Canvas support
- JavaScript enabled
- Internet connection for CDN dependencies
- [Fabric.js](https://fabricjs.com/) (loaded via CDN)

## 🚀 How to Use

1. Select a frame by clicking one of the shape buttons
2. Click "Add Image" or upload your own image
3. Double-click the image to enter edit mode
4. Adjust the image position and zoom as desired
5. Double-click again to exit edit mode

## 💻 Technologies Used

- [Fabric.js v5.3.1](http://fabricjs.com/) - Powerful canvas manipulation library
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

## 🛠️ Installation

### Option 1: Direct Browser Usage
1. Download or clone this repository
2. Open the `index.html` file directly in your web browser
3. No additional installation required - all dependencies are loaded via CDN

### Option 2: Local Development
1. Clone the repository:
```bash
git clone https://github.com/adrianohcampos/Frames-with-Fabric.js-ClipPath.git
```

2. Navigate to the project directory:
```bash
cd Frames-with-Fabric.js-ClipPath
```

3. Open `index.html` in your preferred browser or serve via a local web server

### Dependencies
- **Fabric.js v5.3.1** - Loaded automatically via CDN
- **Modern Browser** - Chrome, Firefox, Safari, or Edge (latest versions recommended)

## 📄 License

This project is under the MIT license. See the [LICENSE](LICENSE) file for more details.

## 🤝 Contributing

We welcome contributions! Here's how you can help improve this project:

### Ways to Contribute
- 🐛 **Report Bugs** - Open an issue with detailed information about the problem
- 💡 **Suggest Features** - Share your ideas for new frame types or improvements
- 🔧 **Code Contributions** - Submit pull requests with bug fixes or new features
- 📖 **Documentation** - Help improve documentation and examples

### Development Guidelines
1. **Follow the existing code style** - Use the established patterns in `script.js`
2. **Test your changes** - Ensure all existing functionality still works
3. **Update documentation** - Keep README and code comments current
4. **Use descriptive commit messages** - Make it clear what your changes accomplish

### Getting Started
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and test them
4. Commit your changes: `git commit -m 'Add some feature'`
5. Push to the branch: `git push origin feature/your-feature-name`
6. Open a Pull Request

### Code Style
- Use `const` and `let` instead of `var`
- Write descriptive variable and function names
- Add JSDoc comments for complex functions
- Follow the existing project structure

For questions or suggestions, feel free to open an issue!

---

Developed with ❤️ using Fabric.js