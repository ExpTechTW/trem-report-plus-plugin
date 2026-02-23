const mapConfig = {
    container: 'map',
    dragRotate: false,
    style: {
        'version': 8,
        'name': 'ExpTech Studio',
        'center': [120.2, 23.6],
        'zoom': 7,
        'sources': {
            'map': {
                'type': 'vector',
                'url': 'https://lb.exptech.dev/api/v1/map/tiles/tiles.json',
            },
        },
        'sprite': '',
        'glyphs': 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
        'layers': [
            {
                id: 'background',
                type: 'background',
                paint: {
                    'background-color': '#1f2025',
                },
            },
            {
                'id': 'county',
                'type': 'fill',
                'source': 'map',
                'source-layer': 'city',
                'paint': {
                    'fill-color': '#3F4045',
                    'fill-opacity': 1,
                },
            },
            {
                'id': 'town',
                'type': 'fill',
                'source': 'map',
                'source-layer': 'town',
                'paint': {
                    'fill-color': '#3F4045',
                    'fill-opacity': 1,
                },
            },
            {
                'id': 'county-outline',
                'source': 'map',
                'source-layer': 'city',
                'type': 'line',
                'paint': {
                    'line-color': '#a9b4bc',
                },
            },
            {
                'id': 'global',
                'type': 'fill',
                'source': 'map',
                'source-layer': 'global',
                'paint': {
                    'fill-color': '#3F4045',
                    'fill-opacity': 1,
                },
            }
        ]
    },
    center: [120.2, 23.6],
    zoom: 6.6
};

const map = new maplibregl.Map(mapConfig);
map.getCanvas().style.outline = 'none';

const resetButton = document.getElementById('reset-position');
if (resetButton) {
    resetButton.addEventListener('click', () => {
        if (typeof map.jumpTo === 'function') {
            map.jumpTo({
                center: [120.2, 23.6],
                zoom: 6.6
            });
        } else if (typeof map.setView === 'function') {
            map.setView([23.6, 120.2], 6.6);
        }
    });
}

// 注入 Popup 深色模式樣式
const popupStyle = document.createElement('style');
popupStyle.innerHTML = `
    .maplibregl-popup-content {
        background-color: #2b2c31 !important;
        color: #fff !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.5) !important;
    }
    .maplibregl-popup-anchor-bottom .maplibregl-popup-tip, .maplibregl-popup-anchor-bottom-left .maplibregl-popup-tip, .maplibregl-popup-anchor-bottom-right .maplibregl-popup-tip { border-top-color: #2b2c31 !important; }
    .maplibregl-popup-anchor-top .maplibregl-popup-tip, .maplibregl-popup-anchor-top-left .maplibregl-popup-tip, .maplibregl-popup-anchor-top-right .maplibregl-popup-tip { border-bottom-color: #2b2c31 !important; }
    .maplibregl-popup-anchor-left .maplibregl-popup-tip { border-right-color: #2b2c31 !important; }
    .maplibregl-popup-anchor-right .maplibregl-popup-tip { border-left-color: #2b2c31 !important; }
    .maplibregl-popup-close-button { color: #fff !important; }
`;
document.head.appendChild(popupStyle);

// 切換圖層相關代碼
const toggleButton = document.getElementById('toggle-layer');
let layerVisible = false;

function loadConfig() {
    try {
        const savedConfig = localStorage.getItem('mapConfig');
        return savedConfig ? JSON.parse(savedConfig) : { layers: { town_outline: { visible: false } } };
    } catch (error) {
        console.error('無法載入設定:', error);
        return { layers: { town_outline: { visible: false } } };
    }
}

function saveConfig(config) {
    try {
        localStorage.setItem('mapConfig', JSON.stringify(config));
        console.log(config);
    } catch (error) {
        console.error('無法儲存設定:', error);
    }
}

