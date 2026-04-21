// Функция для фикса высоты в Safari
function fixSafariHeight() {
    // Вычисляем 1% от высоты вьюпорта
    let vh = window.innerHeight * 0.01;
    // Устанавливаем значение переменной --vh для использования в CSS
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    // Отдельный фикс для сайдбара, если переменная не подхватится
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.style.height = window.innerHeight + 'px';
    }
}

// Слушатели событий
window.addEventListener('load', fixSafariHeight);
window.addEventListener('resize', fixSafariHeight);
window.addEventListener('orientationchange', fixSafariHeight);

// Вызываем сразу
fixSafariHeight();

function showBSOD() {
    const bsod = document.getElementById('bsod');
    if (!bsod) return;
    
    // Блокируем прокрутку
    document.body.classList.add('no-scroll');
    document.body.style.overflow = 'hidden';
    
    // Показываем BSOD
    bsod.style.display = 'block';
    bsod.style.position = 'fixed';
    bsod.style.top = '0';
    bsod.style.left = '0';
    bsod.style.width = '100%';
    bsod.style.height = '100%';
    bsod.style.zIndex = '9999999';
    bsod.style.backgroundColor = '#0000aa';
    bsod.style.color = '#ffffff';

    
    // Автоматическая перезагрузка через 10 секунд
    setTimeout(() => {
        if (bsod.style.display === 'block') {
            window.location.reload();
        }
    }, 10000);
}

if (typeof ymaps !== 'undefined') {
    ymaps.ready(init);
}

function calcInp(v) { document.getElementById('calc-display').value += v; }
function calcResult() {
    try { 
        let d = document.getElementById('calc-display');
        d.value = eval(d.value); 
    } catch { alert("Error"); }
}

// --- 2. ГЛОБАЛЬНАЯ ЛОГИКА ОКОН И ТАСКБАРА ---

document.addEventListener('DOMContentLoaded', () => {

    

    if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
        const preloader = document.getElementById('win98-preload');
        const sidebar = document.getElementById('sidebar');
        
        if (preloader) {
            // Принудительная перерисовка
            preloader.style.display = 'none';
            setTimeout(() => {
                preloader.style.display = 'flex';
                // Еще один форсированный рефлоу
                preloader.offsetHeight;
            }, 10);
        }
        
        if (sidebar) {
            sidebar.style.backgroundColor = '#ffffff';
            // Форсируем рефлоу
            sidebar.offsetHeight;
        }
    }
    // 1. При загрузке создаем иконки ТОЛЬКО для реально видимых окон
    const links = ['win-tanks', 'win-yt', 'win-wiki'];
    
    // Принудительно создаем иконки для них сразу при загрузке
    links.forEach(id => {
        createTaskbarIcon(id);
    });

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
    const closeButtons = document.querySelectorAll('.close');
    let closedCount = 0;

    closeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const win = btn.closest('.window-main, .cta-section, .registration-window, .info-map-block, .footer, .notepad-window, #window-calc');
            
            if (win) {
    // ПРОВЕРКА НА ПАПКУ: Если закрываем именно папку — сразу BSOD
    if (win.id === 'win-papka') {
        showBSOD(); // Используем отдельную функцию вместо прямого манипулирования
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
    }
}
        });
    });
});


// Универсальная функция: Открыть, Восстановить И СКРОЛЛИТЬ
function openOrScroll(winId) {
    const win = document.getElementById(winId);
    if (!win) return;

    // 1. Находим конкретный элемент, который мы анимировали (само "тело" окна)
    const content = win.querySelector('.window, .window-main, .registration-window, .notepad-window, .info-map-block, #window-calc, .window-vibe') || win;

    // Создаем иконку, если её нет
    createTaskbarIcon(winId);

    // Специфическая логика для блокнота
    if (winId === 'win-notepad') {
        const noteCont = document.getElementById('notepad-container');
        if (noteCont) noteCont.style.display = 'block';
    }

    // Фикс для карты
    if (winId === 'win-infa' && typeof myMap !== 'undefined' && myMap) {
        myMap.container.fitToViewport();
    }

    // 2. Сначала включаем отображение контейнеров. 
    // Окно всё еще сдвинуто за экран классом 'minimizing-to-sidebar', поэтому его не видно.
    win.style.display = (winId === 'registration-container') ? 'flex' : 'block';
    const container = win.closest('.container');
    if (container) container.style.display = 'block';

    if (winId === 'registration-container') {
        const regWindow = win.querySelector('.registration-window');
        if (regWindow) regWindow.style.display = 'block';
    }

    // 3. КЛЮЧЕВОЙ МОМЕНТ: небольшая задержка (10-20 мс), чтобы браузер "понял", 
    // что элемент теперь display: block, и подготовил его к анимации.
    setTimeout(() => {
        // Убираем класс, и запускается CSS transition (выезд из -1000px в 0)
        content.classList.remove('minimizing-to-sidebar');
        
        // Дополнительный сброс для окна регистрации, если класс был на нем
        if (winId === 'registration-container') {
            const regWindow = win.querySelector('.registration-window');
            if (regWindow) regWindow.classList.remove('minimizing-to-sidebar');
        }
    }, 20);

    // 4. Скроллим и подсвечиваем заголовок
    setTimeout(() => {
        win.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        const title = win.querySelector('.window-title');
        if (title) {
            title.style.transition = "filter 0.3s";
            title.style.filter = "brightness(1.5)";
            setTimeout(() => title.style.filter = "", 500);
        }
    }, 100); // Чуть увеличил задержку для скролла, чтобы он шел параллельно анимации выезда
}

