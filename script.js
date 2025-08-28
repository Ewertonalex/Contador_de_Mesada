console.log('Script.js carregado!');

class ContadorMesada {
    constructor() {
        console.log('Construtor ContadorMesada iniciado');
        
        this.currentMonth = new Date().getMonth() + 1;
        this.currentYear = new Date().getFullYear();
        this.data = this.loadData();
        this.selectedActivities = {
            enzo: [],
            matteo: []
        };
        
        console.log('Dados carregados:', this.data);
        console.log('Mês atual:', this.currentMonth);
        console.log('Ano atual:', this.currentYear);
        
        // Aguarda o DOM estar completamente carregado
        if (document.readyState === 'loading') {
            console.log('DOM ainda carregando, aguardando...');
            document.addEventListener('DOMContentLoaded', () => {
                console.log('DOM carregado via event listener');
                this.initializeApp();
                this.bindEvents();
            });
        } else {
            console.log('DOM já carregado, inicializando direto');
            this.initializeApp();
            this.bindEvents();
        }
    }

    initializeApp() {
        console.log('Inicializando aplicação...');
        
        try {
            // Define o mês atual no seletor
            const monthSelect = document.getElementById('monthSelect');
            if (monthSelect) {
                monthSelect.value = this.currentMonth;
                console.log('Seletor de mês configurado:', this.currentMonth);
            } else {
                console.error('Elemento monthSelect não encontrado!');
            }
            
            // Carrega os dados do mês atual
            this.loadMonthData();
            
            // Atualiza os saldos
            this.updateBalances();
            
            // Carrega o histórico do dia atual
            this.loadTodayHistory();
            
            console.log('Aplicação inicializada com sucesso!');
        } catch (error) {
            console.error('Erro ao inicializar aplicação:', error);
        }
    }

    bindEvents() {
        console.log('Vinculando eventos...');
        
        try {
            // Eventos dos botões individuais para cada criança
            this.bindKidEvents('enzo');
            this.bindKidEvents('matteo');
            
            // Eventos dos campos de mesada
            this.bindMesadaEvents('enzo');
            this.bindMesadaEvents('matteo');
            
            // Eventos dos botões de reset individual
            this.bindResetMonthEvents('enzo');
            this.bindResetMonthEvents('matteo');
            
            // Evento de mudança de mês
            const monthSelect = document.getElementById('monthSelect');
            if (monthSelect) {
                monthSelect.addEventListener('change', (e) => {
                    this.currentMonth = parseInt(e.target.value);
                    this.loadMonthData();
                    this.updateBalances();
                });
                console.log('Evento change do monthSelect vinculado');
            }

            // Eventos das atividades
            const activityItems = document.querySelectorAll('.activity-item');
            console.log('Encontradas', activityItems.length, 'atividades para vincular eventos');
            
            activityItems.forEach((item, index) => {
                console.log(`Vinculando evento para atividade ${index + 1}:`, item.dataset.activity);
                item.addEventListener('click', (e) => {
                    console.log('Clique detectado na atividade:', e.currentTarget.dataset.activity);
                    this.toggleActivity(e.currentTarget);
                });
            });

            // Modal
            const modal = document.getElementById('reportModal');
            const closeBtn = document.querySelector('.close');
            
            if (closeBtn && modal) {
                closeBtn.addEventListener('click', () => {
                    modal.style.display = 'none';
                });
                console.log('Evento close do modal vinculado');
            }
            
            window.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
            
            console.log('Todos os eventos vinculados com sucesso!');
        } catch (error) {
            console.error('Erro ao vincular eventos:', error);
        }
    }

    toggleActivity(activityItem) {
        console.log('toggleActivity chamado para:', activityItem);
        
        const activity = activityItem.dataset.activity;
        const value = parseFloat(activityItem.dataset.value);
        
        // Determina qual filho a atividade pertence de forma mais robusta
        const kidCard = activityItem.closest('.kid-card');
        let kid = 'enzo'; // padrão
        
        if (kidCard) {
            const header = kidCard.querySelector('.kid-header');
            if (header) {
                if (header.classList.contains('enzo')) {
                    kid = 'enzo';
                } else if (header.classList.contains('matteo')) {
                    kid = 'matteo';
                }
            }
        }
        
        console.log('Atividade clicada:', activity, 'Valor:', value, 'Filho:', kid);
        
        // Verifica se a atividade já está selecionada
        const existingIndex = this.selectedActivities[kid].findIndex(a => a.activity === activity);
        
        if (existingIndex !== -1) {
            // Remove a atividade
            this.selectedActivities[kid].splice(existingIndex, 1);
            activityItem.classList.remove('selected');
            console.log('Atividade removida:', activity);
        } else {
            // Adiciona a atividade
            this.selectedActivities[kid].push({
                activity: activity,
                value: value,
                description: activityItem.querySelector('span').textContent
            });
            activityItem.classList.add('selected');
            console.log('Atividade adicionada:', activity);
        }
        
        console.log('Atividades selecionadas:', this.selectedActivities[kid]);
        this.updateDailySummary(kid);
    }

