// canvas.toJSON(['metadata','data'])
const canvas = new fabric.Canvas('canvas');
fetch("data.json").then(response => response.json()).then(data => {
    canvas.loadFromJSON(data);
});

const deleteObject = function (object = null) {
    const activeObject = object || canvas.getActiveObject();
    if (activeObject) {
        canvas.remove(activeObject);
        canvas.discardActiveObject();
        canvas.renderAll();
    }
}

// Allows deleting the selected object by pressing the Delete key
document.addEventListener('keydown', function (e) {
    if (e.key === 'Delete' || e.key === 'Del') {
        deleteObject();
    }
});

// frames logic
const CONFIG = {
    CHECKERBOARD_SIZE: 20,
    CHECKERBOARD_COLOR_LIGHT: '#fff',
    CHECKERBOARD_COLOR_DARK: '#eee',
    BACKGROUND_IMAGE_SRC: "87e22a62965f141aa08e93699b0b3527.webp",
    DEFAULT_FRAME_PROPS: {
        left: 200,
        top: 200,
        fill: 'red',
        opacity: 1,
        originX: 'center',
        originY: 'center',
    }
};


const frameEditState = {
    isEditMode: false,
    zIndex: null,
    shapeRef: null,
    currentGroup: null,
    awaitImage: false
};

const checkerboardPatternCreated = function() {
    // Create a temporary canvas to generate the checkerboard pattern
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = CONFIG.CHECKERBOARD_SIZE; // Pattern size (10x10 per square)
    tempCanvas.height = CONFIG.CHECKERBOARD_SIZE;
    const ctx = tempCanvas.getContext('2d');

    // Draw the checkerboard pattern
    ctx.fillStyle = CONFIG.CHECKERBOARD_COLOR_LIGHT;
    ctx.fillRect(0, 0, 10, 10);
    ctx.fillRect(10, 10, 10, 10);
    ctx.fillStyle = CONFIG.CHECKERBOARD_COLOR_DARK;
    ctx.fillRect(10, 0, 10, 10);
    ctx.fillRect(0, 10, 10, 10);

    // Create the pattern with fabric.Pattern
    const pattern = new fabric.Pattern({
        source: tempCanvas,
        repeat: 'repeat',
    });

    return pattern;
};

const backgroundImageCreated = function() {
    const i = new Image();
    i.crossOrigin = 'anonymous'; // To avoid CORS issues
    i.src = CONFIG.BACKGROUND_IMAGE_SRC;
    return i;
};


const createScaledPattern = function(object) {
    if (object.type === 'heart') { return object.fill; }

    const bounds = getObjectDimensions(object);
    const objectWidth = bounds.width;
    const objectHeight = bounds.height;
    const tempCanvasBg = document.createElement('canvas');
    tempCanvasBg.width = background.width;
    tempCanvasBg.height = background.height;
    const ctx = tempCanvasBg.getContext("2d");
    ctx.drawImage(background, 0, 0, background.width, background.height);

    const patternWidth = background.width;
    const patternHeight = background.height;

    let scale, offsetX, offsetY;

    if (objectWidth && objectHeight) {
        const scaleXToFit = objectWidth / patternWidth;
        const scaleYToFit = objectHeight / patternHeight;
        scale = Math.max(scaleXToFit, scaleYToFit);

        const scaledPatternWidth = patternWidth * scale;
        const scaledPatternHeight = patternHeight * scale;

        offsetX = (objectWidth - scaledPatternWidth) / 2;
        offsetY = (objectHeight - scaledPatternHeight) / 2;
    } else {
        scale = 1;
        offsetX = 0;
        offsetY = 0;
    }

    return new fabric.Pattern({
        source: tempCanvasBg,
        repeat: 'no-repeat',
        patternTransform: [scale, 0, 0, scale, 0, 0],
        offsetX: offsetX,
        offsetY: offsetY
    });
}