if (toggleButton) {
    toggleButton.addEventListener('click', () => {
        layerVisible = !layerVisible;

        if (layerVisible) {
            if (!map.getLayer('town-outline')) {
                map.addLayer({
                    'id': 'town-outline',
                    'type': 'line',
                    'source': 'map',
                    'source-layer': 'town',
                    'paint': {
                        'line-color': '#a9b4bc',
                    },
                });
            }
            map.setLayoutProperty('town-outline', 'visibility', 'visible');
        } else {
            if (map.getLayer('town-outline')) {
                map.setLayoutProperty('town-outline', 'visibility', 'none');
            }
        }

        saveConfig({
            layers: {
                town_outline: {
                    visible: layerVisible
                }
            }
        });

        toggleButton.innerHTML = layerVisible ? `
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                <path d="m644-448-56-58 122-94-230-178-94 72-56-58 150-116 360 280-196 152Zm115 114-58-58 73-56 66 50-81 64Zm33 258L632-236 480-118 120-398l66-50 294 228 94-73-57-56-37 29-360-280 83-65L55-811l57-57 736 736-56 56ZM487-606Z"/>
            </svg>
        ` : `
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                <path d="M480-118 120-398l66-50 294 228 294-228 66 50-360 280Zm0-202L120-600l360-280 360 280-360 280Zm0-280Zm0 178 230-178-230-178-230 178 230 178Z"/>
            </svg>
        `;
    });
}

const toggleTremButton = document.getElementById('toggle-trem');
let tremVisible = false;

function updateTremButton() {
    toggleTremButton.innerHTML = tremVisible ? `
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#4dabf5">
            <path d="M280-240q-100 0-170-70T40-480q0-100 70-170t170-70h400q100 0 170 70t70 170q0 100-70 170t-170 70H280Zm0-80h400q66 0 113-47t47-113q0-66-47-113t-113-47H280q-66 0-113 47t-47 113q0 66 47 113t113 47Zm485-75q35-35 35-85t-35-85q-35-35-85-35t-85 35q-35 35-35 85t35 85q35 35 85 35t85-35Zm-285-85Z"/>
        </svg>
    ` : `
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="20px" fill="#e8eaed">
            <path d="M288-240q-100 0-170-70T48-480q0-100 70-170t170-70h384q100 0 170 70t70 170q0 100-70 170t-170 70H288Zm0-72h384q70 0 119-49t49-119q0-70-49-119t-119-49H288q-70 0-119 49t-49 119q0 70 49 119t119 49Zm85-83q35-35 35-85t-35-85q-35-35-85-35t-85 35q-35 35-35 85t35 85q35 35 85 35t85-35Zm107-85Z"/>
        </svg>
    `;
}

updateTremButton();

let reportMarkersPopup = null;
let crossMarkersPopup = null;
let tremMarkersPopup = null;
let tremStationPopup = null;

toggleTremButton.addEventListener('click', () => {
    tremVisible = !tremVisible;
    const visibility = tremVisible ? 'visible' : 'none';

    if (map.getLayer('report-markers-trem')) map.setLayoutProperty('report-markers-trem', 'visibility', visibility);
    if (map.getLayer('report-markers-trem-station')) map.setLayoutProperty('report-markers-trem-station', 'visibility', visibility);
    if (map.getLayer('report-markers-trem-station-label')) map.setLayoutProperty('report-markers-trem-station-label', 'visibility', visibility);
    if (tremMarkersPopup) tremMarkersPopup.remove();
    if (tremStationPopup) tremStationPopup.remove();

    updateTremButton();
});

