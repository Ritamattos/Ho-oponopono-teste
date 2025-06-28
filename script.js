// ===== HO'OPONOPONO APP - VERSÃO LIMPA SEM ADMIN =====

// Desabilitar console em produção
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    console.log = console.warn = console.error = console.info = console.debug = () => {};
    document.body.setAttribute('data-production', 'true');
}

// Sistema de persistência usando localStorage com fallback para memória
const StorageManager = {
    KEYS: {
        DIARY: 'hooponopono_diary',
        USER: 'hooponopono_user'
    },

    save(key, data) {
        try {
            const serialized = JSON.stringify(data);
            if (typeof Storage !== "undefined") {
                localStorage.setItem(key, serialized);
            } else {
                this.memoryStorage = this.memoryStorage || {};
                this.memoryStorage[key] = data;
            }
            return true;
        } catch (error) {
            this.memoryStorage = this.memoryStorage || {};
            this.memoryStorage[key] = data;
            return false;
        }
    },

    load(key, defaultValue = null) {
        try {
            if (typeof Storage !== "undefined") {
                const item = localStorage.getItem(key);
                if (item) {
                    return JSON.parse(item);
                }
            }
            
            if (this.memoryStorage && this.memoryStorage[key]) {
                return this.memoryStorage[key];
            }
        } catch (error) {
            // Fallback silencioso
        }
        
        return defaultValue;
    },

    remove(key) {
        try {
            if (typeof Storage !== "undefined") {
                localStorage.removeItem(key);
            }
            if (this.memoryStorage) {
                delete this.memoryStorage[key];
            }
        } catch (error) {
            // Silencioso
        }
    }
};

// Sistema de notificações toast
const ToastManager = {
    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    },

    success(message) {
        this.show(message, 'success');
    },

    error(message) {
        this.show(message, 'error');
    }
};

// ===== VARIÁVEIS GLOBAIS =====
let userName = '';
let currentPage = 1;
let totalPages = 1;
let diaryEntries = [];
let selectedImage = null;
let postId = 0;
let audioAtualTocando = null;

// Conteúdo dos módulos (fixo no código)
let modules = {};

// ===== ÁUDIOS INCLUÍDOS NO CÓDIGO =====
const audiosPadrao = [
    {
        id: 1,
        nome: "Oração Original",
        descricao: "Introdução suave às 4 frases sagradas",
        categoria: "meditacao",
        duracao: "6:38",
        arquivo: "Ho'oponopono - Oração Original.mp3"
    },
    {
        id: 2,
        nome: "Os Três Selves Havaianos",
        descricao: "Conectando com Unihipili, Uhane e Aumakua",
        categoria: "ensinamento",
        duracao: "15:45",
        arquivo: "audios/tres-selves.mp3"
    },
    {
        id: 3,
        nome: "Ho'oponopono para Dormir",
        descricao: "Limpeza noturna para sono reparador",
        categoria: "relaxamento",
        duracao: "20:00",
        arquivo: "audios/para-dormir.mp3"
    },
    {
        id: 4,
        nome: "Curando Relacionamentos",
        descricao: "Limpeza específica para vínculos amorosos",
        categoria: "relacionamentos",
        duracao: "12:15",
        arquivo: "audios/relacionamentos.mp3"
    },
    {
        id: 5,
        nome: "Abundância e Prosperidade",
        descricao: "Removendo bloqueios financeiros",
        categoria: "abundancia",
        duracao: "18:30",
        arquivo: "audios/abundancia.mp3"
    },
    {
        id: 6,
        nome: "Limpeza de Traumas",
        descricao: "Cura profunda com as ferramentas sagradas",
        categoria: "cura",
        duracao: "25:00",
        arquivo: "audios/traumas.mp3"
    },
    {
        id: 7,
        nome: "Ho'oponopono Matinal",
        descricao: "Começando o dia em Zero State",
        categoria: "meditacao",
        duracao: "8:45",
        arquivo: "audios/matinal.mp3"
    },
    {
        id: 8,
        nome: "Perdão Radical",
        descricao: "Liberando mágoas profundas",
        categoria: "cura",
        duracao: "16:20",
        arquivo: "audios/perdao.mp3"
    }
];