// Helper function to create clipPath based on frame type
const createClipPath = function(frameType, width, height, frame = null) {
    const commonProps = {
        left: 0,
        top: 0,
        originX: 'center',
        originY: 'center'
    };
    switch (frameType) {
        case 'circle':
            const circleRadius = Math.min(width, height) / 2;
            return new fabric.Circle({
                radius: circleRadius,
                ...commonProps
            });

        case 'triangle':
            return new fabric.Triangle({
                width: width,
                height: height,
                ...commonProps
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
                ...commonProps
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
                ...commonProps
            });

        case 'heart':
            const heartPath = "M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5 C2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3 C19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35z";
            const path = new fabric.Path(heartPath); // Create a temporary path to get its natural dimensions
            return new fabric.Path(heartPath, {
                // Scale the path to fit the target dimensions (width, height)
                scaleX: width / path.width,
                scaleY: height / path.height,
                ...commonProps
                
            });

        case 'ellipse':
            return new fabric.Ellipse({
                rx: width / 2,
                ry: height / 2,
                ...commonProps
            });

        case 'cloud':            
            const cloudPath = 'M25,60 a20,20 0 0,1 0,-40 a20,20 0 0,1 35,-15 a25,25 0 0,1 45,0 a20,20 0 0,1 0,40 a20,20 0 0,1 -35,15 a25,25 0 0,1 -45,0 z';
            const cloudPath_ = new fabric.Path(cloudPath);
            return new fabric.Path(cloudPath, {
                scaleX: width / cloudPath_.width,
                scaleY: height / cloudPath_.height,
                ...commonProps
            });

        default: // rect
            return new fabric.Rect({
                width: width,
                height: height,
                ...commonProps
            });
    }
}

// Helper function to get frame dimensions
const getObjectDimensions = function(frame) {
    const bounds = frame.getBoundingRect();
    return { width: bounds.width, height: bounds.height };
}


const createFrameObject = function(type, initialProps) {
    let frame;
    const commonProps = { ...CONFIG.DEFAULT_FRAME_PROPS, ...initialProps, metadata: { frameType: type } };

    switch (type) {
        case 'circle':
            frame = new fabric.Circle({ radius: 150, ...commonProps });
            break;

        case 'triangle':
            frame = new fabric.Triangle({ width: 250, height: 250, ...commonProps });
            break;

        case 'hexagon':
            // Creating hexagon using polygon
            const hexPoints = [];
            const sides = 6;
            const hexagonRadius = 150;
            for (let i = 0; i < sides; i++) {
                const angle = (i * 2 * Math.PI) / sides;
                hexPoints.push({
                    x: hexagonRadius * Math.cos(angle),
                    y: hexagonRadius * Math.sin(angle)
                });
            }
            frame = new fabric.Polygon(hexPoints, { ...commonProps });
            break;

        case 'star':
            // Creating 5-pointed star
            const starPoints = [];
            const starOuterRadius = 200;
            const starInnerRadius = 100;
            const spikes = 5;
            for (let i = 0; i < spikes * 2; i++) {
                const starRadius = i % 2 === 0 ? starOuterRadius : starInnerRadius;
                const angle = (i * Math.PI) / spikes;
                starPoints.push({
                    x: starRadius * Math.cos(angle - Math.PI / 2),
                    y: starRadius * Math.sin(angle - Math.PI / 2)
                });
            }
            frame = new fabric.Polygon(starPoints, { ...commonProps });
            break;

        case 'heart':
            // Creating heart using simple SVG path
            const heartPath = "M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5C2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3C19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35z";
            frame = new fabric.Path(heartPath, {
                fill: '#dcf2ff',
                scaleX: 4,
                scaleY: 4,
                ...commonProps
            });
            break;

        case 'ellipse':
            frame = new fabric.Ellipse({ rx: 200, ry: 130, ...commonProps });
            break;

        case 'cloud':            
            const cloudPath = 'M25,60 a20,20 0 0,1 0,-40 a20,20 0 0,1 35,-15 a25,25 0 0,1 45,0 a20,20 0 0,1 0,40 a20,20 0 0,1 -35,15 a25,25 0 0,1 -45,0 z';
            frame = new fabric.Path(cloudPath, {
                fill: '#dcf2ff',
                scaleX: 4,
                scaleY: 4,
                ...commonProps
            });
            break;

        default: // rect
            frame = new fabric.Rect({ width: 400, height: 250, ...commonProps });
            break;
    }

    return frame;
}

const addFrame = function(type) {
    const frame = createFrameObject(type);
    const pattern = createScaledPattern(frame);
    frame.set("fill", pattern);
    canvas.add(frame);
    canvas.setActiveObject(frame);
    frameEditState.activeFrame = frame;
    canvas.renderAll();
}

const uploadImage = function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        addImage(e.target.result);
    };
    reader.readAsDataURL(file);
}

