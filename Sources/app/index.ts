import document from "document";
import * as util from "./simple/utils";
import * as font from "./simple/font";
// Display & AOD
import * as simpleDisplay from "./simple/display";

// Simpl activities
import * as simpleActivities from "simple-fitbit-activities";
import { ActivitySymbol } from "./simple/activity-symbol";

// import clock from "clock";
import * as simpleMinutes from "./simple/clock-strings";

// Device form screen detection
import { me as device } from "device";

// Elements for style
const _container = document.getElementById("container") as GraphicsElement;
const _background = document.getElementById("background") as RectElement;
const _batteryBackground = document.getElementById("battery-bar-background") as GradientArcElement;

// Date
const _datesContainer = document.getElementById("date-container") as GraphicsElement
const _dates1Container = document.getElementById("date1-container") as GraphicsElement;
const _dates1 = _dates1Container.getElementsByTagName("image") as ImageElement[];
const _dates2Container = document.getElementById("date2-container") as GraphicsElement;
const _dates2 = _dates2Container.getElementsByTagName("image") as ImageElement[];

// Hours
const _clocksContainer = document.getElementById("clock-container") as GraphicsElement;
const _clocks = _clocksContainer.getElementsByTagName("image") as ImageElement[];
const _cloksHours = _clocks.slice(0, 2);
const _cloksMinutes = _clocks.slice(3, 5);

// Battery
const _batteryValueContainer = document.getElementById("battery-bar-container") as GraphicsElement;
const _batteryBar = document.getElementById("battery-bar-value") as GradientRectElement;
const _batteryTextContainer = document.getElementById("battery-container") as GraphicsElement;
const _batteries = document.getElementById("battery-text").getElementsByTagName("image");

// Stats
const _statcontainer = document.getElementById("stats-container") as GraphicsElement;

const _stepsContainer = document.getElementById("steps-container") as GraphicsElement;
const _calsContainer = document.getElementById("cals-container") as GraphicsElement;
const _amContainer = document.getElementById("am-container") as GraphicsElement;
const _distContainer = document.getElementById("dist-container") as GraphicsElement;
const _elevationContainer = document.getElementById("elevation-container") as GraphicsElement;

const _steps = new ActivitySymbol(document.getElementById("steps") as GraphicsElement, _background);
const _calories = new ActivitySymbol(document.getElementById("calories") as GraphicsElement, _background);
const _activesMinutes = new ActivitySymbol(document.getElementById("activesminutes") as GraphicsElement, _background);
const _distance = new ActivitySymbol(document.getElementById("distance") as GraphicsElement, _background);
const _elevation = new ActivitySymbol(document.getElementById("elevation") as GraphicsElement, _background);

const _stepsTexts = _stepsContainer.getElementsByClassName("stats-text-container")[0].getElementsByTagName("image");
const _caloriesTexts = _calsContainer.getElementsByClassName("stats-text-container")[0].getElementsByTagName("image");
const _activesMinutesTexts = _amContainer.getElementsByClassName("stats-text-container")[0].getElementsByTagName("image");
const _distanceTexts = _distContainer.getElementsByClassName("stats-text-container")[0].getElementsByTagName("image");
const _elevationTexts = _elevationContainer.getElementsByClassName("stats-text-container")[0].getElementsByTagName("image");

// Heart rate management
const _hrmContainer = document.getElementById("hrm-container") as GroupElement;
const _iconHRM = document.getElementById("iconHRM") as GraphicsElement;
const _imgHRM = document.getElementById("icon") as ImageElement;
const _hrmTexts = document.getElementById("hrm-text-container").getElementsByTagName("image") as ImageElement[];

import { Settings } from "../common/settings";
// Current settings
const _settings = new Settings();
// --------------------------------------------------------------------------------
// Clock
// --------------------------------------------------------------------------------
// Update the clock every seconds
simpleMinutes.initialize("seconds", (clock) => {
  const folder: font.folder = simpleDisplay.isInAodMode()
    ? "chars-aod"
    : "chars";

  // Hours
  if (clock.Hours) {
    font.print(clock.Hours, _cloksHours, folder);
  }

  // Minutes
  if (clock.Minutes) {
    font.print(clock.Minutes, _cloksMinutes, folder);
  }

  // Date 1
  if (clock.Date1 !== undefined) {
    // Position
    _dates1Container.x = (device.screen.width) - (clock.Date1.length * 20);
    // Values
    font.print(clock.Date1, _dates1);
  }

  // Date 2
  if (clock.Date2 !== undefined) {
    // Position
    _dates2Container.x = (device.screen.width) - (clock.Date2.length * 20);
    // Values
    font.print(clock.Date2, _dates2);
  }

  // update od stats
  UpdateActivities();
});

function setHoursMinutes(folder: font.folder) {
  // Hours
  font.print(simpleMinutes.last.Hours + ":" + simpleMinutes.last.Minutes, _clocks, folder);
}

// --------------------------------------------------------------------------------
// Power
// --------------------------------------------------------------------------------
import * as batterySimple from "./simple/battery";