    updateDailySummary(kid) {
        console.log(`updateDailySummary chamado para ${kid}`);
        
        const dailyActivities = document.getElementById(`${kid}DailyActivities`);
        const dailyTotal = document.getElementById(`${kid}DailyTotal`);
        
        // Verifica se os elementos existem
        if (!dailyActivities || !dailyTotal) {
            console.error(`Elementos não encontrados para ${kid}`);
            return;
        }
        
        console.log(`Atualizando resumo para ${kid}:`, this.selectedActivities[kid]);
        
        const today = new Date().toISOString().split('T')[0];
        const monthKey = `${this.currentYear}-${this.currentMonth.toString().padStart(2, '0')}`;
        
        // Busca atividades já salvas hoje
        let savedActivities = [];
        if (this.data[monthKey] && this.data[monthKey][kid] && this.data[monthKey][kid].activities && this.data[monthKey][kid].activities[today]) {
            savedActivities = this.data[monthKey][kid].activities[today];
        }
        
        // Combina atividades salvas + novas seleções
        const allActivities = [...savedActivities, ...this.selectedActivities[kid]];
        
        console.log(`Atividades salvas para ${kid}:`, savedActivities);
        console.log(`Total de atividades para ${kid}:`, allActivities.length);
        
        if (allActivities.length === 0) {
            dailyActivities.innerHTML = '<p class="no-activities">Nenhuma atividade marcada hoje</p>';
            dailyTotal.textContent = 'R$ 0,00';
            return;
        }
        
        let total = 0;
        let activitiesHtml = '';
        
        // Mostra atividades já salvas (em cinza)
        savedActivities.forEach(item => {
            if (item && item.value !== undefined) {
                total += item.value;
                activitiesHtml += `
                    <div class="activity-count saved-activity">
                        <span>${item.description || 'Atividade'}</span>
                        <span>-R$ ${item.value.toFixed(2).replace('.', ',')} ✓</span>
                    </div>
                `;
            }
        });
        
        // Mostra novas seleções (em destaque)
        this.selectedActivities[kid].forEach(item => {
            if (item && item.value !== undefined) {
                total += item.value;
                activitiesHtml += `
                    <div class="activity-count new-activity">
                        <span>${item.description || 'Atividade'}</span>
                        <span>-R$ ${item.value.toFixed(2).replace('.', ',')} ✏️</span>
                    </div>
                `;
            }
        });
        
        dailyActivities.innerHTML = activitiesHtml;
        dailyTotal.textContent = `-R$ ${total.toFixed(2).replace('.', ',')}`;
        
        console.log(`Resumo atualizado para ${kid}. Total: R$ ${total.toFixed(2)}`);
    }

    saveDay() {
        console.log('saveDay chamado');
        
        const today = new Date().toISOString().split('T')[0];
        const monthKey = `${this.currentYear}-${this.currentMonth.toString().padStart(2, '0')}`;
        
        if (!this.data[monthKey]) {
            this.data[monthKey] = {
                enzo: { balance: 30, mesada: 30, activities: {} },
                matteo: { balance: 10, mesada: 10, activities: {} }
            };
        }
        
        // Inicializa arrays de atividades para o dia se não existirem
        if (!this.data[monthKey].enzo.activities[today]) {
            this.data[monthKey].enzo.activities[today] = [];
        }
        if (!this.data[monthKey].matteo.activities[today]) {
            this.data[monthKey].matteo.activities[today] = [];
        }
        
        // Adiciona as novas atividades às existentes (acumula)
        if (this.selectedActivities.enzo.length > 0) {
            this.data[monthKey].enzo.activities[today] = [
                ...this.data[monthKey].enzo.activities[today],
                ...this.selectedActivities.enzo
            ];
            const totalEnzo = this.selectedActivities.enzo.reduce((sum, item) => sum + item.value, 0);
            this.data[monthKey].enzo.balance -= totalEnzo;
        }
        
        if (this.selectedActivities.matteo.length > 0) {
            this.data[monthKey].matteo.activities[today] = [
                ...this.data[monthKey].matteo.activities[today],
                ...this.selectedActivities.matteo
            ];
            const totalMatteo = this.selectedActivities.matteo.reduce((sum, item) => sum + item.value, 0);
            this.data[monthKey].matteo.balance -= totalMatteo;
        }
        
        // Salva no localStorage
        this.saveData();
        
        // Atualiza os saldos
        this.updateBalances();
        
        // Mostra mensagem de sucesso
        this.showNotification('Atividades salvas com sucesso!', 'success');
        
        // Reseta as seleções do dia
        this.resetDay();
    }
    