const addImage = function(imageUrl) {
    if (!frameEditState.activeFrame) {
        alert('Please select or add a frame first!');
        return;
    }

    fabric.Image.fromURL(imageUrl, function (img) {

        frameEditState.activeFrameAngle = (typeof frameEditState.activeFrame.angle === 'number') ? frameEditState.activeFrame.angle : 0;
        frameEditState.activeFrame.set({ angle: 0 });

        canvas.renderAll();

        img.set({
            left: frameEditState.activeFrame.left,
            top: frameEditState.activeFrame.top,
            originX: 'center',
            originY: 'center',
            width: img.width,
            height: img.height,
            scaleX: 1,
            scaleY: 1,
        });

        // Uniform scale (cover) and clipPath in non-scaled image coordinates
        const dimensions = getObjectDimensions(frameEditState.activeFrame);
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
            frameEditState.activeFrame.metadata.frameType,
            cropWidth,
            cropHeight,
            frameEditState.activeFrame
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
            frameType: frameEditState.activeFrame.metadata ? frameEditState.activeFrame.metadata.frameType : frameEditState.activeFrame.type,
            cropX: initCropX,
            cropY: initCropY,
            cropWidth: cropWidth,
            cropHeight: cropHeight,
        };

        frameEditState.activeFrame.strokeWidth = 0;

        // Store frame reference for edit mode toggle
        const shapeRef = frameEditState.activeFrame;

        shapeRef.set({
            fill: 'transparent',
        });

        // Group frame and image
        const group = new fabric.Group([shapeRef, img], {
            left: frameEditState.activeFrame.left,
            top: frameEditState.activeFrame.top,
            originX: 'center',
            originY: 'center',
            angle: frameEditState.activeFrameAngle || 0,
            metadata: { isFrameGroup: true }
        });
        group.data = { shapeRef: shapeRef };

        canvas.remove(frameEditState.activeFrame);
        canvas.add(group);

        canvas.setActiveObject(group);
        frameEditState.activeFrame = null;
        canvas.renderAll();

        frameEditState.currentGroup = group; // store original group reference


    }, { crossOrigin: 'anonymous' });
}

