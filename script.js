// Application State
let dataSelecionada = { 
    mes: '', 
    dia: '', 
    ano: new Date().getFullYear() 
};

let currentStep = 1;

// DOM Elements
const mesesDiv = document.getElementById('meses');
const diasDiv = document.getElementById('dias');
const resultado = document.getElementById('resultado');
const loadingOverlay = document.getElementById('loading-overlay');

// Month names in Portuguese
const mesesNomes = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeMonths();
    updateProgressBar();
});

// Initialize month buttons
function initializeMonths() {
    for (let i = 1; i <= 12; i++) {
        const mes = i.toString().padStart(2, '0');
        const nome = mesesNomes[i - 1];
        
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.innerHTML = `<strong>${mes}</strong><br><small>${nome}</small>`;
        btn.onclick = () => selecionarMes(mes);
        
        mesesDiv.appendChild(btn);
    }
}

// Month selection handler
function selecionarMes(mes) {
    dataSelecionada.mes = mes;
    currentStep = 2;
    
    // Update UI
    updateProgressBar();
    showStep('passo-dia');
    
    // Update result
    updateResult({
        icon: 'fas fa-calendar-day',
        title: 'Ótima escolha!',
        message: `Mês selecionado: ${mesesNomes[parseInt(mes) - 1]}. Agora selecione o dia desejado.`,
        type: 'info'
    });
    
    // Generate day buttons
    generateDayButtons();
}

// Generate day buttons based on selected month
function generateDayButtons() {
    diasDiv.innerHTML = '';
    
    const currentDate = new Date();
    const selectedMonth = parseInt(dataSelecionada.mes);
    const selectedYear = dataSelecionada.ano;
    
    // Get number of days in the selected month
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
        const dia = i.toString().padStart(2, '0');
        const dateToCheck = new Date(selectedYear, selectedMonth - 1, i);
        
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.textContent = dia;
        
        // Disable past dates
        if (dateToCheck < currentDate.setHours(0, 0, 0, 0)) {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        } else {
            btn.onclick = () => selecionarDia(dia);
        }
        
        diasDiv.appendChild(btn);
    }
}

// Day selection handler
function selecionarDia(dia) {
    dataSelecionada.dia = dia;
    currentStep = 3;
    
    // Update UI
    updateProgressBar();
    showStep('passo-barbeiro');
    
    // Format selected date
    const selectedDate = `${dia}/${dataSelecionada.mes}/${dataSelecionada.ano}`;
    
    // Update result
    updateResult({
        icon: 'fas fa-user-tie',
        title: 'Data confirmada!',
        message: `Data selecionada: ${selectedDate}. Agora escolha o barbeiro de sua preferência.`,
        type: 'info'
    });
}

// Barber consultation handler
async function consultarAgenda(barbeiro) {
    const { dia, mes, ano } = dataSelecionada;
    const data = `${ano}-${mes}-${dia}`;
    const selectedDate = `${dia}/${mes}/${ano}`;
    
    // Show loading
    showLoading(true);
    
    // Update result with loading state
    updateResult({
        icon: 'fas fa-search',
        title: 'Consultando agenda...',
        message: `Verificando disponibilidade de ${capitalizeFirst(barbeiro)} para ${selectedDate}...`,
        type: 'info'
    });
    
    try {
        const response = await fetch(`https://ice-club.my/get_agenda.php?barbeiro=${barbeiro}&data=${data}`);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const json = await response.json();
        
        // Hide loading
        showLoading(false);
        
        if (json.erro) {
            updateResult({
                icon: 'fas fa-exclamation-triangle',
                title: 'Erro na consulta',
                message: `Não foi possível consultar a agenda: ${json.erro}`,
                type: 'error'
            });
        } else if (!json.horarios || json.horarios.length === 0) {
            updateResult({
                icon: 'fas fa-calendar-times',
                title: 'Sem disponibilidade',
                message: `Infelizmente não há horários disponíveis para ${capitalizeFirst(json.barbeiro)} em ${formatDate(json.data)}.\n\nTente selecionar outro dia ou barbeiro.`,
                type: 'warning'
            });
        } else {
            const horariosFormatted = json.horarios.map(h => `• ${h}`).join('\n');
            updateResult({
                icon: 'fas fa-clock',
                title: 'Horários disponíveis',
                message: `${capitalizeFirst(json.barbeiro)} - ${formatDate(json.data)}\n\n${horariosFormatted}\n\nEntre em contato para confirmar seu agendamento!`,
                type: 'success'
            });
        }
        
    } catch (error) {
        // Hide loading
        showLoading(false);
        
        console.error('Erro na consulta:', error);
        updateResult({
            icon: 'fas fa-wifi',
            title: 'Erro de conexão',
            message: 'Não foi possível consultar os horários. Verifique sua conexão com a internet e tente novamente.',
            type: 'error'
        });
    }
}

// Show/hide loading overlay
function showLoading(show) {
    if (show) {
        loadingOverlay.classList.add('active');
    } else {
        loadingOverlay.classList.remove('active');
    }
}

// Update result display
function updateResult({ icon, title, message, type = 'info' }) {
    // Remove existing type classes
    resultado.classList.remove('success', 'error', 'warning', 'info');
    
    // Add new type class
    resultado.classList.add(type);
    
    // Update content
    resultado.innerHTML = `
        <div class="result-icon">
            <i class="${icon}"></i>
        </div>
        <div class="result-content">
            <h3>${title}</h3>
            <p>${message}</p>
        </div>
    `;
}

// Show specific step
function showStep(stepId) {
    // Hide all steps
    document.querySelectorAll('.booking-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show target step
    document.getElementById(stepId).classList.add('active');
}

// Update progress bar
function updateProgressBar() {
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        if (index + 1 <= currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

// Back button handler
function voltarPasso(step) {
    currentStep = step;
    updateProgressBar();
    
    switch (step) {
        case 1:
            showStep('passo-mes');
            updateResult({
                icon: 'fas fa-info-circle',
                title: 'Bem-vindo à Barbearia Premium',
                message: 'Escolha o mês para iniciar seu agendamento e desfrute de uma experiência única com nossos profissionais especializados.',
                type: 'info'
            });
            break;
        case 2:
            showStep('passo-dia');
            updateResult({
                icon: 'fas fa-calendar-day',
                title: 'Selecione o dia',
                message: `Mês selecionado: ${mesesNomes[parseInt(dataSelecionada.mes) - 1]}. Agora selecione o dia desejado.`,
                type: 'info'
            });
            break;
    }
}

// Utility functions
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateStr) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

// Add smooth scrolling for better UX
function smoothScrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Add keyboard navigation
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        showLoading(false);
    }
});

// Add touch support for mobile devices
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', function(event) {
    touchStartY = event.changedTouches[0].screenY;
});

document.addEventListener('touchend', function(event) {
    touchEndY = event.changedTouches[0].screenY;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartY - touchEndY;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe up - scroll to top
            smoothScrollToTop();
        }
    }
}

// Performance optimization: Preload critical resources
document.addEventListener('DOMContentLoaded', function() {
    // Preload Font Awesome icons that will be used
    const iconClasses = [
        'fas fa-calendar-alt',
        'fas fa-calendar-day', 
        'fas fa-user-tie',
        'fas fa-clock',
        'fas fa-exclamation-triangle'
    ];
    
    iconClasses.forEach(iconClass => {
        const tempIcon = document.createElement('i');
        tempIcon.className = iconClass;
        tempIcon.style.display = 'none';
        document.body.appendChild(tempIcon);
        setTimeout(() => document.body.removeChild(tempIcon), 100);
    });
});
