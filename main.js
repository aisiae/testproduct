// Add JS here// ============================================
// 📦 포트폴리오 애플리케이션 (app.js)
// ============================================

// 🎵 배경음악 전역 관리
const AudioManager = {
  element: null,
  currentVolume: 30,
  isPlaying: false,

  init() {
    this.element = document.getElementById('bg-music');
    if (!this.element) {
      console.error('❌ 오디오 요소를 찾을 수 없습니다');
      return;
    }

    // localStorage에서 설정 복원
    this.currentVolume = parseInt(localStorage.getItem('musicVolume') || '30');
    const wasPlaying = localStorage.getItem('musicWasPlaying') === 'true';
    const savedMusicData = localStorage.getItem('musicData');

    this.element.volume = this.currentVolume / 100;

    // 저장된 음악 파일이 있으면 로드
    if (savedMusicData) {
      this.element.src = savedMusicData;
      console.log('✅ 저장된 배경음악 복원됨');
    }

    // 이전에 재생 중이었으면 자동 재생
    if (wasPlaying && this.element.src) {
      setTimeout(() => {
        this.play();
      }, 1000);
    }

    // 이벤트 리스너
    this.element.addEventListener('play', () => {
      this.isPlaying = true;
      localStorage.setItem('musicWasPlaying', 'true');
      UI.updateMusicButton();
    });

    this.element.addEventListener('pause', () => {
      this.isPlaying = false;
      localStorage.setItem('musicWasPlaying', 'false');
      UI.updateMusicButton();
    });

    this.element.addEventListener('error', (e) => {
      console.error('❌ 음악 파일 로드 실패:', e);
    });
  },

  play() {
    if (!this.element.src) {
      alert('먼저 배경음악을 업로드해주세요.');
      return;
    }

    const playPromise = this.element.play();
    if (playPromise !== undefined) {
      playPromise.catch(e => {
        console.log('⚠️ 자동재생 차단됨 (브라우저 정책):', e);
        localStorage.setItem('musicWasPlaying', 'false');
      });
    }
  },

  pause() {
    this.element.pause();
  },

  toggle() {
    if (this.element.paused) {
      this.play();
    } else {
      this.pause();
    }
  },

  setVolume(percent) {
    this.currentVolume = Math.max(0, Math.min(100, parseInt(percent)));
    this.element.volume = this.currentVolume / 100;
    localStorage.setItem('musicVolume', this.currentVolume);
  },

  getMusicIcon() {
    if (!this.element.src) return '❌';
    if (this.currentVolume === 0) return '🔇';
    if (this.currentVolume < 33) return '🔈';
    if (this.currentVolume < 67) return '🔉';
    return '🔊';
  },

  setMusicFile(file) {
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/webm'];

    if (!validTypes.includes(file.type)) {
      alert('❌ MP3, WAV, OGG, M4A, WebM 형식만 지원합니다.');
      return false;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert('❌ 파일 크기는 50MB 이하여야 합니다.');
      return false;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileData = event.target.result;
      this.element.src = fileData;
      localStorage.setItem('musicData', fileData);
      localStorage.setItem('musicFileName', file.name);
      console.log('✅ 배경음악 업로드 완료:', file.name);
      alert(`✅ 배경음악이 업로드되었습니다!\n파일: ${file.name}`);
      UI.updateMusicUI();
    };

    reader.onerror = () => {
      alert('❌ 파일을 읽을 수 없습니다.');
    };

    reader.readAsDataURL(file);
    return true;
  },

  deleteMusicFile() {
    if (confirm('배경음악을 삭제하시겠습니까?')) {
      this.pause();
      this.element.src = '';
      localStorage.removeItem('musicData');
      localStorage.removeItem('musicFileName');
      localStorage.setItem('musicWasPlaying', 'false');
      console.log('🗑️ 배경음악 삭제됨');
      UI.updateMusicUI();
      alert('✅ 배경음악이 삭제되었습니다.');
    }
  }
};

