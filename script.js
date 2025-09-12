const canvas = new fabric.Canvas('canvas');
let activeFrame = null;
let isEditMode = false;


// Create a temporary canvas to generate the checkerboard pattern
const tempCanvas = document.createElement('canvas');
tempCanvas.width = 20; // Pattern size (10x10 per square)
tempCanvas.height = 20;
const ctx = tempCanvas.getContext('2d');

// Draw the checkerboard pattern
ctx.fillStyle = '#fff';
ctx.fillRect(0, 0, 10, 10);
ctx.fillRect(10, 10, 10, 10);
ctx.fillStyle = '#eee';
ctx.fillRect(10, 0, 10, 10);
ctx.fillRect(0, 10, 10, 10);

// Create the pattern with fabric.Pattern
const checkerboardPattern = new fabric.Pattern({
  source: tempCanvas,
  repeat: 'repeat'
});

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
            const path = new fabric.Path(heartPath); // Create a temporary path to get its natural dimensions
            return new fabric.Path(heartPath, {
                left: 0,
                top: 0,
                originX: 'center',
                originY: 'center',
                // Scale the path to fit the target dimensions (width, height)
                scaleX: width / path.width,
                scaleY: height / path.height
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
    // getBoundingRect considers the object's scale and angle, providing its actual dimensions on the canvas.
    // This is more robust than calculating based on base width/height and scale factors.
    const bounds = frame.getBoundingRect();
    return { width: bounds.width, height: bounds.height };
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
        
        let activeFrameAngle = activeFrame.angle || 0;
        activeFrame.set({ angle: 0 });

        canvas.renderAll();

        img.set({
            left: activeFrame.left,
            top: activeFrame.top,
            originX: 'center',
            originY: 'center',
            width: img.width,
            height: img.height,
            scaleX: 1,
            scaleY: 1,
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

        canvas.renderAll();

        // Create clipPath based on frame type
        img.clipPath = createClipPath(
            activeFrame.metadata.frameType,
            cropWidth,
            cropHeight,
            activeFrame
        );

        canvas.renderAll();

        // Ensure image remains selectable
        img.set({ selectable: true});
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
        // activeFrame.set({ angle: activeFrameAngle });

        // Store frame reference for edit mode toggle
        const shapeRef = activeFrame;

        shapeRef.set({
            fill: 'transparent',
        });
        
        // Group frame and image
        const group = new fabric.Group([shapeRef, img], {
            left: activeFrame.left,
            top: activeFrame.top,
            originX: 'center',
            originY: 'center',
            angle: activeFrameAngle || 0,    
        });
        group.data = { shapeRef: shapeRef };

        canvas.remove(activeFrame);
        canvas.add(group);

        canvas.setActiveObject(group);
        activeFrame = null;
        canvas.renderAll();


        let originalGroup = group; // store original group reference

        const enterEditMode = function () {
            isEditMode = true;
            let ActiveObject = canvas.getActiveObject();

            // configure cropping mode as in crop.html
            canvas.remove(originalGroup);
            const shapeRef = ActiveObject._objects[0]; // Assumindo que shapeRef é o _objects[0]; defina explicitamente se não for
            const imgCurrent = ActiveObject._objects[1];

            const groupScaleX = ActiveObject.scaleX;
            const groupScaleY = ActiveObject.scaleY;
            const groupAngle = ActiveObject.angle || 0;
            // Adiciona um retângulo azul do tamanho do canvas
            const checkerboardRect = new fabric.Rect({
                left: 0,
                top: 0,
                width: canvas.getWidth(),
                height: canvas.getHeight(),
                fill: checkerboardPattern,
                selectable: false,
                evented: false,
                originX: 'left',
                originY: 'top',
                id: 'checkerboardRect'
            });
            
            canvas.add(shapeRef);
            canvas.add(imgCurrent);
            
            shapeRef.set({ selectable: false, evented: false, fill: 'red' });
            // remove clipPath and configure for cropping
            imgCurrent.clipPath = null;
            imgCurrent.isCropping = true;
            imgCurrent.set({
                lockMovementX: true,
                lockMovementY: true,
                hasControls: true,
                selectable: true,
            });

            imgCurrent.setControlsVisibility({
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
            
            // create backdrop
            fabric.Image.fromURL(imgCurrent._originalElement.currentSrc, function (backdrop) {
                backdrop.imageId = imgCurrent.id;
                imgCurrent.backdropId = 'backdrop-' + Date.now();
                
                // Restore the original position calculation, which user confirmed was correct,
                // but apply the correct angle from the now-correctly-rotated main image.
                let imgTLx = ActiveObject.left - (imgCurrent.width * imgCurrent.scaleX * groupScaleX) / 2;
                let imgTLy = ActiveObject.top - (imgCurrent.height * imgCurrent.scaleY * groupScaleY) / 2;
                
                backdrop.set({
                    id: imgCurrent.backdropId,
                    originX: 'left',
                    originY: 'top',
                    left: (imgTLx - (imgCurrent.cropX || 0) * imgCurrent.scaleX * groupScaleX),
                    top: (imgTLy - (imgCurrent.cropY || 0) * imgCurrent.scaleY * groupScaleY),
                    angle: imgCurrent.angle, // Use the main image's angle as the source of truth
                    width: imgCurrent._element.naturalWidth,
                    height: imgCurrent._element.naturalHeight,
                    scaleX: imgCurrent.scaleX * groupScaleX,
                    scaleY: imgCurrent.scaleY * groupScaleY,
                    angle: groupAngle,
                    opacity: 0.30,
                    selectable: false,
                    evented: false,
                    lockMovementX: true,
                    lockMovementY: true,
                    controls: false,
                });

                backdrop.setControlsVisibility({
                    mtr: false, mt: false, mb: false, ml: false, mr: false,
                    bl: false, br: false, tl: false, tr: false,
                });
                canvas.add(backdrop);
                // backdrop.setPositionByOrigin(ActiveObject.getCenterPoint(), 'center', 'center');
                // backdrop.setCoords();
                canvas.renderAll();
                canvas.sendBackwards(backdrop);
                canvas.sendBackwards(checkerboardRect);
            }, { crossOrigin: 'anonymous' });

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
                canvas.renderAll();
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

                    const diffX = e.pointer.x - image.mouseDownX;
                    const diffY = e.pointer.y - image.mouseDownY;
                    
                    // backdrop movement
                    backdrop.left = backdrop._left + diffX;
                    backdrop.top = backdrop._top + diffY;
                    
                    // backdrop limits (use image top-left coordinates)
                    const imageTLx = ActiveObject.left - (image.width * image.scaleX * groupScaleX) / 2;
                    const imageTLy = ActiveObject.top - (image.height * image.scaleY * groupScaleY) / 2;
                    const imageW = image.width * image.scaleX * groupScaleX;
                    const imageH = image.height * image.scaleY * groupScaleY;
                    const backdropW = backdrop.width * backdrop.scaleX;
                    const backdropH = backdrop.height * backdrop.scaleY;

                    if (backdrop.left > imageTLx) backdrop.left = imageTLx;
                    if (backdrop.top > imageTLy) backdrop.top = imageTLy;
                    if (backdrop.left + backdropW < imageTLx + imageW) backdrop.left = imageTLx + imageW - backdropW;
                    if (backdrop.top + backdropH < imageTLy + imageH) backdrop.top = imageTLy + imageH - backdropH;

                    
                    // crop changes (consider image has center origin)
                    image.cropX = (imageTLx - backdrop.left) / (image.scaleX * groupScaleX);
                    image.cropY = (imageTLy - backdrop.top) / (image.scaleY * groupScaleY);
                    canvas.renderAll();
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

            imgCurrent.on('scaling', handleScaling);
            imgCurrent.on('mousedown', handleMouseDown);
            imgCurrent.on('mousemove', handleMouseMove);
            imgCurrent.on('mouseup', handleMouseUp);  

            canvas.renderAll();
        };
        const exitEditMode = function () {

            if(!isEditMode) return;

            isEditMode = false;
            
            let ActiveObject = canvas.getActiveObject();
            
            let imgCurrent = ActiveObject;

            // remove backdrop and apply final crop
            const backdrop = canvas.getObjects().find(obj => obj.id === imgCurrent.backdropId);
            if (backdrop) canvas.remove(backdrop);
            const checkerboardRect = canvas.getObjects().find(obj => obj.id === 'checkerboardRect');
            if (checkerboardRect) canvas.remove(checkerboardRect);            

            // remove all cropping event listeners
            imgCurrent.off('scaling');
            imgCurrent.off('mousedown');
            imgCurrent.off('mousemove');
            imgCurrent.off('mouseup');
            imgCurrent.off('deselected');

            // disable crop
            imgCurrent.isCropping = false;
            imgCurrent.lockMovementX = false;
            imgCurrent.lockMovementY = false;
            imgCurrent.setControlsVisibility({
                mtr: true, mt: true, mb: true, ml: true, mr: true,
                bl: true, br: true, tl: true, tr: true,
            });

            // apply final crop same as crop.html
            const meta = imgCurrent.data || {};
            const targetW = meta.targetWidth;
            const targetH = meta.targetHeight;
            // tamanho de recorte corrigido pela escala do grupo
            const cropWidth = targetW / (imgCurrent.scaleX);
            const cropHeight = targetH / (imgCurrent.scaleY);


            // center in frame
            imgCurrent.set({
                left: shapeRef.left,
                top: shapeRef.top,
                originX: 'center',
                originY: 'center',
            });


            // create clipPath of frame size
            imgCurrent.clipPath = createClipPath(meta.frameType, cropWidth, cropHeight);

            // update metadata
            meta.cropX = imgCurrent.cropX;
            meta.cropY = imgCurrent.cropY;
            meta.cropWidth = cropWidth * imgCurrent.scaleX;
            meta.cropHeight = cropHeight * imgCurrent.scaleY;
            imgCurrent.data = meta;

            shapeRef.set({ fill: 'transparent' });
            canvas.renderAll();
            // reconstruct original group
            originalGroup = new fabric.Group([shapeRef, imgCurrent], {
                left: originalGroup.left,
                top: originalGroup.top,
                scaleX: originalGroup.scaleX,
                scaleY: originalGroup.scaleY,
                angle: originalGroup.angle,
                originX: 'center',
                originY: 'center'
            });

            originalGroup.data = { shapeRef: shapeRef };
            canvas.add(originalGroup);
            canvas.setActiveObject(originalGroup);
            canvas.renderAll();
            // reattach handler to original group
            originalGroup.on('mousedblclick', enterEditMode);
        };

        // Double click to enter; double click on image to exit
        group.on('mousedblclick', enterEditMode);
        img.on('mousedblclick', exitEditMode); 

        // Optional: Deselect to avoid interference
        /* group.on('deselected', function () {
            canvas.discardActiveObject(); // Remove active selection
            canvas.renderAll();
        }); */


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