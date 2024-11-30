document.addEventListener('DOMContentLoaded', () => {
    // Show success message function
    function showSuccessMessage(message) {
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <path d="M16.667 5l-8.334 8.334L5 10" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            ${message}
        `;
        document.querySelector('.content-grid').insertAdjacentElement('afterbegin', successMessage);

        successMessage.classList.add('message-visible');
        setTimeout(() => {
            successMessage.classList.add('message-hiding');
            setTimeout(() => successMessage.remove(), 300);
        }, 3000);
    }

    // Handle slot click to show reservation dialog
    function handleSlotClick(event) {
        event.preventDefault();
        
        // Only proceed if we're on index.html
        if (!window.location.pathname.endsWith('reserve.html')) {
            const slotLink = event.target;
            const row = slotLink.closest('tr');
            const testCenter = row.querySelector('.centre-name').textContent;
            const category = row.querySelector('.category').textContent;
            const slots = parseInt(slotLink.getAttribute('data-count')) || 0;
            
            console.log('Clicked slot:', { testCenter, category, slots }); // Debug log
            
            if (slots > 0) {
                // Pass information through URL parameters
                const params = new URLSearchParams({
                    center: testCenter,
                    category: category,
                    slots: slots,
                    time: '8:10'
                });
                window.location.href = `reserve.html?${params.toString()}`;
            }
        }
    }

    // Handle remove test centre
    function handleRemoveCentre(button) {
        const row = button.closest('tr');
        const centreName = row.querySelector('.centre-name').textContent;

        if (confirm(`Are you sure you want to remove ${centreName} from your test centres?`)) {
            row.style.opacity = '0';
            setTimeout(() => {
                row.remove();
                showSuccessMessage(`${centreName} test centre removed successfully!`);
            }, 300);
        }
    }

    // Add test centre functionality
    function handleAddCentre() {
        const select = document.getElementById('centreSelect');
        if (!select.value) {
            alert('Please select a test centre');
            return;
        }

        const centreName = select.options[select.selectedIndex].text;

        // Create new row
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td class="test-centre">
                <div class="centre-name">${centreName}</div>
                <div class="category">Car</div>
                <a href="#" class="alert-link">Setup availability alert</a>
                <button class="btn-remove-centre">Remove centre</button>
            </td>
            ${Array(7).fill('').map(() => '<td><a href="#" class="slot-link" data-count="0">0</a></td>').join('')}
        `;

        // Add to table
        document.getElementById('test-centres-body').appendChild(newRow);

        // Add remove functionality to new row
        const removeButton = newRow.querySelector('.btn-remove-centre');
        removeButton.addEventListener('click', () => handleRemoveCentre(removeButton));

        // Generate random slots for the new row
        const slots = newRow.querySelectorAll('.slot-link');
        slots.forEach(slot => {
            const count = Math.floor(Math.random() * 5); // 0-4 slots
            const td = slot.closest('td');
            
            if (count === 0) {
                td.classList.add('no-slots');
                slot.href = '#';
                slot.title = 'No slots available';
                slot.style.color = '#d4351c';  // Using the danger color
            } else {
                td.classList.add('available');
                slot.href = '#';
                slot.title = `${count} slot${count > 1 ? 's' : ''} available`;
                slot.style.color = '#00703c';  // Using the success color
            }
            
            slot.setAttribute('data-count', count);
            slot.textContent = count;
            slot.addEventListener('click', handleSlotClick);
        });

        showSuccessMessage(`${centreName} test centre added successfully!`);
        select.value = '';
    }

    // Initialize navigation
    const prevWeekBtn = document.getElementById('prevWeek');
    const nextWeekBtn = document.getElementById('nextWeek');
    const weekDisplay = document.querySelector('.week-display');
    
    // Initialize current date and click counters
    let currentDate = new Date();
    let prevWeekClicks = 0;
    let nextWeekClicks = 0;
    
    // Custom alert function
    function showCustomAlert(message) {
        const alert = document.createElement('div');
        alert.className = 'custom-alert';
        alert.textContent = message;
        document.body.appendChild(alert);
        
        // Trigger reflow to ensure animation plays
        alert.offsetHeight;
        
        // Show the alert
        alert.classList.add('show');
        
        // Remove the alert after 2 seconds
        setTimeout(() => {
            alert.classList.remove('show');
            setTimeout(() => alert.remove(), 300);
        }, 2000);
    }

    // Set to start of current week (Monday)
    const day = currentDate.getDay();
    const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1);
    currentDate = new Date(currentDate.setDate(diff));

    function updateDisplay() {
        // Update week display
        weekDisplay.textContent = formatDateRange(currentDate);
        
        // Update table dates
        updateTableDates(currentDate);
        
        // Generate new slots
        generateRandomSlots();
    }

    // Format date range for display
    function formatDateRange(startDate) {
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        
        const options = { day: 'numeric', month: 'short' };
        return `${startDate.toLocaleDateString('en-GB', options)} - ${endDate.toLocaleDateString('en-GB', options)}`;
    }

    // Update table headers with dates
    function updateTableDates(startDate) {
        const headers = document.querySelectorAll('.day-header');
        headers.forEach((header, index) => {
            const date = new Date(startDate);
            date.setDate(date.getDate() + index);
            const dateDiv = header.querySelector('.date');
            dateDiv.textContent = date.getDate();
        });
    }

    // Generate random slots for a test centre
    function generateRandomSlots() {
        const cells = document.querySelectorAll('.slot-link');
        cells.forEach(cell => {
            const slots = Math.floor(Math.random() * 5); // 0-4 slots
            const td = cell.closest('td');
            
            td.classList.remove('no-slots', 'available');
            
            if (slots === 0) {
                td.classList.add('no-slots');
                cell.href = '#';
                cell.title = 'No slots available';
                cell.style.color = '#d4351c';  // Red for zero slots
            } else {
                td.classList.add('available');
                cell.href = '#';
                cell.title = `${slots} slot${slots > 1 ? 's' : ''} available`;
                cell.style.color = '#00703c';  // Green for available slots
            }
            
            cell.setAttribute('data-count', slots);
            cell.textContent = slots;
            cell.addEventListener('click', handleSlotClick);
            
            td.classList.add('slot-updated');
            setTimeout(() => td.classList.remove('slot-updated'), 300);
        });
    }

    // Initialize event handlers
    function initializeEventHandlers() {
        // Set colors for all slots
        document.querySelectorAll('.slot-link').forEach(slot => {
            const count = parseInt(slot.getAttribute('data-count')) || 0;
            if (count === 0) {
                slot.style.color = '#d4351c';  // Red for zero slots
            } else {
                slot.style.color = '#00703c';  // Green for available slots
            }
        });

        // Add event listener to the "Add centre" button
        const addCentreBtn = document.getElementById('addCentreBtn');
        if (addCentreBtn) {
            addCentreBtn.addEventListener('click', handleAddCentre);
        }
    }

    // Add navigation button event listeners
    if (prevWeekBtn && nextWeekBtn) {
        prevWeekBtn.addEventListener('click', () => {
            prevWeekClicks++;
            showCustomAlert(`Previous Week button clicked ${prevWeekClicks} time${prevWeekClicks === 1 ? '' : 's'}`);
            currentDate.setDate(currentDate.getDate() - 7);
            updateDisplay();
        });

        nextWeekBtn.addEventListener('click', () => {
            nextWeekClicks++;
            showCustomAlert(`Next Week button clicked ${nextWeekClicks} time${nextWeekClicks === 1 ? '' : 's'}`);
            currentDate.setDate(currentDate.getDate() + 7);
            updateDisplay();
        });
    }

    // Function to handle reserve button click
    function handleReserveButtonClick(button) {
        const row = button.closest('tr');
        const category = row.cells[0].textContent;
        const time = row.cells[1].textContent;
        
        // Remove the row with animation
        row.style.opacity = '0';
        row.style.transform = 'translateX(-10px)';
        row.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            row.remove();
            
            // Update reserved tests section
            const reservedTable = document.querySelector('.reserved-tests table tbody');
            if (reservedTable) {
                // Remove "No information found" if present
                const noInfoRow = reservedTable.querySelector('tr td[colspan]');
                if (noInfoRow) {
                    noInfoRow.closest('tr').remove();
                }

                // Add new reservation
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td>${category}</td>
                    <td>Thursday, 20th March<br>${time}</td>
                    <td>
                        <button class="btn-remove" title="Remove reservation">×</button>
                    </td>
                `;
                reservedTable.appendChild(newRow);

                // Add remove functionality
                const removeButton = newRow.querySelector('.btn-remove');
                removeButton.addEventListener('click', function() {
                    if (confirm('Are you sure you want to cancel this test reservation?')) {
                        newRow.style.opacity = '0';
                        setTimeout(() => {
                            newRow.remove();

                            // Add the test back to the main table
                            const tbody = document.querySelector('.tests-table tbody');
                            const newTestRow = document.createElement('tr');
                            newTestRow.innerHTML = `
                                <td>${category}</td>
                                <td>${time}</td>
                                <td>£52.00</td>
                                <td>1</td>
                                <td>Sun 16th Mar 2025</td>
                                <td>
                                    <button class="btn-reserve">Reserve test</button>
                                </td>
                            `;
                            
                            // Add with fade-in animation
                            newTestRow.style.opacity = '0';
                            newTestRow.style.transform = 'translateX(10px)';
                            newTestRow.style.transition = 'all 0.3s ease';
                            
                            // Remove "No tests available" if present
                            const noTestsRow = tbody.querySelector('.no-tests');
                            if (noTestsRow) {
                                noTestsRow.closest('tr').remove();
                            }
                            
                            tbody.appendChild(newTestRow);
                            
                            // Trigger reflow to ensure animation plays
                            newTestRow.offsetHeight;
                            
                            // Show the row
                            newTestRow.style.opacity = '1';
                            newTestRow.style.transform = 'translateX(0)';
                            
                            // Add event listener to the new reserve button
                            const newReserveButton = newTestRow.querySelector('.btn-reserve');
                            newReserveButton.addEventListener('click', function() {
                                handleReserveButtonClick(this);
                            });
                            
                            // If no more reservations, show "No information found"
                            if (reservedTable.children.length === 0) {
                                const emptyRow = document.createElement('tr');
                                emptyRow.innerHTML = '<td colspan="3">No information found</td>';
                                reservedTable.appendChild(emptyRow);
                            }
                            
                            showSuccessMessage('Reservation cancelled successfully!');
                        }, 300);
                    }
                });
            }
            
            // If no more rows in the main table, show "No tests available"
            if (tbody.children.length === 0) {
                const emptyRow = document.createElement('tr');
                emptyRow.innerHTML = '<td colspan="6" class="no-tests">No tests available</td>';
                tbody.appendChild(emptyRow);
            }

            showSuccessMessage('Test successfully reserved!');
        }, 300);
    }

    // Initialize the reservation page if we're on reserve.html
    if (window.location.pathname.endsWith('reserve.html')) {
        const tbody = document.querySelector('.tests-table tbody');
        if (tbody) {
            // Get parameters from URL
            const params = new URLSearchParams(window.location.search);
            const testCenter = params.get('center');
            const category = params.get('category');
            const slots = parseInt(params.get('slots')) || 0;
            const time = params.get('time');

            if (testCenter && slots > 0) {
                // Update page title
                const pageTitle = document.querySelector('h1');
                if (pageTitle) {
                    pageTitle.textContent = `Reserve tests at ${testCenter}`;
                }

                // Clear existing rows
                tbody.innerHTML = '';

                // Create rows for each available slot
                for (let i = 0; i < slots; i++) {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${category}</td>
                        <td>${time}</td>
                        <td>£52.00</td>
                        <td>1</td>
                        <td>Sun 16th Mar 2025</td>
                        <td>
                            <button class="btn-reserve">Reserve test</button>
                        </td>
                    `;
                    tbody.appendChild(row);
                }

                // Add event listeners to reserve buttons
                document.querySelectorAll('.btn-reserve').forEach(button => {
                    button.addEventListener('click', function() {
                        handleReserveButtonClick(this);
                    });
                });
            }
        }
    } else {
        // Handle slot click in index.html
        document.querySelectorAll('.slot-link').forEach(slotLink => {
            slotLink.addEventListener('click', function(event) {
                event.preventDefault();
                
                // Only proceed if we're on index.html
                if (!window.location.pathname.endsWith('reserve.html')) {
                    const row = this.closest('tr');
                    const testCenter = row.querySelector('.centre-name').textContent;
                    const category = row.querySelector('.category').textContent;
                    const slots = parseInt(this.getAttribute('data-count')) || 0;
                    
                    console.log('Clicked slot:', { testCenter, category, slots }); // Debug log
                    
                    if (slots > 0) {
                        // Pass information through URL parameters
                        const params = new URLSearchParams({
                            center: testCenter,
                            category: category,
                            slots: slots,
                            time: '8:10'
                        });
                        window.location.href = `reserve.html?${params.toString()}`;
                    }
                }
            });
        });

        initializeEventHandlers();
        updateDisplay();
    }

    // Initialize the app
    initializeEventHandlers();
    updateDisplay();
});
