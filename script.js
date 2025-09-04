const canvas = new fabric.Canvas('canvas');
let activeFrame = null;

// Helper function to create clipPath based on frame type
function createClipPath(frameType, width, height, frame = null) {
    switch (frameType) {
        case 'circle':
            const circleRadius = Math.min(width, height) / 2;
            return new fabric.Circle({
                radius: circleRadius,
                left: 0,
                top: 0,
                originX: 'center',
                originY: 'center'
            });

        case 'triangle':
            return new fabric.Triangle({
                width: width,
                height: height,
                left: 0,
                top: 0,
                originX: 'center',
                originY: 'center'
            });

        case 'hexagon':
            const hexPoints = [];
            const sides = 6;
            // Use the same radius as frame creation for consistency
            const hexRadius = Math.min(width, height) / 2;
            for (let i = 0; i < sides; i++) {
                const angle = (i * 2 * Math.PI) / sides;
                hexPoints.push({
                    x: hexRadius * Math.cos(angle),
                    y: hexRadius * Math.sin(angle)
                });
            }
            return new fabric.Polygon(hexPoints, {
                left: 0,
                top: 0,
                originX: 'center',
                originY: 'center'
            });

        case 'star':
            const starPoints = [];
            // Use the same radius as frame creation for consistency
            const outerRadius = Math.min(width, height) / 2;
            const innerRadius = outerRadius * 0.5; // Same ratio used in creation (40/80 = 0.5)
            const spikes = 5;
            for (let i = 0; i < spikes * 2; i++) {
                const pointRadius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = (i * Math.PI) / spikes;
                starPoints.push({
                    x: pointRadius * Math.cos(angle - Math.PI / 2),
                    y: pointRadius * Math.sin(angle - Math.PI / 2)
                });
            }
            return new fabric.Polygon(starPoints, {
                left: 0,
                top: 0,
                originX: 'center',
                originY: 'center'
            });

        case 'heart':
            const heartPath = "M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5 C2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3 C19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35z";
            return new fabric.Path(heartPath, {
                left: 0,
                top: 0,
                originX: 'center',
                originY: 'center',
                scaleX: width / 200,
                scaleY: height / 200
            });

        case 'ellipse':
            return new fabric.Ellipse({
                rx: width / 2,
                ry: height / 2,
                left: 0,
                top: 0,
                originX: 'center',
                originY: 'center'
            });

        default: // rect
            return new fabric.Rect({
                width: width,
                height: height,
                left: 0,
                top: 0,
                originX: 'center',
                originY: 'center'
            });
    }
}

// Helper function to get frame dimensions
function getFrameDimensions(frame) {
    switch (frame.type) {
        case 'circle':
            return { width: frame.radius * 2, height: frame.radius * 2 };
        case 'triangle':
            return { width: frame.width, height: frame.height };
        case 'polygon': // hexagon or star
            // For star, use dimensions based on outer radius with adjustment
            if (frame.metadata && frame.metadata.frameType === 'star') {
                // Use star's outer radius (80px) with scale factor for better coverage
                const outerRadius = 80;
                const scaleFactor = 1.15; // Increase 15% for better star coverage
                return { width: outerRadius * 2 * scaleFactor, height: outerRadius * 2 * scaleFactor };
            } else if (frame.metadata && frame.metadata.frameType === 'hexagon') {
                // For hexagon, use the radius defined in creation (80px)
                const hexRadius = 80;
                return { width: hexRadius * 2, height: hexRadius * 2 };
            } else {
                // Fallback for other polygons
                const bounds = frame.getBoundingRect();
                return { width: bounds.width, height: bounds.height };
            }
        case 'path': // heart
            const pathBounds = frame.getBoundingRect();
            return { width: pathBounds.width, height: pathBounds.height };
        case 'ellipse':
            return { width: frame.rx * 2, height: frame.ry * 2 };
        default: // rect
            return { width: frame.width, height: frame.height };
    }
}

