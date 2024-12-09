const currentTheme = localStorage.getItem('selectedTheme') || 'default';
if (!window.location.pathname.includes(`/themes/${currentTheme}/`)) {
    window.location.href = '/';
}

document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.querySelector('.start-button');
    const startMenu = document.querySelector('.start-menu');
    let startMenuOpen = false;

    startButton.addEventListener('click', () => {
        if (!startMenuOpen) {
            startMenu.style.display = 'flex';
            startMenu.style.animation = 'startMenuOpen 0.2s ease-out';
            startMenuOpen = true;
        } else {
            startMenu.style.animation = 'startMenuClose 0.2s ease-out';
            startMenu.addEventListener('animationend', () => {
                startMenu.style.display = 'none';
            }, { once: true });
            startMenuOpen = false;
        }
    });

    document.addEventListener('click', (e) => {
        if (startMenuOpen && 
            !startMenu.contains(e.target) && 
            !startButton.contains(e.target)) {
            startButton.click();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && startMenuOpen) {
            startButton.click();
        }
    });

    function updateClock() {
        const now = new Date();
        const time = now.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
        document.querySelector('.time').textContent = time;
    }
    
    setInterval(updateClock, 1000);
    updateClock();

    const taskButtons = {};
    
    function createTaskButton(id, title) {
        if (!taskButtons[id]) {
            const button = document.createElement('button');
            button.className = 'task-button';
            button.innerHTML = `
                <img src="data/folder.png" alt="${title}">
                <span>${title}</span>
            `;
            button.addEventListener('click', () => toggleWindow(id));
            document.querySelector('.task-buttons').appendChild(button);
            taskButtons[id] = button;
        }
        taskButtons[id].classList.add('active');
    }

    function removeTaskButton(id) {
        if (taskButtons[id]) {
            taskButtons[id].remove();
            delete taskButtons[id];
        }
    }

    function toggleWindow(id) {
        const win = document.getElementById(id + 'Window');
        if (win.style.display === 'none') {
            win.style.display = 'block';
            win.classList.add('restoring');
            win.addEventListener('animationend', () => {
                win.classList.remove('restoring');
            }, { once: true });
            win.style.zIndex = ++zIndex;
            taskButtons[id].classList.add('active');
        } else {
            if (win.style.zIndex < zIndex) {
                win.style.zIndex = ++zIndex;
            } else {
                win.classList.add('minimizing');
                win.addEventListener('animationend', () => {
                    win.classList.remove('minimizing');
                    win.style.display = 'none';
                }, { once: true });
                taskButtons[id].classList.remove('active');
            }
        }
    }

    let zIndex = 1000;
    const windows = document.querySelectorAll('.window');
    
    windows.forEach(win => {
        const titleBar = win.querySelector('.title-bar');
        const minimizeBtn = win.querySelector('.minimize');
        const maximizeBtn = win.querySelector('.maximize');
        let isMaximized = false;
        let beforeMaximize = {
            width: '',
            height: '',
            top: '',
            left: '',
            transform: ''
        };
        
        minimizeBtn.addEventListener('click', () => {
            win.classList.add('minimizing');
            win.addEventListener('animationend', () => {
                win.classList.remove('minimizing');
                win.style.display = 'none';
            }, { once: true });
            const id = win.id.replace('Window', '');
            if (taskButtons[id]) {
                taskButtons[id].classList.remove('active');
            }
        });

        maximizeBtn.addEventListener('click', () => {
            if (!isMaximized) {
                beforeMaximize = {
                    width: win.style.width,
                    height: win.style.height,
                    top: win.style.top,
                    left: win.style.left,
                    transform: win.style.transform
                };
                requestAnimationFrame(() => {
                    win.style.width = '100vw';
                    win.style.height = 'calc(100vh - 40px)';
                    win.style.top = '0';
                    win.style.left = '0';
                    win.style.transform = 'none';
                });
                maximizeBtn.innerHTML = '❐';
            } else {
                requestAnimationFrame(() => {
                    win.style.width = beforeMaximize.width;
                    win.style.height = beforeMaximize.height;
                    win.style.top = beforeMaximize.top;
                    win.style.left = beforeMaximize.left;
                    win.style.transform = beforeMaximize.transform;
                });
                maximizeBtn.innerHTML = '□';
            }
            isMaximized = !isMaximized;
        });

        titleBar.addEventListener('dblclick', e => {
            if (e.target.closest('.window-controls')) return;
            maximizeBtn.click();
        });

        const handles = ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'].map(dir => {
            const handle = document.createElement('div');
            handle.className = `resize-handle ${dir}`;
            return handle;
        });
        win.append(...handles);

        let isDragging = false;
        let isResizing = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let initialRect;
        let resizeDir = '';
        
        titleBar.addEventListener('mousedown', e => {
            if (e.target.closest('.window-controls')) return;
            
            if (isMaximized) {
                const ratio = e.clientX / window.innerWidth;
                maximizeBtn.click();
                initialX = win.offsetWidth * ratio;
                initialY = e.clientY - win.offsetTop;
            } else {
                initialX = e.clientX - win.offsetLeft;
                initialY = e.clientY - win.offsetTop;
            }
            
            isDragging = true;
            win.style.zIndex = ++zIndex;
        });

        handles.forEach(handle => {
            handle.addEventListener('mousedown', e => {
                isResizing = true;
                resizeDir = handle.className.split(' ')[1];
                initialX = e.clientX;
                initialY = e.clientY;
                initialRect = {
                    top: win.offsetTop,
                    left: win.offsetLeft,
                    width: win.offsetWidth,
                    height: win.offsetHeight
                };
                win.style.zIndex = ++zIndex;
                e.stopPropagation();
            });
        });
        
        document.addEventListener('mousemove', e => {
            if (isDragging) {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                
                win.style.left = currentX + 'px';
                win.style.top = currentY + 'px';
            }
            
            if (isResizing) {
                const deltaX = e.clientX - initialX;
                const deltaY = e.clientY - initialY;
                
                if (resizeDir.includes('e')) {
                    win.style.width = Math.max(400, initialRect.width + deltaX) + 'px';
                }
                if (resizeDir.includes('s')) {
                    win.style.height = Math.max(300, initialRect.height + deltaY) + 'px';
                }
                if (resizeDir.includes('w')) {
                    const newWidth = Math.max(400, initialRect.width - deltaX);
                    win.style.left = (initialRect.left + initialRect.width - newWidth) + 'px';
                    win.style.width = newWidth + 'px';
                }
                if (resizeDir.includes('n')) {
                    const newHeight = Math.max(300, initialRect.height - deltaY);
                    win.style.top = (initialRect.top + initialRect.height - newHeight) + 'px';
                    win.style.height = newHeight + 'px';
                }
            }
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
            isResizing = false;
        });

        win.addEventListener('mousedown', () => {
            win.style.zIndex = ++zIndex;
            const id = win.id.replace('Window', '');
            if (taskButtons[id]) {
                Object.values(taskButtons).forEach(btn => btn.classList.remove('active'));
                taskButtons[id].classList.add('active');
            }
        });
    });

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const message = document.getElementById('message').value;
            
            const bannedWords = [
                'nigger', 'nigga', 'racist', 'slur', 'hate', 'colored people' // truly the filter ever :D
            ];
            
            const containsBannedWord = bannedWords.some(word => 
                message.toLowerCase().includes(word.toLowerCase())
            );
            
            if (containsBannedWord) {
                alert('Message contains inappropriate content and cannot be sent.');
                return;
            }
            
            const p1 = 'discord.com/api';
            const p2 = '/webhooks/';
            const p3 = '1313279684791767111';
            const p4 = 'z3wQJbjFFEt8eL56BsOo1hnvUVPw-VKk2DkdJLyFreBmV1nz0-Jfv0WTSL7zPNJXxtZ5';
            
            const webhookURL = `https://${p1}${p2}${p3}/${p4}`;

            try {
                const response = await fetch(webhookURL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        content: `<@&1220820325915299971> New message: ${message}`
                    })
                });

                if (response.ok) {
                    alert('Message sent successfully!');
                    contactForm.reset();
                } else {
                    alert('Failed to send message...');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to send message...');
            }
        });
    }

    function openWindow(id) {
        const win = document.getElementById(id + 'Window');
        win.style.display = 'block';
        if (!win.style.left && !win.style.top) {
            win.style.left = '50%';
            win.style.top = '50%';
            win.style.transform = 'translate(-50%, -50%)';
        }
        win.style.zIndex = ++zIndex;
        win.classList.add('opening');
        win.addEventListener('animationend', () => {
            win.classList.remove('opening');
        }, { once: true });
        createTaskButton(id, win.querySelector('.title-bar span').textContent);
    }

    function closeWindow(id) {
        document.getElementById(id + 'Window').style.display = 'none';
        removeTaskButton(id);
    }

    window.openWindow = openWindow;
    window.closeWindow = closeWindow;

    const powerButton = document.querySelector('.power-button');
    powerButton.addEventListener('click', () => {
        document.body.style.animation = 'windowsShutdown 0.5s ease-out forwards';
        
        setTimeout(() => {
            window.location.href = '../../index.html';
        }, 500);
    });
});