    saveKidDay(kid) {
        console.log(`saveKidDay chamado para ${kid}`);
        
        const today = new Date().toISOString().split('T')[0];
        const monthKey = `${this.currentYear}-${this.currentMonth.toString().padStart(2, '0')}`;
        
        if (!this.data[monthKey]) {
            this.data[monthKey] = {
                enzo: { balance: 30, mesada: 30, activities: {} },
                matteo: { balance: 10, mesada: 10, activities: {} }
            };
        }
        
        // Inicializa array de atividades para o dia se não existir
        if (!this.data[monthKey][kid].activities[today]) {
            this.data[monthKey][kid].activities[today] = [];
        }
        
        // Adiciona as novas atividades às existentes (acumula)
        if (this.selectedActivities[kid].length > 0) {
            this.data[monthKey][kid].activities[today] = [
                ...this.data[monthKey][kid].activities[today],
                ...this.selectedActivities[kid]
            ];
            const total = this.selectedActivities[kid].reduce((sum, item) => {
                const value = parseFloat(item.value) || 0;
                return sum + value;
            }, 0);
            
            // Garante que o balance seja um número válido
            if (isNaN(this.data[monthKey][kid].balance)) {
                this.data[monthKey][kid].balance = this.data[monthKey][kid].mesada || (kid === 'enzo' ? 30 : 10);
            }
            
            this.data[monthKey][kid].balance -= total;
            console.log(`${kid} - Total descontado: R$ ${total.toFixed(2)}, Novo saldo: R$ ${this.data[monthKey][kid].balance.toFixed(2)}`);
        }
        
        // Salva no localStorage
        this.saveData();
        
        // Atualiza os saldos
        this.updateBalances();
        
        // Mostra mensagem de sucesso
        const kidName = kid === 'enzo' ? 'Enzo' : 'Matteo';
        this.showNotification(`Atividades de ${kidName} salvas com sucesso!`, 'success');
        
        // Reseta as seleções do dia para esta criança (sem notificação duplicada)
        this.resetKidDaySilent(kid);
    }

    resetDay() {
        console.log('resetDay chamado');
        
        // Remove todas as seleções
        document.querySelectorAll('.activity-item.selected').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Limpa as variáveis
        this.selectedActivities = {
            enzo: [],
            matteo: []
        };
        
        // Atualiza os resumos
        this.updateDailySummary('enzo');
        this.updateDailySummary('matteo');
    }
    
    resetKidDay(kid) {
        console.log(`resetKidDay chamado para ${kid}`);
        
        // Remove apenas as seleções da criança específica
        const kidCard = document.querySelector(`.kid-card .kid-header.${kid}`).closest('.kid-card');
        kidCard.querySelectorAll('.activity-item.selected').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Limpa as variáveis para esta criança
        this.selectedActivities[kid] = [];
        
        // Atualiza o resumo
        this.updateDailySummary(kid);
        
        const kidName = kid === 'enzo' ? 'Enzo' : 'Matteo';
        this.showNotification(`Seleções de ${kidName} resetadas!`, 'info');
    }
    
    resetKidDaySilent(kid) {
        console.log(`resetKidDaySilent chamado para ${kid}`);
        
        // Remove apenas as seleções da criança específica
        const kidCard = document.querySelector(`.kid-card .kid-header.${kid}`).closest('.kid-card');
        kidCard.querySelectorAll('.activity-item.selected').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Limpa as variáveis para esta criança
        this.selectedActivities[kid] = [];
        
        // Atualiza o resumo
        this.updateDailySummary(kid);
        
        // Sem notificação para evitar duplicação
    }
    
    clearDay() {
        console.log('clearDay chamado');
        
        const today = new Date().toISOString().split('T')[0];
        const monthKey = `${this.currentYear}-${this.currentMonth.toString().padStart(2, '0')}`;
        
        if (confirm('Deseja limpar TODAS as atividades de hoje? Esta ação não pode ser desfeita.')) {
            // Remove todas as atividades do dia
            if (this.data[monthKey]) {
                if (this.data[monthKey].enzo.activities[today]) {
                    // Restaura o saldo que foi descontado
                    const totalEnzo = this.data[monthKey].enzo.activities[today].reduce((sum, item) => {
                        const value = parseFloat(item.value) || 0;
                        return sum + value;
                    }, 0);
                    
                    if (isNaN(this.data[monthKey].enzo.balance)) {
                        this.data[monthKey].enzo.balance = this.data[monthKey].enzo.mesada || 30;
                    }
                    
                    this.data[monthKey].enzo.balance += totalEnzo;
                    delete this.data[monthKey].enzo.activities[today];
                }
                
                if (this.data[monthKey].matteo.activities[today]) {
                    // Restaura o saldo que foi descontado
                    const totalMatteo = this.data[monthKey].matteo.activities[today].reduce((sum, item) => {
                        const value = parseFloat(item.value) || 0;
                        return sum + value;
                    }, 0);
                    
                    if (isNaN(this.data[monthKey].matteo.balance)) {
                        this.data[monthKey].matteo.balance = this.data[monthKey].matteo.mesada || 10;
                    }
                    
                    this.data[monthKey].matteo.balance += totalMatteo;
                    delete this.data[monthKey].matteo.activities[today];
                }
            }
            
            // Salva as mudanças
            this.saveData();
            
            // Atualiza a interface
            this.updateBalances();
            this.resetDay();
            
            this.showNotification('Dia limpo com sucesso!', 'success');
        }
    }
    