const enterEditMode = function (e) {

    frameEditState.isEditMode = true;
    canvas.selection = false;
    const activeObject = e.target;
    frameEditState.currentGroup = activeObject;

    // get the index of the active object
    frameEditState.zIndex = canvas.getObjects().indexOf(activeObject);

    // lock all except the active object
    lockAllExcept(e.target)

    // configure cropping mode as in crop.html
    canvas.remove(frameEditState.currentGroup);

    const shapeRef = activeObject._objects.find(obj => obj.type !== 'image');
    const imgCurrent = activeObject._objects.find(obj => obj.type === 'image');

    imgCurrent.on('mousedblclick', exitEditMode);

    frameEditState.shapeRef = shapeRef;

    const groupScaleX = activeObject.scaleX;
    const groupScaleY = activeObject.scaleY;
    const groupAngle = activeObject.angle || 0;

    // create checkerboard rect
    const checkerboardRect = new fabric.Rect({
        left: 0,
        top: 0,
        width: canvas.getWidth(),
        height: canvas.getHeight(),
        fill: checkerboardPattern,
        selectable: false,
        evented: true,
        originX: 'left',
        originY: 'top',
        id: 'checkerboardRect',
        opacity: 0.5,
    });

    canvas.preserveObjectStacking = true;

    canvas.add(checkerboardRect);
    canvas.add(imgCurrent);
    canvas.add(shapeRef);

    shapeRef.set({
        opacity: 1,
        selectable: false,
        evented: false,
        strokeWidth: 2,
        strokeUniform: true,
        stroke: 'rgba(0, 162, 255, 0.8)',
        strokeDashArray: [5, 5],
    });
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
        let imgTLx = activeObject.left - (imgCurrent.width * imgCurrent.scaleX * groupScaleX) / 2;
        let imgTLy = activeObject.top - (imgCurrent.height * imgCurrent.scaleY * groupScaleY) / 2;

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
        // backdrop.setPositionByOrigin(activeObject.getCenterPoint(), 'center', 'center');
        // backdrop.setCoords();
        canvas.renderAll();
        canvas.sendBackwards(backdrop);
        canvas.bringForward(imgCurrent);
        canvas.bringForward(shapeRef);
    }, { crossOrigin: 'anonymous' });

    // handlers same as crop.html
    const handleScaling = function (e) {
        const image = e.transform.target;
        if (image.isCropping) {
            image.isScaling = true;
            const backdrop = getById(image.backdropId);
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
        const backdrop = getById(image.backdropId);
        if (backdrop) {
            backdrop._left = backdrop.left;
            backdrop._top = backdrop.top;
        }
    };

    const handleMouseMove = function (e) {
        const image = e.target;
        const backdrop = getById(image.backdropId);

        if (image.isMouseDown && backdrop && !image.isScaling) {

            const group = image.group;
            const groupAngle = group ? group.angle : 0;
            const groupScaleX = group ? group.scaleX : 1;
            const groupScaleY = group ? group.scaleY : 1;
            const angleRad = fabric.util.degreesToRadians(groupAngle);

            const diffX = e.pointer.x - image.mouseDownX;
            const diffY = e.pointer.y - image.mouseDownY;

            const cosA = Math.cos(angleRad);
            const sinA = Math.sin(angleRad);
            const rotatedDiffX = diffX * cosA + diffY * sinA;
            const rotatedDiffY = diffY * cosA - diffX * sinA;

            backdrop.left = backdrop._left + rotatedDiffX;
            backdrop.top = backdrop._top + rotatedDiffY;

            const groupCenter = group
                ? { x: group.left, y: group.top }
                : { x: image.left, y: image.top };

            const imageW = image.width * image.scaleX * groupScaleX;
            const imageH = image.height * image.scaleY * groupScaleY;
            const imageTLx = groupCenter.x - imageW / 2;
            const imageTLy = groupCenter.y - imageH / 2;

            const backdropW = backdrop.width * backdrop.scaleX;
            const backdropH = backdrop.height * backdrop.scaleY;

            if (backdrop.left > imageTLx) backdrop.left = imageTLx;
            if (backdrop.top > imageTLy) backdrop.top = imageTLy;
            if (backdrop.left + backdropW < imageTLx + imageW) backdrop.left = imageTLx + imageW - backdropW;
            if (backdrop.top + backdropH < imageTLy + imageH) backdrop.top = imageTLy + imageH - backdropH;

            const deltaX = imageTLx - backdrop.left;
            const deltaY = imageTLy - backdrop.top;

            image.cropX = (deltaX * cosA - deltaY * sinA) / (image.scaleX * groupScaleX);
            image.cropY = (deltaY * cosA + deltaX * sinA) / (image.scaleY * groupScaleY);

            // backdrop.setPositionByOrigin(image.group.getCenterPoint(), 'center', 'center');
            // backdrop.setCoords();
            console.group('image');
            console.log(image.cropX, image.cropY, image.width, image.height, image.scaleX, image.scaleY);
            console.groupEnd();

            console.group('backdrop');
            console.log(backdrop.top, backdrop.left);
            console.groupEnd();
            
            canvas.renderAll();
        }
    };

    const handleMouseUp = function (e) {
        const image = e.target;
        image.isMouseDown = false;
        image.isScaling = false;
        const backdrop = getById(image.backdropId);
        if (backdrop) {
            backdrop._left = backdrop.left;
            backdrop._top = backdrop.top;
        }
    };

    // add event listeners for scaling, mouse down, mouse move, and mouse up
    imgCurrent.on('scaling', handleScaling);
    imgCurrent.on('mousedown', handleMouseDown);
    imgCurrent.on('mousemove', handleMouseMove);
    imgCurrent.on('mouseup', handleMouseUp);

    // exit edit mode when clicking on the checkerboard rect
    checkerboardRect.on('mousedown', () => {
        checkerboardRect.off('mousedown');
        let e = { target: imgCurrent };
        exitEditMode(e)
    })
    canvas.renderAll();
};

