const { ipcRenderer } = require("electron");
const { ExpTech } = require('@exptech/http');

// 建立列表容器
const wrapper = document.createElement('div');
wrapper.id = 'report-list-container';
wrapper.style.overflow = 'visible';
wrapper.style.transition = 'transform 0.3s ease';
wrapper.classList.add('collapsed');
document.body.appendChild(wrapper);

const filterContainer = document.createElement('div');
filterContainer.id = 'report-list-filter';
filterContainer.style.padding = '10px';
filterContainer.style.borderBottom = '1px solid #444';
filterContainer.style.display = 'flex';
filterContainer.style.gap = '5px';
filterContainer.style.flexWrap = 'wrap';

const minIntSelect = document.createElement('select');
minIntSelect.style.backgroundColor = '#2b2c31';
minIntSelect.style.color = '#fff';
minIntSelect.style.border = '1px solid #555';
minIntSelect.style.padding = '4px';
minIntSelect.style.borderRadius = '4px';
minIntSelect.style.flex = '1';
minIntSelect.style.outline = 'none';

const intOptions = [
    { value: -1, text: '震度' },
    { value: 1, text: '1+' },
    { value: 2, text: '2+' },
    { value: 3, text: '3+' },
    { value: 4, text: '4+' },
    { value: 5, text: '5弱+' },
    { value: 6, text: '5強+' },
    { value: 7, text: '6弱+' },
    { value: 8, text: '6強+' },
    { value: 9, text: '7' },
];

intOptions.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.innerText = opt.text;
    minIntSelect.appendChild(option);
});

minIntSelect.onchange = () => renderList();

const minMagSelect = document.createElement('select');
minMagSelect.style.backgroundColor = '#2b2c31';
minMagSelect.style.color = '#fff';
minMagSelect.style.border = '1px solid #555';
minMagSelect.style.padding = '4px';
minMagSelect.style.borderRadius = '4px';
minMagSelect.style.flex = '1';
minMagSelect.style.outline = 'none';

const magOptions = [
    { value: -1, text: '規模' },
    { value: 3, text: 'M3+' },
    { value: 4, text: 'M4+' },
    { value: 5, text: 'M5+' },
    { value: 6, text: 'M6+' },
    { value: 7, text: 'M7+' },
    { value: 'custom', text: '自定義' },
];

magOptions.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.innerText = opt.text;
    minMagSelect.appendChild(option);
});

const customMagInput = document.createElement('input');
customMagInput.type = 'number';
customMagInput.step = '0.1';
customMagInput.placeholder = '規模';
customMagInput.style.backgroundColor = '#2b2c31';
customMagInput.style.color = '#fff';
customMagInput.style.border = '1px solid #555';
customMagInput.style.padding = '4px';
customMagInput.style.borderRadius = '4px';
customMagInput.style.flex = '1';
customMagInput.style.outline = 'none';
customMagInput.style.display = 'none';

customMagInput.oninput = () => renderList();
customMagInput.onblur = () => {
    if (!customMagInput.value) {
        customMagInput.style.display = 'none';
        minMagSelect.style.display = 'block';
        minMagSelect.value = -1;
        renderList();
    }
};

minMagSelect.onchange = () => {
    if (minMagSelect.value === 'custom') {
        minMagSelect.style.display = 'none';
        customMagInput.style.display = 'block';
        customMagInput.focus();
    }
    renderList();
};

const searchInput = document.createElement('input');
searchInput.type = 'text';
searchInput.placeholder = '搜尋地點...';
searchInput.style.backgroundColor = '#2b2c31';
searchInput.style.color = '#fff';
searchInput.style.border = '1px solid #555';
searchInput.style.padding = '4px';
searchInput.style.borderRadius = '4px';
searchInput.style.flex = '2';
searchInput.style.outline = 'none';

searchInput.oninput = () => renderList();

filterContainer.appendChild(minIntSelect);
filterContainer.appendChild(minMagSelect);
filterContainer.appendChild(customMagInput);
filterContainer.appendChild(searchInput);
wrapper.appendChild(filterContainer);

const listContainer = document.createElement('div');
listContainer.id = 'report-list-content';
listContainer.style.height = '100%';
listContainer.style.overflowY = 'auto';
listContainer.innerHTML = '<div style="color: #ffffff;">載入中...</div>';
wrapper.appendChild(listContainer);

const toggleBtn = document.createElement('div');
toggleBtn.id = 'report-list-toggle';
toggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/></svg>`;
toggleBtn.onclick = () => {
    wrapper.classList.toggle('collapsed');
    toggleBtn.innerHTML = wrapper.classList.contains('collapsed') ?
        `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/></svg>` :
        `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/></svg>`;
};
wrapper.appendChild(toggleBtn);

const toggleStyle = document.createElement('style');
toggleStyle.innerHTML = `
    #report-list-container.collapsed { transform: translateX(-100%); }
    #report-list-toggle {
        position: absolute;
        right: -24px;
        top: 50%;
        transform: translateY(-50%);
        width: 24px;
        height: 48px;
        background-color: #2b2c31;
        border-radius: 0 8px 8px 0;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 1000;
        box-shadow: 4px 0 8px rgba(0,0,0,0.2);
    }
    #report-list-content::-webkit-scrollbar {
        width: 8px;
    }
    #report-list-content::-webkit-scrollbar-track {
        background: #2b2c31;
    }
    #report-list-content::-webkit-scrollbar-thumb {
        background: #555;
        border-radius: 4px;
    }
    #report-list-content::-webkit-scrollbar-thumb:hover {
        background: #777;
    }