// ===== FUNÇÃO PRINCIPAL =====
function entrarApp() {
    console.log('🚀 Função entrarApp chamada');
    
    try {
        const nomeInput = document.getElementById('name');
        const splash = document.getElementById('splash');
        const main = document.getElementById('main');
        const welcome = document.getElementById('welcome');
        
        // Verificar se os elementos existem
        if (!nomeInput || !splash || !main) {
            console.error('❌ Elementos não encontrados');
            alert('Erro: Elementos da página não encontrados!');
            return;
        }
        
        const nome = nomeInput.value.trim();
        if (!nome) {
            alert('Por favor, digite seu nome antes de continuar! 📝');
            nomeInput.focus();
            return;
        }
        
        console.log('✅ Nome válido, iniciando app...');
        
        // Definir userName
        userName = nome;
        
        // Salvar usuário
        StorageManager.save(StorageManager.KEYS.USER, { nome, lastLogin: new Date().toISOString() });
        
        // Atualizar welcome
        if (welcome) {
            welcome.textContent = `Bem-vindo, ${nome}`;
        }
        
        // Esconder splash e mostrar main
        splash.style.display = 'none';
        main.style.display = 'block';
        
        // Carregar dados na interface
        try {
            if (typeof carregarModulosNaInterface === 'function') {
                carregarModulosNaInterface();
            }
            if (typeof carregarAudiosNaInterface === 'function') {
                carregarAudiosNaInterface();
            }
            if (typeof atualizarDiario === 'function') {
                atualizarDiario();
            }
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
        }
        
        console.log('✅ App iniciado com sucesso!');
        
        // Mostrar toast de sucesso
        if (typeof ToastManager !== 'undefined') {
            ToastManager.success(`Bem-vindo, ${nome}! 🌺`);
        }
        
    } catch (error) {
        console.error('❌ Erro na função entrarApp:', error);
        alert('Erro ao iniciar o app: ' + error.message);
    }
}

// ===== INICIALIZAÇÃO DOS MÓDULOS =====
async function inicializarDadosPadrao() {
    const modulosPadrao = {
        1: {
            title: "Módulo 1: Descobrindo o Ho'oponopono",
            description: "Introdução à prática havaiana - 20 páginas",
            pages: [
                {
                    title: "🌺 Aloha! Bem-vindo",
                    content: `<p style="line-height: 1.8; font-size: 1.1em;">Você está prestes a descobrir uma antiga prática havaiana que tem o poder de transformar sua vida através do perdão, gratidão e amor.</p><div style="text-align: center; margin-top: 40px;"><p style="font-size: 1.3em; color: #10b981;">"A paz começa comigo"</p></div>`
                },
                {
                    title: "As 4 Frases Sagradas",
                    content: `<div style="background: rgba(139, 92, 246, 0.2); padding: 30px; border-radius: 15px; text-align: center;"><p style="font-size: 1.5em; margin: 15px 0; color: #10b981;">Sinto muito</p><p style="font-size: 1.5em; margin: 15px 0; color: #10b981;">Me perdoe</p><p style="font-size: 1.5em; margin: 15px 0; color: #10b981;">Te amo</p><p style="font-size: 1.5em; margin: 15px 0; color: #10b981;">Sou grato</p></div>`
                },
                {
                    title: "Como Praticar",
                    content: `<p style="line-height: 1.8; font-size: 1.1em;">Simplesmente repita as quatro frases sempre que surgir um problema, conflito ou memória dolorosa.</p><p style="line-height: 1.8; font-size: 1.1em; margin-top: 20px;">Não precisa entender, apenas confie no processo.</p>`
                }
                // ... (incluir todas as páginas que você já tem)
            ]
        },
        2: {
            title: "Módulo 2: A Ciência da Responsabilidade",
            description: "100% de responsabilidade - 30 páginas",
            pages: [
                {
                    title: "🌟 Bem-vindo ao Módulo 2",
                    content: `<h3 style="color: #a78bfa; margin-bottom: 15px;">🚀 Aprofundando Sua Jornada</h3><p style="line-height: 1.8; font-size: 1.1em;">Agora que você conhece as 4 frases sagradas, vamos mergulhar mais profundo na filosofia do Ho'oponopono.</p>`
                }
                // ... (continuar com as páginas)
            ]
        }
        // ... (incluir todos os módulos que você já criou)
    };

    modules = modulosPadrao;
    diaryEntries = StorageManager.load(StorageManager.KEYS.DIARY, []);
}

