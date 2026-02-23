const { ipcRenderer } = require("electron");
const path = require("path");
class Plugin {
  #ctx;
  constructor(ctx) {
    this.#ctx = ctx;
    this.name = "report-plus";

    this.refreshInterval = null;
    this.reportData = [];
  }

  init() {
    const reportButtons = document.querySelector("#focus");
    if (reportButtons) {
      const button = document.createElement("div");
      button.id = "earthquake-report";
      button.title = "詳細地震報告";
      button.className = "nav-bar-location";
      button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M320-240h320v-80H320v80Zm0-160h320v-80H320v80ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z"/></svg>`;
      reportButtons.insertAdjacentElement("afterend", button);
    }

    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    this.refreshInterval = setInterval(() => this.refresh(), 10000);
    this.refresh();
  }

  refresh() {
    const { TREM } = this.#ctx;
    const reports = TREM.variable.data.report;
    if (this.reportData != reports) {
      this.reportData = reports;
      ipcRenderer.send("send-to-plugin-window", {
        windowId: this.name,
        channel: "report-plus-data",
        payload: this.reportData,
      });
    }
  }

  addClickEvent() {
    const { TREM, Logger, info, utils } = this.#ctx;

    const event = (event, callback) => TREM.variable.events.on(event, callback);

    event("ReportRelease", (ans) => {
      this.reportData.push(ans);
      ipcRenderer.send("send-to-plugin-window", {
        windowId: this.name,
        channel: "report-plus-data",
        payload: this.reportData,
      });
    });

    const reportButton = document.querySelector("#earthquake-report");
    if (reportButton) {
      reportButton.addEventListener("click", () => {
        ipcRenderer.send("open-plugin-window", {
          pluginId: this.name,
          htmlPath: `${info.pluginDir}/report-plus/web/report.html`,
          options: {
            width: 886,
            height: 673,
            minWidth: 886,
            minHeight: 673,
            title: "詳細地震報告",
          }
        });
        setTimeout(() => {
          ipcRenderer.send("send-to-plugin-window", {
            windowId: this.name,
            channel: "report-plus-data",
            payload: this.reportData,
          });
          ipcRenderer.send("send-to-plugin-window", {
            windowId: this.name,
            channel: "report-plus-station",
            payload: TREM.variable.station,
          });
          ipcRenderer.send("send-to-plugin-window", {
            windowId: this.name,
            channel: "report-plus-region",
            payload: TREM.variable.region,
          });
        }, 1000);
      });
    }
  }

  onLoad() {
    this.init();
    this.addClickEvent();
  }
}

module.exports = Plugin;