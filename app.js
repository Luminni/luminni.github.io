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

    // Additions: KPI Summary Cards Elements
    const kpiNetPnL = document.getElementById('kpiNetPnL');
    const kpiWinRate = document.getElementById('kpiWinRate');
    const kpiTotalTrades = document.getElementById('kpiTotalTrades');
    const kpiAvgPnL = document.getElementById('kpiAvgPnL');

    // Additions: Interactive Day Detail Viewer Elements
    const detailPanel = document.getElementById('detailPanel');
    const closeDetailBtn = document.getElementById('closeDetailBtn');
    const detailDate = document.getElementById('detailDate');
    const detailPnL = document.getElementById('detailPnL');
    const detailAccType = document.getElementById('detailAccType');
    const detailMarketType = document.getElementById('detailMarketType');
    const detailPosition = document.getElementById('detailPosition');
    const detailShares = document.getElementById('detailShares');
    const detailEntry = document.getElementById('detailEntry');
    const detailExit = document.getElementById('detailExit');
    const detailPreMarket = document.getElementById('detailPreMarket');
    const detailMindset = document.getElementById('detailMindset');
    const detailMistakes = document.getElementById('detailMistakes');
    const detailEOD = document.getElementById('detailEOD');

    // Additions: Chart Elements
    const equityChart = document.getElementById('equityChart');
    const chartLine = document.getElementById('chartLine');
    const chartArea = document.getElementById('chartArea');
    const zeroLine = document.getElementById('zeroLine');
    const chartPlaceholder = document.getElementById('chartPlaceholder');

    // Additions: Admin Controls
    const resetBtn = document.getElementById('resetBtn');

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

    // Addition 1: Calculate and render KPIs summary cards
    function calculateKPIs() {
        if (!kpiNetPnL || !kpiWinRate || !kpiTotalTrades || !kpiAvgPnL) return;

        const logs = JSON.parse(localStorage.getItem('tradingLogs')) || {};
        const logKeys = Object.keys(logs);
        const totalTrades = logKeys.length;

        if (totalTrades === 0) {
            kpiNetPnL.innerText = '$0.00';
            kpiNetPnL.style.color = '';
            kpiWinRate.innerText = '0.0%';
            kpiTotalTrades.innerText = '0';
            kpiAvgPnL.innerText = '$0.00';
            kpiAvgPnL.style.color = '';
            return;
        }

        let netPnL = 0;
        let winCount = 0;

        logKeys.forEach(key => {
            const pnl = parseFloat(logs[key].pnl) || 0;
            netPnL += pnl;
            if (pnl >= 0) {
                winCount++;
            }
        });

        const winRate = (winCount / totalTrades) * 100;
        const avgPnL = netPnL / totalTrades;

        // Populate values
        kpiNetPnL.innerText = `${netPnL >= 0 ? '+' : ''}$${netPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        kpiNetPnL.style.color = netPnL >= 0 ? 'var(--win-text)' : 'var(--loss-text)';
        
        kpiWinRate.innerText = `${winRate.toFixed(1)}%`;
        kpiTotalTrades.innerText = totalTrades.toString();

        kpiAvgPnL.innerText = `${avgPnL >= 0 ? '+' : ''}$${avgPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        kpiAvgPnL.style.color = avgPnL >= 0 ? 'var(--win-text)' : 'var(--loss-text)';
    }

    // Addition 2: Dynamic SVG Equity Curve Renderer
    function renderEquityChart() {
        if (!equityChart || !chartLine || !chartArea || !zeroLine || !chartPlaceholder) return;

        const logs = JSON.parse(localStorage.getItem('tradingLogs')) || {};
        const sortedDates = Object.keys(logs).sort();

        // We need at least 1 trade to draw a curve starting from $0
        if (sortedDates.length < 1) {
            chartPlaceholder.style.display = 'flex';
            chartLine.setAttribute('d', '');
            chartArea.setAttribute('d', '');
            return;
        }

        chartPlaceholder.style.display = 'none';

        // Calculate cumulative points starting at $0 baseline
        const cumulativeVals = [0];
        let runningSum = 0;

        sortedDates.forEach(date => {
            runningSum += parseFloat(logs[date].pnl) || 0;
            cumulativeVals.push(runningSum);
        });

        const n = cumulativeVals.length;

        // Find min/max values to scale the y-axis (always keep 0 in context)
        let maxVal = Math.max(...cumulativeVals, 0);
        let minVal = Math.min(...cumulativeVals, 0);

        // Add a vertical padding buffer to prevent lines clipping
        const range = maxVal - minVal;
        const paddingBuffer = range === 0 ? 100 : range * 0.15;
        maxVal += paddingBuffer;
        minVal -= paddingBuffer;

        // SVG bounds
        const svgWidth = 600;
        const svgHeight = 200;
        const paddingX = 20;
        const paddingY = 20;
        const drawWidth = svgWidth - (paddingX * 2);
        const drawHeight = svgHeight - (paddingY * 2);

        // Map points to SVG coordinate systems
        const points = [];
        for (let i = 0; i < n; i++) {
            const val = cumulativeVals[i];
            const x = paddingX + (i * (drawWidth / (n - 1)));
            const y = paddingY + drawHeight - ((val - minVal) * (drawHeight / (maxVal - minVal)));
            points.push({ x, y });
        }

        // Draw Line Path
        let linePathStr = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < n; i++) {
            linePathStr += ` L ${points[i].x} ${points[i].y}`;
        }
        chartLine.setAttribute('d', linePathStr);

        // Draw Shaded Gradient Area Path (connect back to the bottom of the drawing box)
        const areaBottomY = svgHeight - paddingY;
        let areaPathStr = linePathStr;
        areaPathStr += ` L ${points[n - 1].x} ${areaBottomY}`;
        areaPathStr += ` L ${points[0].x} ${areaBottomY}`;
        areaPathStr += ' Z';
        chartArea.setAttribute('d', areaPathStr);

        // Draw Zero Baseline indicator
        const yZero = paddingY + drawHeight - ((0 - minVal) * (drawHeight / (maxVal - minVal)));
        zeroLine.setAttribute('y1', yZero);
        zeroLine.setAttribute('y2', yZero);
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
            const hasLog = !!logs[dateStr];
            if (hasLog) {
                const dayPnL = parseFloat(logs[dateStr].pnl) || 0;
                if (dayPnL >= 0) {
                    dayDiv.classList.add('win');
                    dayDiv.title = `Profit: $${dayPnL.toFixed(2)}`;
                } else {
                    dayDiv.classList.add('loss');
                    dayDiv.title = `Loss: $${dayPnL.toFixed(2)}`;
                }
            }

            // Addition 3: Day Click Selection Details Drawer handler
            dayDiv.addEventListener('click', () => {
                // Remove existing focus outlines
                const allDays = calendar.querySelectorAll('.day');
                allDays.forEach(d => d.classList.remove('active-focus'));

                if (hasLog) {
                    dayDiv.classList.add('active-focus');
                    displayTradeDetails(dateStr, logs[dateStr]);
                } else {
                    // If no trade logged on that day, hide drawer and set date field to facilitate logging for that date
                    if (detailPanel) detailPanel.style.display = 'none';
                    if (tradeDate) {
                        tradeDate.value = dateStr;
                        showToast('Date Updated', `Form date set to ${dateStr}. Ready to log.`, 'neutral');
                    }
                }
            });

            calendar.appendChild(dayDiv);
        }
    }

    // Addition 4: Populate & Transition Day Details Drawer
    function displayTradeDetails(date, log) {
        if (!detailPanel || !detailDate || !detailPnL || !detailAccType || !detailMarketType || 
            !detailPosition || !detailShares || !detailEntry || !detailExit || 
            !detailPreMarket || !detailMindset || !detailMistakes || !detailEOD) return;

        const pnl = parseFloat(log.pnl) || 0;
        
        detailDate.innerText = date;
        detailPnL.innerText = `${pnl >= 0 ? '+' : ''}$${pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        
        // Reset and assign badges
        detailPnL.className = 'detail-pnl-badge';
        detailPnL.classList.add(pnl >= 0 ? 'win' : 'loss');

        detailAccType.innerText = log.accType === 'funded' ? 'Funded / Prop' : 'Personal Capital';
        detailMarketType.innerText = log.marketType || '-';
        detailPosition.innerText = log.positionType === 'long' ? 'Long (Buy)' : 'Short (Sell)';
        detailShares.innerText = (log.shares || 0).toLocaleString();
        detailEntry.innerText = `$${(log.entryPrice || 0).toFixed(2)}`;
        detailExit.innerText = `$${(log.exitPrice || 0).toFixed(2)}`;
        
        detailPreMarket.innerText = log.preMarket || '-';
        detailMindset.innerText = log.mindset || '-';
        detailMistakes.innerText = log.mistakes || 'No mistakes logged.';
        detailEOD.innerText = log.eodReview || '-';

        // Slide panel open
        detailPanel.style.display = 'block';
        detailPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Detail Panel Close Button Event
    if (closeDetailBtn) {
        closeDetailBtn.addEventListener('click', () => {
            if (detailPanel) detailPanel.style.display = 'none';
            // Clear calendar cell outline focus
            if (calendar) {
                const allDays = calendar.querySelectorAll('.day');
                allDays.forEach(d => d.classList.remove('active-focus'));
            }
        });
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
            
            // Additions triggers: Recalculate KPIs and draw graph
            calculateKPIs();
            renderEquityChart();

            // Hide details panel since it represents old dates
            if (detailPanel) detailPanel.style.display = 'none';
        });
    }

    // Addition 5: Reset Database Routines
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            const firstCheck = confirm('Are you sure you want to delete all trade logs? This action cannot be undone.');
            if (firstCheck) {
                const secondCheck = confirm('Double-check: This will permanently wipe your journal history. Confirm delete?');
                if (secondCheck) {
                    localStorage.removeItem('tradingLogs');
                    
                    showToast('Journal Reset', 'All data logs have been permanently deleted.', 'neutral');
                    
                    // Reset UI
                    if (detailPanel) detailPanel.style.display = 'none';
                    tradeForm.reset();
                    tradeDate.valueAsDate = new Date();
                    
                    calculateRisk();
                    renderCalendar();
                    calculateKPIs();
                    renderEquityChart();
                }
            }
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
        
        let borderStroke = 'var(--border)';
        let shadowEffect = '0 0 0 transparent';
        if (type === 'success') {
            borderStroke = 'var(--win-border)';
            shadowEffect = '0 0 15px var(--win-glow)';
        } else if (type === 'neutral') {
            borderStroke = 'var(--accent-glow)';
        }
        
        toast.style.border = `1px solid ${borderStroke}`;
        toast.style.padding = '16px 20px';
        toast.style.borderRadius = 'var(--radius-lg)';
        toast.style.boxShadow = `0 10px 25px -5px rgba(0, 0, 0, 0.4), ${shadowEffect}`;
        toast.style.maxWidth = '380px';
        toast.style.zIndex = '9999';
        toast.style.display = 'flex';
        toast.style.flexDirection = 'column';
        toast.style.gap = '4px';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        toast.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
        toast.style.pointerEvents = 'none';

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
    calculateKPIs();
    renderEquityChart();
});
