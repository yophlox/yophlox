const currentTheme = localStorage.getItem('selectedTheme') || 'default';
if (!window.location.pathname.includes(`/themes/${currentTheme}/`)) {
    window.location.href = '/';
}

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
if (isMobile) {
    document.body.classList.add('mobile');
}

document.addEventListener('DOMContentLoaded', function() {
    setInterval(function() {
        document.querySelectorAll('blink').forEach(element => {
            element.style.visibility = 
                element.style.visibility === 'hidden' ? 'visible' : 'hidden';
        });
    }, 500);

    const colors = ['#ff6600', '#ff9900', '#ffcc00'];
    document.addEventListener('mousemove', function(e) {
        const trail = document.createElement('div');
        trail.className = 'cursor-trail';
        trail.style.left = e.pageX + 'px';
        trail.style.top = e.pageY + 'px';
        trail.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        document.body.appendChild(trail);

        setTimeout(() => {
            trail.remove();
        }, 500);
    });

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const message = document.getElementById('message').value;
            
            const bannedWords = [
                'nigger', 'nigga', 'racist', 'slur', 'hate', 'colored people', 'fag', 'faggot', 'retard' // truly the filter ever :D, also i'm not racist nor homophobic or anything else, I fw everyone and every race, gender, sexuality, etc.
            ];
            
            const containsBannedWord = bannedWords.some(word => 
                message.toLowerCase().includes(word.toLowerCase())
            );
            
            if (containsBannedWord) {
                showRetroAlert('Message contains inappropriate content and cannot be sent.');
                return;
            }
            
            const clickSound = new Audio('data/click.mp3');
            clickSound.play().catch(() => {});
            
            const p1 = 'discord.com/api';
            const p2 = '/webhooks/';
            const p3 = '1313279684791767111';
            const p4 = 'z3wQJbjFFEt8eL56BsOo1hnvUVPw-VKk2DkdJLyFreBmV1nz0-Jfv0WTSL7zPNJXxtZ5';

            // if ur reading this, PLEASE DO NOT send random shit to this webhook

            
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
                    showRetroAlert('Message sent successfully!');
                    contactForm.reset();
                } else {
                    showRetroAlert('Failed to send message...');
                }
            } catch (error) {
                console.error('Error:', error);
                showRetroAlert('Failed to send message...');
            }
        });
    }

    function showRetroAlert(message) {
        const alertBox = document.createElement('div');
        alertBox.className = 'retro-alert';
        alertBox.innerHTML = `
            <div class="retro-alert-content">
                <h3>][==MESSAGE==][</h3>
                <p>${message}</p>
                <button onclick="this.parentElement.parentElement.remove()">
                    [OK]
                </button>
            </div>
        `;
        document.body.appendChild(alertBox);
    }
});

const style = document.createElement('style');
style.textContent = `
    .cursor-trail {
        position: fixed;
        width: 5px;
        height: 5px;
        pointer-events: none;
        border-radius: 50%;
        opacity: 0.7;
        animation: fade-out 0.5s linear;
        z-index: 9999;
    }

    .retro-alert {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    }

    .retro-alert-content {
        background: #1a1a1a;
        border: 3px solid #ff6600;
        padding: 20px;
        text-align: center;
        color: #ff9900;
        font-family: 'Comic Sans MS', cursive;
    }

    .retro-alert button {
        background: #330000;
        color: #ff9900;
        border: 2px solid #ff6600;
        padding: 5px 15px;
        cursor: pointer;
        font-family: 'Comic Sans MS', cursive;
        margin-top: 10px;
    }

    .retro-alert button:hover {
        background: #ff6600;
        color: #ffffff;
    }

    @keyframes fade-out {
        from { opacity: 0.7; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);