// ===== RENDERIZAR BIBLIOTECA DE ÁUDIOS =====
function renderizarBibliotecaAudios() {
    const audioContent = document.getElementById('audioContent');
    if (!audioContent) return;

    // Criar estatísticas
    const categorias = [...new Set(audiosPadrao.map(audio => audio.categoria))];
    const totalDuracao = audiosPadrao.reduce((total, audio) => {
        const [min, seg] = audio.duracao.split(':').map(Number);
        return total + min + (seg / 60);
    }, 0);

    audioContent.innerHTML = `
        <h2 style="margin-bottom: 20px; color: #e9d5ff; font-size: clamp(1.5em, 5vw, 2em);">🎵 Biblioteca de Áudios</h2>
        
        <!-- Estatísticas -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;">
            <div style="background: rgba(139, 92, 246, 0.2); padding: 20px; border-radius: 15px; text-align: center;">
                <div style="font-size: 2em; margin-bottom: 10px;">🎧</div>
                <div style="font-size: 1.5em; color: #8b5cf6; font-weight: bold;">${audiosPadrao.length}</div>
                <div style="color: #c4b5fd;">Áudios Disponíveis</div>
            </div>
            <div style="background: rgba(16, 185, 129, 0.2); padding: 20px; border-radius: 15px; text-align: center;">
                <div style="font-size: 2em; margin-bottom: 10px;">⏱️</div>
                <div style="font-size: 1.5em; color: #10b981; font-weight: bold;">${Math.round(totalDuracao)}min</div>
                <div style="color: #6ee7b7;">Tempo Total</div>
            </div>
            <div style="background: rgba(245, 158, 11, 0.2); padding: 20px; border-radius: 15px; text-align: center;">
                <div style="font-size: 2em; margin-bottom: 10px;">📁</div>
                <div style="font-size: 1.5em; color: #f59e0b; font-weight: bold;">${categorias.length}</div>
                <div style="color: #fbbf24;">Categorias</div>
            </div>
        </div>

        <!-- Filtros -->
        <div style="margin-bottom: 25px;">
            <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
                <span style="color: #c4b5fd; margin-right: 10px;">Filtrar por:</span>
                <button onclick="filtrarAudios('todos')" class="filtro-btn active" data-categoria="todos">
                    🎵 Todos
                </button>
                <button onclick="filtrarAudios('meditacao')" class="filtro-btn" data-categoria="meditacao">
                    🧘 Meditação
                </button>
                <button onclick="filtrarAudios('cura')" class="filtro-btn" data-categoria="cura">
                    💚 Cura
                </button>
                <button onclick="filtrarAudios('relacionamentos')" class="filtro-btn" data-categoria="relacionamentos">
                    💕 Relacionamentos
                </button>
                <button onclick="filtrarAudios('abundancia')" class="filtro-btn" data-categoria="abundancia">
                    💰 Abundância
                </button>
                <button onclick="filtrarAudios('relaxamento')" class="filtro-btn" data-categoria="relaxamento">
                    😴 Relaxamento
                </button>
                <button onclick="filtrarAudios('ensinamento')" class="filtro-btn" data-categoria="ensinamento">
                    📚 Ensinamento
                </button>
            </div>
        </div>

        <!-- Lista de Áudios -->
        <div class="modules-grid" id="audioGrid">
            ${audiosPadrao.map(audio => criarCardAudio(audio)).join('')}
        </div>
    `;

    // Adicionar estilos dos filtros
    const style = document.createElement('style');
    style.textContent = `
        .filtro-btn {
            background: rgba(139, 92, 246, 0.2);
            color: #c4b5fd;
            border: 1px solid rgba(139, 92, 246, 0.3);
            padding: 8px 15px;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.9em;
        }
        .filtro-btn:hover {
            background: rgba(139, 92, 246, 0.4);
            color: #e9d5ff;
        }
        .filtro-btn.active {
            background: #8b5cf6;
            color: white;
            border-color: #8b5cf6;
        }
    `;
    document.head.appendChild(style);
}

function criarCardAudio(audio) {
    const categoriaEmoji = {
        'meditacao': '🧘',
        'cura': '💚',
        'relacionamentos': '💕',
        'abundancia': '💰',
        'relaxamento': '😴',
        'ensinamento': '📚'
    };

    return `
        <div class="audio-card" data-categoria="${audio.categoria}" style="background: rgba(30, 0, 60, 0.3); backdrop-filter: blur(10px); border-radius: 20px; padding: 20px; border: 1px solid rgba(139, 92, 246, 0.3); position: relative;">
            <div class="audio-play-btn" style="width: 60px; height: 60px; background: linear-gradient(135deg, #8b5cf6, #10b981); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 15px; cursor: pointer; transition: all 0.3s ease;" 
                 onclick="reproduzirAudioPadrao(${audio.id})" id="play-btn-${audio.id}">▶</div>
            
            <div style="position: absolute; top: 15px; right: 15px; background: rgba(139, 92, 246, 0.8); color: white; padding: 4px 8px; border-radius: 10px; font-size: 0.8em;">
                ${categoriaEmoji[audio.categoria]} ${audio.categoria.charAt(0).toUpperCase() + audio.categoria.slice(1)}
            </div>
            
            <h3 style="color: #e9d5ff; margin-bottom: 10px; font-size: 1.2em; padding-right: 80px;">${audio.nome}</h3>
            <p style="color: #c4b5fd; font-size: 0.95em; margin-bottom: 10px;">${audio.descricao}</p>
            <p style="color: #86efac; font-size: 0.85em;">⏱️ ${audio.duracao}</p>
            
            <div style="margin-top: 15px; display: none;" id="controls-${audio.id}">
                <div style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 10px;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                        <button style="background: #8b5cf6; color: white; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 14px;" onclick="pausarAudioPadrao(${audio.id})">⏸</button>
                        <button style="background: #10b981; color: white; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 14px;" onclick="pararAudioPadrao(${audio.id})">⏹</button>
                        <span style="color: #c4b5fd; font-size: 0.9em;" id="time-${audio.id}">00:00 / ${audio.duracao}</span>
                    </div>
                    <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; cursor: pointer;">
                        <div style="height: 100%; background: linear-gradient(135deg, #8b5cf6, #10b981); border-radius: 2px; width: 0%; transition: width 0.1s;" id="progress-${audio.id}"></div>
                    </div>
                </div>
            </div>

            <div style="margin-top: 15px; display: flex; gap: 10px;">
                <button onclick="baixarAudio('${audio.arquivo}', '${audio.nome}')" style="background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); padding: 6px 12px; border-radius: 15px; cursor: pointer; font-size: 0.8em; flex: 1;">
                    📥 Download
                </button>
                <button onclick="compartilharAudio('${audio.nome}', '${audio.descricao}')" style="background: rgba(245, 158, 11, 0.2); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); padding: 6px 12px; border-radius: 15px; cursor: pointer; font-size: 0.8em; flex: 1;">
                    📤 Compartilhar
                </button>
            </div>
        </div>
    `;
}

