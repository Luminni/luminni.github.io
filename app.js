document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const tradeForm = document.getElementById('tradeForm');
    const tradeDate = document.getElementById('tradeDate');
    const accType = document.getElementById('accType');
    const accBalance = document.getElementById('accBalance');
    const maxRisk = document.getElementById('maxRisk');
    const positionType = document.getElementById('positionType');
    const shares = document.getElementById('shares');
    const entryPrice = document.getElementById('entryPrice');
    const exitPrice = document.getElementById('exitPrice');
    const pnlDisplay = document.getElementById('pnlDisplay');
    const calendar = document.getElementById('calendar');
    const calendarTitle = document.getElementById('calendarTitle');

    // State Variables
    let currentPnL = 0;
    const now = new Date();

    // 1. Initialize Today's Date
    if (tradeDate) {
        tradeDate.valueAsDate = now;
    }

    // 2. Render Calendar Month Name
    if (calendarTitle) {
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        calendarTitle.innerText = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
    }

    // 3. Risk Calculation Rule #1
    function calculateRisk() {
        if (!accBalance || !accType || !maxRisk) return;
        
        const balance = parseFloat(accBalance.value) || 0;
        const type = accType.value;
        let calculatedRisk = 0;

        if (type === 'personal') {
            // Rule #1: Personal capital maxes out at $1000 or 10% of total balance, whichever is lower
            calculatedRisk = Math.min(1000, balance * 0.10);
        } else {
            // Funded/Prop accounts allow 1% risk of total balance
            calculatedRisk = balance * 0.01;
        }
        
        maxRisk.value = `$${calculatedRisk.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // 4. Auto-Calculate Net P&L
    function calculatePnL() {
        if (!entryPrice || !exitPrice || !shares || !positionType || !pnlDisplay) return;

        const entry = parseFloat(entryPrice.value) || 0;
        const exit = parseFloat(exitPrice.value) || 0;
        const shareCount = parseFloat(shares.value) || 0;
        const pos = positionType.value;

        if (entry > 0 && exit > 0 && shareCount > 0) {
            if (pos === 'long') {
                currentPnL = (exit - entry) * shareCount;
            } else {
                currentPnL = (entry - exit) * shareCount;
            }
            
            pnlDisplay.innerText = `Auto-Calculated P&L: ${currentPnL >= 0 ? '+' : ''}$${currentPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            
            // Style P&L indicator based on positive/negative results
            if (currentPnL >= 0) {
                pnlDisplay.style.backgroundColor = 'var(--win-color)';
                pnlDisplay.style.color = 'var(--win-text)';
                pnlDisplay.style.borderColor = 'var(--win-border)';
                pnlDisplay.style.boxShadow = '0 0 12px var(--win-glow)';
            } else {
                pnlDisplay.style.backgroundColor = 'var(--loss-color)';
                pnlDisplay.style.color = 'var(--loss-text)';
                pnlDisplay.style.borderColor = 'var(--loss-border)';
                pnlDisplay.style.boxShadow = '0 0 12px var(--loss-glow)';
            }
        } else {
            // Reset to default neutral display
            currentPnL = 0;
            pnlDisplay.innerText = 'Auto-Calculated P&L: $0.00';
            pnlDisplay.style.backgroundColor = '';
            pnlDisplay.style.color = '';
            pnlDisplay.style.borderColor = '';
            pnlDisplay.style.boxShadow = '';
        }
    }

    // 5. Render Calendar Cells
    function renderCalendar() {
        if (!calendar) return;
        calendar.innerHTML = '';
        
        const logs = JSON.parse(localStorage.getItem('tradingLogs')) || {};

        // Calculate current month details
        const year = now.getFullYear();
        const month = now.getMonth();
        
        // Find total days in the current month
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Determine the weekday of the first day (0 = Sunday, 1 = Monday, etc.)
        const firstDayIndex = new Date(year, month, 1).getDay();

        // Add padding days for alignment with day labels (S M T W T F S)
        for (let x = 0; x < firstDayIndex; x++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'day empty';
            emptyDiv.style.opacity = '0';
            emptyDiv.style.pointerEvents = 'none';
            calendar.appendChild(emptyDiv);
        }

        // Add calendar days
        for (let i = 1; i <= daysInMonth; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'day';
            dayDiv.innerText = i;

            // Format date string to match input format (YYYY-MM-DD)
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

            // Check if a trade was logged on this day
            if (logs[dateStr]) {
                const dayPnL = parseFloat(logs[dateStr].pnl) || 0;
                if (dayPnL >= 0) {
                    dayDiv.classList.add('win');
                    dayDiv.title = `Profit: $${dayPnL.toFixed(2)}`;
                } else {
                    dayDiv.classList.add('loss');
                    dayDiv.title = `Loss: $${dayPnL.toFixed(2)}`;
                }
            }
            calendar.appendChild(dayDiv);
        }
    }

    // 6. Handle Form Submission & Data Storage
    if (tradeForm) {
        tradeForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const date = tradeDate.value;
            if (!date) return;

            const tradeData = {
                pnl: currentPnL,
                accType: accType.value,
                accBalance: parseFloat(accBalance.value) || 0,
                preMarket: document.getElementById('preMarket').value,
                marketType: document.getElementById('marketType').value,
                positionType: positionType.value,
                shares: parseFloat(shares.value) || 0,
                stopLoss: parseFloat(document.getElementById('stopLoss').value) || 0,
                entryPrice: parseFloat(entryPrice.value) || 0,
                exitPrice: parseFloat(exitPrice.value) || 0,
                mindset: document.getElementById('mindset').value,
                mistakes: document.getElementById('mistakes').value,
                eodReview: document.getElementById('eodReview').value
            };

            // Save trade logs to local storage
            let logs = JSON.parse(localStorage.getItem('tradingLogs')) || {};
            logs[date] = tradeData;
            localStorage.setItem('tradingLogs', JSON.stringify(logs));

            // Custom non-intrusive alert notification
            showToast('Success', 'Trade logged successfully! Remember Rule #4: One trade a day. You are done for the day.', 'success');

            // Reset UI and form states
            tradeForm.reset();
            
            // Restore default values
            tradeDate.valueAsDate = new Date();
            currentPnL = 0;
            pnlDisplay.innerText = 'Auto-Calculated P&L: $0.00';
            pnlDisplay.style.backgroundColor = '';
            pnlDisplay.style.color = '';
            pnlDisplay.style.borderColor = '';
            pnlDisplay.style.boxShadow = '';
            
            calculateRisk();
            renderCalendar();
        });
    }

    // Custom Toast Notification Implementation
    function showToast(title, message, type) {
        // Remove existing toast if visible
        const existingToast = document.getElementById('ui-toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.id = 'ui-toast';
        
        // Custom styling for Toast container
        toast.style.position = 'fixed';
        toast.style.bottom = '24px';
        toast.style.right = '24px';
        toast.style.backgroundColor = 'var(--panel-bg)';
        toast.style.border = `1px solid ${type === 'success' ? 'var(--win-border)' : 'var(--border)'}`;
        toast.style.padding = '16px 20px';
        toast.style.borderRadius = 'var(--radius-lg)';
        toast.style.boxShadow = `0 10px 25px -5px rgba(0, 0, 0, 0.4), ${type === 'success' ? '0 0 15px var(--win-glow)' : '0 0 0 transparent'}`;
        toast.style.maxWidth = '380px';
        toast.style.zIndex = '9999';
        toast.style.display = 'flex';
        toast.style.flexDirection = 'column';
        toast.style.gap = '4px';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        toast.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';

        const toastTitle = document.createElement('strong');
        toastTitle.innerText = title;
        toastTitle.style.color = type === 'success' ? 'var(--win-text)' : 'var(--text-main)';
        toastTitle.style.fontSize = '0.95rem';

        const toastMsg = document.createElement('span');
        toastMsg.innerText = message;
        toastMsg.style.color = 'var(--text-muted)';
        toastMsg.style.fontSize = '0.85rem';

        toast.appendChild(toastTitle);
        toast.appendChild(toastMsg);
        document.body.appendChild(toast);

        // Animation entry
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 50);

        // Close after 5 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    // 7. Bind Event Listeners
    accType.addEventListener('change', calculateRisk);
    accBalance.addEventListener('input', calculateRisk);
    positionType.addEventListener('change', calculatePnL);
    shares.addEventListener('input', calculatePnL);
    entryPrice.addEventListener('input', calculatePnL);
    exitPrice.addEventListener('input', calculatePnL);

    // Initial Trigger on load
    calculateRisk();
    renderCalendar();
});
