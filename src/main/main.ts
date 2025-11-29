import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import { FileSystemService } from "./services/FileSystemService";
import { TaskService } from "./services/TaskService";
import { LoggerService } from "./services/LoggerService";
import { SchedulerService } from "./services/SchedulerService";
import { NotificationService } from "./services/NotificationService";
import { JiraService } from "./services/JiraService";
import { GitHubService } from "./services/GitHubService";
import { EncryptionService } from "./services/EncryptionService";
import { setupIpcHandlers } from "./ipc/handlers";

let mainWindow: BrowserWindow | null = null;

// Initialize services
const dataDir = path.join(app.getPath("userData"), "data");
const logsDir = path.join(app.getPath("userData"), "logs");
const configDir = path.join(app.getPath("userData"), "config");

const fileSystemService = new FileSystemService(dataDir, configDir);
const loggerService = new LoggerService(logsDir);
const encryptionService = new EncryptionService();
const taskService = new TaskService(fileSystemService, loggerService);
const notificationService = new NotificationService(mainWindow);
const jiraService = new JiraService(encryptionService, configDir);
const githubService = new GitHubService(
  encryptionService,
  configDir,
  dataDir,
  logsDir
);
const schedulerService = new SchedulerService(
  taskService,
  notificationService,
  jiraService,
  githubService,
  loggerService
);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Update notification service with window reference
  notificationService.setWindow(mainWindow);

  // Load the app
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    // When compiled, __dirname is dist/main/main; renderer is at dist/renderer
    mainWindow.loadFile(path.join(__dirname, "../../renderer/index.html"));
  }

  mainWindow.on("ready-to-show", () => {
    console.log("[Main] BrowserWindow ready-to-show.");
  });

  mainWindow.webContents.on("did-finish-load", () => {
    console.log("[Main] Renderer finished load.");
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  console.log("[Main] App ready. Initializing services and window...");

  // Request notification permissions on macOS
  if (process.platform === "darwin") {
    const { systemPreferences } = require("electron");
    const status = systemPreferences.getMediaAccessStatus("screen");
    console.log("[Main] Notification permission status:", status);
  }

  // Initialize services
  fileSystemService.initialize();
  loggerService.initialize();

  // Setup IPC handlers
  setupIpcHandlers({
    taskService,
    loggerService,
    jiraService,
    githubService,
    schedulerService,
    notificationService,
  });

  // Start scheduler
  schedulerService.start();

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  schedulerService.stop();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("quit", () => {
  schedulerService.stop();
});