// ===== FUNÇÕES DE REPRODUÇÃO DE ÁUDIO =====
function reproduzirAudioPadrao(audioId) {
    // Parar qualquer áudio tocando
    if (audioAtualTocando) {
        audioAtualTocando.pause();
        resetarInterfaceAudio(audioAtualTocando.dataset.audioId);
    }

    const audio = audiosPadrao.find(a => a.id === audioId);
    if (!audio) {
        ToastManager.error('Áudio não encontrado!');
        return;
    }

    try {
        const audioElement = new Audio(audio.arquivo);
        audioElement.dataset.audioId = audioId;
        audioAtualTocando = audioElement;

        const playBtn = document.getElementById(`play-btn-${audioId}`);
        const controls = document.getElementById(`controls-${audioId}`);

        playBtn.innerHTML = '⌛';
        playBtn.style.background = 'linear-gradient(135deg, #f59e0b, #8b5cf6)';

        audioElement.addEventListener('canplay', () => {
            controls.style.display = 'block';
            playBtn.innerHTML = '⏸';
            playBtn.style.background = 'linear-gradient(135deg, #ef4444, #f59e0b)';
        });

        audioElement.addEventListener('ended', () => {
            resetarInterfaceAudio(audioId);
            audioAtualTocando = null;
        });

        audioElement.addEventListener('timeupdate', () => {
            const progress = document.getElementById(`progress-${audioId}`);
            const timeDisplay = document.getElementById(`time-${audioId}`);
            
            if (progress && timeDisplay && audioElement.duration) {
                const percentage = (audioElement.currentTime / audioElement.duration) * 100;
                progress.style.width = `${percentage}%`;
                
                const currentMin = Math.floor(audioElement.currentTime / 60);
                const currentSec = Math.floor(audioElement.currentTime % 60);
                const currentTime = `${currentMin.toString().padStart(2, '0')}:${currentSec.toString().padStart(2, '0')}`;
                
                timeDisplay.textContent = `${currentTime} / ${audio.duracao}`;
            }
        });

        audioElement.play().catch(error => {
            ToastManager.error('Erro ao reproduzir áudio. Verifique se o arquivo existe.');
            resetarInterfaceAudio(audioId);
            audioAtualTocando = null;
        });

    } catch (error) {
        ToastManager.error('Erro ao carregar áudio.');
        resetarInterfaceAudio(audioId);
    }
}

function pausarAudioPadrao(audioId) {
    if (audioAtualTocando && audioAtualTocando.dataset.audioId == audioId) {
        if (audioAtualTocando.paused) {
            audioAtualTocando.play();
            document.getElementById(`play-btn-${audioId}`).innerHTML = '⏸';
        } else {
            audioAtualTocando.pause();
            document.getElementById(`play-btn-${audioId}`).innerHTML = '▶';
        }
    }
}

function pararAudioPadrao(audioId) {
    if (audioAtualTocando && audioAtualTocando.dataset.audioId == audioId) {
        audioAtualTocando.pause();
        audioAtualTocando.currentTime = 0;
        resetarInterfaceAudio(audioId);
        audioAtualTocando = null;
    }
}

function resetarInterfaceAudio(audioId) {
    const playBtn = document.getElementById(`play-btn-${audioId}`);
    const controls = document.getElementById(`controls-${audioId}`);
    const progress = document.getElementById(`progress-${audioId}`);
    
    if (playBtn) {
        playBtn.innerHTML = '▶';
        playBtn.style.background = 'linear-gradient(135deg, #8b5cf6, #10b981)';
    }
    if (controls) controls.style.display = 'none';
    if (progress) progress.style.width = '0%';
}

