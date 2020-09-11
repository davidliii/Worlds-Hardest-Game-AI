/* User input methods */

var ballTypeSelect;
var ballRotateLengthInput;
var levelSelect;

// Toggles
var isEditMode = true;
var isHumanMode = true;
var environmentFeaturesVisible = false;
var playerFeaturesVisible = false;

function setupUserInput() {
    ballTypeSelect = document.getElementById("ballTypeSelect");
    levelSelect = document.getElementById("levelSelect");
    ballRotateLengthInput = document.getElementById("ballRadiusInput");
}

function toggleEdit() {
    isEditMode = true;
}

function toggleSave() {
    isEditMode = false;
}

function resetGame() {
    GAME.resetGame();
}

function setLevel() {
    GAME.clearGame();
    let level = levelSelect.value;
    switch (level) {
        case "level1":
            setLevel1(GAME);
            break;
        case "level2":
            setLevel2(GAME);
            break;
        case "level3":
            setLevel3(GAME);
            break;
        case "level4":
            setLevel4(GAME);
            break;
        case "level5":
            setLevel5(GAME);
            break;
        case "level6":
            setLevel6(GAME);
            break;
    }
}

function toggleEnvironmentFeatures() {
    environmentFeaturesVisible = !environmentFeaturesVisible;
}

function togglePlayerFeatures() {
    playerFeaturesVisible = !playerFeaturesVisible;
}

function getBallTypeSelection() {
    return ballTypeSelect.value;
}

function getBallRotateLengthInput() {
    if (!isNaN(ballRotateLengthInput.value)) {
        return int(ballRotateLengthInput.value)
    }
    return 0;
}