    clearKidDay(kid) {
        console.log(`clearKidDay chamado para ${kid}`);
        
        const today = new Date().toISOString().split('T')[0];
        const monthKey = `${this.currentYear}-${this.currentMonth.toString().padStart(2, '0')}`;
        const kidName = kid === 'enzo' ? 'Enzo' : 'Matteo';
        
        if (confirm(`Deseja limpar TODAS as atividades de ${kidName} de hoje? Esta ação não pode ser desfeita.`)) {
            // Remove apenas as atividades do dia da criança específica
            if (this.data[monthKey] && this.data[monthKey][kid].activities[today]) {
                // Restaura o saldo que foi descontado
                const total = this.data[monthKey][kid].activities[today].reduce((sum, item) => {
                    const value = parseFloat(item.value) || 0;
                    return sum + value;
                }, 0);
                
                // Garante que o balance seja um número válido
                if (isNaN(this.data[monthKey][kid].balance)) {
                    this.data[monthKey][kid].balance = this.data[monthKey][kid].mesada || (kid === 'enzo' ? 30 : 10);
                }
                
                this.data[monthKey][kid].balance += total;
                console.log(`${kid} - Saldo restaurado: R$ ${total.toFixed(2)}, Novo saldo: R$ ${this.data[monthKey][kid].balance.toFixed(2)}`);
                delete this.data[monthKey][kid].activities[today];
            }
            
            // Salva as mudanças
            this.saveData();
            
            // Atualiza a interface
            this.updateBalances();
            this.resetKidDay(kid);
            
            // Limpa o histórico visual do dia para esta criança
            this.updateTodayHistory(kid, []);
            
            this.showNotification(`Dia de ${kidName} limpo com sucesso!`, 'success');
        }
    }

    startNewMonth() {
        console.log('startNewMonth chamado');
        
        const monthKey = `${this.currentYear}-${this.currentMonth.toString().padStart(2, '0')}`;
        
        if (confirm(`Deseja iniciar um novo mês para ${this.getMonthName(this.currentMonth)}?`)) {
            // Pega as mesadas atuais ou usa os valores padrão
            const enzoMesada = this.data[monthKey] ? this.data[monthKey].enzo.mesada : 30;
            const matteoMesada = this.data[monthKey] ? this.data[monthKey].matteo.mesada : 10;
            
            // Inicia o novo mês com as mesadas atuais
            this.data[monthKey] = {
                enzo: { 
                    balance: enzoMesada, 
                    mesada: enzoMesada, 
                    activities: {} 
                },
                matteo: { 
                    balance: matteoMesada, 
                    mesada: matteoMesada, 
                    activities: {} 
                }
            };
            
            // Limpa o histórico do dia atual
            this.resetDay();
            
            // Salva e atualiza
            this.saveData();
            this.updateBalances();
            this.updateMesadaDisplay('enzo', enzoMesada);
            this.updateMesadaDisplay('matteo', matteoMesada);
            
            // Limpa o histórico visual do dia
            this.loadTodayHistory();
            
            this.showNotification('Novo mês iniciado!', 'success');
        }
    }

    loadMonthData() {
        console.log('loadMonthData chamado');
        
        const monthKey = `${this.currentYear}-${this.currentMonth.toString().padStart(2, '0')}`;
        
        if (!this.data[monthKey]) {
            this.data[monthKey] = {
                enzo: { balance: 30, mesada: 30, activities: {} },
                matteo: { balance: 10, mesada: 10, activities: {} }
            };
        }
        
        // Atualiza os campos de mesada na interface
        this.updateMesadaDisplay('enzo', this.data[monthKey].enzo.mesada || 30);
        this.updateMesadaDisplay('matteo', this.data[monthKey].matteo.mesada || 10);
    }

    updateBalances() {
        console.log('updateBalances chamado');
        
        const monthKey = `${this.currentYear}-${this.currentMonth.toString().padStart(2, '0')}`;
        
        if (this.data[monthKey]) {
            const enzoBalance = document.getElementById('enzoBalance');
            const matteoBalance = document.getElementById('matteoBalance');
            
            // Verifica e corrige valores inválidos para Enzo
            if (this.data[monthKey].enzo && (isNaN(this.data[monthKey].enzo.balance) || this.data[monthKey].enzo.balance === undefined)) {
                console.warn('Valor inválido para Enzo, corrigindo...');
                this.data[monthKey].enzo.balance = this.data[monthKey].enzo.mesada || 30;
            }
            
            // Verifica e corrige valores inválidos para Matteo
            if (this.data[monthKey].matteo && (isNaN(this.data[monthKey].matteo.balance) || this.data[monthKey].matteo.balance === undefined)) {
                console.warn('Valor inválido para Matteo, corrigindo...');
                this.data[monthKey].matteo.balance = this.data[monthKey].matteo.mesada || 10;
            }
            
            if (enzoBalance && this.data[monthKey].enzo && this.data[monthKey].enzo.balance !== undefined) {
                const balance = parseFloat(this.data[monthKey].enzo.balance);
                if (!isNaN(balance)) {
                    enzoBalance.textContent = `R$ ${balance.toFixed(2).replace('.', ',')}`;
                }
            }
            
            if (matteoBalance && this.data[monthKey].matteo && this.data[monthKey].matteo.balance !== undefined) {
                const balance = parseFloat(this.data[monthKey].matteo.balance);
                if (!isNaN(balance)) {
                    matteoBalance.textContent = `R$ ${balance.toFixed(2).replace('.', ',')}`;
                }
            }
        }
    }

    showMonthReport() {
        console.log('showMonthReport chamado');
        
        const monthKey = `${this.currentYear}-${this.currentMonth.toString().padStart(2, '0')}`;
        const monthData = this.data[monthKey];
        
        if (!monthData) {
            this.showNotification('Nenhum dado encontrado para este mês.', 'warning');
            return;
        }
        
        const reportHtml = this.generateMonthReport(monthData);
        document.getElementById('monthReport').innerHTML = reportHtml;
        document.getElementById('reportModal').style.display = 'block';
    }
    
