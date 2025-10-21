/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// --- TYPE DEFINITIONS ---
type AppointmentType = 'ASA' | 'OSS' | 'CONSULENZA' | 'EXTRA';
interface Appointment {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    patientId: string;
    type: AppointmentType;
    notes?: string;
    duration: number;
}
interface Patient {
    id: string;
    firstName: string;
    lastName: string;
}

const runApp = () => {
    // --- LOCAL STORAGE KEYS ---
    const APPOINTMENTS_KEY = 'ossHeroAppointments';
    const PATIENTS_KEY = 'ossHeroPatients';

    // --- GLOBAL UI ELEMENTS & STATE ---
    const loadingEl = document.getElementById('loading')!;
    const views: { [key: string]: HTMLElement } = {
        'agenda-view': document.getElementById('agenda-view')!,
        'pazienti-view': document.getElementById('pazienti-view')!,
        'report-view': document.getElementById('report-view')!
    };
    const navButtons = document.querySelectorAll<HTMLButtonElement>('.nav-btn');
    let currentDate = new Date();
    let currentReportDate = new Date();

    let appointments: Appointment[] = [];
    let patients: Patient[] = [];

    // --- UTILITY FUNCTIONS ---
    const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatPatientName = (patient: Patient | undefined): string => {
        if (!patient) return 'Paziente non trovato';
        return `${patient.lastName} ${patient.firstName}`.trim();
    };

    const getWeekStart = (date: Date): Date => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as start of week
        const startOfWeek = new Date(d.setDate(diff));
        startOfWeek.setHours(0, 0, 0, 0);
        return startOfWeek;
    };

    const showToast = (message: string, isError = false) => {
        const toast = document.getElementById('toast')!;
        const toastMessage = document.getElementById('toast-message')!;
        toastMessage.textContent = message;
        toast.className = toast.className.replace(/bg-\w+-500/, isError ? 'bg-red-500' : 'bg-green-500');
        toast.classList.remove('opacity-0', 'translate-y-10');
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-10');
        }, 3000);
    };

    const getItalianHoliday = (date: Date): string | null => {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const dayKey = `${month}-${day}`;

        const fixedHolidays: { [key: string]: string } = {
            '1-1': 'Capodanno', '1-6': 'Epifania', '4-25': 'Festa della Liberazione', '5-1': 'Festa del Lavoro',
            '6-2': 'Festa della Repubblica', '8-15': 'Ferragosto', '11-1': 'Ognissanti', '12-8': 'Immacolata Concezione',
            '12-25': 'Natale', '12-26': 'Santo Stefano',
        };

        if (fixedHolidays[dayKey]) return fixedHolidays[dayKey];

        const a = year % 19, b = Math.floor(year / 100), c = year % 100, d = Math.floor(b / 4), e = b % 4,
              f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30,
              i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7,
              m = Math.floor((a + 11 * h + 22 * l) / 451),
              easterMonth = Math.floor((h + l - 7 * m + 114) / 31),
              easterDay = ((h + l - 7 * m + 114) % 31) + 1;

        const easterDate = new Date(year, easterMonth - 1, easterDay);
        if (date.getTime() === easterDate.getTime()) return 'Pasqua';

        const easterMondayDate = new Date( easterDate );
        easterMondayDate.setDate(easterDate.getDate() + 1);
        if (date.getTime() === easterMondayDate.getTime()) return "Lunedì dell'Angelo";

        return null;
    };

    // --- DATA PERSISTENCE ---
    const saveData = () => {
        localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
        localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
    };

    const loadData = () => {
        const storedAppointments = localStorage.getItem(APPOINTMENTS_KEY);
        if (storedAppointments) {
            appointments = JSON.parse(storedAppointments);
        }

        const storedPatients = localStorage.getItem(PATIENTS_KEY);
        if (storedPatients) {
            const loadedPatients: any[] = JSON.parse(storedPatients);
            // Check if migration is needed by looking for the old 'name' property.
            if (loadedPatients.length > 0 && loadedPatients[0].name !== undefined) {
                patients = loadedPatients.map(p => {
                    if (p.name === 'Corsi e riunioni') {
                        return { id: p.id, firstName: '', lastName: 'Corsi e riunioni' };
                    }
                    const parts = (p.name || '').split(' ').filter(Boolean);
                    const firstName = parts.shift() || '';
                    const lastName = parts.join(' ');
                    return { id: p.id, firstName, lastName };
                });
                saveData(); // Save migrated data
                showToast('Dati pazienti aggiornati al nuovo formato.');
            } else {
                patients = loadedPatients;
            }
        } else {
            // First time loading, seed the special patient
            patients = [{
                id: Date.now().toString() + Math.random().toString(),
                firstName: '',
                lastName: 'Corsi e riunioni'
            }];
            saveData();
            showToast('Paziente "Corsi e riunioni" aggiunto.');
        }
    };


    // --- VIEW MANAGEMENT ---
    const showView = (viewId: string) => {
        Object.values(views).forEach(v => v.classList.add('hidden'));
        views[viewId]?.classList.remove('hidden');
        
        navButtons.forEach(btn => {
            if (btn.dataset.view === viewId) {
                btn.classList.add('text-blue-600', 'bg-blue-50');
                btn.classList.remove('text-gray-500', 'hover:bg-gray-100');
            } else {
                btn.classList.remove('text-blue-600', 'bg-blue-50');
                btn.classList.add('text-gray-500', 'hover:bg-gray-100');
            }
        });
        
        if (viewId === 'agenda-view') renderWeek();
        if (viewId === 'pazienti-view') renderPatients();
        if (viewId === 'report-view') renderReport();
    };

    // --- RENDERING LOGIC ---
    function renderWeek() {
        const weekContainer = document.getElementById('week-container')!;
        const weekStart = getWeekStart(currentDate);
        
        const todayBtn = document.getElementById('goto-today-btn') as HTMLButtonElement;
        const startOfTodayWeek = getWeekStart(new Date());
        todayBtn.disabled = weekStart.getTime() === startOfTodayWeek.getTime();

        const weekEndDisplay = new Date(weekStart);
        weekEndDisplay.setDate(weekStart.getDate() + 6);
        
        const weekEndFilter = new Date(weekStart);
        weekEndFilter.setDate(weekStart.getDate() + 6);
        const startStr = formatDate(weekStart);
        const endStr = formatDate(weekEndFilter);

        const weekAppointments = appointments.filter(a => {
            return a.date >= startStr && a.date <= endStr;
        });

        const copyWeekBtn = document.getElementById('copy-week-btn') as HTMLButtonElement;
        copyWeekBtn.disabled = weekAppointments.length > 0;

        const deleteWeekBtn = document.getElementById('delete-week-btn') as HTMLButtonElement;
        deleteWeekBtn.disabled = weekAppointments.length === 0;

        const totalWeekHours = weekAppointments.reduce((sum, a) => sum + (a.duration || 0), 0);
        
        document.getElementById('current-week-label')!.innerHTML = `
            <div>${weekStart.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })} - ${weekEndDisplay.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        `;
        
        const totalWeekHoursIndicator = document.getElementById('total-week-hours-indicator')!;
        totalWeekHoursIndicator.textContent = totalWeekHours.toFixed(1);
        totalWeekHoursIndicator.setAttribute('title', `Ore totali pianificate per la settimana: ${totalWeekHours.toFixed(2)}`);

        weekContainer.innerHTML = '';
        const weekdays = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(weekStart);
            dayDate.setDate(weekStart.getDate() + i);
            const dateStr = formatDate(dayDate);

            const dayAppointments = appointments
                .filter(a => a.date === dateStr)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));
            
            const totalDayHours = dayAppointments.reduce((sum, a) => sum + (a.duration || 0), 0);
            
            const dailyHoursIndicator = `
                <div class="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 text-gray-400 font-bold text-sm cursor-default select-none border border-gray-400" title="Ore totali per la giornata: ${totalDayHours.toFixed(2)}">
                    ${totalDayHours.toFixed(1)}
                </div>
            `;

            const holiday = getItalianHoliday(dayDate);
            let holidayText = holiday ? `<span class="font-normal text-sm ml-2">(${holiday})</span>` : '';
            let dayClass = holiday ? 'text-red-600' : 'text-gray-700';

            const dayEl = document.createElement('div');
            dayEl.innerHTML = `
                <div class="bg-white p-3 rounded-lg shadow-sm flex justify-between items-center mb-3">
                    <div>
                        <h3 class="text-lg font-bold ${dayClass}">${weekdays[i]} ${holidayText}</h3>
                        <p class="text-sm text-gray-500">${dayDate.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}</p>
                    </div>
                     <div class="flex items-center gap-2">
                        ${dailyHoursIndicator}
                        <button class="add-appointment-btn p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors" data-date="${dateStr}" aria-label="Aggiungi appuntamento per ${weekdays[i]}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        </button>
                    </div>
                </div>
                <div class="appointments-list space-y-1" id="list-${dateStr}">
                    ${dayAppointments.length > 0 ? dayAppointments.map(renderAppointment).join('') : '<p class="text-center text-gray-500 italic py-4">Nessun appuntamento.</p>'}
                </div>
            `;
            weekContainer.appendChild(dayEl);
        }
    }
    
    function renderAppointment(app: Appointment): string {
        const typeColors: Record<AppointmentType, string> = {
            OSS: 'bg-blue-100 text-blue-800 border-l-blue-500',
            ASA: 'bg-green-100 text-green-800 border-l-green-500',
            CONSULENZA: 'bg-purple-100 text-purple-800 border-l-purple-500',
            EXTRA: 'bg-yellow-100 text-yellow-800 border-l-yellow-500'
        };
        const typeClass = typeColors[app.type] || 'bg-gray-100 text-gray-800 border-l-gray-500';
        const patient = patients.find(p => p.id === app.patientId);
        return `
            <div class="appointment-item cursor-pointer relative border-l-4 ${typeClass} grid grid-cols-[auto_1fr] gap-x-4 items-baseline" data-id="${app.id}">
                <p class="py-3 pl-4 font-mono font-semibold text-gray-700 text-sm whitespace-nowrap">${app.startTime} - ${app.endTime}</p>
                <div class="py-3 pr-4">
                    <p class="font-bold text-base break-words">${formatPatientName(patient)}</p>
                    ${app.notes ? `<p class="text-sm text-gray-500 mt-2 pt-2 border-t border-gray-200 flex items-start gap-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg><span>${app.notes}</span></p>` : ''}
                </div>
            </div>
        `;
    }

    function renderPatients() {
        const listEl = document.getElementById('patients-list')!;
        listEl.innerHTML = '';
        if (patients.length === 0) {
             listEl.innerHTML = `<p class="text-gray-500 italic px-2">Nessun paziente aggiunto.</p>`;
             return;
        }

        const todayStr = formatDate(new Date());

        [...patients].sort((a,b) => {
            const lastNameComp = a.lastName.localeCompare(b.lastName);
            if (lastNameComp !== 0) return lastNameComp;
            return a.firstName.localeCompare(b.firstName);
        }).forEach(p => {
            const patientEl = document.createElement('div');
            patientEl.className = 'card flex justify-between items-center';
            
            const patientAppointments = appointments.filter(a => a.patientId === p.id && a.date <= todayStr);
            let lastVisitHtml = '<span class="text-xs text-gray-500 mt-1 block">Nessuna visita passata</span>';
            if (patientAppointments.length > 0) {
                patientAppointments.sort((a, b) => b.date.localeCompare(a.date));
                const lastDate = patientAppointments[0].date;
                const [year, month, day] = lastDate.split('-');
                const formattedDate = `${day}/${month}/${year}`;
                lastVisitHtml = `<span class="text-xs text-gray-500 mt-1 block">Ultima visita: ${formattedDate}</span>`;
            }

            const deleteButtonHtml = !(p.lastName === 'Corsi e riunioni' && p.firstName === '')
                ? `<button class="delete-patient-btn p-2 rounded-full hover:bg-red-100 text-red-500" data-id="${p.id}" aria-label="Elimina paziente ${formatPatientName(p)}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                </button>`
                : '';
                
            patientEl.innerHTML = `
                <div class="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500 self-start shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" /></svg>
                    <div>
                        <span class="font-medium">${formatPatientName(p)}</span>
                        ${lastVisitHtml}
                    </div>
                </div>
                ${deleteButtonHtml}
            `;
            listEl.appendChild(patientEl);
        });
    }
    
    function renderReport() {
        const contentEl = document.getElementById('report-content')!;
        document.getElementById('current-month-label')!.textContent = currentReportDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
        
        const todayMonthBtn = document.getElementById('goto-current-month-btn') as HTMLButtonElement;
        const today = new Date();
        todayMonthBtn.disabled = today.getFullYear() === currentReportDate.getFullYear() && today.getMonth() === currentReportDate.getMonth();

        const year = currentReportDate.getFullYear();
        const month = currentReportDate.getMonth();
        const monthAppointments = appointments.filter(a => {
            const aDate = new Date(a.date + 'T00:00:00'); // Treat date as local to avoid TZ issues
            return aDate.getFullYear() === year && aDate.getMonth() === month;
        });

        if (monthAppointments.length === 0) {
            contentEl.innerHTML = '<div class="card border-dashed border-2"><p class="text-center text-gray-500 italic py-8">Nessun dato per questo mese.</p></div>';
            return;
        }

        const totalsByCategory = monthAppointments.reduce((acc, curr) => {
            acc[curr.type] = (acc[curr.type] || 0) + curr.duration;
            return acc;
        }, {} as Record<AppointmentType, number>);

        const totalsByPatient = monthAppointments.reduce((acc, curr) => {
            const patient = patients.find(p => p.id === curr.patientId);
            const patientName = formatPatientName(patient);
            acc[patientName] = (acc[patientName] || 0) + curr.duration;
            return acc;
        }, {} as Record<string, number>);

        const totalHours = monthAppointments.reduce((sum, a) => sum + a.duration, 0);

        contentEl.innerHTML = `
            <div class="space-y-6">
                 <div class="card">
                    <h3 class="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a1 1 0 011-1h5a.997.997 0 01.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                        </svg>
                        Riepilogo per categoria
                    </h3>
                    <div class="space-y-1">
                        ${['ASA', 'OSS', 'CONSULENZA', 'EXTRA'].map(cat => `
                            <div class="flex justify-between">
                                <span>${cat}</span>
                                <span class="font-semibold">${(totalsByCategory[cat as AppointmentType] || 0).toFixed(2)} ore</span>
                            </div>
                        `).join('')}
                    </div>
                    <hr class="my-3"><div class="flex justify-between font-bold text-lg text-gray-700"><span>Totale Generale</span><span>${totalHours.toFixed(2)} ore</span></div>
                </div>
                <div class="card">
                    <h3 class="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        Riepilogo per paziente
                    </h3>
                    <div class="space-y-1">
                        ${Object.entries(totalsByPatient).sort((a, b) => a[0].localeCompare(b[0])).map(([name, hours]) => `
                            <div class="flex justify-between"><span>${name}</span><span class="font-semibold">${hours.toFixed(2)} ore</span></div>
                        `).join('')}
                    </div>
                    <hr class="my-3"><div class="flex justify-between font-bold text-lg text-gray-700"><span>Totale Generale</span><span>${totalHours.toFixed(2)} ore</span></div>
                </div>
            </div>`;
    }

    // --- MODAL MANAGEMENT ---
    const appointmentModal = document.getElementById('appointment-modal')!;
    const appointmentForm = document.getElementById('appointment-form') as HTMLFormElement;
    const patientModal = document.getElementById('patient-modal')!;
    const patientForm = document.getElementById('patient-form') as HTMLFormElement;
    const confirmModal = document.getElementById('confirm-modal')!;
    const copyWeekModal = document.getElementById('copy-week-modal')!;
    let confirmCallback: (() => void) | null = null;
    
    const openAppointmentModal = (appointment: Appointment | null = null, date: string | null = null) => {
        appointmentForm.reset();
        (document.getElementById('appointment-id') as HTMLInputElement).value = '';
        document.querySelector('#modal-title span')!.textContent = 'Nuovo Appuntamento';
        document.getElementById('delete-appointment')!.classList.add('hidden');
        
        const patientSelect = document.getElementById('patient-select') as HTMLSelectElement;
        patientSelect.innerHTML = '<option value="">Seleziona un paziente...</option>';
        [...patients].sort((a,b) => {
            const lastNameComp = a.lastName.localeCompare(b.lastName);
            if (lastNameComp !== 0) return lastNameComp;
            return a.firstName.localeCompare(b.firstName);
        }).forEach(p => {
            patientSelect.innerHTML += `<option value="${p.id}">${formatPatientName(p)}</option>`;
        });

        if (appointment) {
            document.querySelector('#modal-title span')!.textContent = 'Modifica Appuntamento';
            (document.getElementById('appointment-id') as HTMLInputElement).value = appointment.id;
            (document.getElementById('appointment-date') as HTMLInputElement).value = appointment.date;
            (document.getElementById('start-time') as HTMLInputElement).value = appointment.startTime;
            (document.getElementById('end-time') as HTMLInputElement).value = appointment.endTime;
            patientSelect.value = appointment.patientId;
            (document.getElementById('appointment-type') as HTMLSelectElement).value = appointment.type;
            (document.getElementById('appointment-notes') as HTMLTextAreaElement).value = appointment.notes || '';
            document.getElementById('delete-appointment')!.classList.remove('hidden');
        } else if (date) {
            (document.getElementById('appointment-date') as HTMLInputElement).value = date;
        }
        
        appointmentModal.classList.remove('hidden');
        setTimeout(()=> appointmentModal.querySelector('.modal-content')!.classList.add('scale-100'), 10);
    };
    
    const closeModal = (modal: HTMLElement) => {
        modal.querySelector('.modal-content')!.classList.remove('scale-100');
        setTimeout(()=> modal.classList.add('hidden'), 300);
    };

    const openPatientModal = () => {
        patientForm.reset();
        patientModal.classList.remove('hidden');
        setTimeout(()=> patientModal.querySelector('.modal-content')!.classList.add('scale-100'), 10);
    };

    const openConfirmModal = (message: string, onConfirm: () => void) => {
        document.getElementById('confirm-message')!.textContent = message;
        confirmCallback = onConfirm;
        confirmModal.classList.remove('hidden');
        setTimeout(()=> confirmModal.querySelector('.modal-content')!.classList.add('scale-100'), 10);
    };

    const openCopyWeekModal = () => {
        copyWeekModal.classList.remove('hidden');
        setTimeout(()=> copyWeekModal.querySelector('.modal-content')!.classList.add('scale-100'), 10);
    };
    
    // --- EVENT LISTENERS ---
    appointmentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = (document.getElementById('appointment-id') as HTMLInputElement).value;
        const date = (document.getElementById('appointment-date') as HTMLInputElement).value;
        const startTime = (document.getElementById('start-time') as HTMLInputElement).value;
        const endTime = (document.getElementById('end-time') as HTMLInputElement).value;

        if (endTime <= startTime) {
            showToast('L\'orario di fine deve essere successivo a quello di inizio.', true);
            return;
        }
        
        const duration = (new Date(`${date}T${endTime}`).getTime() - new Date(`${date}T${startTime}`).getTime()) / (1000 * 60 * 60);

        const appointmentData = {
            date, startTime, endTime,
            patientId: (document.getElementById('patient-select') as HTMLSelectElement).value,
            type: (document.getElementById('appointment-type') as HTMLSelectElement).value as AppointmentType,
            notes: (document.getElementById('appointment-notes') as HTMLTextAreaElement).value,
            duration
        };
        
        if (id) {
            const index = appointments.findIndex(a => a.id === id);
            if (index > -1) {
                appointments[index] = { ...appointments[index], ...appointmentData };
            }
            showToast('Appuntamento aggiornato!');
        } else {
            const newAppointment: Appointment = { ...appointmentData, id: Date.now().toString() + Math.random().toString() };
            appointments.push(newAppointment);
            showToast('Appuntamento salvato!');
        }
        saveData();
        closeModal(appointmentModal);
        renderWeek();
        renderReport();
    });

    document.getElementById('delete-appointment')!.addEventListener('click', () => {
         const id = (document.getElementById('appointment-id') as HTMLInputElement).value;
         if (!id) return;
         const app = appointments.find(a => a.id === id);
         const patient = patients.find(p => p.id === app?.patientId);
         openConfirmModal(`Sei sicuro di voler eliminare questo appuntamento con ${formatPatientName(patient)}?`, () => {
            appointments = appointments.filter(a => a.id !== id);
            saveData();
            showToast('Appuntamento eliminato.');
            closeModal(appointmentModal);
            renderWeek();
            renderReport();
         });
    });

    patientForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const firstName = (document.getElementById('patient-firstname') as HTMLInputElement).value.trim();
        const lastName = (document.getElementById('patient-lastname') as HTMLInputElement).value.trim();

        if (lastName) { // Only require last name
            const existingPatient = patients.find(p =>
                p.firstName.toLowerCase() === firstName.toLowerCase() &&
                p.lastName.toLowerCase() === lastName.toLowerCase()
            );

            if (existingPatient) {
                showToast('Un paziente con lo stesso nome e cognome esiste già.', true);
                return;
            }

            const newPatient: Patient = {
                id: Date.now().toString() + Math.random().toString(),
                firstName,
                lastName
            };
            patients.push(newPatient);
            saveData();
            showToast('Paziente aggiunto!');
            closeModal(patientModal);
            renderPatients();
        } else {
            showToast('Il cognome è obbligatorio.', true);
        }
    });
    
    document.getElementById('prev-week')!.addEventListener('click', () => { currentDate.setDate(currentDate.getDate() - 7); renderWeek(); });
    document.getElementById('next-week')!.addEventListener('click', () => { currentDate.setDate(currentDate.getDate() + 7); renderWeek(); });
    document.getElementById('goto-today-btn')!.addEventListener('click', () => { currentDate = new Date(); renderWeek(); });
    document.getElementById('prev-month')!.addEventListener('click', () => { currentReportDate.setMonth(currentReportDate.getMonth() - 1); renderReport(); });
    document.getElementById('next-month')!.addEventListener('click', () => { currentReportDate.setMonth(currentReportDate.getMonth() + 1); renderReport(); });
    document.getElementById('goto-current-month-btn')!.addEventListener('click', () => { currentReportDate = new Date(); renderReport(); });
    document.getElementById('copy-week-btn')!.addEventListener('click', openCopyWeekModal);

    document.getElementById('delete-week-btn')!.addEventListener('click', () => {
        const weekStart = getWeekStart(currentDate);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        const startStr = formatDate(weekStart);
        const endStr = formatDate(weekEnd);

        const appsToDelete = appointments.filter(a => a.date >= startStr && a.date <= endStr);

        if (appsToDelete.length === 0) {
            showToast("Nessun appuntamento da eliminare in questa settimana.");
            return;
        }

        openConfirmModal(`Sei sicuro di voler eliminare i ${appsToDelete.length} appuntamenti di questa settimana?`, () => {
            const idsToDelete = new Set(appsToDelete.map(a => a.id));
            appointments = appointments.filter(a => !idsToDelete.has(a.id));
            saveData();
            showToast("Appuntamenti della settimana eliminati.");
            renderWeek();
            renderReport();
        });
    });

    document.body.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;

        const addBtn = target.closest<HTMLElement>('.add-appointment-btn');
        if (addBtn) { openAppointmentModal(null, addBtn.dataset.date || null); return; }

        const appointmentCard = target.closest<HTMLElement>('.appointment-item');
        if (appointmentCard instanceof HTMLElement) {
             const appointmentId = appointmentCard.dataset.id;
             const clickedAppointment = appointments.find(a => a.id === appointmentId);
             if (clickedAppointment) {
                openAppointmentModal(clickedAppointment);
             }
             return;
        }
        
        const deletePatientBtn = target.closest<HTMLElement>('.delete-patient-btn');
        if(deletePatientBtn instanceof HTMLElement) {
            const { id } = deletePatientBtn.dataset;
            if (!id) return;
            const patientToDelete = patients.find(p => p.id === id);
            if (!patientToDelete) return;
            
            if (patientToDelete.lastName === 'Corsi e riunioni' && patientToDelete.firstName === '') return; // Safety check

            const appCount = appointments.filter(a => a.patientId === id).length;
            let msg = `Sei sicuro di voler eliminare "${formatPatientName(patientToDelete)}"?`;
            if(appCount > 0) msg += `\n\nATTENZIONE: Ci sono ${appCount} appuntamenti associati. L'eliminazione del paziente NON eliminerà i suoi appuntamenti.`;

            openConfirmModal(msg, () => {
                patients = patients.filter(p => p.id !== id);
                saveData();
                showToast('Paziente eliminato.');
                renderPatients();
                renderWeek(); // Re-render week in case patient names are now "not found"
            });
            return;
        }
    });

    document.getElementById('suggest-time-btn')!.addEventListener('click', () => {
        const date = (document.getElementById('appointment-date') as HTMLInputElement).value;
        if (!date) {
            showToast("Seleziona prima una data.", true);
            return;
        }
        const spinner = document.getElementById('suggest-spinner')!;
        spinner.classList.remove('hidden');

        const timeToMinutes = (time: string): number => {
            const [hours, minutes] = time.split(':').map(Number);
            return hours * 60 + minutes;
        };
    
        const minutesToTime = (minutes: number): string => {
            const h = Math.floor(minutes / 60).toString().padStart(2, '0');
            const m = (minutes % 60).toString().padStart(2, '0');
            return `${h}:${m}`;
        };
    
        const dayAppointments = appointments.filter(a => a.date === date);
        const busySlots = dayAppointments.map(a => ({
            start: timeToMinutes(a.startTime),
            end: timeToMinutes(a.endTime),
        }));
    
        busySlots.push({ start: timeToMinutes('12:00'), end: timeToMinutes('14:00') });
        busySlots.sort((a, b) => a.start - b.start);
    
        const slotDuration = 60; // 1 hour
        const dayStart = timeToMinutes('08:00');
        const dayEnd = timeToMinutes('18:00');
        let suggestedStartTime: number | null = null;
    
        let checkTime = dayStart;
    
        while (checkTime <= dayEnd - slotDuration) {
            const slotEnd = checkTime + slotDuration;
            const conflictingBusySlot = busySlots.find(busy => checkTime < busy.end && slotEnd > busy.start);
    
            if (conflictingBusySlot) {
                checkTime = conflictingBusySlot.end;
            } else {
                suggestedStartTime = checkTime;
                break;
            }
        }
    
        spinner.classList.add('hidden');
    
        if (suggestedStartTime !== null) {
            const start = minutesToTime(suggestedStartTime);
            const end = minutesToTime(suggestedStartTime + slotDuration);
            (document.getElementById('start-time') as HTMLInputElement).value = start;
            (document.getElementById('end-time') as HTMLInputElement).value = end;
        } else {
            showToast("Non ho trovato uno slot da 1 ora.", true);
        }
    });

    document.getElementById('copy-week-options')!.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const button = target.closest<HTMLButtonElement>('[data-weeks-ago]');

        if (!button) return;

        const weeksAgo = parseInt(button.dataset.weeksAgo!, 10);
        if (isNaN(weeksAgo)) return;

        const targetWeekStart = getWeekStart(currentDate);

        const sourceWeekStart = new Date(targetWeekStart);
        sourceWeekStart.setDate(sourceWeekStart.getDate() - (7 * weeksAgo));
        const sourceWeekEnd = new Date(sourceWeekStart);
        sourceWeekEnd.setDate(sourceWeekStart.getDate() + 6);
        
        const sourceStartStr = formatDate(sourceWeekStart);
        const sourceEndStr = formatDate(sourceWeekEnd);

        const sourceAppointments = appointments.filter(a => a.date >= sourceStartStr && a.date <= sourceEndStr);

        if (sourceAppointments.length === 0) {
            showToast(`Nessun appuntamento trovato ${weeksAgo === 1 ? 'la settimana scorsa' : `${weeksAgo} settimane fa`}.`, true);
            closeModal(copyWeekModal);
            return;
        }
        
        const newAppointments: Appointment[] = sourceAppointments.map(sourceApp => {
            const sourceAppDate = new Date(sourceApp.date + 'T00:00:00');
            const dayOffset = Math.round((sourceAppDate.getTime() - sourceWeekStart.getTime()) / (1000 * 60 * 60 * 24));
            
            const newAppDate = new Date(targetWeekStart);
            newAppDate.setDate(targetWeekStart.getDate() + dayOffset);

            return {
                ...sourceApp,
                id: Date.now().toString() + Math.random().toString(),
                date: formatDate(newAppDate)
            };
        });

        appointments.push(...newAppointments);
        saveData();
        closeModal(copyWeekModal);
        renderWeek();
        renderReport();
        showToast(`${newAppointments.length} appuntamenti copiati con successo!`);
    });

    navButtons.forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.view!)));
    document.getElementById('add-patient-btn-view')!.addEventListener('click', openPatientModal);
    
    document.getElementById('cancel-appointment')!.addEventListener('click', () => closeModal(appointmentModal));
    document.getElementById('cancel-patient')!.addEventListener('click', () => closeModal(patientModal));
    appointmentModal.addEventListener('click', (e) => { if (e.target === appointmentModal) closeModal(appointmentModal); });
    patientModal.addEventListener('click', (e) => { if (e.target === patientModal) closeModal(patientModal); });
    document.getElementById('cancel-confirm')!.addEventListener('click', () => closeModal(confirmModal));
    document.getElementById('confirm-action')!.addEventListener('click', () => { confirmCallback?.(); closeModal(confirmModal); });
    confirmModal.addEventListener('click', (e) => { if (e.target === confirmModal) closeModal(confirmModal); });
    document.getElementById('cancel-copy-week')!.addEventListener('click', () => closeModal(copyWeekModal));
    copyWeekModal.addEventListener('click', (e) => { if (e.target === copyWeekModal) closeModal(copyWeekModal); });
    
    // --- APP START ---
    loadData();
    loadingEl.classList.add('hidden');
    showView('agenda-view');

    // --- PWA Service Worker Registration ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('SW registered: ', registration);
            }).catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
        });
    }
};

// Defer app execution until the DOM is ready to prevent race conditions.
document.addEventListener('DOMContentLoaded', runApp);