// ===== FILTROS DE ÁUDIO =====
function filtrarAudios(categoria) {
    // Atualizar botões ativos
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-categoria="${categoria}"]`).classList.add('active');

    // Filtrar cards
    const cards = document.querySelectorAll('.audio-card');
    cards.forEach(card => {
        if (categoria === 'todos' || card.dataset.categoria === categoria) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// ===== FUNÇÕES UTILITÁRIAS DE ÁUDIO =====
function baixarAudio(arquivo, nome) {
    const link = document.createElement('a');
    link.href = arquivo;
    link.download = `${nome}.mp3`;
    link.click();
    ToastManager.success('Download iniciado! 📥');
}

function compartilharAudio(nome, descricao) {
    if (navigator.share) {
        navigator.share({
            title: nome,
            text: `${descricao} - Ho'oponopono App`,
            url: window.location.href
        });
    } else {
        const texto = `${nome} - ${descricao}\n\nDescubra Ho'oponopono em: ${window.location.href}`;
        navigator.clipboard.writeText(texto).then(() => {
            ToastManager.success('Link copiado para compartilhar! 📋');
        }).catch(() => {
            ToastManager.error('Erro ao copiar link');
        });
    }
}

// ===== CARREGAR MÓDULOS NA INTERFACE =====
function carregarModulosNaInterface() {
    const container = document.getElementById('modulesContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    Object.entries(modules).forEach(([id, module]) => {
        const card = document.createElement('div');
        card.className = 'module-card';
        card.onclick = () => abrirModulo(parseInt(id));
        
        card.innerHTML = `
            <div class="module-number">${id}</div>
            <h3 style="color: #e9d5ff; margin-bottom: 10px; font-size: clamp(1.1em, 4vw, 1.3em);">${module.title}</h3>
            <p style="color: #c4b5fd; font-size: clamp(0.9em, 3vw, 1em);">${module.description}</p>
            <p style="color: #86efac; margin-top: 10px; font-size: clamp(0.8em, 2.5vw, 0.9em);">✨ ${module.pages.length} página${module.pages.length !== 1 ? 's' : ''}</p>
        `;
        
        container.appendChild(card);
    });
}

// ===== CARREGAR ÁUDIOS NA INTERFACE (COMPATIBILIDADE) =====
function carregarAudiosNaInterface() {
    // Função mantida por compatibilidade, mas agora carrega a biblioteca de áudios
    if (document.getElementById('audioContent')) {
        renderizarBibliotecaAudios();
    }
}

// ===== NAVEGAÇÃO =====
function irPara(secao) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
    
    event.target.closest('.nav-item').classList.add('active');
    
    let contentElement;
    if (secao === 'audio') {
        contentElement = document.getElementById('audioContent');
        if (contentElement) {
            renderizarBibliotecaAudios();
        }
    } else {
        contentElement = document.getElementById(secao + 'Content');
    }
    
    if (contentElement) {
        contentElement.classList.add('active');
    }
}