    showKidReport(kid) {
        console.log(`showKidReport chamado para ${kid}`);
        
        const monthKey = `${this.currentYear}-${this.currentMonth.toString().padStart(2, '0')}`;
        const monthData = this.data[monthKey];
        const kidName = kid === 'enzo' ? 'Enzo' : 'Matteo';
        
        if (!monthData || !monthData[kid]) {
            this.showNotification(`Nenhum dado encontrado para ${kidName} neste mês.`, 'warning');
            return;
        }
        
        const reportHtml = this.generateKidReport(monthData[kid], kidName);
        document.getElementById('monthReport').innerHTML = reportHtml;
        document.getElementById('reportModal').style.display = 'block';
    }

    generateMonthReport(monthData) {
        const monthName = this.getMonthName(this.currentMonth);
        let reportHtml = `
            <div class="report-section">
                <h3>📊 Resumo de ${monthName} ${this.currentYear}</h3>
                <p><strong>Enzo:</strong> Saldo final: R$ ${monthData.enzo.balance.toFixed(2).replace('.', ',')}</p>
                <p><strong>Matteo:</strong> Saldo final: R$ ${monthData.matteo.balance.toFixed(2).replace('.', ',')}</p>
            </div>
        `;
        
        // Estatísticas do Enzo
        const enzoStats = this.calculateStats(monthData.enzo.activities);
        reportHtml += `
            <div class="report-section">
                <h3>👦 Enzo - Atividades do Mês</h3>
                <p><strong>Total de atividades:</strong> ${enzoStats.totalCount}</p>
                <p><strong>Valor total descontado:</strong> R$ ${enzoStats.totalValue.toFixed(2).replace('.', ',')}</p>
                <p><strong>Média por dia:</strong> R$ ${(enzoStats.totalValue / 30).toFixed(2).replace('.', ',')}</p>
            </div>
        `;
        
        if (enzoStats.activities.length > 0) {
            reportHtml += '<div class="report-section"><h3>📝 Detalhamento das Atividades</h3>';
            enzoStats.activities.forEach(activity => {
                reportHtml += `
                    <div class="activity-count">
                        <span>${activity.description}</span>
                        <span>${activity.count}x (-R$ ${(activity.value * activity.count).toFixed(2).replace('.', ',')})</span>
                    </div>
                `;
            });
            reportHtml += '</div>';
        }
        
        // Estatísticas do Matteo
        const matteoStats = this.calculateStats(monthData.matteo.activities);
        reportHtml += `
            <div class="report-section">
                <h3>👶 Matteo - Atividades do Mês</h3>
                <p><strong>Total de atividades:</strong> ${matteoStats.totalCount}</p>
                <p><strong>Valor total descontado:</strong> R$ ${matteoStats.totalValue.toFixed(2).replace('.', ',')}</p>
                <p><strong>Média por dia:</strong> R$ ${(matteoStats.totalValue / 30).toFixed(2).replace('.', ',')}</p>
            </div>
        `;
        
        if (matteoStats.activities.length > 0) {
            reportHtml += '<div class="report-section"><h3>📝 Detalhamento das Atividades</h3>';
            matteoStats.activities.forEach(activity => {
                reportHtml += `
                    <div class="activity-count">
                        <span>${activity.description}</span>
                        <span>${activity.count}x (-R$ ${(activity.value * activity.count).toFixed(2).replace('.', ',')})</span>
                    </div>
                `;
            });
            reportHtml += '</div>';
        }
        
        return reportHtml;
    }
    
    generateKidReport(kidData, kidName) {
        const monthName = this.getMonthName(this.currentMonth);
        let reportHtml = `
            <div class="report-section">
                <h3>📊 Relatório de ${kidName} - ${monthName} ${this.currentYear}</h3>
                <p><strong>Saldo final:</strong> R$ ${kidData.balance.toFixed(2).replace('.', ',')}</p>
                <p><strong>Mesada inicial:</strong> R$ ${kidData.mesada.toFixed(2).replace('.', ',')}</p>
            </div>
        `;
        
        // Estatísticas da criança
        const stats = this.calculateStats(kidData.activities);
        reportHtml += `
            <div class="report-section">
                <h3>📈 Estatísticas do Mês</h3>
                <p><strong>Total de atividades:</strong> ${stats.totalCount}</p>
                <p><strong>Valor total descontado:</strong> R$ ${stats.totalValue.toFixed(2).replace('.', ',')}</p>
                <p><strong>Média por dia:</strong> R$ ${(stats.totalValue / 30).toFixed(2).replace('.', ',')}</p>
            </div>
        `;
        
        if (stats.activities.length > 0) {
            reportHtml += '<div class="report-section"><h3>📝 Detalhamento das Atividades</h3>';
            stats.activities.forEach(activity => {
                reportHtml += `
                    <div class="activity-count">
                        <span>${activity.description}</span>
                        <span>${activity.count}x (-R$ ${(activity.value * activity.count).toFixed(2).replace('.', ',')})</span>
                    </div>
                `;
            });
            reportHtml += '</div>';
        }
        
        return reportHtml;
    }

