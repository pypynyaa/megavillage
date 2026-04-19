// --- 1. КАРТА, ВКЛАДКИ И КАЛЬКУЛЯТОР ---
function init() {
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        const centerCoords = [59.927284, 30.339182];
        const myMap = new ymaps.Map("map", {
            center: centerCoords, zoom: 16, controls: ['zoomControl']
        });
        myMap.geoObjects.add(new ymaps.Placemark(centerCoords, {balloonContent: 'Ломоносова, 9'}));
        myMap.behaviors.disable('scrollZoom');
    }
}
if (typeof ymaps !== 'undefined') ymaps.ready(init);

// Калькулятор
const openCalcBtn = document.getElementById('open-calc');
if (openCalcBtn) openCalcBtn.addEventListener('click', () => {
    openOrScroll('window-calc');
});

function calcInp(v) { document.getElementById('calc-display').value += v; }
function calcResult() {
    try { 
        let d = document.getElementById('calc-display');
        d.value = eval(d.value); 
    } catch { alert("Error"); }
}

// --- 2. ГЛОБАЛЬНАЯ ЛОГИКА ОКОН И ТАСКБАРА ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. При загрузке создаем иконки ТОЛЬКО для реально видимых окон
    const startWindows = document.querySelectorAll('.window-main, .cta-section');
    startWindows.forEach(win => {
        // Список ID, которые НЕ должны создавать иконку при старте (скрытые окна)
        const isExcluded = [
            'win-notepad', 
            'window-calc', 
            'error-window', 
            'registration-container', 
            'win-jokes'
        ].includes(win.id);
        
        if (win.id && win.offsetParent !== null && !isExcluded) {
            createTaskbarIcon(win.id);
        }
    });

    // 2. Обработка КРЕСТИКА (Закрытие)
    // 2. Обработка КРЕСТИКА (Закрытие)
    const closeButtons = document.querySelectorAll('.close');
    let closedCount = 0;

    closeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const win = btn.closest('.window-main, .cta-section, .registration-window, .info-map-block, .footer, .notepad-window, #window-calc');
            
            if (win) {
                // ПРОВЕРКА НА ПАПКУ: Если закрываем именно папку — сразу BSOD
                if (win.id === 'win-papka') {
                    const bsod = document.getElementById('bsod');
                    if (bsod) {
                        bsod.style.display = 'block';
                        // Опционально: скрываем весь остальной контент, чтобы нельзя было кликать под BSOD
                        document.body.style.overflow = 'hidden'; 
                    }
                    return; // Прерываем функцию, чтобы дальше ничего не выполнялось
                }

                const oncl = btn.getAttribute('onclick') || "";
                if (!oncl.includes('showForm') && !oncl.includes('closeNotepad')) {
                    win.style.display = 'none';
                    const container = win.closest('.container') || win.parentElement;
                    if (container && container.classList.contains('container')) container.style.display = 'none';

                    const icon = document.querySelector(`[data-target="${win.id}"]`);
                    if (icon) icon.remove();

                    closedCount++;
                    // Твоя старая проверка на 6 закрытых окон тоже остается
                }
            }
        });
    });
});

// Универсальная функция: Открыть, Восстановить И СКРОЛЛИТЬ
function openOrScroll(winId) {
    const win = document.getElementById(winId);
    if (!win) return;

    // Сначала создаем иконку (внутри createTaskbarIcon встроена проверка на дубликаты)
    createTaskbarIcon(winId);

    // Специфическая логика для обертки блокнота
    if (winId === 'win-notepad') {
        const noteCont = document.getElementById('notepad-container');
        if (noteCont) noteCont.style.display = 'block';
    }

    // 1. Показываем само окно и его родительский контейнер
    win.style.display = 'block';
    const container = win.closest('.container');
    if (container) container.style.display = 'block';

    // 2. Убираем класс сворачивания, если он был
    win.classList.remove('minimizing-to-sidebar');

    // 3. СКРОЛЛИМ К ОКНУ
    setTimeout(() => {
        win.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Визуальный эффект подсветки заголовка
        const title = win.querySelector('.window-title');
        if (title) {
            title.style.transition = "filter 0.3s";
            title.style.filter = "brightness(1.5)";
            setTimeout(() => title.style.filter = "", 500);
        }
    }, 50);
}

// Функция создания иконки в таскбаре (сайдбаре)
function createTaskbarIcon(winId) {
    const taskbar = document.getElementById('minimized-apps-container');
    // ПРОВЕРКА НА ДУБЛИКАТ: Если иконка для этого ID уже существует, выходим
    if (!taskbar || document.querySelector(`[data-target="${winId}"]`)) return;

    const windowEl = document.getElementById(winId);
    if (!windowEl) return;
    
    const customIcon = windowEl.getAttribute('data-icon') || 'images/exe.png';

    const icon = document.createElement('div');
    icon.className = 'minimized-icon-item visible';
    icon.setAttribute('data-target', winId);
    icon.innerHTML = `<img src="${customIcon}" style="width:70px; height:70px; object-fit:contain;">`;
    
    icon.onclick = function() {
        const targetWin = document.getElementById(winId);
        const isHidden = targetWin.style.display === 'none' || targetWin.classList.contains('minimizing-to-sidebar');
        
        if (isHidden) {
            openOrScroll(winId);
        } else {
            // Если уже открыто — просто фокус скроллом
            targetWin.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const title = targetWin.querySelector('.window-title');
            if (title) {
                title.style.transition = "filter 0.3s";
                title.style.filter = "brightness(1.8)";
                setTimeout(() => title.style.filter = "", 400);
            }
        }
    };
    taskbar.appendChild(icon);
}