map.on('load', function () {
    const config = loadConfig();
    layerVisible = config.layers.town_outline.visible;

    if (layerVisible) {
        map.addLayer({
            'id': 'town-outline',
            'type': 'line',
            'source': 'map',
            'source-layer': 'town',
            'paint': {
                'line-color': '#a9b4bc',
            },
        });
    } else {
        map.addLayer({
            'id': 'town-outline',
            'type': 'line',
            'source': 'map',
            'source-layer': 'town',
            'paint': {
                'line-color': '#a9b4bc',
            },
            'layout': {
                'visibility': 'none'
            }
        });
    }

    if (toggleButton) {
        toggleButton.innerHTML = layerVisible ? `
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                <path d="m644-448-56-58 122-94-230-178-94 72-56-58 150-116 360 280-196 152Zm115 114-58-58 73-56 66 50-81 64Zm33 258L632-236 480-118 120-398l66-50 294 228 94-73-57-56-37 29-360-280 83-65L55-811l57-57 736 736-56 56ZM487-606Z"/>
            </svg>
        ` : `
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                <path d="M480-118 120-398l66-50 294 228 294-228 66 50-360 280Zm0-202L120-600l360-280 360 280-360 280Zm0-280Zm0 178 230-178-230-178-230 178 230 178Z"/>
            </svg>
        `;
    }

    // 修正 "Image 'cross' could not be loaded" 錯誤
    // 動態生成震央紅色十字圖標
    const crossSize = 500;
    const crossCanvas = document.createElement('canvas');
    crossCanvas.width = crossSize;
    crossCanvas.height = crossSize;
    const crossCtx = crossCanvas.getContext('2d');
    crossCtx.strokeStyle = '#FF0000';
    crossCtx.lineWidth = 50;
    crossCtx.lineCap = 'round';
    crossCtx.beginPath();
    crossCtx.moveTo(100, 100);
    crossCtx.lineTo(400, 400);
    crossCtx.moveTo(400, 100);
    crossCtx.lineTo(100, 400);
    crossCtx.stroke();
    map.addImage('cross', crossCtx.getImageData(0, 0, crossSize, crossSize));

    // 動態生成 TREM EEW 藍色十字圖標
    const crossBlueCanvas = document.createElement('canvas');
    crossBlueCanvas.width = crossSize;
    crossBlueCanvas.height = crossSize;
    const crossBlueCtx = crossBlueCanvas.getContext('2d');
    crossBlueCtx.strokeStyle = '#0000FF';
    crossBlueCtx.lineWidth = 50;
    crossBlueCtx.lineCap = 'round';
    crossBlueCtx.beginPath();
    crossBlueCtx.moveTo(100, 100);
    crossBlueCtx.lineTo(400, 400);
    crossBlueCtx.moveTo(400, 100);
    crossBlueCtx.lineTo(100, 400);
    crossBlueCtx.stroke();
    map.addImage('cross-blue', crossBlueCtx.getImageData(0, 0, crossSize, crossSize));

    // 初始化報告圖層
    map.addSource('report-markers-geojson', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
    });

    // 震度圓點 (使用圓形代替圖標以確保相容性)
    map.addLayer({
        id: 'report-markers',
        type: 'circle',
        source: 'report-markers-geojson',
        filter: ['all', ['!=', ['get', 'i'], 0], ['!=', ['get', 'type'], 'trem'], ['!=', ['get', 'type'], 'trem-station']],
        paint: {
            'circle-radius': [
                'interpolate', ['linear'], ['zoom'],
                5, 8,
                10, 14
            ],
            'circle-color': [
                'step', ['get', 'i'],
                '#202020',
                1, '#003264',
                2, '#0064c8',
                3, '#1e9632',
                4, '#ffc800',
                5, '#ff9600',
                6, '#ff6400',
                7, '#ff0000',
                8, '#c00000',
                9, '#9600c8'
            ],
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff'
        }
    });

    map.addLayer({
        id: 'report-markers-label',
        type: 'symbol',
        source: 'report-markers-geojson',
        filter: ['all', ['!=', ['get', 'i'], 0], ['!=', ['get', 'type'], 'trem'], ['!=', ['get', 'type'], 'trem-station']],
        layout: {
            'text-field': ['to-string', ['get', 'i']],
            'text-size': 12,
            'text-allow-overlap': true
        },
        paint: {
            'text-color': [
                'step', ['get', 'i'],
                '#ffffff',
                4, '#000000',
                7, '#ffffff'
            ]
        }
    });

    // 震央
    map.addLayer({
        id: 'report-markers-cross',
        type: 'symbol',
        source: 'report-markers-geojson',
        filter: ['all', ['==', ['get', 'i'], 0], ['!=', ['get', 'type'], 'trem'], ['!=', ['get', 'type'], 'trem-station']],
        layout: {
            'symbol-sort-key': ['get', 'i'],
            'symbol-z-order': 'source',
            'icon-image': 'cross',
            'icon-size': [
                'interpolate',
                ['linear'],
                ['zoom'],
                5, 0.01,
                10, 0.09,
            ],
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
        },
    });

    // TREM EEW 震央
    map.addLayer({
        id: 'report-markers-trem',
        type: 'symbol',
        source: 'report-markers-geojson',
        filter: ['==', ['get', 'type'], 'trem'],
        layout: {
            'icon-image': 'cross-blue',
            'icon-size': [
                'interpolate',
                ['linear'],
                ['zoom'],
                5, 0.01,
                10, 0.09,
            ],
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            'visibility': 'none',
        },
    });

    // TREM 測站
    map.addLayer({
        id: 'report-markers-trem-station',
        type: 'circle',
        source: 'report-markers-geojson',
        filter: ['==', ['get', 'type'], 'trem-station'],
        layout: {
            'visibility': 'none',
        },
        paint: {
            'circle-radius': [
                'interpolate', ['linear'], ['zoom'],
                5, 8,
                10, 14
            ],
            'circle-color': [
                'step', ['get', 'int'],
                '#202020',
                1, '#003264',
                2, '#0064c8',
                3, '#1e9632',
                4, '#ffc800',
                5, '#ff9600',
                6, '#ff6400',
                7, '#ff0000',
                8, '#c00000',
                9, '#9600c8'
            ],
            'circle-stroke-width': 1,
            'circle-stroke-color': '#000000',
        }
    });

    map.addLayer({
        id: 'report-markers-trem-station-label',
        type: 'symbol',
        source: 'report-markers-geojson',
        filter: ['==', ['get', 'type'], 'trem-station'],
        layout: {
            'text-field': ['to-string', ['get', 'int']],
            'text-size': 12,
            'text-allow-overlap': true,
            'visibility': 'none',
        },
        paint: {
            'text-color': [
                'step', ['get', 'int'],
                '#ffffff',
                4, '#000000',
                7, '#ffffff'
            ]
        }
    });

    // Popup 相關事件
    const createPopup = (e, content) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        return new maplibregl.Popup({ closeOnClick: false, offset: 25 })
            .setLngLat(coordinates)
            .setHTML(content)
            .addTo(map);
    };

    const formatTime = (ts) => {
        if (!ts) return '未知';
        const d = new Date(ts);
        return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
    };

    // 點擊事件
    map.on('click', 'report-markers', (e) => {
        const p = e.features[0].properties;
        if (reportMarkersPopup) {
            reportMarkersPopup.remove();
        }
        reportMarkersPopup = createPopup(e, `<div style="color: #fff;"><b>${p.city || ''} ${p.town || ''}</b><br>震度: ${p.i}<br>距離CWA震央: ${p.dist}km</div>`);
    });

    map.on('click', 'report-markers-cross', (e) => {
        const p = e.features[0].properties;
        map.flyTo({ center: [p.lon, p.lat], zoom: 7.5 });
        if (crossMarkersPopup) {
            crossMarkersPopup.remove();
        }
        crossMarkersPopup = createPopup(e, `<div style="color: #fff;"><b>震央資訊</b><br>位置: ${p.loc}<br>規模: M${p.mag || 0}<br>深度: ${p.depth || 0}km<br>時間: ${formatTime(p.time)}</div>`);
    });

    map.on('click', 'report-markers-trem', (e) => {
        const coords = e.features[0].geometry.coordinates;
        const features = e.features.filter(f => f.geometry.coordinates[0] === coords[0] && f.geometry.coordinates[1] === coords[1]);
        let content = '';
        features.forEach((feature, index) => {
            const p = feature.properties;
            const borderStyle = index < features.length - 1 ? 'border-bottom: 1px solid #555; padding-bottom: 5px; margin-bottom: 5px;' : '';
            content += `
            <div style="color: #fff; ${borderStyle}">
                <b>TREM ${p.detail} (第 ${p.number} 報${p.final ? " (最終報)" : ""})</b><br>
                時間: ${formatTime(p.time)}<br>
                規模: M${p.mag || 0}<br>
                深度: ${p.depth || 0}km<br>
                預估最大震度: ${p.max}<br>
                RTS: ${p.rts}<br>
                距離CWA震央: ${p.dist}km<br>
                觸發: ${p.trigger}站<br>
                警報狀態: ${p.status}<br>
                原因: ${p.reason}<br>
                震央地名: ${p.loc}<br>
                檢知經過秒數: ${p.after_time}秒<br>
                震後秒數: ${p.after_eq_time}秒<br>
            </div>`;
        });
        if (tremMarkersPopup) {
            tremMarkersPopup.remove();
        }
        tremMarkersPopup = createPopup(e, content);
    });

    map.on('click', 'report-markers-trem-station', (e) => {
        const coords = e.features[0].geometry.coordinates;
        const features = e.features.filter(f => f.geometry.coordinates[0] === coords[0] && f.geometry.coordinates[1] === coords[1]);
        let content = '';
        features.forEach((feature, index) => {
            const p = feature.properties;
            const borderStyle = index < features.length - 1 ? 'border-bottom: 1px solid #555; padding-bottom: 5px; margin-bottom: 5px;' : '';
            content += `
            <div style="color: #fff; ${borderStyle}">
                <b>${p.city} ${p.town}</b><br>
                ID: ${p.id}<br>
                型號: ${p.net}<br>
                震度: ${p.int}<br>
                計測震度: ${p.i}<br>
                PGA: ${p.pga} gal<br>
                PGV: ${p.pgv} kine<br>
                lpgm: ${p.lpgm}<br>
                距離CWA震央: ${p.dist}km
            </div>`;
        });
        if (tremStationPopup) {
            tremStationPopup.remove();
        }
        tremStationPopup = createPopup(e, content);
    });

    ['report-markers', 'report-markers-cross', 'report-markers-trem', 'report-markers-trem-station'].forEach(layer => {
        map.on('mouseenter', layer, () => map.getCanvas().style.cursor = 'pointer');
        map.on('mouseleave', layer, () => map.getCanvas().style.cursor = '');
    });
});