const exitEditMode = function (e) {
    e.target.off('mousedblclick');
    canvas.selection = true;
    if (!frameEditState.isEditMode) return;

    frameEditState.isEditMode = false;

    let imgCurrent = e.target;

    let shapeRef = frameEditState.shapeRef;

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
        left: shapeRef.left || 0,
        top: shapeRef.top || 0,
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

    shapeRef.set({ opacity: 1, fill: 'transparent', stroke: null });
    canvas.renderAll();

    // reconstruct original group
    const newGroup = new fabric.Group([shapeRef, imgCurrent], {
        left: frameEditState.currentGroup.left,
        top: frameEditState.currentGroup.top,
        scaleX: frameEditState.currentGroup.scaleX,
        scaleY: frameEditState.currentGroup.scaleY,
        angle: frameEditState.currentGroup.angle,
        originX: 'center',
        originY: 'center',
        metadata: { isFrameGroup: true }
    });

    newGroup.data = { shapeRef: shapeRef };

    // Move the reconstructed group to the original zIndex position
    if (typeof frameEditState.zIndex === 'number') {
        // Remove individual objects first
        canvas.remove(shapeRef);
        canvas.remove(imgCurrent);
        // Add the group at the correct position
        canvas.insertAt(newGroup, frameEditState.zIndex, false);
    } else {
        // Fallback: remove individual objects and add the group
        canvas.remove(shapeRef);
        canvas.remove(imgCurrent);
        canvas.add(newGroup);
    }

    // unlock all objects
    unlockAll();
    canvas.preserveObjectStacking = false;
    canvas.setActiveObject(newGroup);
    canvas.renderAll();

    frameEditState.zIndex = null;
    frameEditState.shapeRef = null;

};

// lock all objects except the active one
const lockAllExcept = function(activeObject) {
    // Unlock all objects first
    unlockAll();

    // Select the desired object
    canvas.setActiveObject(activeObject);

    // Lock all other objects
    canvas.getObjects().forEach(obj => {
        if (obj !== activeObject) {

            if (obj.selectable || obj.evented) {
                // Store current values if they don't exist                
                obj.originalSelectable = obj.selectable;
                obj.originalEvented = obj.evented;
                // Lock temporarily
                obj.set({
                    selectable: false,
                    evented: false
                });
            }
        }
    });

    canvas.renderAll();
}

// unlock all objects
const unlockAll = function() {
    canvas.getObjects().forEach(obj => {
        // Restore original values if they exist
        if (obj.originalSelectable !== undefined && obj.originalEvented !== undefined) {
            obj.set({
                selectable: obj.originalSelectable,
                evented: obj.originalEvented
            });
            // Clear original properties to avoid side effects in future operations
            delete obj.originalSelectable;
            delete obj.originalEvented;
        }
        // If we don't have original values, leave the object as is
    });
}

// update active selected object
const updateActiveSelectedObject = function (e) {
    if (e.selected && e.selected[0] && e.selected[0].type === 'image' && frameEditState.awaitImage && frameEditState.activeFrame) {
        addImage(e.selected[0].src);
    } else {
        frameEditState.awaitImage = false;
        frameEditState.activeFrame = null;
        if (e.selected && e.selected[0] && e.selected[0].metadata && e.selected[0].metadata.frameType) {
            frameEditState.activeFrame = e.selected[0];
            frameEditState.awaitImage = true;
        }
    } 
}

// double click on frame group
const mouseDblclick = function (options) {
    if (options.target) {
        if (options.target.metadata && options.target.metadata.isFrameGroup) {
            if (!frameEditState.isEditMode) {
                enterEditMode(options);
            }
        }
    }
}

// delete frame group or image
const deleteAction = function (e) {
    if (e.selected && e.selected[0] && e.selected[0].metadata && e.selected[0].metadata.isFrameGroup) {
        frameEditState.activeFrame = null;
    }
    if (e.target && e.target.data && e.target.data.frameType) {
        if (frameEditState.isEditMode) {
            disassembleGroup(e);
        }
    }
}

// disassemble frame group
const disassembleGroup = function (e) {
    exitEditMode(e);
    const group = canvas.getActiveObject();
    const objects = group.getObjects();
    group.destroy();
    canvas.remove(group);
    objects.forEach(function (obj) {
        if (obj.type !== 'image') {
            const pattern = createScaledPattern(obj);
            obj.set({
                selectable: true,
                evented: true,
                hasControls: true,
                hasBorders: true,
                fill: pattern,
            });
            canvas.add(obj);
        }
    })
    canvas.renderAll();
}


const getById = (id) => {
    let objects = canvas.getObjects();
    for (let i = 0; i < objects.length; i++) if (objects[i].id == id) return objects[i]
}

const checkerboardPattern = checkerboardPatternCreated();
const background = backgroundImageCreated();

canvas.on('selection:created', updateActiveSelectedObject);
canvas.on('selection:updated', updateActiveSelectedObject);
canvas.on('selection:cleared', updateActiveSelectedObject);
canvas.on('mouse:dblclick', mouseDblclick);
canvas.on('object:removed', deleteAction);
