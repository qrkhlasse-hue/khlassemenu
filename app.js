var qrData = JSON.parse(localStorage.getItem('khlasse_qr') || '[]');
var chartInited = false;

function save() {
  localStorage.setItem('khlasse_qr', JSON.stringify(qrData));
}

function showToast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function() { t.classList.remove('show'); }, 2500);
}

function switchTab(name, el) {
  document.querySelectorAll('.dash-tab').forEach(function(t) { t.classList.remove('active'); });
  el.classList.add('active');
  document.getElementById('tab-qr').style.display = name === 'qr' ? 'block' : 'none';
  document.getElementById('tab-stats').style.display = name === 'stats' ? 'block' : 'none';
  document.getElementById('tab-plan').style.display = name === 'plan' ? 'block' : 'none';
  if (name === 'stats') {
    updateStats();
    if (!chartInited) { initChart(); chartInited = true; }
  }
}

function makeQRSvg(size) {
  size = size || 100;
  var s = size;
  var u = Math.floor(s / 10);
  var p = u;
  return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 ' + s + ' ' + s + '" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<rect x="' + p + '" y="' + p + '" width="' + (3*u) + '" height="' + (3*u) + '" rx="' + u*0.4 + '" fill="#185FA5"/>' +
    '<rect x="' + (p+u*0.5) + '" y="' + (p+u*0.5) + '" width="' + (2*u) + '" height="' + (2*u) + '" rx="' + u*0.3 + '" fill="white"/>' +
    '<rect x="' + (p+u) + '" y="' + (p+u) + '" width="' + u + '" height="' + u + '" rx="' + u*0.2 + '" fill="#185FA5"/>' +
    '<rect x="' + (s-p-3*u) + '" y="' + p + '" width="' + (3*u) + '" height="' + (3*u) + '" rx="' + u*0.4 + '" fill="#185FA5"/>' +
    '<rect x="' + (s-p-3*u+u*0.5) + '" y="' + (p+u*0.5) + '" width="' + (2*u) + '" height="' + (2*u) + '" rx="' + u*0.3 + '" fill="white"/>' +
    '<rect x="' + (s-p-2*u) + '" y="' + (p+u) + '" width="' + u + '" height="' + u + '" rx="' + u*0.2 + '" fill="#185FA5"/>' +
    '<rect x="' + p + '" y="' + (s-p-3*u) + '" width="' + (3*u) + '" height="' + (3*u) + '" rx="' + u*0.4 + '" fill="#185FA5"/>' +
    '<rect x="' + (p+u*0.5) + '" y="' + (s-p-3*u+u*0.5) + '" width="' + (2*u) + '" height="' + (2*u) + '" rx="' + u*0.3 + '" fill="white"/>' +
    '<rect x="' + (p+u) + '" y="' + (s-p-2*u) + '" width="' + u + '" height="' + u + '" rx="' + u*0.2 + '" fill="#185FA5"/>' +
    '<rect x="' + (s-p-3*u) + '" y="' + (s-p-3*u) + '" width="' + u + '" height="' + u + '" fill="#185FA5"/>' +
    '<rect x="' + (s-p-2*u) + '" y="' + (s-p-3*u) + '" width="' + u + '" height="' + u + '" fill="#185FA5"/>' +
    '<rect x="' + (s-p-u) + '" y="' + (s-p-3*u) + '" width="' + u + '" height="' + u + '" fill="#185FA5"/>' +
    '<rect x="' + (s-p-3*u) + '" y="' + (s-p-2*u) + '" width="' + u + '" height="' + u + '" fill="#185FA5"/>' +
    '<rect x="' + (s-p-u) + '" y="' + (s-p-2*u) + '" width="' + u + '" height="' + u + '" fill="#185FA5"/>' +
    '<rect x="' + (s-p-3*u) + '" y="' + (s-p-u) + '" width="' + u + '" height="' + u + '" fill="#185FA5"/>' +
    '<rect x="' + (s-p-2*u) + '" y="' + (s-p-u) + '" width="' + u + '" height="' + u + '" fill="#185FA5"/>' +
    '<rect x="' + (s-p-u) + '" y="' + (s-p-u) + '" width="' + u + '" height="' + u + '" fill="#185FA5"/>' +
    '</svg>';
}

