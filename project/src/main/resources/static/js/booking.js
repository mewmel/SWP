// Define working hours for each day
            const workingHours = {
                1: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00',], // Monday
                2: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00',], // Tuesday
                3: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00',], // Wednesday
                4: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00',], // Thursday
                5: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00',], // Friday
                6: ['08:00', '09:00', '10:00', '11:00'], // Saturday (8:00-12:00)
                0: ['08:00', '09:00', '10:00', '11:00'] // Sunday (8:00-11:30)
            };

            // Function to update time slots based on selected date
            function updateTimeSlots(selectedDate) {
                const timeSlotsContainer = document.querySelector('.time-slots');
                const date = new Date(selectedDate);
                const dayOfWeek = date.getDay();

                // Clear existing time slots
                timeSlotsContainer.innerHTML = '';

                // Get available hours for the selected day
                const availableHours = workingHours[dayOfWeek] || [];

                if (availableHours.length === 0) {
                    timeSlotsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #6c757d; padding: 20px;">Ngày này phòng khám không làm việc</p>';
                    return;
                }

                // Create time slots
                availableHours.forEach(hour => {
                    const endHour = parseInt(hour.split(':')[0]) + 1;
                    const endTime = endHour.toString().padStart(2, '0') + ':00';

                    const timeSlot = document.createElement('div');
                    timeSlot.className = 'time-slot';
                    timeSlot.setAttribute('data-time', hour);
                    timeSlot.textContent = `${hour}-${endTime}`;

                    // Add click event listener
                    timeSlot.addEventListener('click', function () {
                        document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                        this.classList.add('selected');
                        document.getElementById('selectedTime').value = this.dataset.time;
                    });

                    timeSlotsContainer.appendChild(timeSlot);
                });

                // Reset selected time
                document.getElementById('selectedTime').value = '';
            }

            // Function to get day name in Vietnamese
            function getDayName(dayOfWeek) {
                const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
                return days[dayOfWeek];
            }

            // Set minimum date to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('appointmentDate').setAttribute('min', today);
            document.getElementById('dob').setAttribute('max', today);

            // Initialize with today's date if no date is selected
            document.addEventListener('DOMContentLoaded', function () {
                const appointmentDateInput = document.getElementById('appointmentDate');

                // Set default to today
                appointmentDateInput.value = today;
                updateTimeSlots(today);
            });

            // Update time slots when date changes
            document.getElementById('appointmentDate').addEventListener('change', function () {
                const selectedDate = this.value;
                if (selectedDate) {
                    updateTimeSlots(selectedDate);

                    // Show working hours info
                    const date = new Date(selectedDate);
                    const dayOfWeek = date.getDay();
                    const dayName = getDayName(dayOfWeek);

                    let workingInfo = '';
                    if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
                        workingInfo = `${dayName}: 8:00 - 17:00`;
                    } else if (dayOfWeek === 6) { // Saturday
                        workingInfo = `${dayName}: 8:00 - 12:00`;
                    } else if (dayOfWeek === 0) { // Sunday
                        workingInfo = `${dayName}: 8:00 - 12:00`;
                    }

                    // Update or create working hours display
                    let workingHoursDisplay = document.querySelector('.working-hours-display');
                    if (!workingHoursDisplay) {
                        workingHoursDisplay = document.createElement('div');
                        workingHoursDisplay.className = 'working-hours-display';
                        workingHoursDisplay.style.cssText = `
                        background: #e3f2fd;
                        border: 1px solid #2196f3;
                        border-radius: 8px;
                        padding: 8px 12px;
                        margin-top: 8px;
                        font-size: 0.85rem;
                        color: #1976d2;
                        text-align: center;
                    `;
                        document.querySelector('.time-slots').parentNode.appendChild(workingHoursDisplay);
                    }
                    workingHoursDisplay.textContent = `Giờ làm việc ${workingInfo}`;
                }
            });

            // Form submission
            document.getElementById('bookingForm').addEventListener('submit', function (e) {
                e.preventDefault();

                if (!document.getElementById('selectedTime').value) {
                    alert('Vui lòng chọn khung giờ khám!');
                    return;
                }

                alert('Đặt lịch thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.');

                // Reset form and update time slots for today
                this.reset();
                document.getElementById('appointmentDate').value = today;
                updateTimeSlots(today);
                document.getElementById('selectedTime').value = '';

                // Remove working hours display
                const workingHoursDisplay = document.querySelector('.working-hours-display');
                if (workingHoursDisplay) {
                    workingHoursDisplay.remove();
                }
            });

            // Mobile menu toggle
            document.querySelector('.mobile-menu-btn').addEventListener('click', function () {
                document.querySelector('nav').classList.toggle('active');
            });
        