`;
document.head.appendChild(toggleStyle);

// 加入樣式
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'css/report.css';
document.head.appendChild(link);

function updateListHeight() {
    listContainer.style.maxHeight = `${window.innerHeight - 165}px`;
}

window.addEventListener('resize', updateListHeight);
updateListHeight();

let reports = [];
let currentReportId = null;
let currentFetchId = null;
let station = {};
let region = require('../resource/data/region.json');

function search_loc_name(int) {
  for (const city of Object.keys(region)) {
    for (const town of Object.keys(region[city])) {
      if (region[city][town].code == int) {
        return { city, town };
      }
    }
  }
  return null;
}

function formatTime(ts) {
    const d = new Date(ts);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

function getIntensityClass(intVal) {
    const i = parseInt(intVal);
    if (i >= 0 && i <= 9) return `int-${i}`;
    return 'int-0';
}

async function fetchTremData() {
    try {
        const response = await fetch('https://api-1.exptech.dev/api/v1/trem/list');
        const tremList = await response.json();
        const promises = reports.map(async (report) => {
            const match = tremList.find(item => item.Cwa_id === report.id);
            if (match) {
                report.trem = match.ID;
                report.trem_list = match.List;
                try {
                    const detailRes = await fetch(`https://api-1.exptech.dev/api/v1/trem/report/${report.trem}`);
                    const detail = await detailRes.json();
                    if (Array.isArray(detail) && detail.length > 0) {
                        report.trem_eew = detail;
                    }

                    if (report.trem_list) {
                        const infoRes = await fetch("https://api-1.exptech.dev/api/v1/trem/info", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ list: JSON.parse(report.trem_list) }),
                        });
                        const infoData = await infoRes.json();
                        report.trem_stations = infoData.map((item) => {
                            const s = station[item.id];
                            if (!s || !s.info || s.info.length === 0) return null;
                            const info = s.info[s.info.length - 1];
                            return {
                                ...item,
                                lat: info.lat,
                                lon: info.lon,
                                loc: search_loc_name(info.code),
                                net: s.net,
                            };
                        }).filter((e) => e);
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        });
        await Promise.all(promises);
        if (currentReportId) {
            const report = reports.find(r => r.id === currentReportId);
            if (report) {
                showReport(report);
            }
        }
    } catch (e) {
        console.error(e);
    }
}

async function showReport(report, autoCenter = true) {
    if (!report || !report.id) {
        return;
    }

    const fetchId = report.id;
    currentFetchId = fetchId;

    try {
        const [data] = await ExpTech.getReportById(report.id, {
            timeout: 10000,
        });
        if (currentFetchId === fetchId && data && window.showReportPoint) {
            report.list = data.list;
            window.showReportPoint(report, autoCenter);
        }
    } catch (e) {
        console.error(e);
    }
}

function renderList() {
    listContainer.innerHTML = '';
    const minInt = parseInt(minIntSelect.value);
    let minMag = parseFloat(minMagSelect.value);
    if (minMagSelect.value === 'custom') {
        minMag = parseFloat(customMagInput.value);
    }
    const searchText = searchInput.value.trim().toLowerCase();

    reports.forEach(report => {
        if (!report || !report.time) return;

        let rInt = parseInt(report.int);
        if (isNaN(rInt)) rInt = 0;
        if (minInt !== -1 && rInt < minInt) return;

        let rMag = parseFloat(report.mag);
        if (isNaN(rMag)) rMag = 0;
        if (!isNaN(minMag) && minMag !== -1 && rMag < minMag) return;

        if (searchText) {
            const loc = (report.loc || '').toLowerCase();
            if (!loc.includes(searchText)) return;
        }

        const card = document.createElement('div');
        card.className = `report-card ${report.id === currentReportId ? 'active' : ''}`;

        card.innerHTML = `
            <div class="report-time">${formatTime(report.time)}</div>
            <div class="report-info">
                <div class="report-intensity ${getIntensityClass(report.int)}">${report.int || 0}</div>
                <div class="report-details">
                    <div class="report-location">${report.loc || '未知地點'}</div>
                    <div class="report-mag-depth">M${report.mag || 0} / ${report.depth || 0}km</div>
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            wrapper.classList.add('collapsed');
            currentReportId = report.id;
            renderList();
            fetchTremData();
        });

        listContainer.appendChild(card);
    });
}

// 監聽從主進程傳來的數據
ipcRenderer.on('report-plus-data', (event, data) => {
    if (Array.isArray(data)) {
        reports = data.filter(item => item && item.time);
        if (reports.length > 0 && !currentReportId) {
            currentReportId = reports[0].id;
        }
    } else {
        if (data && data.time) {
            reports.unshift(data);
            currentReportId = data.id;
        }
    }
    renderList();
    fetchTremData();
    console.log(reports);
});

ipcRenderer.on('report-plus-station', (event, data) => {
    station = data;
});