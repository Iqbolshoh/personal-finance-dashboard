let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

const form = document.getElementById('tx-form');
const txList = document.getElementById('tx-list');
const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('income');
const expenseEl = document.getElementById('expense');

let chart;

function formatMoney(num) {
  return num.toLocaleString('uz-UZ') + " so'm";
}

function save() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

function render() {
  const income = transactions.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0);

  balanceEl.textContent = formatMoney(income - expense);
  incomeEl.textContent = formatMoney(income);
  expenseEl.textContent = formatMoney(expense);

  if (transactions.length === 0) {
    txList.innerHTML = '<div class="empty">Hozircha tranzaksiya yo\'q</div>';
  } else {
    txList.innerHTML = transactions.slice().reverse().map(t => `
      <div class="tx-item">
        <div class="left">
          <strong>${t.desc}</strong>
          <span>${t.category} • ${t.date}</span>
        </div>
        <div style="display:flex;align-items:center;">
          <span class="tx-amount ${t.type}">${t.type === 'income' ? '+' : '-'}${formatMoney(t.amount)}</span>
          <button class="del-btn" onclick="deleteTx(${t.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
    `).join('');
  }

  drawChart();
}

function drawChart() {
  const categories = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    categories[t.category] = (categories[t.category] || 0) + t.amount;
  });

  const ctx = document.getElementById('chart').getContext('2d');
  const labels = Object.keys(categories);
  const data = Object.values(categories);

  if (chart) chart.destroy();

  if (labels.length === 0) return;

  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: ['#60a5fa','#f87171','#34d399','#fbbf24','#a78bfa','#f472b6','#38bdf8'],
        borderColor: '#1a1d29',
        borderWidth: 3,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#e5e7eb' } }
      }
    }
  });
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const desc = document.getElementById('desc').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  const type = document.getElementById('type').value;
  const category = document.getElementById('category').value;

  if (!desc || !amount || amount <= 0) return;

  transactions.push({
    id: Date.now(),
    desc, amount, type, category,
    date: new Date().toLocaleDateString('uz-UZ')
  });

  save();
  render();
  form.reset();
  document.getElementById('desc').focus();
});

function deleteTx(id) {
  transactions = transactions.filter(t => t.id !== id);
  save();
  render();
}

render();