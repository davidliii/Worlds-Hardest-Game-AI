function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloatBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomBool() {
    let value = getRandomIntInclusive(0, 1);
    if (value == 0) {
        return false;
    }

    else {
        return true;
    }
}

function print_green(x) {
    console.log(JSON.parse(JSON.stringify('\033[32m' + x + '\033[39m')));
}

function print_red(x) {
    console.log(JSON.parse(JSON.stringify('\033[31m' + x + '\033[39m')));
}

function getFuncName() {
    return getFuncName.caller.name;
}