// Функция создания иконки в таскбаре (сайдбаре)
function createTaskbarIcon(winId) {
    const taskbar = document.getElementById('minimized-apps-container');
    // ПРОВЕРКА НА ДУБЛИКАТ: Если иконка для этого ID уже существует, выходим
    if (!taskbar || document.querySelector(`[data-target="${winId}"]`)) return;

    const windowEl = document.getElementById(winId);
    if (!windowEl) return;
    
    const customIcon = windowEl.getAttribute('data-icon') || 'images/exe.png';
    const externalUrl = windowEl.getAttribute('data-url'); 

    const icon = document.createElement('div');
    icon.className = 'minimized-icon-item visible';
    icon.setAttribute('data-target', winId);
    icon.innerHTML = `<img src="${customIcon}">`;
    
    icon.onclick = function() {
        const targetWin = document.getElementById(winId);
        
        // Стандартная проверка
        let isHidden = targetWin.style.display === 'none' || targetWin.classList.contains('minimizing-to-sidebar');
        
        // ---> ФИКС ДЛЯ ОКНА РЕГИСТРАЦИИ: проверяем внутреннее окно <---
        if (winId === 'registration-container') {
            const regWindow = targetWin.querySelector('.registration-window');
            if (regWindow && (regWindow.style.display === 'none' || regWindow.classList.contains('minimizing-to-sidebar'))) {
                isHidden = true;
            }
        }
        
        if (externalUrl) {
            window.open(externalUrl, '_blank');
            return;
        }

        if (isHidden) {
            openOrScroll(winId);
        } else {
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
    'tab4': ['images/domik1.jpg', 'images/domik2.jpg', 'images/domik3.jpg', 'images/domik4.jpg', 'images/domik5.jpg', 'images/domik6.jpg'],
    'tab5': ['images/vaib.jpg', 'images/vaib2.jpg', 'images/vaib3.jpg', 'images/vaib4.jpg', 'images/vaib5.jpg', 'images/vaib6.jpg']
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
    const regWindow = regContainer.querySelector('.registration-window');
    
    // Проверяем: скрыт контейнер, или свернуто само окно внутри
    const isHidden = regContainer.style.display === 'none' || 
                     !regContainer.classList.contains('show') || 
                     (regWindow && regWindow.classList.contains('minimizing-to-sidebar')) ||
                     (regWindow && regWindow.style.display === 'none');
    
    if (isHidden) {
        regContainer.style.display = 'flex';
        setTimeout(() => regContainer.classList.add('show'), 10);
        openOrScroll(winId);
    } else {
        // Закрываем окно окончательно
        regContainer.classList.remove('show');
        setTimeout(() => {
            regContainer.style.display = 'none';
            if (regWindow) regWindow.style.display = 'block'; // Сбрасываем для следующего раза
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

    // Управляем видимостью стрелочки
    if (mobileTrigger) {
        if (sidebar.classList.contains('active')) {
            // Если бар открыт — скрываем стрелку
            mobileTrigger.style.opacity = '0';
            mobileTrigger.style.pointerEvents = 'none';
        } else {
            // Если бар закрыт — показываем стрелку
            mobileTrigger.style.opacity = '1';
            mobileTrigger.style.pointerEvents = 'auto';
        }
    }
}

if (mobileTrigger) mobileTrigger.addEventListener('click', toggleSidebar);
if (overlay) overlay.addEventListener('click', toggleSidebar);

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxotjg4lb6_6ravMwXIDlIFGmZoisTV147kaaiDHuu-1GqCJvb5e1SxSYU8NgEqrB4G/exec';

// Окно успешной регистрации + приглашение в закрытый чат.
function showSuccessWindow() {
    const successWindow = document.getElementById('success-window');
    if (!successWindow) return;
    successWindow.style.display = 'block';
}

function closeSuccessWindow() {
    const successWindow = document.getElementById('success-window');
    if (!successWindow) return;
    successWindow.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    const regaForm = document.getElementById('rega-form');
    const statusNode = document.getElementById('rega-submit-status');
    const feedbackForm = document.getElementById('feedback-form');
    
    const feedbackStatusNode = document.getElementById('feedback-status');
    if (!regaForm) return;

    regaForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (APPS_SCRIPT_URL.includes('PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE')) {
            alert('Сначала вставь URL Web App из Google Apps Script в APPS_SCRIPT_URL.');
            return;
        }

        const submitBtn = regaForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'ОТПРАВЛЯЕМ...';
        }
        if (statusNode) {
            statusNode.style.display = 'block';
            statusNode.textContent = 'Сохраняем данные...';
        }

        const payload = {
            telegram: (regaForm.elements.telegram?.value || '').trim(),
            phone: (regaForm.elements.phone?.value || '').trim(),
            sports: Array.from(regaForm.querySelectorAll('input[name="sport"]:checked')).map((el) => el.value),
            roommate: (regaForm.elements.roommate?.value || '').trim(),
            address: (regaForm.elements.address?.value || '').trim(),
            bus_31: regaForm.elements.bus_31?.value || 'none',
            bus_01: regaForm.elements.bus_01?.value || 'none',
            paid: !!regaForm.elements.paid?.checked,
            suggestions: (regaForm.elements.suggestions?.value || '').trim(),
            created_at: new Date().toISOString(),
            source: window.location.href
        };

        try {
            await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify(payload)
            });

            regaForm.reset();
            if (statusNode) {
                statusNode.textContent = 'Готово! Заявка отправлена.';
            }
            showSuccessWindow();
        } catch (error) {
            console.error('Ошибка отправки формы:', error);
            if (statusNode) {
                statusNode.textContent = 'Не удалось отправить. Попробуй еще раз.';
            }
            alert('Ошибка отправки формы. Проверь подключение или настройки Apps Script.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'ОТПРАВИТЬ';
            }
        }

        
    });

    if (feedbackForm) {
        feedbackForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const feedbackInput = document.getElementById('feedback-message');
            const message = (feedbackInput?.value || '').trim();
            if (!message) return;

            if (feedbackStatusNode) {
                feedbackStatusNode.style.display = 'block';
                feedbackStatusNode.textContent = 'Спасибо! Пожелание сохранено локально.';
            }

            try {
                const history = JSON.parse(localStorage.getItem('mv_feedback_notes') || '[]');
                history.push({
                    message,
                    createdAt: new Date().toISOString()
                });
                localStorage.setItem('mv_feedback_notes', JSON.stringify(history));
            } catch (error) {
                console.warn('Не удалось сохранить пожелание в localStorage:', error);
            }

            feedbackForm.reset();
        });
    }
});