function addFrame(type) {
    let frame;

    switch (type) {
        case 'circle':
            frame = new fabric.Circle({
                radius: 100,
                left: 200,
                top: 200,
                fill: 'red',
                opacity: 0.5,
                originX: 'center',
                originY: 'center',
                metadata: {
                    frameType: type
                }
            });
            break;

        case 'triangle':
            frame = new fabric.Triangle({
                width: 150,
                height: 150,
                left: 200,
                top: 200,
                fill: 'red',
                opacity: 0.5,
                originX: 'center',
                originY: 'center',
                metadata: {
                    frameType: type
                }
            });
            break;

        case 'hexagon':
            // Creating hexagon using polygon
            const hexPoints = [];
            const sides = 6;
            const hexagonRadius = 80;
            for (let i = 0; i < sides; i++) {
                const angle = (i * 2 * Math.PI) / sides;
                hexPoints.push({
                    x: hexagonRadius * Math.cos(angle),
                    y: hexagonRadius * Math.sin(angle)
                });
            }
            frame = new fabric.Polygon(hexPoints, {
                left: 200,
                top: 200,
                fill: 'red',
                opacity: 0.5,
                originX: 'center',
                originY: 'center',
                metadata: {
                    frameType: type
                }
            });
            break;

        case 'star':
            // Creating 5-pointed star
            const starPoints = [];
            const starOuterRadius = 80;
            const starInnerRadius = 40;
            const spikes = 5;
            for (let i = 0; i < spikes * 2; i++) {
                const starRadius = i % 2 === 0 ? starOuterRadius : starInnerRadius;
                const angle = (i * Math.PI) / spikes;
                starPoints.push({
                    x: starRadius * Math.cos(angle - Math.PI / 2),
                    y: starRadius * Math.sin(angle - Math.PI / 2)
                });
            }
            frame = new fabric.Polygon(starPoints, {
                left: 200,
                top: 200,
                fill: 'red',
                opacity: 0.5,
                originX: 'center',
                originY: 'center',
                metadata: {
                    frameType: type
                }
            });
            break;

        case 'heart':
            // Creating heart using simple SVG path
            const heartPath = "M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5C2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3C19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35z";
            try {
                frame = new fabric.Path(heartPath, {
                    left: 200,
                    top: 200,
                    fill: 'red',
                    opacity: 0.5,
                    originX: 'center',
                    originY: 'center',
                    scaleX: 4,
                    scaleY: 4,
                    metadata: {
                        frameType: type
                    }
                });
            } catch (error) {
                console.error('Error creating heart:', error);
                // Fallback to rectangle if error occurs
                frame = new fabric.Rect({
                    width: 150,
                    height: 120,
                    left: 200,
                    top: 200,
                    fill: 'red',
                    opacity: 0.5,
                    originX: 'center',
                    originY: 'center',
                    metadata: {
                        frameType: 'rect'
                    }
                });
            }
            break;

        case 'ellipse':
            frame = new fabric.Ellipse({
                rx: 120,
                ry: 80,
                left: 200,
                top: 200,
                fill: 'red',
                originX: 'center',
                originY: 'center',
                opacity: 0.5,
                metadata: {
                    frameType: type
                }
            });
            break;

        default: // rect
            frame = new fabric.Rect({
                width: 200,
                height: 100,
                left: 200,
                top: 200,
                fill: 'red',
                opacity: 0.5,
                originX: 'center',
                originY: 'center',
                metadata: {
                    frameType: type
                }
            });
            break;
    }

    canvas.add(frame);
    canvas.setActiveObject(frame);
    activeFrame = frame;
    canvas.renderAll();
}

function uploadImage(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        addImage(e.target.result);
    };
    reader.readAsDataURL(file);
}