// ===== MÓDULOS E LEITOR =====
function abrirModulo(num) {
    const module = modules[num];
    if (!module) {
        ToastManager.error('Módulo em desenvolvimento! 🚧');
        return;
    }
    
    currentPage = 1;
    totalPages = module.pages.length;
    
    document.getElementById('bookTitle').textContent = module.title;
    
    const container = document.getElementById('flipbook');
    container.innerHTML = '';
    
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        module.pages.forEach((page, index) => {
            const spreadDiv = document.createElement('div');
            spreadDiv.className = `page-spread ${index === 0 ? 'current' : 'hidden'}`;
            spreadDiv.id = `spread${index + 1}`;
            
            spreadDiv.innerHTML = `
                <div class="page-left">
                    <div class="page-content" style="padding: 20px; padding-bottom: 80px; max-height: calc(100vh - 140px); overflow-y: auto;">
                        <h2 style="margin-bottom: 20px; color: #8b5cf6;">${page.title}</h2>
                        <div style="line-height: 1.6;">${page.content}</div>
                        <div class="page-number" style="position: absolute; bottom: 100px; right: 20px; color: #666;">${index + 1}</div>
                    </div>
                </div>
            `;
            
            container.appendChild(spreadDiv);
        });
        totalPages = module.pages.length;
    } else {
        totalPages = Math.ceil(module.pages.length / 2);
        
        for (let i = 0; i < module.pages.length; i += 2) {
            const spreadDiv = document.createElement('div');
            spreadDiv.className = `page-spread ${i === 0 ? 'current' : 'hidden'}`;
            spreadDiv.id = `spread${Math.floor(i / 2) + 1}`;
            
            const leftPage = module.pages[i];
            const rightPage = module.pages[i + 1];
            
            let leftContent = '';
            let rightContent = '';
            
            if (leftPage) {
                leftContent = `
                    <div class="page-left">
                        <div class="page-content" style="padding: 20px; padding-bottom: 60px;">
                            <h2 style="margin-bottom: 20px; color: #8b5cf6;">${leftPage.title}</h2>
                            <div style="line-height: 1.6;">${leftPage.content}</div>
                            <div class="page-number" style="position: absolute; bottom: 80px; left: 20px; color: #666;">${i + 1}</div>
                        </div>
                    </div>
                `;
            }
            
            if (rightPage) {
                rightContent = `
                    <div class="page-right">
                        <div class="page-content" style="padding: 20px; padding-bottom: 60px;">
                            <h2 style="margin-bottom: 20px; color: #8b5cf6;">${rightPage.title}</h2>
                            <div style="line-height: 1.6;">${rightPage.content}</div>
                            <div class="page-number" style="position: absolute; bottom: 80px; right: 20px; color: #666;">${i + 2}</div>
                        </div>
                    </div>
                `;
            } else {
                rightContent = `
                    <div class="page-right">
                        <div class="page-content" style="padding: 20px;">
                            <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666;">
                                <p style="text-align: center; font-style: italic;">Fim do módulo</p>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            spreadDiv.innerHTML = leftContent + rightContent;
            container.appendChild(spreadDiv);
        }
    }
    
    document.getElementById('book').style.display = 'block';
    atualizarPagina();
    
    setTimeout(() => {
        initNavigationAutoHide();
    }, 500);
}

function paginaAnterior() {
    if (currentPage > 1) {
        tocarSomPagina();
        
        const paginaAtual = document.getElementById(`spread${currentPage}`);
        if (paginaAtual) {
            paginaAtual.className = 'page-spread hidden';
        }
        
        currentPage--;
        
        const paginaAnterior = document.getElementById(`spread${currentPage}`);
        if (paginaAnterior) {
            paginaAnterior.className = 'page-spread current';
        }
        
        atualizarPagina();
    }
}

function proximaPagina() {
    if (currentPage < totalPages) {
        tocarSomPagina();
        
        const paginaAtual = document.getElementById(`spread${currentPage}`);
        if (paginaAtual) {
            paginaAtual.className = 'page-spread hidden';
        }
        
        currentPage++;
        
        const proximaPagina = document.getElementById(`spread${currentPage}`);
        if (proximaPagina) {
            proximaPagina.className = 'page-spread current';
        }
        
        atualizarPagina();
    }
}

function fecharLivro() {
    document.getElementById('book').style.display = 'none';
}

function atualizarPagina() {
    document.getElementById('pageInfo').textContent = `Página ${currentPage} de ${totalPages}`;
    
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
        prevBtn.style.opacity = currentPage === 1 ? '0.3' : '1';
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.style.opacity = currentPage === totalPages ? '0.3' : '1';
    }
}

// ===== SISTEMA DE AUTO-HIDE PARA NAVEGAÇÃO =====
let navigationTimeout;
let isNavigationVisible = true;

function showNavigation() {
    const nav = document.querySelector('.book-navigation');
    if (nav) {
        nav.style.opacity = '1';
        nav.style.transform = 'translateX(-50%) translateY(0)';
        isNavigationVisible = true;
    }
}

function hideNavigation() {
    const nav = document.querySelector('.book-navigation');
    if (nav) {
        nav.style.opacity = '0.3';
        nav.style.transform = 'translateX(-50%) translateY(20px)';
        isNavigationVisible = false;
    }
}

function resetNavigationTimer() {
    clearTimeout(navigationTimeout);
    showNavigation();
    
    navigationTimeout = setTimeout(() => {
        hideNavigation();
    }, 3000);
}

function initNavigationAutoHide() {
    const bookContainer = document.getElementById('flipbook');
    if (bookContainer) {
        bookContainer.addEventListener('touchstart', resetNavigationTimer);
        bookContainer.addEventListener('touchmove', resetNavigationTimer);
        bookContainer.addEventListener('mousemove', resetNavigationTimer);
        bookContainer.addEventListener('scroll', resetNavigationTimer);
        
        resetNavigationTimer();
    }
}

// ===== EFEITOS SONOROS =====
function criarSomPagina() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.3, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
        const t = i / audioContext.sampleRate;
        const freq1 = 800 + Math.sin(t * 20) * 200;
        const freq2 = 1200 + Math.sin(t * 15) * 150;
        
        let sample = Math.sin(2 * Math.PI * freq1 * t) * 0.3;
        sample += Math.sin(2 * Math.PI * freq2 * t) * 0.2;
        
        const envelope = Math.exp(-t * 8) * (1 - Math.exp(-t * 30));
        const noise = (Math.random() - 0.5) * 0.1;
        
        data[i] = (sample + noise) * envelope * 0.4;
    }
    
    return buffer;
}

function tocarSomPagina() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const buffer = criarSomPagina();
        const source = audioContext.createBufferSource();
        const gainNode = audioContext.createGain();
        
        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        gainNode.gain.value = 0.3;
        source.start(0);
    } catch (error) {
        // Modo silencioso se não conseguir tocar
    }
}

// ===== DIÁRIO =====
function salvarDiario() {
    const texto = document.getElementById('diaryText').value.trim();
    if (!texto) {
        ToastManager.error('Por favor, escreva algo antes de salvar! 📝');
        return;
    }
    
    diaryEntries.unshift({
        date: new Date().toLocaleString('pt-BR'),
        text: texto
    });
    
    StorageManager.save(StorageManager.KEYS.DIARY, diaryEntries);
    
    document.getElementById('diaryText').value = '';
    atualizarDiario();
    ToastManager.success('Entrada salva com sucesso! 🌺');
}

function atualizarDiario() {
    const container = document.getElementById('entradas');
    if (!container) return;
    
    if (diaryEntries.length === 0) {
        container.innerHTML = '<p style="color: #c4b5fd; text-align: center; font-size: clamp(1em, 3vw, 1.1em);">Suas entradas aparecerão aqui</p>';
    } else {
        container.innerHTML = diaryEntries.map(entry => `
            <div style="margin-bottom: 15px; padding: clamp(12px, 3vw, 15px); background: rgba(0, 0, 0, 0.2); border-radius: 10px;">
                <div style="color: #a78bfa; font-size: clamp(0.8em, 2.5vw, 0.9em); margin-bottom: 5px;">${entry.date}</div>
                <p style="line-height: 1.6; font-size: clamp(1em, 3vw, 1.1em);">${entry.text}</p>
            </div>
        `).join('');
    }
}

// ===== COMUNIDADE =====
function publicarPost() {
    const texto = document.getElementById('postText').value.trim();
    if (!texto && !selectedImage) {
        ToastManager.error('Por favor, escreva algo ou adicione uma imagem antes de publicar! 💬');
        return;
    }
    
    postId++;
    const container = document.getElementById('posts');
    
    let imagemHtml = '';
    if (selectedImage) {
        imagemHtml = `<div style="margin: 15px 0;"><img src="${selectedImage}" style="max-width: 100%; max-height: 400px; border-radius: 10px; border: 1px solid rgba(139, 92, 246, 0.3);"></div>`;
    }
    
    const postHtml = `
        <div style="background: rgba(30, 0, 60, 0.3); backdrop-filter: blur(10px); border-radius: 20px; padding: clamp(15px, 4vw, 20px); border: 1px solid rgba(139, 92, 246, 0.3); margin-bottom: 15px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                <div style="width: clamp(35px, 8vw, 40px); height: clamp(35px, 8vw, 40px); background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: clamp(1em, 4vw, 1.2em);">${userName.charAt(0).toUpperCase()}</div>
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: bold; font-size: clamp(1em, 3.5vw, 1.1em);">${userName}</div>
                    <div style="color: #c4b5fd; font-size: clamp(0.8em, 2.5vw, 0.9em);">agora mesmo</div>
                </div>
                <button style="background: #ef4444; color: white; border: none; padding: clamp(4px, 1vw, 6px) clamp(8px, 2vw, 12px); border-radius: 5px; cursor: pointer; font-size: clamp(0.7em, 2vw, 0.8em); min-height: 32px;" onclick="this.parentElement.parentElement.remove(); ToastManager.success('Post excluído!')">🗑️ Excluir</button>
            </div>
            <p style="line-height: 1.6; margin-bottom: 15px; font-size: clamp(1em, 3vw, 1.1em);">${texto}</p>
            ${imagemHtml}
            
            <div style="border-top: 1px solid rgba(139, 92, 246, 0.2); padding-top: 15px;">
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <input type="text" placeholder="Adicione um comentário..." style="flex: 1; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 15px; padding: clamp(6px, 2vw, 8px) clamp(12px, 3vw, 15px); color: white; font-size: clamp(0.8em, 2.5vw, 0.9em);" onkeypress="if(event.key==='Enter') comentar(this, '${postId}')">
                    <button style="background: #8b5cf6; color: white; border: none; padding: clamp(6px, 2vw, 8px) clamp(12px, 3vw, 15px); border-radius: 15px; cursor: pointer; font-size: clamp(0.8em, 2.5vw, 0.9em); min-height: 40px;" onclick="comentar(this.previousElementSibling, '${postId}')">💬</button>
                </div>
                <div id="comentarios-${postId}"></div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('afterbegin', postHtml);
    document.getElementById('postText').value = '';
    removerImagem();
    ToastManager.success('Post publicado com sucesso! 🎉');
}

function mostrarPreview(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            selectedImage = e.target.result;
            document.getElementById('previewImg').src = selectedImage;
            document.getElementById('imagePreview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        ToastManager.error('Por favor, selecione um arquivo de imagem válido! 🖼️');
    }
}

function removerImagem() {
    selectedImage = null;
    document.getElementById('imageUpload').value = '';
    document.getElementById('imagePreview').style.display = 'none';
}

function comentar(input, postId) {
    const texto = input.value.trim();
    if (!texto) {
        ToastManager.error('Digite um comentário antes de enviar! 💭');
        return;
    }
    
    const comentariosDiv = document.getElementById('comentarios-' + postId);
    
    const comentarioHtml = `
        <div style="background: rgba(0, 0, 0, 0.2); border-radius: 10px; padding: clamp(8px, 2vw, 10px); margin-bottom: 8px; border-left: 3px solid #8b5cf6;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 5px; gap: 10px;">
                <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0;">
                    <div style="width: clamp(20px, 5vw, 25px); height: clamp(20px, 5vw, 25px); background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: clamp(0.7em, 2vw, 0.8em); flex-shrink: 0;">${userName.charAt(0).toUpperCase()}</div>
                    <span style="font-weight: bold; font-size: clamp(0.8em, 2.5vw, 0.9em);">${userName}</span>
                    <span style="color: #c4b5fd; font-size: clamp(0.7em, 2vw, 0.8em);">agora</span>
                </div>
                <button style="background: #ef4444; color: white; border: none; padding: clamp(2px, 0.5vw, 3px) clamp(4px, 1vw, 7px); border-radius: 3px; cursor: pointer; font-size: clamp(0.6em, 1.5vw, 0.7em); min-height: 24px; flex-shrink: 0;" onclick="this.parentElement.parentElement.remove(); ToastManager.success('Comentário excluído!')">🗑️</button>
            </div>
            <p style="font-size: clamp(0.8em, 2.5vw, 0.9em); line-height: 1.4; margin-left: clamp(28px, 7vw, 33px);">${texto}</p>
        </div>
    `;
    
    comentariosDiv.insertAdjacentHTML('beforeend', comentarioHtml);
    input.value = '';
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌟 DOM carregado, configurando eventos...');
    
    // Inicializar dados
    inicializarDadosPadrao();
    
    // Verificar usuário salvo
    try {
        const usuarioSalvo = StorageManager.load(StorageManager.KEYS.USER);
        if (usuarioSalvo && usuarioSalvo.nome) {
            const nameInput = document.getElementById('name');
            if (nameInput) nameInput.value = usuarioSalvo.nome;
        }
    } catch (e) {
        console.log('Primeiro acesso ou erro ao carregar usuário');
    }
    
    // Event listeners
    const nameInput = document.getElementById('name');
    if (nameInput) {
        nameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                console.log('⌨️ Enter pressionado no campo nome');
                entrarApp();
            }
        });
        console.log('✅ Event listener Enter adicionado ao campo nome');
    }
    
    const btnIniciar = document.getElementById('btnIniciarJornada');
    if (btnIniciar) {
        btnIniciar.addEventListener('click', function(e) {
            console.log('🖱️ Botão clicado via addEventListener');
            entrarApp();
        });
        console.log('✅ Event listener adicional adicionado ao botão');
    }
    
    console.log('🎉 Todos os event listeners configurados!');
});

