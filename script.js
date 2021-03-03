'use strict';
/*global localStorage, document, clearInterval, setInterval*/
/* jshint -W083 */
/* jshint -W097 */
import images from './images.js';
import {
    btnList,
    btnLoad,
    btnSave,
    btnSleepping,
    btnSound,
    btnStart,
    countStep,
    field,
    imgName,
    listItem,
    listItemImage,
    pTime,
    result,
    succes,
    ulImage
} from './variables.js';

const screenWidth = window.screen.width;
let isFinished = false;
let sleep = false;
const liName = [];
let srcLi = '';
let cellSize = 70;
let kolRowColumn = 4;
let empty = {
    value: kolRowColumn * kolRowColumn,
    top: kolRowColumn - 1,
    left: kolRowColumn - 1,
};
const cells = [];
const numbers = new Array(kolRowColumn * kolRowColumn - 1);
let s = 0;
let inv = 1;
let count = 0;
let sound = false;
let sec = 0;
let min = 0;
let hour = 0;
let isImage = false;
const audio = document.querySelectorAll('audio');
let clockTimer;
imgName.setAttribute('style', `width: ${kolRowColumn*4.375}rem;`);

function init() {
    isFinished = false;
    s = 0;
    inv = 1;
    empty = {
        value: kolRowColumn * kolRowColumn,
        top: kolRowColumn - 1,
        left: kolRowColumn - 1,
    };
    count = 0;
    field.innerHTML = '';
    cells.length = 0;
    cells.push(empty);
    numbers.length = 0;
    countStep.innerHTML = `Ходы: ${count}`;
    sec = 0;
    min = 0;
    hour = 0;
    pTime.innerHTML = `Время: ${addZero(hour)}<span>:<span>${addZero(min)}<span>:<span>${addZero(sec)}`;
    clearInterval(clockTimer);
}

/*  imgName.innerHTML = ''; */
//===================================move=====================
function move(index) {
    if (sleep) return;
    const cell = cells[index];
    const leftDiff = Math.abs(empty.left - cell.left);
    const topDiff = Math.abs(empty.top - cell.top);

    if (leftDiff + topDiff > 1) {
        return;
    }

    cell.element.style.left = `${empty.left * cellSize}px`;
    cell.element.style.top = `${empty.top*cellSize}px`;

    const emptyLeft = empty.left;
    const emptyTop = empty.top;

    empty.left = cell.left;
    empty.top = cell.top;

    cell.left = emptyLeft;
    cell.top = emptyTop;

    isFinished = cells.every(cell => {
        return cell.value === cell.top * kolRowColumn + cell.left + 1;
    });
    if (count === 0) { initTime(); }
    count++;
    if (sound) audio[0].play();
    countStep.innerHTML = `Ходы: ${count}`;
    if (isFinished) {
        localPush(kolRowColumn, count, pTime.innerHTML);
        if (sound) audio[1].play();
        clearInterval(clockTimer);
        if (isImage) {
            field.innerHTML = `<img src="${srcLi}"/>`;
            srcLi = '';
            isImage = false;
        } else {
            field.innerHTML = '<img src="assets/finish.jpg"/>';
        }
        showSucces(count);

    }
}

function soundfunc() {
    sound = !sound;
    if (sound) {
        btnSound.innerHTML = '<img src="assets/sound.png" title="Звук"/>';
    } else {
        btnSound.innerHTML = '<img src="assets/nosound.png" title="Без звука"/>';
    }
}

