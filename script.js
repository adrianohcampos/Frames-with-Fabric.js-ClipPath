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

document.addEventListener('keydown', function (e) {
    if (e.key === 'Delete' || e.key === 'Del') {
        deleteObject();
    }
});

// frame editor instance
const frameEditor = new FrameEditor(canvas);