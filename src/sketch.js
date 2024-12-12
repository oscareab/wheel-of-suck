import p5 from 'p5';
import confs from './confs.js';
import $ from 'jquery';

let images = [];
let totalImages = 0; // Adjust this value to the number of images you want
let imagePositions = []; // Store image positions for hover detection
let conf;

let zoomLevel = 1; // Initial zoom level
let panOffset = { x: 0, y: 0 }; // Initial pan offset
let isPanning = false;
let startPan = { x: 0, y: 0 };

const sketch = (p) => {
    p.preload = () => {
        conf = confs.mac;
        for (let i = 0; i < conf.length; i++) {
            images[i] = p.loadImage(conf[i][1]);
        }

        totalImages = images.length;
    };

    p.setup = () => {
        let container = document.getElementById('canvasDiv');
        let width = container.offsetWidth;
        let height = container.offsetHeight;

        const canvas = p.createCanvas(width, height);
        canvas.parent(container); // Attach the canvas to the container

        p.noFill();
        p.stroke(0);
    };

    p.draw = () => {
        p.background(255);

        let centerX = p.width / 2;
        let centerY = p.height / 2;
        let radius = Math.min(p.width, p.height) * 0.4; // 30% of the smaller dimension

        // Draw images in a circle and store positions for hover detection
        imagePositions = []; // Reset positions array for each frame
        for (let i = 0; i < totalImages; i++) {
            let angle = p.map(i, 0, totalImages, 0, Math.PI * 2);
            let x = centerX + radius * p.cos(angle);
            let y = centerY + radius * p.sin(angle);

            let imgSize = radius * 0.2;
            p.image(images[i], x - imgSize / 2, y - imgSize / 2, imgSize, imgSize);

            // Store position and size for hover detection
            imagePositions.push({ x: x, y: y, size: imgSize });
        }

        // Draw arrows, but store their end points to prevent being covered
        let arrowPositions = [];
        for (let i = 0; i < totalImages; i++) {
            let angleStart = p.map(i, 0, totalImages, 0, Math.PI * 2);
            let angleEnd = p.map(i + 1, 0, totalImages, 0, Math.PI * 2);

            let startX = centerX + radius * p.cos(angleStart);
            let startY = centerY + radius * p.sin(angleStart);
            let endX = centerX + radius * p.cos(angleEnd);  // Adjust as needed
            let endY = centerY + radius * p.sin(angleEnd);  // Adjust as needed

            arrowPositions.push({ startX, startY, endX, endY });
            drawArrow(p, startX, startY, endX, endY);
        }

        // Show hover text box
        for (let i = 0; i < totalImages; i++) {
            let imgPos = imagePositions[i];
            // Check if the mouse is over the image
            if (p.dist(p.mouseX, p.mouseY, imgPos.x, imgPos.y) < imgPos.size / 2) {
                // Prepare the text you want to display
                let textContent = `Lost ${conf[i][2]} - ${conf[i][3]} to ${conf[(i + 1) % conf.length][0]}`;

                // Calculate the width and height of the text
                let textWidth = p.textWidth(textContent);  // Get width of the text
                let textHeight = 20;  // You can adjust the height based on the font size

                // Calculate position for the rectangle (to center it)
                let rectX = imgPos.x + imgPos.size / 2 + 10;
                let rectY = imgPos.y - textHeight / 2 - 20; // Center the box vertically with respect to the text

                // Draw background rectangle for the tooltip, sized to fit the text
                p.fill(0, 150);  // Semi-transparent black background
                p.noStroke();
                p.rect(rectX, rectY, textWidth + 20, textHeight + 10); // Add padding to the box

                // Draw the text (centered within the box)
                p.fill(255);  // White text color
                p.textSize(14); // Adjust text size for better fit
                p.textAlign(p.CENTER, p.CENTER); // Center the text horizontally and vertically
                p.text(textContent, rectX + (textWidth + 20) / 2, rectY + (textHeight + 10) / 2);  // Position the text in the center of the box
            }
        }
    }

    const drawArrow = (p, x1, y1, x2, y2) => {
        let arrowSize = 5; // Arrowhead size
        let arrowLength = p.dist(x1, y1, x2, y2) * 0.6; // Shorten the arrow by 40% (adjust as needed)

        [x1, x2] = [x2, x1];  // Swap start and end points for reverse direction
        [y1, y2] = [y2, y1];

        // Calculate the new endpoint closer to the starting point
        let angle = p.atan2(y2 - y1, x2 - x1);
        let newStartX = x2 - arrowLength * p.cos(angle);
        let newStartY = y2 - arrowLength * p.sin(angle);
        let newEndX = x1 + arrowLength * p.cos(angle);
        let newEndY = y1 + arrowLength * p.sin(angle);

        p.stroke(0); // Arrow line color
        p.line(newStartX, newStartY, newEndX, newEndY); // Draw the shortened arrow line

        p.push();
        p.translate(newEndX, newEndY);
        p.rotate(angle);

        p.fill(0); // Arrowhead color
        p.noStroke();
        p.triangle(0, 0, -arrowSize, -arrowSize / 2, -arrowSize, arrowSize / 2);
        p.pop();
    };


    p.windowResized = () => {
        let container = document.getElementById('canvasDiv');
        let width = container.offsetWidth;
        let height = container.offsetHeight;
        p.resizeCanvas(width, height);
    };

    $(function () {
        
    
        $('#confSelect').on('change', function () {
            let conference = $(this).val();
            conf = confs[conference]; // Change the configuration
            totalImages = conf.length;
    
            // Reload the images based on the new configuration
            images = [];
            for (let i = 0; i < conf.length; i++) {
                images[i] = p.loadImage(conf[i][1]);  // Reload images from new configuration
            }
        })
    });
};

new p5(sketch);