// 🎨 UI 관리
const UI = {
  isLoggedIn: false,

  init() {
    this.render();
    this.attachEventListeners();
    this.updateMusicButton();
  },

  render() {
    const root = document.getElementById('root');
    const musicFileName = localStorage.getItem('musicFileName') || '';

    root.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        <!-- 네비게이션 -->
        <nav class="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-700/50">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 class="text-2xl font-bold text-cyan-400">J-PROJECT</h1>
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-3 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2">
                <button 
                  id="music-toggle"
                  class="text-cyan-400 hover:text-cyan-300 transition text-lg"
                  title="음악 재생/정지"
                >
                  ${AudioManager.getMusicIcon()}
                </button>
                <input 
                  id="volume-slider"
                  type="range" 
                  min="0" max="100" 
                  value="${AudioManager.currentVolume}"
                  class="w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  title="음량 조절"
                />
                <span class="text-xs text-slate-400 w-8 text-right">${AudioManager.currentVolume}%</span>
              </div>
              ${!this.isLoggedIn ? `
                <button id="login-btn" class="flex items-center gap-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 px-4 py-2 rounded-lg transition">
                  <span class="text-sm">🔐 관리자 로그인</span>
                </button>
              ` : `
                <button id="upload-music-btn" class="flex items-center gap-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 px-4 py-2 rounded-lg transition">
                  <span class="text-sm">🎵 배경음악</span>
                </button>
                <button id="logout-btn" class="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded-lg transition">
                  <span class="text-sm">🚪 로그아웃</span>
                </button>
              `}
            </div>
          </div>
        </nav>

        <main>
          <!-- 메인 영상 -->
          <section class="py-12 sm:py-16">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 class="text-2xl font-bold mb-8 text-center text-cyan-300">메인 영상</h2>
              <div class="aspect-video bg-slate-800 rounded-lg overflow-hidden shadow-lg border border-slate-700 mb-8">
                <iframe width="100%" height="100%" src="https://www.youtube.com/embed/gqos6G0MnzM?autoplay=1&mute=1&loop=1&playlist=gqos6G0MnzM" title="Main Video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
              </div>
            </div>
          </section>

          <!-- 소개 -->
          <section class="py-12 sm:py-16 text-center">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 class="text-3xl font-bold mb-4 text-cyan-200">안녕하세요! 교육의 효율을 디자인하는</h2>
              <h2 class="text-3xl font-bold mb-3 text-cyan-200">강사 정지영입니다.</h2>
              <div class="text-slate-200 space-y-5 text-base sm:text-lg max-w-3xl mx-auto">
                <p>신입 교육 및 업무 교육을 중심으로 강의를 해왔습니다.</p>
                <p>변화하는 시대에 맞춰, AI와 자동화 도구를 적극 활용하여 업무의 효율을 높이는 방식을 적용하려 노력합니다.</p>
                <p>영상 교육 콘텐츠 제작 역량을 갖추고 있으며, CS 강사 1급 자격증을 소지하고 있습니다.</p>
                <p>현재 홈페이지는 HTML, CSS, JavaScript를 이용하여 직접 제작하였습니다.</p>
              </div>
              <p class="text-slate-500 mt-10 text-base sm:text-lg">현실에 안주하기보다 끊임없는 도전과 노력으로 항상 발전하는 사람이 되고 싶습니다.</p>
            </div>
          </section>

          <!-- 주요 활동 -->
          <section class="py-12 sm:py-16">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 class="text-3xl font-bold mb-12 text-center text-cyan-300">주요 활동</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="bg-slate-800/40 border border-slate-700 rounded-lg p-6">
                  <h3 class="text-2xl font-semibold mb-4 text-cyan-300">진행 업무</h3>
                  <div class="w-full h-px bg-cyan-400/50 mb-6"></div>
                  <ul class="space-y-2">
                    <li class="text-slate-300"><span class="text-cyan-400 mr-2">•</span>신입 사원 업무 교육</li>
                    <li class="text-slate-300"><span class="text-cyan-400 mr-2">•</span>기존 사원 업무 교육</li>
                    <li class="text-slate-300"><span class="text-cyan-400 mr-2">•</span>온라인/오프라인 강의</li>
                    <li class="text-slate-300"><span class="text-cyan-400 mr-2">•</span>CS 교육 기획 및 진행</li>
                    <li class="text-slate-300"><span class="text-cyan-400 mr-2">•</span>영상 교육 제작</li>
                    <li class="text-slate-300"><span class="text-cyan-400 mr-2">•</span>개인정보 보호 교육 기획 및 진행</li>
                    <li class="text-slate-300"><span class="text-cyan-400 mr-2">•</span>간단한 프로그램 개발</li>
                    <li class="text-slate-300"><span class="text-cyan-400 mr-2">•</span>상담 모니터링 진행 및 분석 보고</li>
                    <li class="text-slate-300"><span class="text-cyan-400 mr-2">•</span>프로모션 기획 및 진행</li>
                  </ul>
                </div>

                <div class="bg-slate-800/40 border border-slate-700 rounded-lg p-6">
                  <h3 class="text-2xl font-semibold mb-4 text-cyan-300">이용 가능 툴</h3>
                  <div class="w-full h-px bg-cyan-400/50 mb-6"></div>
                  <ul class="space-y-2">
                    <li class="text-slate-300"><span class="text-cyan-400 mr-2">•</span>Microsoft Excel</li>
                    <li class="text-slate-300"><span class="text-cyan-400 mr-2">•</span>Microsoft PowerPoint</li>
                    <li class="text-slate-300"><span class="text-cyan-400 mr-2">•</span>Teams</li>
                    <li class="text-slate-300"><span class="text-cyan-400 mr-2">•</span>Zoom</li>
                    <li class="text-slate-300"><span class="text-cyan-400 mr-2">•</span>Premiere Pro</li>
                    <li class="text-slate-300"><span class="text-cyan-400 mr-2">•</span>Aftereffect</li>
                    <li class="text-slate-300"><span class="text-cyan-400 mr-2">•</span>Chat GPT / Python / Notion</li>
                    <li class="text-slate-300"><span class="text-cyan-400 mr-2">•</span>다양한 AI 툴</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <!-- 연락처 -->
          <section class="py-16 border-t border-slate-700">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 class="text-2xl font-bold mb-8 text-center text-cyan-300">연락처</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <div class="bg-slate-800/40 border border-slate-700 rounded-lg p-6 text-center">
                  <p class="text-slate-400 text-sm mb-2">이메일</p>
                  <p class="text-lg font-semibold text-cyan-300">jiyoung1013@gmail.com</p>
                </div>
                <div class="bg-slate-800/40 border border-slate-700 rounded-lg p-6 text-center">
                  <p class="text-slate-400 text-sm mb-2">전화</p>
                  <p class="text-lg font-semibold text-cyan-300">010-4007-1417</p>
                </div>
              </div>
              <div class="text-center mt-12 text-slate-400 text-sm border-t border-slate-700 pt-8">
                <p>© 2025 Jiyoung - All rights reserved</p>
              </div>
            </div>
          </section>
        </main>
      </div>

      <!-- 배경음악 업로드 모달 (관리자용) -->
      <div id="music-modal" style="display: none;" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div class="w-full max-w-md">
          <div class="bg-slate-800 rounded-xl shadow-2xl p-8 border border-slate-700 relative">
            <button id="close-music-modal" class="absolute top-4 right-4 text-slate-400 hover:text-white transition text-2xl">×</button>
            
            <h2 class="text-2xl font-bold mb-2 text-white">배경음악 업로드</h2>
            <p class="text-slate-400 mb-6">MP3, WAV, OGG, M4A 파일을 업로드해주세요 (최대 50MB)</p>
            
            <div class="space-y-4">
              <input 
                id="music-file-input"
                type="file" 
                accept="audio/*"
                style="display: none;"
              />
              
              <label for="music-file-input" class="block w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg transition cursor-pointer text-center">
                📁 파일 선택
              </label>
              
              <div id="current-music-info" style="display: none;" class="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                <p class="text-slate-400 text-sm mb-2">현재 음악</p>
                <p id="current-music-name" class="text-white font-medium truncate"></p>
              </div>
              
              <button id="delete-music-btn" style="display: none;" class="w-full flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded-lg transition">
                🗑️ 배경음악 삭제
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  attachEventListeners() {
    // 음악 토글
    const musicToggleBtn = document.getElementById('music-toggle');
    if (musicToggleBtn) {
      musicToggleBtn.addEventListener('click', () => AudioManager.toggle());
    }

    // 음량 조절
    const volumeSlider = document.getElementById('volume-slider');
    if (volumeSlider) {
      volumeSlider.addEventListener('change', (e) => {
        AudioManager.setVolume(e.target.value);
        this.updateMusicButton();
      });
      volumeSlider.addEventListener('input', (e) => {
        AudioManager.setVolume(e.target.value);
        this.updateMusicButton();
      });
    }

    // 로그인
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => this.showLogin());
    }

    // 로그아웃
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }

    // 배경음악 업로드 모달
    const uploadMusicBtn = document.getElementById('upload-music-btn');
    if (uploadMusicBtn) {
      uploadMusicBtn.addEventListener('click', () => this.showMusicModal());
    }

    const closeModalBtn = document.getElementById('close-music-modal');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => this.hideMusicModal());
    }

    const musicFileInput = document.getElementById('music-file-input');
    if (musicFileInput) {
      musicFileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
          AudioManager.setMusicFile(e.target.files[0]);
        }
      });
    }

    const deleteMusicBtn = document.getElementById('delete-music-btn');
    if (deleteMusicBtn) {
      deleteMusicBtn.addEventListener('click', () => AudioManager.deleteMusicFile());
    }
  },

  updateMusicButton() {
    const btn = document.getElementById('music-toggle');
    if (btn) {
      btn.textContent = AudioManager.getMusicIcon();
    }
  },

  updateMusicUI() {
    const musicFileName = localStorage.getItem('musicFileName') || '';
    const currentMusicInfo = document.getElementById('current-music-info');
    const currentMusicName = document.getElementById('current-music-name');
    const deleteMusicBtn = document.getElementById('delete-music-btn');

    if (musicFileName) {
      currentMusicInfo.style.display = 'block';
      currentMusicName.textContent = musicFileName;
      deleteMusicBtn.style.display = 'block';
    } else {
      currentMusicInfo.style.display = 'none';
      deleteMusicBtn.style.display = 'none';
    }
  },

  showLogin() {
    const password = prompt('🔐 비밀번호를 입력하세요:');
    if (password === 'wjdwldud2025') {
      this.isLoggedIn = true;
      this.render();
      this.attachEventListeners();
      alert('✅ 관리자로 로그인되었습니다!');
    } else if (password !== null) {
      alert('❌ 비밀번호가 틀렸습니다.');
    }
  },

  logout() {
    this.isLoggedIn = false;
    this.render();
    this.attachEventListeners();
  },

  showMusicModal() {
    const modal = document.getElementById('music-modal');
    if (modal) {
      modal.style.display = 'flex';
      this.updateMusicUI();
    }
  },

  hideMusicModal() {
    const modal = document.getElementById('music-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }
};

// 🚀 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 포트폴리오 앱 시작...');
  AudioManager.init();
  UI.init();
});