function start() {
    if (sleep) return;
    init();
    while (inv % 2) {
        for (let j = 0; j < kolRowColumn * kolRowColumn - 1; j++) numbers[j] = j + 1;
        numbers.sort(() => Math.random() - 0.5);
        inv = 0;
        for (let j = 0; j < kolRowColumn * kolRowColumn - 2; j++) {
            s = 0;
            for (let k = j + 1; k < kolRowColumn * kolRowColumn - 1; k++) {
                if (numbers[k] < numbers[j]) { s++; }
            }
            inv += s;
        }
    }


    for (let i = 1; i <= kolRowColumn * kolRowColumn - 1; i++) {
        const cell = document.createElement('div');
        const value = numbers[i - 1];
        cell.className = 'cell';
        cell.draggable = true;
        cell.innerHTML = value;

        const left = (i - 1) % kolRowColumn;
        const top = (i - 1 - left) / kolRowColumn;
        const leftImg = (value - 1) % kolRowColumn;
        const topImg = (value - 1 - leftImg) / kolRowColumn;
        cells.push({
            value: value,
            left: left,
            top: top,
            leftImg: leftImg,
            topImg: topImg,
            element: cell,
        });
        cell.style.left = `${left * cellSize}px`;
        cell.style.top = `${top * cellSize}px`;
        if (isImage) {
            cell.style.backgroundPosition = `${0-leftImg * cellSize}px ${0-topImg * cellSize}px`;
            cell.style.backgroundImage = `url(${srcLi})`;
            cell.style.backgroundRepeat = 'no-repeat';
            cell.style.backgroundSize = `${field.clientWidth}px ${field.clientHeight}px`;
        }
        field.append(cell);
        cell.addEventListener('dragend', () => {
            cell.classList.add('selected');
            move(i);
        });
        cell.addEventListener('click', () => {
            cell.classList.remove('selected');
            move(i);
        });
    }
}
//===============================create field saved game======================
function createField() {
    field.innerHTML = '';
    empty.top = cells[0].top;
    empty.left = cells[0].left;
    cells[0].top = kolRowColumn - 1;
    cells[0].left = kolRowColumn - 1;
    cells[0].value = kolRowColumn * kolRowColumn;
    for (let i = 1; i <= kolRowColumn * kolRowColumn - 1; i++) {
        const cell = document.createElement('div');
        const value = cells[i].value;
        cell.className = 'cell';
        cell.draggable = true;
        cell.innerHTML = value;

        const left = cells[i].left;
        const top = cells[i].top;
        const leftImg = cells[i].leftImg;
        const topImg = cells[i].topImg;

        cells[i].element = cell;

        cell.style.left = `${left * cellSize}px`;
        cell.style.top = `${top * cellSize}px`;
        if (isImage) {
            cell.style.backgroundPosition = `${0-leftImg * cellSize}px ${0-topImg * cellSize}px`;
            cell.style.backgroundImage = `url(${srcLi})`;
            cell.style.backgroundRepeat = 'no-repeat';
            cell.style.backgroundSize = `${field.clientWidth}px ${field.clientHeight}px`;
        }
        field.append(cell);
        cell.addEventListener('dragend', () => {
            cell.classList.add('selected');
            move(i);
        });
        cell.addEventListener('click', () => {
            cell.classList.remove('selected');
            move(i);
        });
    }
}

//===============================timer=====================================
function initTime() {
    clockTimer = setInterval(tick, 1000);
}

function tick() {
    sec++;
    if (sec >= 60) { //задаем числовые параметры, меняющиеся по ходу работы программы
        min++;
        sec = sec - 60;
    }
    if (min >= 60) {
        hour++;
        min = min - 60;
    }
    pTime.innerHTML = `Время: ${addZero(hour)}<span>:<span>${addZero(min)}<span>:<span>${addZero(sec)}`;
}

function addZero(n) {
    return (parseInt(n, 10) < 10 ? '0' : '') + n;
}
//======================================ulImage===================

for (let i = 0; i < listItem.length; i++) {
    listItem[i].onclick = function() {
        if (sleep) return;
        kolRowColumn = i + 3;
        /*  if (kolRowColumn > 4 && screenWidth < 500) {
             cellSize = 60;
             field.classList.add('mobile');

             cells.forEach(cell => cell.classLIst.add('mobileCell'));
             field.setAttribute('style', `width: ${kolRowColumn * 3.75}rem; height: ${kolRowColumn * 3.75}rem;`);
             return;
         }
         cellSize = 70;
         field.classList.remove('mobile');
         cells.forEach(cell => cell.classLIst.remove('mobileCell')); */
        field.setAttribute('style', `width: ${kolRowColumn*4.375}rem; height: ${kolRowColumn*4.375}rem;`);
        imgName.setAttribute('style', `width: ${kolRowColumn*4.375}rem;`);
        start();
    };
}

//===================drag&drop======================
field.ondragover = allowDrop;

function allowDrop(event) {
    event.preventDefault();
}

//===================================================