// ===== GESTOS TOUCH PARA MOBILE =====
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', function(e) {
    if (!touchStartX || !touchStartY) return;

    let touchEndX = e.changedTouches[0].clientX;
    let touchEndY = e.changedTouches[0].clientY;

    let diffX = touchStartX - touchEndX;
    let diffY = touchStartY - touchEndY;

    if (document.getElementById('book').style.display === 'block') {
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            if (diffX > 0) {
                proximaPagina();
            } else {
                paginaAnterior();
            }
        }
    }

    touchStartX = 0;
    touchStartY = 0;
}, { passive: true });

// ===== SEGURANÇA EM PRODUÇÃO =====
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.shiftKey && e.key === 'J') ||
            (e.ctrlKey && e.key === 'U')) {
            e.preventDefault();
            return false;
        }
    });
    
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
}

// ===== EXPORTAR FUNÇÕES GLOBAIS =====
window.ToastManager = ToastManager;
window.entrarApp = entrarApp;
window.renderizarBibliotecaAudios = renderizarBibliotecaAudios;
window.reproduzirAudioPadrao = reproduzirAudioPadrao;
window.pausarAudioPadrao = pausarAudioPadrao;
window.pararAudioPadrao = pararAudioPadrao;
window.filtrarAudios = filtrarAudios;
window.baixarAudio = baixarAudio;
window.compartilharAudio = compartilharAudio;
window.irPara = irPara;
window.abrirModulo = abrirModulo;
window.paginaAnterior = paginaAnterior;
window.proximaPagina = proximaPagina;
window.fecharLivro = fecharLivro;
window.salvarDiario = salvarDiario;
window.publicarPost = publicarPost;
window.mostrarPreview = mostrarPreview;
window.removerImagem = removerImagem;
window.comentar = comentar;
window.criarSomPagina = criarSomPagina;
window.tocarSomPagina = tocarSomPagina;

console.log('🌺 Ho\'oponopono App carregado com sucesso!');
console.log('🎵 Biblioteca de áudios disponível com', audiosPadrao.length, 'áudios');