// === PIXEL-PERFECT WINDOWS 98 BOOT SCREEN (С БЛОКИРОВКОЙ ПРОКРУТКИ) ===
document.addEventListener('DOMContentLoaded', () => {
    const preload = document.getElementById('win98-preload');
    const progressBar = document.getElementById('win98-progress');
    const statusText = document.getElementById('win98-status');

    if (!preload) return;

    // БЛОКИРУЕМ ПРОКРУТКУ
    document.body.classList.add('no-scroll');
    
    // Для Safari дополнительно блокируем touchmove
    function preventTouchMove(e) {
        e.preventDefault();
    }
    
    // Добавляем обработчик для блокировки касаний
    document.body.addEventListener('touchmove', preventTouchMove, { passive: false });
    
    // Оборачиваем прелоудер в wrapper для Safari (если еще не обернут)
    if (preload.parentNode && !preload.parentNode.classList.contains('win98-preload-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'win98-preload-wrapper';
        preload.parentNode.insertBefore(wrapper, preload);
        wrapper.appendChild(preload);
        
        // Добавляем защиту от касаний на wrapper
        wrapper.addEventListener('touchmove', preventTouchMove, { passive: false });
        wrapper.addEventListener('touchstart', preventTouchMove, { passive: false });
    }

    // Принудительно показываем прелоудер
    preload.style.display = 'flex';
    preload.style.opacity = '1';
    preload.style.visibility = 'visible';
    
    // Форсируем перерисовку для Safari
    preload.offsetHeight;

    // Создаем "бегущие" блоки как у классического Win98 boot bar.
    const chunksWrap = document.createElement('div');
    chunksWrap.className = 'win98-progress-chunks';
    for (let i = 0; i < 8; i++) {
        const chunk = document.createElement('span');
        chunk.className = 'win98-progress-chunk';
        chunksWrap.appendChild(chunk);
    }
    
    if (progressBar) {
        progressBar.innerHTML = '';
        progressBar.appendChild(chunksWrap);
    }

    const loadingMessages = [
        "Проверка устройств MegaVillage...",
        "Загрузка драйверов отдыха и спорта...",
        "Запуск служб бани и бассейна...",
        "Инициализация поля и домика...",
        "Синхронизация данных тусы 2026...",
        "Подготовка рабочего стола вечеринки..."
    ];

    let progress = 0;       // виртуальный прогресс загрузки
    let loopProgress = 0;   // смещение бегущих сегментов в одном цикле
    let messageIndex = 0;

    const interval = setInterval(() => {
        progress += Math.random() * 8 + 4;
        loopProgress += 12;

        if (progress > 100) progress = 100;
        if (loopProgress > 760) loopProgress = -220;
        
        if (chunksWrap) {
            chunksWrap.style.transform = `translateX(${loopProgress}px)`;
        }

        if (progress > messageIndex * 16 && messageIndex < loadingMessages.length && statusText) {
            statusText.textContent = loadingMessages[messageIndex];
            messageIndex++;
        }

        if (progress >= 90) {
            clearInterval(interval);
            if (chunksWrap) chunksWrap.classList.add('done');
            if (chunksWrap) chunksWrap.style.transform = 'translateX(360px)';
            if (statusText) statusText.textContent = 'Запуск MegaVillage завершен.';
            
            setTimeout(() => {
                const wrapper = preload.closest('.win98-preload-wrapper');
                if (wrapper) {
                    wrapper.style.transition = 'opacity 1.1s ease';
                    wrapper.style.opacity = '0';
                    if (wrapper && wrapper.parentNode) {
                            wrapper.remove();
                        }
                        // РАЗБЛОКИРУЕМ ПРОКРУТКУ
                        document.body.classList.remove('no-scroll');
                        document.body.removeEventListener('touchmove', preventTouchMove);
                        // Убираем фикс-класс с body если есть
                        document.body.classList.remove('safari-fixed');
                } else {
                    preload.style.opacity = '0';
                    setTimeout(() => {
                        if (preload && preload.parentNode) {
                            preload.remove();
                        }
                        document.body.classList.remove('no-scroll');
                        document.body.removeEventListener('touchmove', preventTouchMove);
                        document.body.classList.remove('safari-fixed');
                    }, 900);
                }
            }, 850);
        }
    }, 110);
    
    // Блокируем колесико мыши во время загрузки
    function preventWheelScroll(e) {
        if (document.querySelector('.win98-preload-wrapper') || document.getElementById('win98-preload')) {
            e.preventDefault();
            return false;
        }
    }
    
    window.addEventListener('wheel', preventWheelScroll, { passive: false });
    
    // Блокируем клавиши навигации
    function preventKeyScroll(e) {
        if (document.querySelector('.win98-preload-wrapper') || document.getElementById('win98-preload')) {
            const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Space', 'PageUp', 'PageDown', 'Home', 'End'];
            if (keys.includes(e.key)) {
                e.preventDefault();
                return false;
            }
        }
    }
    
    window.addEventListener('keydown', preventKeyScroll);
    
    // Сохраняем обработчики для удаления после загрузки
    window._preloadHandlers = {
        wheel: preventWheelScroll,
        keydown: preventKeyScroll,
        touchmove: preventTouchMove
    };
});

// Функция для ручного снятия блокировки (на всякий случай)
function unlockScroll() {
    document.body.classList.remove('no-scroll');
    if (window._preloadHandlers) {
        window.removeEventListener('wheel', window._preloadHandlers.wheel);
        window.removeEventListener('keydown', window._preloadHandlers.keydown);
        document.body.removeEventListener('touchmove', window._preloadHandlers.touchmove);
    }
}

// Закрытие сайдбара при клике вне его области
document.addEventListener('click', (event) => {
    // Проверяем, открыт ли сайдбар (есть ли класс active)
    const isSidebarActive = sidebar.classList.contains('active');
    
    // Проверяем, был ли клик ВНЕ сайдбара И ВНЕ кнопки триггера
    const isClickInsideSidebar = sidebar.contains(event.target);
    const isClickOnTrigger = mobileTrigger.contains(event.target);

    if (isSidebarActive && !isClickInsideSidebar && !isClickOnTrigger) {
        // Если кликнули мимо — закрываем
        toggleSidebar();
    }
});

