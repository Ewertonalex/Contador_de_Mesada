// Configuração e inicialização do Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Configuração do Firebase (você precisará substituir pelos seus dados do Firebase Console)
const firebaseConfig = {
    // INSTRUÇÕES:
    // 1. Vá para https://console.firebase.google.com/
    // 2. Crie um novo projeto chamado "mesada-kids"
    // 3. Ative Authentication (Email/Password e Google)
    // 4. Ative Firestore Database
    // 5. Copie a configuração aqui
    
    apiKey: "AIzaSyAWxlKMbSjQo-6s7cAiUecPCsm6C89vmK4",
    authDomain: "mesadakids-534c2.firebaseapp.com",
    projectId: "mesadakids-534c2",
    storageBucket: "mesadakids-534c2.firebasestorage.app",
    messagingSenderId: "827704870033",
    appId: "1:827704870033:web:b0e453f6419a0018346b30",
    measurementId: "G-46SZ3EN88Q"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Sistema de sincronização de dados
class FirebaseSync {
    constructor() {
        this.currentUser = null;
        this.unsubscribe = null;
        this.localData = null;
        this.init();
    }

    init() {
        // Verifica se houve logout manual primeiro
        const manualLogout = localStorage.getItem('manualLogout');
        if (manualLogout === 'true') {
            console.log('🚫 Logout manual detectado - NÃO inicializando Firebase');
            localStorage.removeItem('manualLogout');
            return;
        }
        
        // Adiciona um delay pequeno para evitar race conditions
        setTimeout(() => {
            // Verifica se o usuário está logado
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    console.log('✅ Usuário autenticado:', user.email);
                    this.currentUser = user;
                    this.setupDataSync();
                    this.showLogoutButton();
                } else {
                    console.log('❌ Usuário não autenticado');
                    this.currentUser = null;
                    this.hideLogoutButton();
                    
                    // SÓ redireciona se não foi logout manual e não está na página de login
                    const isLoginPage = window.location.pathname.includes('login.html');
                    const wasManualLogout = sessionStorage.getItem('manualLogoutFlag');
                    
                    if (!isLoginPage && !wasManualLogout) {
                        console.log('🔄 Redirecionando para login...');
                        window.location.replace('login.html');
                    } else if (wasManualLogout) {
                        sessionStorage.removeItem('manualLogoutFlag');
                    }
                }
            });
        }, 500); // Delay de 500ms
    }

    setupDataSync() {
        if (!this.currentUser) return;

        // Referência do documento do usuário
        const userDocRef = doc(db, 'mesada-data', this.currentUser.uid);

        // Escuta mudanças em tempo real
        this.unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const cloudData = docSnapshot.data();
                console.log('📥 Dados recebidos da nuvem:', cloudData);
                
                // Atualiza dados locais
                this.updateLocalData(cloudData);
            } else {
                console.log('📝 Primeira vez do usuário, criando documento...');
                this.uploadLocalData();
            }
        });

        // Migra dados locais existentes para a nuvem (apenas na primeira vez)
        this.migrateLocalToCloud();
    }

    async uploadLocalData() {
        if (!this.currentUser) return;

        // Pega dados do localStorage
        const localData = this.getLocalStorageData();
        
        if (Object.keys(localData).length > 0) {
            console.log('📤 Enviando dados locais para a nuvem...');
            
            try {
                const userDocRef = doc(db, 'mesada-data', this.currentUser.uid);
                await setDoc(userDocRef, {
                    ...localData,
                    lastModified: serverTimestamp(),
                    userEmail: this.currentUser.email
                });
                console.log('✅ Dados sincronizados com sucesso!');
            } catch (error) {
                console.error('❌ Erro ao sincronizar dados:', error);
            }
        }
    }

    updateLocalData(cloudData) {
        // Atualiza localStorage com dados da nuvem
        Object.keys(cloudData).forEach(key => {
            if (key !== 'lastModified' && key !== 'userEmail') {
                localStorage.setItem(key, JSON.stringify(cloudData[key]));
            }
        });

        // Atualiza a interface se a aplicação já estiver carregada
        if (window.contadorMesada) {
            window.contadorMesada.loadData();
            window.contadorMesada.updateAllDisplays();
        }
    }

    getLocalStorageData() {
        const data = {};
        const keys = ['mesadaData', 'currentMonth', 'balances'];
        
        keys.forEach(key => {
            const value = localStorage.getItem(key);
            if (value) {
                try {
                    data[key] = JSON.parse(value);
                } catch (e) {
                    data[key] = value;
                }
            }
        });

        return data;
    }

    async saveToCloud(data) {
        if (!this.currentUser) return;

        try {
            const userDocRef = doc(db, 'mesada-data', this.currentUser.uid);
            await setDoc(userDocRef, {
                ...data,
                lastModified: serverTimestamp(),
                userEmail: this.currentUser.email
            }, { merge: true });
            
            console.log('💾 Dados salvos na nuvem');
        } catch (error) {
            console.error('❌ Erro ao salvar na nuvem:', error);
        }
    }

    async migrateLocalToCloud() {
        const hasCloudData = await this.checkCloudData();
        if (!hasCloudData) {
            await this.uploadLocalData();
        }
    }

    async checkCloudData() {
        if (!this.currentUser) return false;

        try {
            const userDocRef = doc(db, 'mesada-data', this.currentUser.uid);
            const docSnapshot = await getDoc(userDocRef);
            return docSnapshot.exists();
        } catch (error) {
            console.error('❌ Erro ao verificar dados na nuvem:', error);
            return false;
        }
    }

    showLogoutButton() {
        // Conecta evento ao botão de logout existente
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.style.display = 'flex'; // Mostra o botão
            logoutBtn.title = 'Fazer logout';
            
            // Adiciona evento de clique (remove o antigo primeiro)
            const newClickHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🖱️ Botão Sair clicado');
                this.confirmLogout();
            };
            
            // Remove listeners antigos
            logoutBtn.onclick = null;
            
            // Adiciona novo listener
            logoutBtn.addEventListener('click', newClickHandler);
            console.log('✅ Botão de logout conectado e visível');
        } else {
            console.error('❌ Botão de logout não encontrado no HTML');
        }
    }

    hideLogoutButton() {
        // Oculta o botão de logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.style.display = 'none';
            console.log('❌ Botão de logout ocultado');
        }
    }

    confirmLogout() {
        // Confirmação antes de fazer logout
        const confirmed = confirm('Tem certeza que deseja sair?');
        if (confirmed) {
            this.logout();
        }
    }

    async logout() {
        try {
            console.log('🔄 Fazendo logout do Firebase...');
            
            // Limpa a sincronização
            if (this.unsubscribe) {
                this.unsubscribe();
                this.unsubscribe = null;
            }
            
            // Limpa dados locais
            localStorage.removeItem('currentUser');
            this.currentUser = null;
            
            // Faz logout do Firebase
            await signOut(auth);
            
            console.log('✅ Logout do Firebase realizado com sucesso');
            
            // Força redirecionamento
            window.location.replace('login.html');
            
        } catch (error) {
            console.error('❌ Erro no logout do Firebase:', error);
            
            // Mesmo com erro, força o redirecionamento
            localStorage.removeItem('currentUser');
            window.location.replace('login.html');
        }
    }

    // Método para ser chamado quando dados locais são alterados
    onDataChange(data) {
        this.saveToCloud(data);
    }

    destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
}

// Exporta para uso global
window.FirebaseSync = FirebaseSync;

// Inicializa automaticamente quando o script é carregado
window.addEventListener('DOMContentLoaded', () => {
    // Verifica se o Firebase foi desabilitado
    if (window.firebaseDisabled) {
        console.log('🚫 Firebase desabilitado, não inicializando...');
        return;
    }
    
    // Só inicializa se não estiver desabilitado
    try {
        window.firebaseSync = new FirebaseSync();
    } catch (error) {
        console.error('❌ Erro ao inicializar Firebase:', error);
    }
    
    // Conecta o botão de logout como backup
    setTimeout(() => {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn && !logoutBtn.onclick) {
            console.log('🔄 Conectando botão logout como backup...');
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🖱️ Logout clicado (backup)');
                if (window.firebaseSync) {
                    window.firebaseSync.confirmLogout();
                } else {
                    // Fallback simples
                    if (confirm('Tem certeza que deseja sair?')) {
                        localStorage.clear();
                        window.location.replace('login.html');
                    }
                }
            });
            console.log('✅ Botão logout conectado como backup');
        }
    }, 1000);
});
