const Store = {
  read(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  write(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
};

const KEYS = {
  users: 'egov_users',
  session: 'egov_session',
  procedures: 'egov_procedures',
  applications: 'egov_applications',
  feedbacks: 'egov_feedbacks',
  linkedData: 'egov_linked_data',
  openData: 'egov_open_data_downloads',
};

function seedData() {
  if (!Store.read(KEYS.procedures)) {
    Store.write(KEYS.procedures, [
      { id:'KHAISINH', name:'Đăng ký khai sinh', days:2, fee:0, steps:'Nộp hồ sơ -> Kiểm tra -> Trả kết quả' },
      { id:'DANGKYKD', name:'Đăng ký hộ kinh doanh', days:3, fee:100000, steps:'Nộp hồ sơ -> Thẩm định -> Phê duyệt' },
      { id:'DATDAI', name:'Cấp đổi sổ đỏ', days:15, fee:500000, steps:'Nộp hồ sơ -> Đo đạc -> Phê duyệt -> Trả kết quả' },
    ]);
  }
  if (!Store.read(KEYS.linkedData)) {
    Store.write(KEYS.linkedData, {
      citizenId:'079203001234', insurance:'DN-23819331', land:'TD-443920', business:'HKD-12223',
    });
  }
}

function users() { return Store.read(KEYS.users, []); }
function saveUsers(arr) { Store.write(KEYS.users, arr); }
function session() { return Store.read(KEYS.session); }
function setSession(s) { Store.write(KEYS.session, s); }

function hashPassword(pwd) { return btoa(unescape(encodeURIComponent(pwd))); }

function register({name,email,password,phone}) {
  const all = users();
  if (all.find(u => u.email === email)) throw new Error('Email đã tồn tại');
  const user = { id: crypto.randomUUID(), name, email, phone, password: hashPassword(password), createdAt: new Date().toISOString() };
  all.push(user); saveUsers(all); setSession({userId:user.id, at:new Date().toISOString()});
}

function login({email,password}) {
  const u = users().find(x => x.email===email && x.password===hashPassword(password));
  if (!u) throw new Error('Sai tài khoản hoặc mật khẩu');
  setSession({userId:u.id, at:new Date().toISOString()});
}

function logout() { localStorage.removeItem(KEYS.session); location.href = 'index.html'; }

function currentUser() {
  const s = session(); if (!s) return null;
  return users().find(u => u.id===s.userId) || null;
}

function requireAuth() {
  seedData();
  const u = currentUser();
  if (!u) location.href = 'index.html';
  return u;
}

function fmtVND(v){ return Number(v||0).toLocaleString('vi-VN') + ' đ'; }

function addRecord(key, record){ const arr = Store.read(key,[]); arr.unshift(record); Store.write(key,arr); return arr; }

const featureLinks = [
 ['dashboard.html','Tổng quan'],
 ['feature-1-cong-khai.html','1. Công khai TTHC'],
 ['feature-2-nop-ho-so.html','2. Nộp hồ sơ'],
 ['feature-3-thanh-toan.html','3. Thanh toán'],
 ['feature-4-theo-doi.html','4. Theo dõi tiến độ'],
 ['feature-5-tra-ket-qua.html','5. Trả kết quả'],
 ['feature-6-ket-noi.html','6. Kết nối dữ liệu'],
 ['feature-7-xac-thuc.html','7. Xác thực điện tử'],
 ['feature-8-phan-anh.html','8. Phản ánh'],
 ['feature-9-da-kenh.html','9. Hỗ trợ đa kênh'],
 ['feature-10-lien-thong.html','10. Liên thông'],
 ['feature-11-du-lieu-mo.html','11. Dữ liệu mở'],
 ['feature-12-bao-mat.html','12. Bảo mật'],
];

function renderLayout(active, title, description, contentHTML) {
  const u = requireAuth();
  document.body.innerHTML = `
    <div class="layout">
      <aside class="sidebar">
        <div class="brand">🇻🇳 Cổng Chính phủ điện tử</div>
        <div class="small">Xin chào, <b>${u.name}</b></div>
        <div class="nav">
          ${featureLinks.map(([href,label]) => `<a class="${active===href?'active':''}" href="${href}">${label}</a>`).join('')}
        </div>
        <div style="margin-top:10px"><button id="logoutBtn">Đăng xuất</button></div>
      </aside>
      <main class="main">
        <div class="header">
          <div>
            <h2 style="margin:0">${title}</h2>
            <div class="small">${description}</div>
          </div>
          <div><span class="tag">Fluent 2</span><span class="tag">LocalStorage</span></div>
        </div>
        ${contentHTML}
      </main>
    </div>`;
  document.getElementById('logoutBtn').onclick = logout;
}
