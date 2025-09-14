/**
 * Classe FrameEditor - Gerencia frames com Fabric.js e ClipPath
 * Funcionalidades: Criação de frames, edição de imagens, crop, e diferentes formas geométricas
 */
class FrameEditor {
    constructor(canvas) {
        this.canvas = canvas;
        this.self = canvas;
        
        // Configurações base para modo de edição de frame
        this.CONFIG = {
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
            },
            DEFAULT_FILL: 'red'
        };

        // Estado para modo de edição de frame
        this.frameEditState = {
            isEditMode: false,
            zIndex: null,
            shapeRef: null,
            currentGroup: null,
            awaitImage: false,
            activeFrame: null,
            activeFrameAngle: 0,
            imgCurrent: null
        };

        // Padrões e imagens de fundo
        this.checkerboardPattern = this.createCheckerboardPattern();
        this.backgroundImageToPattern = this.createBackgroundImage(this.CONFIG.BACKGROUND_IMAGE_SRC);

        // Configurar event listeners
        this.setupEventListeners();
    }

    /**
     * Cria um padrão de tabuleiro para o fundo do modo de edição
     */
    createCheckerboardPattern() {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.CONFIG.CHECKERBOARD_SIZE;
        tempCanvas.height = this.CONFIG.CHECKERBOARD_SIZE;
        const ctx = tempCanvas.getContext('2d');

        // Desenha o padrão de tabuleiro
        ctx.fillStyle = this.CONFIG.CHECKERBOARD_COLOR_LIGHT;
        ctx.fillRect(0, 0, 10, 10);
        ctx.fillRect(10, 10, 10, 10);
        ctx.fillStyle = this.CONFIG.CHECKERBOARD_COLOR_DARK;
        ctx.fillRect(10, 0, 10, 10);
        ctx.fillRect(0, 10, 10, 10);

        return new fabric.Pattern({
            source: tempCanvas,
            repeat: 'repeat',
        });
    }

    /**
     * Cria uma imagem de fundo para usar como fonte no padrão
     */
    createBackgroundImage(imageSrc) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imageSrc;
        return img;
    }

    /**
     * Cria um padrão escalado usando imagem como fonte
     */
    createScaledPattern(object, background) {
        if (!background) {
            return this.CONFIG.DEFAULT_FILL;
        }

        const bounds = this.getObjectDimensions(object);
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

    /**
     * Função auxiliar para criar clipPath baseado no tipo de frame
     */
    createClipPath(frameType, width, height, frame = null) {
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
                const outerRadius = Math.min(width, height) / 2;
                const innerRadius = outerRadius * 0.5;
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
                const path = new fabric.Path(heartPath);
                return new fabric.Path(heartPath, {
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

    /**
     * Função auxiliar para obter dimensões do frame
     */
    getObjectDimensions(frame) {
        const bounds = frame.getBoundingRect();
        return { width: bounds.width, height: bounds.height };
    }

    /**
     * Função utilitária para criar objetos de frame de várias formas no canvas
     */
    createFrameObject(type, initialProps) {
        let frame;
        const commonProps = { ...this.CONFIG.DEFAULT_FRAME_PROPS, ...initialProps, metadata: { frameType: type } };

        switch (type) {
            case 'circle':
                frame = new fabric.Circle({ radius: 150, ...commonProps });
                break;

            case 'triangle':
                frame = new fabric.Triangle({ width: 250, height: 250, ...commonProps });
                break;

            case 'hexagon':
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

    /**
     * Função para adicionar um novo frame do tipo especificado ao canvas
     */
    addFrame(type) {
        const frame = this.createFrameObject(type);
        const pattern = this.createScaledPattern(frame, this.backgroundImageToPattern);
        frame.set("fill", pattern);
        this.self.add(frame);
        this.self.setActiveObject(frame);
        this.frameEditState.activeFrame = frame;
        frame.setPositionByOrigin(this.self.getCenterPoint(), 'center', 'center');
        frame.setCoords();
        this.self.renderAll();
    }

    /**
     * Função para fazer upload de uma imagem do computador do usuário e adicioná-la ao canvas
     */
    uploadImage(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            this.addImage(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    /**
     * Função para adicionar uma imagem ao canvas
     */
    addImage(imageUrl) {
        if (!this.frameEditState.activeFrame) {
            alert('Por favor, selecione ou adicione uma moldura primeiro!');
            return;
        }

        fabric.Image.fromURL(imageUrl, (img) => {
            this.frameEditState.activeFrameAngle = (typeof this.frameEditState.activeFrame.angle === 'number') ? this.frameEditState.activeFrame.angle : 0;
            this.frameEditState.activeFrame.set({ angle: 0 });

            this.self.renderAll();

            img.set({
                left: this.frameEditState.activeFrame.left,
                top: this.frameEditState.activeFrame.top,
                originX: 'center',
                originY: 'center',
                width: img.width,
                height: img.height,
                scaleX: 1,
                scaleY: 1,
            });

            // Escala uniforme (cover) e clipPath em coordenadas de imagem não escaladas
            const dimensions = this.getObjectDimensions(this.frameEditState.activeFrame);
            const targetWidth = dimensions.width;
            const targetHeight = dimensions.height;

            const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
            img.set({ scaleX: scale, scaleY: scale });

            // Armazena dimensões naturais para edição posterior
            const naturalWidth = img.width;
            const naturalHeight = img.height;

            // Corta imagem para área visível (reduz bounding box do objeto)
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

            this.self.renderAll();

            // Cria clipPath baseado no tipo de frame
            img.clipPath = this.createClipPath(
                this.frameEditState.activeFrame.metadata.frameType,
                cropWidth,
                cropHeight,
                this.frameEditState.activeFrame
            );

            this.self.renderAll();

            // Garante que a imagem permaneça selecionável
            img.set({ selectable: true });
            // Armazena metadados para edição (zoom mantendo frame fixo)
            img.data = {
                targetWidth: targetWidth,
                targetHeight: targetHeight,
                naturalWidth: naturalWidth,
                naturalHeight: naturalHeight,
                frameType: this.frameEditState.activeFrame.metadata ? this.frameEditState.activeFrame.metadata.frameType : this.frameEditState.activeFrame.type,
                cropX: initCropX,
                cropY: initCropY,
                cropWidth: cropWidth,
                cropHeight: cropHeight,
            };

            this.frameEditState.activeFrame.strokeWidth = 0;

            // Armazena referência do frame para alternância do modo de edição
            const shapeRef = this.frameEditState.activeFrame;

            shapeRef.set({
                fill: 'transparent',
            });

            // Agrupa frame e imagem
            const group = new fabric.Group([shapeRef, img], {
                left: this.frameEditState.activeFrame.left,
                top: this.frameEditState.activeFrame.top,
                originX: 'center',
                originY: 'center',
                angle: this.frameEditState.activeFrameAngle || 0,
                metadata: { isFrameGroup: true }
            });
            group.data = { shapeRef: shapeRef };

            this.self.remove(this.frameEditState.activeFrame);
            this.self.add(group);

            this.self.setActiveObject(group);
            this.frameEditState.activeFrame = null;
            this.self.renderAll();

            this.frameEditState.currentGroup = group; // armazena referência do grupo original

        }, { crossOrigin: 'anonymous' });
    }

    /**
     * Entra no modo de edição
     */
    enterEditMode(e) {
        const activeObject = (e && e.target) ? e.target : this.self.getActiveObject();
        
        this.frameEditState.isEditMode = true;
        this.self.selection = false;
        this.frameEditState.currentGroup = activeObject;

        this.frameEditState.activeFrameAngle = (typeof this.frameEditState.currentGroup.angle === 'number') ? this.frameEditState.currentGroup.angle : 0;

        // obtém o índice do objeto ativo
        this.frameEditState.zIndex = this.self.getObjects().indexOf(activeObject);

        // bloqueia todos exceto o objeto ativo
        this.lockAllExcept(activeObject);

        // configura modo de crop como em crop.html
        this.self.remove(this.frameEditState.currentGroup);

        const shapeRef = activeObject._objects.find(obj => obj.type !== 'image');
        const imgCurrent = activeObject._objects.find(obj => obj.type === 'image');

        imgCurrent.on('mousedblclick', () => this.exitEditMode());

        this.frameEditState.shapeRef = shapeRef;

        const groupScaleX = activeObject.scaleX;
        const groupScaleY = activeObject.scaleY;
        const groupAngle = activeObject.angle || 0;

        // cria retângulo de tabuleiro
        const checkerboardRect = new fabric.Rect({
            left: 0,
            top: 0,
            width: this.self.getWidth(),
            height: this.self.getHeight(),
            fill: this.checkerboardPattern,
            selectable: false,
            evented: true,
            originX: 'left',
            originY: 'top',
            id: 'checkerboardRect',
            opacity: 0.5,
        });

        this.self.preserveObjectStacking = true;

        this.self.add(checkerboardRect);
        this.self.add(imgCurrent);
        this.self.add(shapeRef);

        shapeRef.set({
            opacity: 1,
            selectable: false,
            evented: false,
            strokeWidth: 2,
            strokeUniform: true,
            stroke: 'rgba(0, 162, 255, 0.8)',
            strokeDashArray: [5, 5],
        });

        // remove clipPath e configura para crop
        imgCurrent.clipPath = null;
        imgCurrent.isCropping = true;
        imgCurrent.set({
            lockMovementX: true,
            lockMovementY: true,
            hasControls: true,
            selectable: true,
        });

        imgCurrent.setControlsVisibility({
            mtr: false, mt: false, mb: false, ml: false, mr: false,
            bl: false, br: false, tl: false, tr: false,
        });

        // cria backdrop
        fabric.Image.fromURL(imgCurrent._originalElement.currentSrc, (backdrop) => {
            backdrop.imageId = imgCurrent.id;
            imgCurrent.backdropId = 'backdrop-' + Date.now();
            
            let imgTLx = activeObject.left - (imgCurrent.width * imgCurrent.scaleX * groupScaleX) / 2;
            let imgTLy = activeObject.top - (imgCurrent.height * imgCurrent.scaleY * groupScaleY) / 2;

            backdrop.set({
                id: imgCurrent.backdropId,
                originX: 'left',
                originY: 'top',
                left: (imgTLx - (imgCurrent.cropX || 0) * imgCurrent.scaleX * groupScaleX),
                top: (imgTLy - (imgCurrent.cropY || 0) * imgCurrent.scaleY * groupScaleY),
                angle: imgCurrent.angle,
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

            // se o frame está rotacionado, esconde o backdrop
            if (this.frameEditState.activeFrameAngle > 0) {
                backdrop.set('opacity', 0);
            }

            this.self.add(backdrop);
            this.self.renderAll();
            this.self.sendBackwards(backdrop);
            this.self.bringForward(imgCurrent);
            this.self.bringForward(shapeRef);
        }, { crossOrigin: 'anonymous' });

        // handlers iguais ao crop.html
        this.setupCropHandlers(imgCurrent);

        this.self.setActiveObject(imgCurrent);

        this.frameEditState.imgCurrent = imgCurrent;
        // sai do modo de edição ao clicar no retângulo de tabuleiro
        checkerboardRect.on('mousedown', () => {
            checkerboardRect.off('mousedown');
            let e = { target: imgCurrent };
            this.exitEditMode(e);
        });
        this.self.renderAll();
    }

    /**
     * Configura os handlers para o modo de crop
     */
    setupCropHandlers(imgCurrent) {
        const handleScaling = (e) => {
            const image = e.transform.target;
            if (image.isCropping) {
                image.isScaling = true;
                const backdrop = this.getById(image.backdropId);
                if (backdrop) {
                    // não muda escala
                    image.scaleX = backdrop.scaleX;
                    image.scaleY = backdrop.scaleY;
                    // muda tamanho usando cropX & cropY
                    const diffX = image.left - backdrop.left;
                    const diffY = image.top - backdrop.top;
                    image.cropX = diffX;
                    image.cropY = diffY;
                    image.width = backdrop.width - diffX;
                    image.height = backdrop.height - diffY;
                    // limites
                    if (image.width > backdrop.width) image.width = backdrop.width;
                    if (image.height > backdrop.height) image.height = backdrop.height;
                    if (backdrop.left > image.left) backdrop.left = image.left;
                    if (backdrop.top > image.top) backdrop.top = image.top;
                    if (backdrop.top + backdrop.height < image.top + image.height) backdrop.top = image.top + image.height - backdrop.height;
                    if (backdrop.left + backdrop.width < image.left + image.width) backdrop.left = image.left + image.width - backdrop.width;
                }
            }
            this.self.renderAll();
        };

        const handleMouseDown = (e) => {
            const image = e.target;
            image.isMouseDown = true;
            image.mouseDownX = e.pointer.x;
            image.mouseDownY = e.pointer.y;
            const backdrop = this.getById(image.backdropId);
            if (backdrop) {
                backdrop._left = backdrop.left;
                backdrop._top = backdrop.top;
            }
        };

        const handleMouseMove = (e) => {
            const image = e.target;
            const backdrop = this.getById(image.backdropId);

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
                
                this.self.renderAll();
            }
        };

        const handleMouseUp = (e) => {
            const image = e.target;
            image.isMouseDown = false;
            image.isScaling = false;
            const backdrop = this.getById(image.backdropId);
            if (backdrop) {
                backdrop._left = backdrop.left;
                backdrop._top = backdrop.top;
            }
        };

        // adiciona event listeners para scaling, mouse down, mouse move, e mouse up
        imgCurrent.on('scaling', handleScaling);
        imgCurrent.on('mousedown', handleMouseDown);
        imgCurrent.on('mousemove', handleMouseMove);
        imgCurrent.on('mouseup', handleMouseUp);
    }

    /**
     * Sai do modo de edição
     */
    exitEditMode(e) {
        if (e && e.target) {
            e.target.off('mousedblclick');
        }
       
        this.self.selection = true;

        if (!this.frameEditState.isEditMode) return;

        this.frameEditState.isEditMode = false;

        let imgCurrent = (e && e.target) ? e.target : this.frameEditState.imgCurrent;
        this.frameEditState.imgCurrent = null;

        let shapeRef = this.frameEditState.shapeRef;

        // remove backdrop e aplica crop final
        const backdrop = this.self.getObjects().find(obj => obj.id === imgCurrent.backdropId);
        if (backdrop) this.self.remove(backdrop);
        const checkerboardRect = this.self.getObjects().find(obj => obj.id === 'checkerboardRect');
        if (checkerboardRect) this.self.remove(checkerboardRect);

        // remove todos os event listeners de crop
        imgCurrent.off('scaling');
        imgCurrent.off('mousedown');
        imgCurrent.off('mousemove');
        imgCurrent.off('mouseup');

        // desabilita crop
        imgCurrent.isCropping = false;
        imgCurrent.lockMovementX = false;
        imgCurrent.lockMovementY = false;
        imgCurrent.setControlsVisibility({
            mtr: true, mt: true, mb: true, ml: true, mr: true,
            bl: true, br: true, tl: true, tr: true,
        });

        // aplica crop final igual ao crop.html
        const meta = imgCurrent.data || {};
        const targetW = meta.targetWidth;
        const targetH = meta.targetHeight;
        // tamanho de recorte corrigido pela escala do grupo
        const cropWidth = targetW / (imgCurrent.scaleX);
        const cropHeight = targetH / (imgCurrent.scaleY);

        // centraliza no frame
        imgCurrent.set({
            left: shapeRef.left || 0,
            top: shapeRef.top || 0,
            originX: 'center',
            originY: 'center',
        });

        // cria clipPath do tamanho do frame
        imgCurrent.clipPath = this.createClipPath(meta.frameType, cropWidth, cropHeight);

        // atualiza metadados
        meta.cropX = imgCurrent.cropX;
        meta.cropY = imgCurrent.cropY;
        meta.cropWidth = cropWidth * imgCurrent.scaleX;
        meta.cropHeight = cropHeight * imgCurrent.scaleY;
        imgCurrent.data = meta;

        shapeRef.set({ opacity: 1, fill: 'transparent', stroke: null });
        this.self.renderAll();

        // reconstrói grupo original
        const newGroup = new fabric.Group([shapeRef, imgCurrent], {
            left: this.frameEditState.currentGroup.left,
            top: this.frameEditState.currentGroup.top,
            scaleX: this.frameEditState.currentGroup.scaleX,
            scaleY: this.frameEditState.currentGroup.scaleY,
            angle: this.frameEditState.currentGroup.angle,
            originX: 'center',
            originY: 'center',
            metadata: { isFrameGroup: true }
        });

        newGroup.data = { shapeRef: shapeRef };

        // Move o grupo reconstruído para a posição zIndex original
        if (typeof this.frameEditState.zIndex === 'number') {
            // Remove objetos individuais primeiro
            this.self.remove(shapeRef);
            this.self.remove(imgCurrent);
            // Adiciona o grupo na posição correta
            this.self.insertAt(newGroup, this.frameEditState.zIndex, false);
        } else {
            // Fallback: remove objetos individuais e adiciona o grupo
            this.self.remove(shapeRef);
            this.self.remove(imgCurrent);
            this.self.add(newGroup);
        }

        // desbloqueia todos os objetos
        this.unlockAll();
        this.self.preserveObjectStacking = false;
        this.self.setActiveObject(newGroup);
        this.self.renderAll();

        this.frameEditState.zIndex = null;
        this.frameEditState.shapeRef = null;
    }

    /**
     * Bloqueia todos os objetos exceto o ativo
     */
    lockAllExcept(activeObject) {
        // Desbloqueia todos os objetos primeiro
        this.unlockAll();

        // Seleciona o objeto desejado
        this.self.setActiveObject(activeObject);

        // Bloqueia todos os outros objetos
        this.self.getObjects().forEach(obj => {
            if (obj !== activeObject) {
                if (obj.selectable || obj.evented) {
                    // Armazena valores atuais se não existirem
                    obj.originalSelectable = obj.selectable;
                    obj.originalEvented = obj.evented;
                    // Bloqueia temporariamente
                    obj.set({
                        selectable: false,
                        evented: false
                    });
                }
            }
        });

        this.self.renderAll();
    }

    /**
     * Desbloqueia todos os objetos
     */
    unlockAll() {
        this.self.getObjects().forEach(obj => {
            // Restaura valores originais se existirem
            if (obj.originalSelectable !== undefined && obj.originalEvented !== undefined) {
                obj.set({
                    selectable: obj.originalSelectable,
                    evented: obj.originalEvented
                });
                // Limpa propriedades originais para evitar efeitos colaterais em operações futuras
                delete obj.originalSelectable;
                delete obj.originalEvented;
            }
            // Se não temos valores originais, deixa o objeto como está
        });
    }

    /**
     * Habilita seleção de imagem
     */
    enableToSelectImage() {
        this.frameEditState.awaitImage = false;
        if (this.frameEditState.activeFrame) {
            this.frameEditState.awaitImage = true;
        }
    }

    /**
     * Desabilita seleção de imagem
     */
    disableToSelectImage() {
        this.frameEditState.awaitImage = false;
    }

    /**
     * Função para atualizar objeto ativo selecionado
     */
    updateActiveSelectedObject(e) {
        if (e.selected && e.selected[0] && e.selected[0].type === 'image' && this.frameEditState.awaitImage && this.frameEditState.activeFrame) {
            this.addImage(e.selected[0].src);
        } else {
            this.frameEditState.activeFrame = null;
            if (e.selected && e.selected[0] && e.selected[0].metadata && e.selected[0].metadata.frameType) {
                this.frameEditState.activeFrame = e.selected[0];
            }
        }
        this.disableToSelectImage();
    }

    /**
     * Duplo clique no grupo de frame
     */
    mouseDblclick(options) {
        if (options.target) {
            if (options.target.metadata && options.target.metadata.isFrameGroup) {
                if (!this.frameEditState.isEditMode) {
                    this.enterEditMode(options);
                }
            }
        }
    }

    /**
     * Deleta grupo de frame ou imagem
     */
    deleteAction(e) {
        if (e.selected && e.selected[0] && e.selected[0].metadata && e.selected[0].metadata.isFrameGroup) {
            this.frameEditState.activeFrame = null;
        }
        if (e.target && e.target.data && e.target.data.frameType) {
            if (this.frameEditState.isEditMode) {
                this.disassembleGroup(e);
            }
        }
    }

    /**
     * Desmonta grupo de frame
     */
    disassembleGroup(e) {
        this.exitEditMode(e);
        const group = this.self.getActiveObject();
        if (!group || !group.metadata || !group.metadata.isFrameGroup) return;
        const objects = group.getObjects();
        group.destroy();
        this.self.remove(group);
        objects.forEach((obj) => {
            if (obj.type !== 'image') {
                const pattern = this.createScaledPattern(obj, this.backgroundImageToPattern);
                obj.set({
                    selectable: true,
                    evented: true,
                    hasControls: true,
                    hasBorders: true,
                    fill: pattern,
                    opacity: 1,
                });
                this.self.add(obj);
            }
        });
        this.self.renderAll();
    }

    /**
     * Obtém objeto por id
     */
    getById(id) {
        let objects = this.self.getObjects();
        for (let i = 0; i < objects.length; i++) {
            if (objects[i].id == id) return objects[i];
        }
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        this.self.on('selection:created', (e) => this.updateActiveSelectedObject(e));
        this.self.on('selection:updated', (e) => this.updateActiveSelectedObject(e));
        this.self.on('selection:cleared', (e) => this.updateActiveSelectedObject(e));
        this.self.on('mouse:dblclick', (e) => this.mouseDblclick(e));
        this.self.on('object:removed', (e) => this.deleteAction(e));
    }

    /**
     * Função para deletar objeto selecionado
     */
    deleteObject(object = null) {
        const activeObject = object || this.self.getActiveObject();
        if (activeObject) {
            this.self.remove(activeObject);
            this.self.discardActiveObject();
            this.self.renderAll();
        }
    }
}

// Exporta a classe para uso global
window.FrameEditor = FrameEditor;