    calculateStats(activities) {
        const stats = {};
        let totalCount = 0;
        let totalValue = 0;
        
        Object.values(activities).forEach(dayActivities => {
            dayActivities.forEach(activity => {
                const key = `${activity.activity}-${activity.description}`;
                if (!stats[key]) {
                    stats[key] = {
                        description: activity.description,
                        value: activity.value,
                        count: 0
                    };
                }
                stats[key].count++;
                totalCount++;
                totalValue += activity.value;
            });
        });
        
        return {
            totalCount,
            totalValue,
            activities: Object.values(stats).sort((a, b) => b.count - a.count)
        };
    }

    getMonthName(month) {
        const months = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return months[month - 1];
    }

    showNotification(message, type = 'info') {
        console.log('showNotification chamado:', message, type);
        
        // Cria uma notificação temporária
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
        `;
        
        // Define as cores baseadas no tipo
        switch (type) {
            case 'success':
                notification.style.background = '#28a745';
                break;
            case 'warning':
                notification.style.background = '#ffc107';
                notification.style.color = '#212529';
                break;
            case 'error':
                notification.style.background = '#dc3545';
                break;
            default:
                notification.style.background = '#17a2b8';
        }
        
        document.body.appendChild(notification);
        
        // Remove a notificação após 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    loadData() {
        console.log('loadData chamado');
        
        try {
            const saved = localStorage.getItem('contadorMesada');
            const data = saved ? JSON.parse(saved) : {};
            console.log('Dados carregados do localStorage:', data);
            
            // Corrige dados corrompidos
            this.fixCorruptedData(data);
            
            return data;
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            return {};
        }
    }
    
    fixCorruptedData(data) {
        console.log('Verificando e corrigindo dados corrompidos...');
        
        Object.keys(data).forEach(monthKey => {
            if (data[monthKey]) {
                // Corrige dados do Enzo
                if (data[monthKey].enzo) {
                    if (isNaN(data[monthKey].enzo.balance) || data[monthKey].enzo.balance === undefined) {
                        console.warn(`Corrigindo balance do Enzo para ${monthKey}`);
                        data[monthKey].enzo.balance = data[monthKey].enzo.mesada || 30;
                    }
                    if (isNaN(data[monthKey].enzo.mesada) || data[monthKey].enzo.mesada === undefined) {
                        console.warn(`Corrigindo mesada do Enzo para ${monthKey}`);
                        data[monthKey].enzo.mesada = 30;
                        data[monthKey].enzo.balance = 30;
                    }
                }
                
                // Corrige dados do Matteo
                if (data[monthKey].matteo) {
                    if (isNaN(data[monthKey].matteo.balance) || data[monthKey].matteo.balance === undefined) {
                        console.warn(`Corrigindo balance do Matteo para ${monthKey}`);
                        data[monthKey].matteo.balance = data[monthKey].matteo.mesada || 10;
                    }
                    if (isNaN(data[monthKey].matteo.mesada) || data[monthKey].matteo.mesada === undefined) {
                        console.warn(`Corrigindo mesada do Matteo para ${monthKey}`);
                        data[monthKey].matteo.mesada = 10;
                        data[monthKey].matteo.balance = 10;
                    }
                }
            }
        });
        
        console.log('Verificação de dados concluída');
    }

    saveData() {
        console.log('saveData chamado');
        
        try {
            localStorage.setItem('contadorMesada', JSON.stringify(this.data));
            console.log('Dados salvos no localStorage');
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
        }
    }
    
    loadTodayHistory() {
        console.log('loadTodayHistory chamado');
        
        const today = new Date().toISOString().split('T')[0];
        const monthKey = `${this.currentYear}-${this.currentMonth.toString().padStart(2, '0')}`;
        
        if (this.data[monthKey]) {
            // Carrega histórico do Enzo
            if (this.data[monthKey].enzo.activities[today]) {
                this.updateTodayHistory('enzo', this.data[monthKey].enzo.activities[today]);
            }
            
            // Carrega histórico do Matteo
            if (this.data[monthKey].matteo.activities[today]) {
                this.updateTodayHistory('matteo', this.data[monthKey].matteo.activities[today]);
            }
        }
    }
    
    updateTodayHistory(kid, activities) {
        console.log(`updateTodayHistory chamado para ${kid}:`, activities);
        
        const historyContainer = document.getElementById(`${kid}DailyActivities`);
        const dailyTotal = document.getElementById(`${kid}DailyTotal`);
        
        if (activities.length === 0) {
            historyContainer.innerHTML = '<p class="no-activities">Nenhuma atividade marcada hoje</p>';
            dailyTotal.textContent = 'R$ 0,00';
            return;
        }
        
        let total = 0;
        let activitiesHtml = '';
        
        activities.forEach(item => {
            total += item.value;
            activitiesHtml += `
                <div class="activity-count">
                    <span>${item.description}</span>
                    <span>-R$ ${item.value.toFixed(2).replace('.', ',')}</span>
                </div>
            `;
        });
        
        historyContainer.innerHTML = activitiesHtml;
        dailyTotal.textContent = `-R$ ${total.toFixed(2).replace('.', ',')}`;
    }
    
    updateMesada(kid, newValue) {
        console.log(`updateMesada chamado para ${kid}:`, newValue);
        
        const monthKey = `${this.currentYear}-${this.currentMonth.toString().padStart(2, '0')}`;
        const newMesada = parseFloat(newValue);
        
        if (isNaN(newMesada) || newMesada < 0) {
            this.showNotification('Valor de mesada inválido!', 'error');
            return;
        }
        
        if (!this.data[monthKey]) {
            this.data[monthKey] = {
                enzo: { balance: 30, mesada: 30, activities: {} },
                matteo: { balance: 10, mesada: 10, activities: {} }
            };
        }
        
        // Atualiza a mesada
        this.data[monthKey][kid].mesada = newMesada;
        
        // Recalcula o saldo baseado na nova mesada
        const totalDescontado = this.calculateTotalDescontado(monthKey, kid);
        this.data[monthKey][kid].balance = newMesada - totalDescontado;
        
        // Salva e atualiza a interface
        this.saveData();
        this.updateBalances();
        this.updateMesadaDisplay(kid, newMesada);
        this.showNotification(`Mesada do ${kid === 'enzo' ? 'Enzo' : 'Matteo'} atualizada para R$ ${newMesada.toFixed(2).replace('.', ',')}`, 'success');
    }
    
    calculateTotalDescontado(monthKey, kid) {
        let total = 0;
        if (this.data[monthKey] && this.data[monthKey][kid].activities) {
            Object.values(this.data[monthKey][kid].activities).forEach(dayActivities => {
                dayActivities.forEach(activity => {
                    total += activity.value;
                });
            });
        }
        return total;
    }
    
    resetMonth(kid) {
        console.log(`resetMonth chamado para ${kid}`);
        
        const monthKey = `${this.currentYear}-${this.currentMonth.toString().padStart(2, '0')}`;
        const kidName = kid === 'enzo' ? 'Enzo' : 'Matteo';
        
        if (confirm(`Deseja resetar TODOS os dados de ${kidName} para ${this.getMonthName(this.currentMonth)}? Esta ação não pode ser desfeita.`)) {
            // Pega a mesada atual ou usa o valor padrão
            const currentMesada = this.data[monthKey] ? this.data[monthKey][kid].mesada : (kid === 'enzo' ? 30 : 10);
            
            // Reseta apenas o filho selecionado
            if (!this.data[monthKey]) {
                this.data[monthKey] = {
                    enzo: { balance: 30, mesada: 30, activities: {} },
                    matteo: { balance: 10, mesada: 10, activities: {} }
                };
            }
            
            // Reseta o filho específico
            this.data[monthKey][kid] = {
                balance: currentMesada,
                mesada: currentMesada,
                activities: {}
            };
            
            // Atualiza o campo de mesada na interface
            this.updateMesadaDisplay(kid, currentMesada);
            
            // Limpa as seleções do dia atual para este filho
            this.selectedActivities[kid] = [];
            this.updateDailySummary(kid);
            
            // Salva e atualiza
            this.saveData();
            this.updateBalances();
            
            // Limpa o histórico visual do dia para este filho
            this.updateTodayHistory(kid, []);
            
            this.showNotification(`Mês de ${kidName} resetado com sucesso!`, 'success');
        }
    }
    
    bindMesadaEvents(kid) {
        console.log(`bindMesadaEvents chamado para ${kid}`);
        
        const editBtn = document.getElementById(`${kid}EditBtn`);
        const saveBtn = document.getElementById(`${kid}SaveBtn`);
        const cancelBtn = document.getElementById(`${kid}CancelBtn`);
        const editMode = document.getElementById(`${kid}EditMode`);
        const controls = document.getElementById(`${kid}EditBtn`).parentElement;
        const input = document.getElementById(`${kid}Mesada`);
        
        if (editBtn && saveBtn && cancelBtn && editMode && controls && input) {
            editBtn.addEventListener('click', () => {
                controls.style.display = 'none';
                editMode.style.display = 'flex';
                input.focus();
                input.select();
            });
            
            saveBtn.addEventListener('click', () => {
                this.updateMesada(kid, input.value);
                this.exitEditMode(kid);
            });
            
            cancelBtn.addEventListener('click', () => {
                this.exitEditMode(kid);
            });
            
            // Salvar ao pressionar Enter
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.updateMesada(kid, input.value);
                    this.exitEditMode(kid);
                }
            });
            
            // Cancelar ao pressionar Escape
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.exitEditMode(kid);
                }
            });
            
            console.log(`Eventos de mesada vinculados para ${kid}`);
        } else {
            console.error(`Elementos de mesada não encontrados para ${kid}`);
        }
    }
    
    bindResetMonthEvents(kid) {
        console.log(`bindResetMonthEvents chamado para ${kid}`);
        
        const resetBtn = document.getElementById(`reset${kid.charAt(0).toUpperCase() + kid.slice(1)}MonthBtn`);
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetMonth(kid);
            });
            console.log(`Evento de reset mensal vinculado para ${kid}`);
        } else {
            console.error(`Botão de reset mensal não encontrado para ${kid}`);
        }
    }
    
    bindKidEvents(kid) {
        console.log(`bindKidEvents chamado para ${kid}`);
        
        // Botão Salvar Atividades
        const saveBtn = document.getElementById(`save${kid.charAt(0).toUpperCase() + kid.slice(1)}Btn`);
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveKidDay(kid));
            console.log(`Evento saveBtn vinculado para ${kid}`);
        }
        
        // Botão Resetar Seleções
        const resetBtn = document.getElementById(`reset${kid.charAt(0).toUpperCase() + kid.slice(1)}Btn`);
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetKidDay(kid));
            console.log(`Evento resetBtn vinculado para ${kid}`);
        }
        
        // Botão Limpar Dia
        const clearBtn = document.getElementById(`clear${kid.charAt(0).toUpperCase() + kid.slice(1)}Btn`);
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearKidDay(kid));
            console.log(`Evento clearBtn vinculado para ${kid}`);
        }
        
        // Botão Relatório
        const reportBtn = document.getElementById(`report${kid.charAt(0).toUpperCase() + kid.slice(1)}Btn`);
        if (reportBtn) {
            reportBtn.addEventListener('click', () => this.showKidReport(kid));
            console.log(`Evento reportBtn vinculado para ${kid}`);
        }
        
        console.log(`Todos os eventos individuais vinculados para ${kid}`);
    }
    
    exitEditMode(kid) {
        const editMode = document.getElementById(`${kid}EditMode`);
        const controls = document.getElementById(`${kid}EditBtn`).parentElement;
        const input = document.getElementById(`${kid}Mesada`);
        
        controls.style.display = 'flex';
        editMode.style.display = 'none';
        
        // Restaura o valor original se foi cancelado
        const monthKey = `${this.currentYear}-${this.currentMonth.toString().padStart(2, '0')}`;
        if (this.data[monthKey] && this.data[monthKey][kid]) {
            input.value = this.data[monthKey][kid].mesada;
        }
    }
    
    updateMesadaDisplay(kid, value) {
        console.log(`updateMesadaDisplay chamado para ${kid}:`, value);
        
        const display = document.getElementById(`${kid}MesadaDisplay`);
        const input = document.getElementById(`${kid}Mesada`);
        
        if (display) {
            display.textContent = `R$ ${value.toFixed(2).replace('.', ',')}`;
        }
        
        if (input) {
            input.value = value;
        }
    }
}

// Adiciona estilos CSS para as notificações
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Sistema de expansão/colapso para mobile
class MobileToggleSystem {
    constructor() {
        this.bindToggleEvents();
    }

    bindToggleEvents() {
        // Adiciona eventos de clique nos headers clicáveis
        document.querySelectorAll('.clickable-header').forEach(header => {
            header.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const kidData = e.currentTarget.getAttribute('data-kid');
                console.log(`🔍 Clique detectado no header: ${kidData}`);
                
                const kidCard = document.querySelector(`[data-kid="${kidData}"]`);
                console.log(`📋 Card encontrado:`, kidCard);
                console.log(`📊 Classes atuais:`, kidCard ? kidCard.className : 'N/A');
                console.log(`✅ Tem classe expanded?`, kidCard ? kidCard.classList.contains('expanded') : false);
                
                this.toggleKidCard(kidData);
            });
        });
    }

    toggleKidCard(kidName) {
        console.log(`🎯 INICIANDO toggle para: ${kidName}`);
        
        const kidCard = document.querySelector(`[data-kid="${kidName}"]`);
        if (!kidCard) {
            console.log(`❌ Card não encontrado para: ${kidName}`);
            return;
        }

        // Verifica o estado ATUAL antes de qualquer modificação
        const wasExpanded = kidCard.classList.contains('expanded');
        console.log(`🔄 Card ${kidName} estava expandido? ${wasExpanded}`);

        if (wasExpanded) {
            // Se estava expandido, só colapsa este card
            console.log(`🔽 Colapsando card ${kidName}`);
            kidCard.classList.remove('expanded');
            console.log(`✅ Card ${kidName} colapsado`);
        } else {
            // Se não estava expandido, colapsa todos e expande este
            console.log(`🔄 Colapsando todos os cards primeiro`);
            document.querySelectorAll('.kid-card').forEach(card => {
                card.classList.remove('expanded');
            });
            
            console.log(`🔼 Expandindo card ${kidName}`);
            kidCard.classList.add('expanded');
            console.log(`✅ Card ${kidName} expandido`);
            
            // Scroll suave para o card expandido
            setTimeout(() => {
                kidCard.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100);
        }
        
        console.log(`🏁 FINALIZADO toggle para: ${kidName}`);
    }

    expandCard(kidCard) {
        // Adiciona a classe expandida
        kidCard.classList.add('expanded');
        console.log('Card expandido:', kidCard.getAttribute('data-kid'));
        
        // Scroll suave para o card expandido
        setTimeout(() => {
            kidCard.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
    }

    collapseCard(kidCard) {
        kidCard.classList.remove('expanded');
        console.log('Card colapsado:', kidCard.getAttribute('data-kid'));
    }

    collapseAllCards() {
        document.querySelectorAll('.kid-card').forEach(card => {
            card.classList.remove('expanded');
        });
        console.log('Todos os cards colapsados');
    }
}

console.log('Criando instância da aplicação...');

// Inicializa a aplicação
try {
    const app = new ContadorMesada();
    const mobileToggle = new MobileToggleSystem();
    console.log('Aplicação criada com sucesso:', app);
    console.log('Sistema mobile inicializado:', mobileToggle);
} catch (error) {
    console.error('Erro ao criar aplicação:', error);
}