window.intensity_float_to_int = (float) => {
    return float < 0 ? 0 : float < 4.5 ? Math.round(float) : float < 5 ? 5 : float < 5.5 ? 6 : float < 6 ? 7 : float < 6.5 ? 8 : 9;
}

// 暴露給外部使用的函數
window.showReportPoint = (data, autoCenter = true) => {
    if (!data || !map.getSource('report-markers-geojson')) {
        return;
    }

    if (reportMarkersPopup) reportMarkersPopup.remove();
    if (crossMarkersPopup) crossMarkersPopup.remove();
    if (tremMarkersPopup) tremMarkersPopup.remove();
    if (tremStationPopup) tremStationPopup.remove();

    const twoPointDistance = ({ lat: lat1, lon: lon1 }, { lat: lat2, lon: lon2 }) => (((lat1 - lat2) * 111) ** 2 + ((lon1 - lon2) * 101) ** 2) ** 0.5;
    const center = { lat: data.lat, lon: data.lon };
    const intensity_list = [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5弱",
        "5強",
        "6弱",
        "6強",
        "7",
    ];
    const reason_list = {1: "EEW 預測震央 發生變化", 2: "EEW 預測規模 發生變化", 3: "由於使用 NSSPE 方法進行的 預測震度 發生變化", 4: "釋出 最終報", 5: "釋出 取消報"};
    const int_to_intensity = (int) => {
        return intensity_list[int];
    };

    const dataList = [];

    // 處理震度分佈 (data.list 結構: city -> town -> info)
    if (data.list) {
        for (const city of Object.keys(data.list)) {
            for (const town of Object.keys(data.list[city].town)) {
                const info = data.list[city].town[town];
                let dist = 0;
                if (data.lat && data.lon) {
                    dist = twoPointDistance(center, { lat: info.lat, lon: info.lon }).toFixed(2);
                }
                dataList.push({
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: [info.lon, info.lat] },
                    properties: {
                        type: 'town',
                        i: info.int,
                        city: city,
                        town: town,
                        dist: dist
                    },
                });
            }
        }
    }

    // 處理震央
    if (data.lon && data.lat) {
        dataList.push({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [data.lon, data.lat] },
            properties: {
                type: 'epicenter',
                i: 0,
                loc: data.loc,
                mag: data.mag,
                depth: data.depth,
                time: data.time,
                lon: data.lon,
                lat: data.lat,
            },
        });
        if (autoCenter) {
            map.flyTo({ center: [data.lon, data.lat], zoom: 7.5 });
        }
    }

    // 處理 TREM EEW 震央
    if (Array.isArray(data.trem_eew)) {
        let number = 1;
        data.trem_eew.forEach((trem_eew) => {
            const eew = trem_eew.eq;
            if (eew.lon && eew.lat) {
                let dist = 0;
                if (data.lat && data.lon) {
                    dist = twoPointDistance(center, { lat: eew.lat, lon: eew.lon }).toFixed(2);
                }
                dataList.push({
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: [eew.lon, eew.lat] },
                    properties: {
                        type: 'trem',
                        mag: eew.mag.toFixed(1),
                        depth: eew.depth,
                        time: eew.time,
                        dist: dist,
                        number: number,
                        final: trem_eew.final,
                        trigger: trem_eew.trigger,
                        detail: !trem_eew.detail ? "NSSPE" : "EEW",
                        rts: trem_eew.rts ? "有" : "無",
                        max: eew.max ? int_to_intensity(eew.max) : "不明",
                        status: trem_eew.status == 1 ? "有" : "無",
                        reason: reason_list[trem_eew.reason] || "不明",
                        loc: eew.loc,
                        lon: eew.lon,
                        lat: eew.lat,
                        after_eq_time: eew ? Math.round((trem_eew.time - eew.time) / 1000): "未知",
                        after_time: Math.round((trem_eew.time - Number(data.trem)) / 1000) > 0 ? Math.round((trem_eew.time - Number(data.trem)) / 1000) : 0,
                    },
                });
                number++;
            };
        });
    }

    // 處理 TREM 測站
    if (data.trem_stations && Array.isArray(data.trem_stations)) {
        data.trem_stations.forEach(station => {
            if (station.lat && station.lon) {
                let dist = 0;
                if (data.lat && data.lon) {
                    dist = twoPointDistance(center, { lat: station.lat, lon: station.lon }).toFixed(2);
                }
                station.int = window.intensity_float_to_int(station.i);
                dataList.push({
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: [station.lon, station.lat] },
                    properties: {
                        type: 'trem-station',
                        i: station.i,
                        int: station.int,
                        id: station.id,
                        name: station.name,
                        pga: station.pga,
                        pgv: station.pgv,
                        lpgm: station.lpgm,
                        dist: dist,
                        city: station.loc.city,
                        town: station.loc.town,
                        net: station.net,
                    },
                });
            }
        });
    }

    map.getSource('report-markers-geojson').setData({
        type: 'FeatureCollection',
        features: dataList,
    });
}