function loadGame() {
    if (sleep) return;
    const arrayGame = localStorage.getItem('arrayGame') !== null ? JSON.parse(localStorage.getItem('arrayGame')) : new Array(0);
    const sizeArray = arrayGame[0].size;
    if (kolRowColumn != sizeArray) return;
    count = arrayGame[0].kolStep;
    countStep.innerHTML = `Ходы: ${count}`;
    hour = arrayGame[0].hour;
    min = arrayGame[0].min;
    sec = arrayGame[0].sec;
    srcLi = arrayGame[0].srcLi;
    cells.length = 0;
    arrayGame[0].gameField.forEach(el => { cells.push(el); });
    createField();
}

function saveGame() {
    localStorage.removeItem('arrayGame');
    const game = {};
    game.size = kolRowColumn;
    game.kolStep = count;
    game.hour = hour;
    game.min = min;
    game.sec = sec;
    game.srcLi = srcLi;
    game.gameField = [];
    cells.forEach(el => { game.gameField.push(el); });
    game.gameField[0].left = empty.left;
    game.gameField[0].top = empty.top;
    const arrayGame = new Array(0);
    arrayGame.push(game);
    localStorage.setItem('arrayGame', JSON.stringify(arrayGame));
}


function sleepingMode() {
    if ((!sleep && (count != 0)) || isFinished) {
        btnSleepping.classList.toggle('noSleepping');
        clearInterval(clockTimer);
        sleep = !sleep;
        return;
    }
    if (sleep && (count != 0)) {
        btnSleepping.classList.toggle('noSleepping');
        initTime();
        sleep = !sleep;
        return;
    }
}

images.forEach((el, i) => {
    liName[i] = document.createElement('li');
    liName[i].classList.add('liName');
    liName[i].innerHTML = el.name + '. ' + el.author;
    ulImage.append(liName[i]);
});


for (let i = 0; i < liName.length; i++) {
    liName[i].onclick = () => {
        isImage = true;
        srcLi = `assets/box/${i + 1}.jpg `;
        ulImage.setAttribute('style', `opacity: 0; display: none;`);
        imgName.innerHTML = liName[i].innerHTML;
        start();
    };
}

listItemImage.onclick = function() {
    if (sleep) return;
    ulImage.setAttribute('style', `opacity: 1; display: flex;`);

};


function localPush() {
    const resultLs = {};
    resultLs.size = kolRowColumn;
    resultLs.kolStep = count;
    resultLs.time = `${ addZero(hour)}:${addZero(min)}:${addZero(sec)}`;
    const arrayResult = localStorage.getItem('arrayResult') !== null ? JSON.parse(localStorage.getItem('arrayResult')) : new Array(0);

    while (arrayResult.length > 9) {
        arrayResult.pop();
    }
    arrayResult.push(resultLs);
    arrayResult.sort(function(a, b) {
        if (a.kolStep > b.kolStep) {
            return 1;
        }
        if (a.kolStep < b.kolStep) {
            return -1;
        }
        // a должно быть равным b
        return 0;
    });
    localStorage.setItem('arrayResult', JSON.stringify(arrayResult));
}
result.onclick = function() {
    result.setAttribute('style', `opacity: 0; display: none;`);
};

function showResult() {
    result.setAttribute('style', `opacity: 1; display: flex;`);
    const arrayResult = localStorage.getItem('arrayResult') !== null ? JSON.parse(localStorage.getItem('arrayResult')) : new Array(0);
    let table = `<h3>Ваши результаты</h3>`;
    table += `<table><tr><th> Размер поля </th><th>Кол-во ходов</th><th>Время игры</th></tr><tr>`;
    if (arrayResult) {
        arrayResult.forEach(el => {
            table += `<td>${el.size}</td><td>${el.kolStep}</td><td>${el.time}</td></tr><tr>`;
        });
        table += `</tr>`;
    }
    result.innerHTML = table;
}
succes.onclick = function() {
    succes.classList.remove('anim');
    imgName.innerHTML = '';
    succes.setAttribute('style', `opacity: 0; display: none;`);
};

function showSucces(kolStep) {
    succes.classList.add('anim');
    succes.setAttribute('style', `opacity: 1; display: flex; flex-direction:column;`);
    succes.innerHTML = `<p>Ура! Вы решили головоломку</p><p> за ${hour}ч.${min}мин.${sec}сек. и ${kolStep} ходов</p>`;
}

start();
btnStart.addEventListener('click', start);
btnSound.addEventListener('click', soundfunc);
btnList.addEventListener('click', showResult);
btnSleepping.addEventListener('click', sleepingMode);
btnSave.addEventListener('click', saveGame);
btnLoad.addEventListener('click', loadGame);