// Сворачивание окна
function minimizeWindow(btn) {
    const windowEl = btn.closest('.window-main, .cta-section, .registration-window, .info-map-block, .footer, .notepad-window, #window-calc');
    if (!windowEl) return;

    windowEl.classList.add('minimizing-to-sidebar');

    setTimeout(() => {
        windowEl.style.display = 'none';
        const container = windowEl.closest('.container');
        if (container) container.style.display = 'none';
    }, 400);
}

// --- 3. ПРОВОДНИК И ПАПКИ ---
const folderData = {
    'tab1': ['images/banya.jpg', 'images/banya2.jpg', 'images/banya3.jpg'],
    'tab2': ['images/baseinb.jpg', 'images/basein2.jpg'],
    'tab3': ['images/pole.jpg'],
    'tab4': ['images/domik1.jpg', 'images/domik2.jpg', 'images/domik3.jpg']
};

function openFolder(folderId, folderName) {
    const grid = document.getElementById('folder-grid');
    const view = document.getElementById('folder-view');
    const backBtn = document.getElementById('back-button');
    const winTitle = document.querySelector('#win-papka .window-title');

    grid.style.display = 'none';
    view.style.display = 'grid'; // Используем grid для ровной сетки
    backBtn.style.display = 'block';

    // Очищаем старое содержимое перед добавлением новых фото
    view.innerHTML = '';

    if (folderData[folderId]) {
        folderData[folderId].forEach((imgSrc, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'folder-item'; 
            
            fileItem.innerHTML = `
                <div style="width: 100%; height: 60px; overflow: hidden; border: 1px solid #777; background: #000;">
                    <img src="${imgSrc}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <span>photo_${index + 1}.jpg</span>
            `;
            view.appendChild(fileItem);
        });
    }
    
    if (winTitle) winTitle.textContent = `C:\\файлы\\${folderName}`;
}

function showFolderGrid() {
    document.getElementById('folder-grid').style.display = 'grid';
    document.getElementById('folder-view').style.display = 'none';
    document.getElementById('back-button').style.display = 'none';
    const winTitle = document.querySelector('#win-papka .window-title');
    if (winTitle) winTitle.textContent = "C:\\файлы";
}

// --- 4. БЛОКНОТ И ОШИБКИ ---
const textFiles = {
    'rules.txt': 'ПРАВИЛА ТУСЫ:\n\n1. Не спать.\n2. Быть заряженным.\n3. Рега обязательна.\n\nКто нарушит — тот чистит картошку!',
};

function openTxt(fileName) {
    const content = document.getElementById('notepad-content');
    const title = document.getElementById('notepad-title');

    if (textFiles[fileName]) {
        if (title) title.textContent = fileName;
        if (content) content.value = textFiles[fileName];
        openOrScroll('win-notepad');
    }
}

function closeNotepad() {
    const win = document.getElementById('win-notepad');
    const container = document.getElementById('notepad-container');
    if (win) win.style.display = 'none';
    if (container) container.style.display = 'none';
    const icon = document.querySelector(`[data-target="win-notepad"]`);
    if (icon) icon.remove();
}

function showError() {
    openOrScroll('error-window');
}

function closeError() {
    const errWin = document.getElementById('error-window');
    if (errWin) errWin.style.display = 'none';
    const icon = document.querySelector(`[data-target="error-window"]`);
    if (icon) icon.remove();
}

// --- 5. РЕГИСТРАЦИЯ И МОБИЛЬНОЕ МЕНЮ ---
function showForm() {
    const regContainer = document.getElementById('registration-container');
    const winId = 'registration-container';
    
    if (regContainer.style.display === 'none' || !regContainer.classList.contains('show')) {
        regContainer.style.display = 'flex';
        setTimeout(() => regContainer.classList.add('show'), 10);
        openOrScroll(winId);
    } else {
        regContainer.classList.remove('show');
        setTimeout(() => {
            regContainer.style.display = 'none';
            const icon = document.querySelector(`[data-target="${winId}"]`);
            if (icon) icon.remove();
        }, 400);
    }
}

const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const mobileTrigger = document.getElementById('mobile-trigger');

function toggleSidebar() {
    if (sidebar) sidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
}

if (mobileTrigger) mobileTrigger.addEventListener('click', toggleSidebar);
if (overlay) overlay.addEventListener('click', toggleSidebar);