function renderQRGrid() {
  var grid = document.getElementById('qr-grid');
  grid.innerHTML = '';
  var isPro = false;
  var limit = isPro ? Infinity : 1;

  qrData.forEach(function(q, i) {
    var card = document.createElement('div');
    card.className = 'qr-card';
    card.innerHTML =
      '<div class="qr-card-name">' + escHtml(q.name) + '</div>' +
      '<div class="qr-card-meta">📍 ' + (q.scans || 0) + ' scans ce mois</div>' +
      '<div class="qr-preview">' + makeQRSvg(110) + '</div>' +
      '<div class="qr-card-actions">' +
        '<button onclick="copyLink(' + i + ')">📋 Copier le lien</button>' +
        '<button onclick="downloadQR(' + i + ')">⬇ Télécharger</button>' +
        '<button onclick="deleteQR(' + i + ')" style="color:#E24B4A">🗑</button>' +
      '</div>';
    grid.appendChild(card);
  });

  var addBtn = document.createElement('button');
  addBtn.className = 'new-qr-btn';

  if (qrData.length >= limit) {
    addBtn.innerHTML =
      '<div class="icon">🔒</div>' +
      '<span>QR code supplémentaire</span>' +
      '<small style="font-size:12px;color:var(--text-hint)">Passez au Pro pour en ajouter plus</small>';
    addBtn.onclick = function() {
      switchTab('plan', document.querySelectorAll('.dash-tab')[2]);
    };
  } else {
    addBtn.innerHTML =
      '<div class="icon">＋</div>' +
      '<span>Ajouter un QR code</span>';
    addBtn.onclick = openModal;
  }
  grid.appendChild(addBtn);

  var fill = Math.min(100, Math.round((qrData.length / limit) * 100));
  var bar = document.getElementById('plan-bar-fill');
  if (bar) bar.style.width = fill + '%';
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function copyLink(i) {
  var url = qrData[i].url || 'https://khlassemenu.fr/' + encodeURIComponent(qrData[i].name);
  navigator.clipboard.writeText(url).then(function() {
    showToast('Lien copié !');
  }).catch(function() {
    showToast('Lien : ' + url);
  });
}

function downloadQR(i) {
  var svg = makeQRSvg(300);
  var blob = new Blob([svg], {type: 'image/svg+xml'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'qrcode-' + qrData[i].name.replace(/\s+/g, '-').toLowerCase() + '.svg';
  a.click();
  showToast('QR code téléchargé !');
}

function deleteQR(i) {
  if (!confirm('Supprimer le QR code "' + qrData[i].name + '" ?')) return;
  qrData.splice(i, 1);
  save();
  renderQRGrid();
  showToast('QR code supprimé.');
}

function openModal() {
  document.getElementById('modal').classList.add('open');
  document.getElementById('inp-name').focus();
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
  document.getElementById('inp-name').value = '';
  document.getElementById('inp-url').value = '';
}

function createQR() {
  var name = document.getElementById('inp-name').value.trim();
  var url = document.getElementById('inp-url').value.trim();
  if (!name) { document.getElementById('inp-name').focus(); return; }
  qrData.push({ name: name, url: url || '', scans: 0, created: Date.now() });
  save();
  closeModal();
  renderQRGrid();
  showToast('QR code créé !');
}

function updateStats() {
  var qc = document.getElementById('stat-qr-count');
  var rc = document.getElementById('stat-resto-count');
  if (qc) qc.textContent = qrData.length;
  if (rc) rc.textContent = qrData.length;
}

function initChart() {
  var ctx = document.getElementById('chart');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      datasets: [{
        data: [28, 35, 42, 31, 55, 68, 44],
        backgroundColor: '#B5D4F4',
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 13 } } },
        x: { grid: { display: false }, ticks: { font: { size: 13 } } }
      },
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

document.getElementById('btn-new-qr').onclick = openModal;
document.getElementById('btn-cancel').onclick = closeModal;
document.getElementById('btn-create').onclick = createQR;

document.getElementById('inp-name').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') createQR();
});

document.getElementById('modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

renderQRGrid();