function addImage(imageUrl) {
    if (!activeFrame) {
        alert('Please select or add a frame first!');
        return;
    }

    fabric.Image.fromURL(imageUrl, function (img) {        

        img.set({
            left: activeFrame.left,
            top: activeFrame.top,
            originX: 'center',
            originY: 'center',
            width: img.width,
            height: img.height,
            scaleX: 1,
            scaleY: 1,
            angle: activeFrame.angle || 0,
        });

        // Uniform scale (cover) and clipPath in non-scaled image coordinates
        const dimensions = getFrameDimensions(activeFrame);
        const targetWidth = dimensions.width;
        const targetHeight = dimensions.height;

        const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
        img.set({ scaleX: scale, scaleY: scale });
        // Store natural dimensions for later editing
        const naturalWidth = img.width;
        const naturalHeight = img.height;

        // Crop image to visible area (reduces object bounding box)
        const cropWidth = targetWidth / scale;
        const cropHeight = targetHeight / scale;
        const initCropX = (img.width - cropWidth) / 2;
        const initCropY = (img.height - cropHeight) / 2;
        img.set({
            cropX: initCropX,
            cropY: initCropY,
            width: cropWidth,
            height: cropHeight
        });

        // Create clipPath based on frame type
        img.clipPath = createClipPath(
            activeFrame.metadata.frameType,
            cropWidth,
            cropHeight,
            activeFrame
        );

        canvas.renderAll();

        // Ensure image remains selectable
        img.set({ selectable: true });
        // Store metadata for editing (zoom keeping frame fixed)
        img.data = {
            targetWidth: targetWidth,
            targetHeight: targetHeight,
            naturalWidth: naturalWidth,
            naturalHeight: naturalHeight,
            frameType: activeFrame.metadata ? activeFrame.metadata.frameType : activeFrame.type,
            cropX: initCropX,
            cropY: initCropY,
            cropWidth: cropWidth,
            cropHeight: cropHeight,
        };

        activeFrame.strokeWidth = 0;

        // Store frame reference for edit mode toggle
        const shapeRef = activeFrame;

        // Group frame and image
        const group = new fabric.Group([shapeRef, img], {
            left: activeFrame.left,
            top: activeFrame.top,
            originX: 'center',
            originY: 'center',
        });
        group.data = { shapeRef: shapeRef };

        canvas.remove(activeFrame);
        canvas.add(group);

        canvas.setActiveObject(group);
        activeFrame = null;
        canvas.renderAll();       
        

        let originalGroup = group; // store original group reference

        const enterEditMode = function () {
            let ActiveObject = canvas.getActiveObject();

            // configure cropping mode as in crop.html
            canvas.remove(originalGroup);

            canvas.add(shapeRef);
            canvas.add(img);
            shapeRef.set({ selectable: false, evented: false });
            // remove clipPath and configure for cropping
            img.clipPath = null;
            img.isCropping = true;
            img.set({
                lockMovementX: true,
                lockMovementY: true,
                hasControls: true,
                selectable: true,
            });

            img.setControlsVisibility({
                mtr: false,
                mt: false,
                mb: false,
                ml: false,
                mr: false,
                bl: false,
                br: false,
                tl: false,
                tr: false,
            });

            shapeRef.set({ left: 0, top: 0 });
            img.set({ left: 0, top: 0 });

            // create backdrop exactly as in crop.html
            fabric.Image.fromURL(img._originalElement.currentSrc, function (backdrop) {
                backdrop.imageId = img.id;
                img.backdropId = 'backdrop-' + Date.now();

                // calculate correct position considering img has center origin                             
                let imgTLx = ActiveObject.left - (img.width * img.scaleX) / 2 * 1;
                let imgTLy = ActiveObject.top - (img.height * img.scaleY) / 2 * 1;

                backdrop.set({
                    id: img.backdropId,
                    cropX: 0,
                    cropY: 0,
                    originX: 'left',
                    originY: 'top',
                    left: (imgTLx - (img.cropX || 0) * img.scaleX),
                    top: (imgTLy - (img.cropY || 0) * img.scaleY),
                    width: img._element.naturalWidth,
                    height: img._element.naturalHeight,
                    scaleX: img.scaleX,
                    scaleY: img.scaleY,
                    opacity: 0.25,
                    angle: img.angle || 0,
                    lockMovementX: true,
                    lockMovementY: true,
                    controls: false,
                    selectable: false,
                    evented: false
                });
                backdrop.setControlsVisibility({
                    mtr: false, mt: false, mb: false, ml: false, mr: false,
                    bl: false, br: false, tl: false, tr: false,
                });
                canvas.add(backdrop);
                canvas.sendToBack(backdrop);
            });

            // handlers same as crop.html
            const handleScaling = function (e) {
                const image = e.transform.target;
                if (image.isCropping) {
                    image.isScaling = true;
                    const backdrop = canvas.getObjects().find(obj => obj.id === image.backdropId);
                    if (backdrop) {
                        // don't change scaling
                        image.scaleX = backdrop.scaleX;
                        image.scaleY = backdrop.scaleY;
                        // change size using cropX & cropY
                        const diffX = image.left - backdrop.left;
                        const diffY = image.top - backdrop.top;
                        image.cropX = diffX;
                        image.cropY = diffY;
                        image.width = backdrop.width - diffX;
                        image.height = backdrop.height - diffY;
                        // limits
                        if (image.width > backdrop.width) image.width = backdrop.width;
                        if (image.height > backdrop.height) image.height = backdrop.height;
                        if (backdrop.left > image.left) backdrop.left = image.left;
                        if (backdrop.top > image.top) backdrop.top = image.top;
                        if (backdrop.top + backdrop.height < image.top + image.height) backdrop.top = image.top + image.height - backdrop.height;
                        if (backdrop.left + backdrop.width < image.left + image.width) backdrop.left = image.left + image.width - backdrop.width;
                    }
                }
                canvas.requestRenderAll();
            };

            const handleMouseDown = function (e) {
                const image = e.target;
                image.isMouseDown = true;
                image.mouseDownX = e.pointer.x;
                image.mouseDownY = e.pointer.y;
                const backdrop = canvas.getObjects().find(obj => obj.id === image.backdropId);
                if (backdrop) {
                    backdrop._left = backdrop.left;
                    backdrop._top = backdrop.top;
                }
            };

            const handleMouseMove = function (e) {
                const image = e.target;

                const backdrop = canvas.getObjects().find(obj => obj.id === image.backdropId);
                if (image.isMouseDown && backdrop && !image.isScaling) {

                    const imageLeft = ActiveObject.left - (image.width * image.scaleX) //image.left
                    const imageTop = ActiveObject.top - (image.height * image.scaleY) //image.top

                    const diffX = e.pointer.x - image.mouseDownX;
                    const diffY = e.pointer.y - image.mouseDownY;
                    // backdrop movement
                    backdrop.left = backdrop._left + diffX;
                    backdrop.top = backdrop._top + diffY;
                    // backdrop limits (use image top-left coordinates)
                    const imageTLx = imageLeft - (image.width * image.scaleX) / 2 * -1;
                    const imageTLy = imageTop - (image.height * image.scaleY) / 2 * -1;
                    const imageW = image.width * image.scaleX;
                    const imageH = image.height * image.scaleY;
                    const backdropW = backdrop.width * backdrop.scaleX;
                    const backdropH = backdrop.height * backdrop.scaleY;

                    if (backdrop.left > imageTLx) backdrop.left = imageTLx;
                    if (backdrop.top > imageTLy) backdrop.top = imageTLy;
                    if (backdrop.left + backdropW < imageTLx + imageW) backdrop.left = imageTLx + imageW - backdropW;
                    if (backdrop.top + backdropH < imageTLy + imageH) backdrop.top = imageTLy + imageH - backdropH;

                    // crop changes (consider image has center origin)
                    image.cropX = (imageTLx - backdrop.left) / image.scaleX;
                    image.cropY = (imageTLy - backdrop.top) / image.scaleY;
                    canvas.requestRenderAll();
                }
            };

            const handleMouseUp = function (e) {
                const image = e.target;
                image.isMouseDown = false;
                image.isScaling = false;
                const backdrop = canvas.getObjects().find(obj => obj.id === image.backdropId);
                if (backdrop) {
                    backdrop._left = backdrop.left;
                    backdrop._top = backdrop.top;
                }
            };

            img.on('scaling', handleScaling);
            img.on('mousedown', handleMouseDown);
            img.on('mousemove', handleMouseMove);
            img.on('mouseup', handleMouseUp);

            canvas.requestRenderAll();
        };

        const exitEditMode = function () {
            // remove backdrop and apply final crop
            const backdrop = canvas.getObjects().find(obj => obj.id === img.backdropId);
            if (backdrop) canvas.remove(backdrop);

            // remove all cropping event listeners
            img.off('scaling');
            img.off('mousedown');
            img.off('mousemove');
            img.off('mouseup');
            img.off('deselected');

            // disable crop
            img.isCropping = false;
            img.lockMovementX = false;
            img.lockMovementY = false;
            img.setControlsVisibility({
                mtr: true, mt: true, mb: true, ml: true, mr: true,
                bl: true, br: true, tl: true, tr: true,
            });

            // apply final crop same as crop.html
            const meta = img.data || {};
            const targetW = meta.targetWidth;
            const targetH = meta.targetHeight;
            const cropWidth = targetW / img.scaleX;
            const cropHeight = targetH / img.scaleY;

            // center in frame
            img.set({
                left: shapeRef.left,
                top: shapeRef.top,
                originX: 'center',
                originY: 'center',
                width: cropWidth,
                height: cropHeight
            });

            // create clipPath of frame size
            img.clipPath = createClipPath(meta.frameType, cropWidth, cropHeight);

            // update metadata
            meta.cropX = img.cropX;
            meta.cropY = img.cropY;
            meta.cropWidth = cropWidth;
            meta.cropHeight = cropHeight;
            img.data = meta;

            // reconstruct original group
            originalGroup = new fabric.Group([shapeRef, img], {
                left: originalGroup.left,
                top: originalGroup.top,
                originX: 'center',
                originY: 'center'
            });
            originalGroup.data = { shapeRef: shapeRef };
            canvas.add(originalGroup);
            canvas.setActiveObject(originalGroup);
            canvas.requestRenderAll();
            // reattach handler to original group
            originalGroup.on('mousedblclick', enterEditMode);
        };

        // Double click to enter; double click on image to exit
        group.on('mousedblclick', enterEditMode);
        img.on('mousedblclick', exitEditMode);

        // Optional: Deselect to avoid interference
        group.on('deselected', function () {
            canvas.discardActiveObject(); // Remove active selection
            canvas.renderAll();
        });

    }, { crossOrigin: 'anonymous' });
}

canvas.on('selection:created', function (e) {
    activeFrame = null;
    if (e.selected[0].metadata && e.selected[0].metadata.frameType) {
        activeFrame = e.selected[0];
    }
});

canvas.on('selection:cleared', function () {
    activeFrame = null;
});