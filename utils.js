function intersectCircleSquare(circleData, squareData) {
    let [cx, cy] = circleData[0]; // circle center
    let radius = circleData[1] / 2; // circle radius
    let [top, left, bot, right] = squareData; // square points

    let [testX, testY] = [cx, cy];
    if (cx < left) {
        testX = left;
    }
    else if (cx > right) {
        testX = right;
    }

    if (cy < top) {
        testY = top;
    }
    else if (cy > bot) {
        testY = bot;
    }

    let distX = cx - testX;
    let distY = cy - testY;
    let distance = Math.sqrt(distX**2 + distY**2);
    if (distance <= radius) return true;
    return false;
}