// Method to update battery level informations
batterySimple.initialize((battery) => {
  let batteryString = battery.toString() + "%";
  // Battery text
  font.print(batteryString, _batteries);
  // Battery bar
  _batteryBar.width = Math.floor(battery) * device.screen.width / 100;
});

// --------------------------------------------------------------------------------
// Activity
// --------------------------------------------------------------------------------

// Init
simpleActivities.initialize(UpdateActivities);

// Elevation is available
if (!simpleActivities.elevationIsAvailable()) {
  util.hide(_elevationContainer);
  _statcontainer.y = 36;
}

// Update Activities informations
function UpdateActivities() {
  // Get activities
  const activities = simpleActivities.getNewValues();

  // Steps
  UpdateActivity(activities.steps, _steps, _stepsTexts);

  // Calories
  UpdateActivity(activities.calories, _calories, _caloriesTexts);

  // Active minutes
  UpdateActivity(activities.activeZoneMinutes, _activesMinutes, _activesMinutesTexts);

  // Disance
  UpdateActivity(activities.distance, _distance, _distanceTexts);

  // Elevation
  if (simpleActivities.elevationIsAvailable()) {
    UpdateActivity(activities.elevationGain, _elevation, _elevationTexts);
  }
}

function refreshActivitiesColors() {
  _steps.refresh();
  _calories.refresh();
  _activesMinutes.refresh();
  _distance.refresh();
  _elevation.refresh();
}

function UpdateActivity(activity: simpleActivities.Activity, symbol: ActivitySymbol, texts: ImageElement[]): void {
  if (activity === undefined) return;
  // Symbol
  symbol.set(activity);

  // Text
  font.print(activity.actual.toString(), texts);
}

// --------------------------------------------------------------------------------
// Heart rate manager
// --------------------------------------------------------------------------------
import * as simpleHRM from "./simple/hrm";
let lastBpm: number;

simpleHRM.initialize((newValue, bpm, zone, restingHeartRate) => {
  // Zones
  if (zone === "out-of-range") {
    _imgHRM.href = "images/stat_hr_open_48px.png";
  } else {
    _imgHRM.href = "images/stat_hr_solid_48px.png";
  }

  // Animation
  if (newValue) {
    _iconHRM.animate("highlight");
  }

  // BPM value display
  if (bpm !== lastBpm) {
    if (bpm > 0) {
      _hrmContainer.style.display = "inline";
      font.print(bpm.toString(), _hrmTexts);
    } else {
      _hrmContainer.style.display = "none";
    }
  }
});

// --------------------------------------------------------------------------------
// Settings
// --------------------------------------------------------------------------------
import * as simpleSettings from "simple-fitbit-settings/app";

simpleSettings.initialize(
  _settings,
  (settings: Settings) => {
    if (!settings) {
      return;
    }

    if (settings.showBatteryPourcentage !== undefined) {
      _batteryTextContainer.style.display = settings.showBatteryPourcentage
        ? "inline"
        : "none";
    }

    if (settings.showBatteryBar !== undefined) {
      _batteryValueContainer.style.display = settings.showBatteryBar
        ? "inline"
        : "none";
    }

    if (settings.colorBackground !== undefined) {
      _background.style.fill = settings.colorBackground;
      _batteryBackground.gradient.colors.c2 = settings.colorBackground;
      refreshActivitiesColors(); // For achivement color
    }

    if (settings.colorForeground !== undefined) {
      _container.style.fill = settings.colorForeground;
    }

    // Display based on 12H or 24H format
    if (settings.clockDisplay24 !== undefined) {
      simpleMinutes.updateClockDisplay24(settings.clockDisplay24);
    }
  });
// --------------------------------------------------------------------------------
// Allway On Display
// --------------------------------------------------------------------------------
simpleDisplay.initialize(onEnteredAOD, onLeavedAOD, onDisplayGoOn);

function onEnteredAOD() {
  // Stop sensors
  simpleHRM.stop();

  // Clock
  setHoursMinutes("chars-aod");

  // Clock position
  // 50%-75
  _clocksContainer.x = (device.screen.width - 150) / 2;

  // Hide elements
  _background.style.display = "none";
  _datesContainer.style.display = "none";
  _batteryTextContainer.style.display = "none";
  _batteryValueContainer.style.display = "none";
  _statcontainer.style.display = "none";
  _hrmContainer.style.display = "none";
}

function onLeavedAOD() {
  // Clock
  setHoursMinutes("chars");
  // Show elements & start sensors
  _background.style.display = "inline";
  if (_settings.showBatteryPourcentage) _batteryTextContainer.style.display = "inline";
  if (_settings.showBatteryBar) _batteryValueContainer.style.display = "inline";
  _datesContainer.style.display = "inline";
  _statcontainer.style.display = "inline";
  _hrmContainer.style.display = "inline";

  // 100%-150
  _clocksContainer.x = device.screen.width - 150;

  // Start sensors
  simpleHRM.start();
}

function onDisplayGoOn() {
  _steps.onDiplayGoOn();
  _calories.onDiplayGoOn();
  _activesMinutes.onDiplayGoOn();
  _distance.onDiplayGoOn();
  _elevation.onDiplayGoOn();
}