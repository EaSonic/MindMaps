const STORAGE_KEY = "home-surveillance:v1";
const REQUEST_DOMAIN = "meeting-rtc.ctcdn.cn";
const TOKEN_ALGORITHM = "CTRTC1-MD5";
const RTC_INTERNAL_PARAM = "Hj6XuurWY4JhMP6";
const DEFAULT_GUARD_CONFIG = {
  mode: "camera",
  room: "senlan-1901",
  uid: "living-room",
  displayName: "Living Room Camera",
};

const els = {
  joinForm: document.querySelector("#join-form"),
  joinBtn: document.querySelector("#join-btn"),
  leaveBtn: document.querySelector("#leave-btn"),
  clearLogBtn: document.querySelector("#clear-log-btn"),
  mode: document.querySelector("#mode"),
  room: document.querySelector("#room"),
  uid: document.querySelector("#uid"),
  displayName: document.querySelector("#displayName"),
  statusPill: document.querySelector("#status-pill"),
  statusText: document.querySelector("#status-text"),
  roomChip: document.querySelector("#room-chip"),
  modeChip: document.querySelector("#mode-chip"),
  localRole: document.querySelector("#local-role"),
  localPlayer: document.querySelector("#local-player"),
  remoteGrid: document.querySelector("#remote-grid"),
  remoteCount: document.querySelector("#remote-count"),
  log: document.querySelector("#log"),
};

const state = {
  client: null,
  joined: false,
  localVideoTrack: null,
  remoteTiles: new Map(),
};

window.__surveillanceAutomation = {
  joined: false,
  published: false,
  lastError: "",
  lastEvent: "idle",
  statusText: "",
  defaults: { ...DEFAULT_GUARD_CONFIG },
};

CTRTC.setRequestDomain(REQUEST_DOMAIN);

const client = CTRTC.createClient({
  mode: "ctrtc",
  codec: "h264",
  appScene: 3,
  role: "host",
});

bindEvents();
restoreForm();
setStatus("idle", "Ready to join.");
writeLog("Page ready.");

function bindEvents() {
  els.joinForm.addEventListener("submit", onJoinSubmit);
  els.leaveBtn.addEventListener("click", leaveRoom);
  els.clearLogBtn.addEventListener("click", () => {
    els.log.textContent = "";
  });
}

async function onJoinSubmit(event) {
  event.preventDefault();

  const form = readForm();
  await joinWithForm(form);
}

async function joinWithForm(form) {
  clearAutomationError();

  if (state.joined) {
    return { ok: true, alreadyJoined: true };
  }

  if (!form.room || !form.uid) {
    setStatus("error", "Room name and user name are required.");
    window.__surveillanceAutomation.lastError = "Room name and user name are required.";
    return { ok: false, reason: "missing-fields" };
  }

  if (!/^[^\u4e00-\u9fa5&? ]+$/.test(form.uid)) {
    setStatus("error", 'User name cannot contain spaces, Chinese characters, "&", or "?".');
    window.__surveillanceAutomation.lastError =
      'User name cannot contain spaces, Chinese characters, "&", or "?".';
    return { ok: false, reason: "invalid-uid" };
  }

  persistForm(form);
  toggleControls(true);
  setStatus("idle", "Joining room...");
  writeLog(`Joining room ${form.room} as ${labelMode(form.mode)}.`);

  try {
    const rtcAuth = buildRtcToken(form.uid, form.room);

    attachClientEvents();
    const joinResult = await client.join(
      form.room,
      form.uid,
      rtcAuth.token,
      null,
      JSON.stringify(buildUserProps(form)),
      rtcAuth.tokenParam,
      "host",
    );

    state.joined = true;
    state.client = client;
    window.__surveillanceAutomation.joined = true;
    window.__surveillanceAutomation.lastEvent = "joined";
    els.roomChip.textContent = form.room;
    els.modeChip.textContent = labelMode(form.mode);
    toggleControls(false);

    writeLog(`Join successful. Current uid: ${joinResult || client.uid}`);

    if (form.mode === "camera") {
      await publishCamera(form);
    } else {
      resetLocalPreview();
      els.localRole.textContent = "Viewer Side";
      setStatus("live", "Joined successfully. Waiting for remote video.");
    }

    await autoSubscribeExistingUsers();
    return { ok: true, uid: joinResult || client.uid };
  } catch (error) {
    writeLog(`Join failed: ${formatError(error)}`);
    setStatus("error", `Join failed: ${formatError(error)}`);
    window.__surveillanceAutomation.lastError = formatError(error);
    window.__surveillanceAutomation.lastEvent = "join-error";
    await safeLeave();
    detachClientEvents();
    toggleControls(false);
    return { ok: false, reason: "join-failed", error: formatError(error) };
  }
}

function attachClientEvents() {
  client.on("user-joined", handleUserJoined);
  client.on("user-left", handleUserLeft);
  client.on("user-published", handleUserPublished);
  client.on("user-unpublished", handleUserUnpublished);
  client.on("user-all-streams-removed", handleUserAllStreamsRemoved);
  client.on("error", handleError);
  client.on("offline", handleOffline);
}

function detachClientEvents() {
  client.off("user-joined");
  client.off("user-left");
  client.off("user-published");
  client.off("user-unpublished");
  client.off("user-all-streams-removed");
  client.off("error");
  client.off("offline");
}

async function publishCamera(form) {
  state.localVideoTrack = await CTRTC.createCameraVideoTrack({
    encoderConfig: isMobile() ? "360p" : "720p",
  });

  clearElement(els.localPlayer);
  els.localPlayer.classList.remove("empty");
  state.localVideoTrack.play("local-player");
  els.localRole.textContent = "Guard Side";
  writeLog("Local camera opened. Microphone remains off.");

  await client.publish(state.localVideoTrack);
  window.__surveillanceAutomation.published = true;
  window.__surveillanceAutomation.lastEvent = "published";
  setStatus("live", "Video published. Remote viewers can watch now.");
  writeLog("Local video published.");
}

async function autoSubscribeExistingUsers() {
  if (!client.remoteUsers || client.remoteUsers.length === 0) {
    syncRemoteCount();
    return;
  }

  for (const user of client.remoteUsers) {
    if (user.hasVideo || user.hasScreenVideo || user.hasVideoLow) {
      await subscribeToVideo(user);
    }
  }
}

async function leaveRoom() {
  toggleControls(true);
  setStatus("idle", "Leaving room...");
  writeLog("Leaving room.");

  try {
    await safeLeave();
    writeLog("Left room.");
    setStatus("idle", "Left room.");
  } catch (error) {
    writeLog(`Leave error: ${formatError(error)}`);
    setStatus("error", `Leave error: ${formatError(error)}`);
  } finally {
    cleanupAfterLeave();
    toggleControls(false);
  }
}

async function safeLeave() {
  if (state.localVideoTrack) {
    try {
      await client.unpublish(state.localVideoTrack);
    } catch (error) {
      writeLog(`Ignored unpublish error: ${formatError(error)}`);
    }
  }

  destroyLocalTrack();

  if (state.joined) {
    await client.leave();
  }
}

function cleanupAfterLeave() {
  state.joined = false;
  state.client = null;
  window.__surveillanceAutomation.joined = false;
  window.__surveillanceAutomation.published = false;
  window.__surveillanceAutomation.lastEvent = "left";
  destroyLocalTrack();
  detachClientEvents();
  resetLocalPreview();
  clearRemoteTiles();
  els.roomChip.textContent = "Not joined";
  els.modeChip.textContent = "No mode";
  els.localRole.textContent = "Inactive";
}

function destroyLocalTrack() {
  if (!state.localVideoTrack) {
    return;
  }

  state.localVideoTrack.stop();
  state.localVideoTrack.close();
  state.localVideoTrack = null;
}

function resetLocalPreview() {
  clearElement(els.localPlayer);
  els.localPlayer.classList.add("empty");
  els.localPlayer.innerHTML =
    '<span class="placeholder">The local camera preview appears here after Guard Side joins.</span>';
}

async function handleUserJoined(user) {
  writeLog(`Remote user joined: ${user.uid}`);
  syncRemoteCount();
}

async function handleUserLeft(user) {
  writeLog(`Remote user left: ${user.uid}`);
  removeRemoteTile(user.uid);
}

async function handleUserPublished(user, mediaType) {
  writeLog(`Remote user published ${mediaType}: ${user.uid}`);

  if (mediaType === "video" || mediaType === "screen" || mediaType === "videoLow") {
    await subscribeToVideo(user, mediaType);
  }
}

async function handleUserUnpublished(user, mediaType) {
  writeLog(`Remote user unpublished ${mediaType}: ${user.uid}`);

  if (mediaType === "video" || mediaType === "screen" || mediaType === "videoLow") {
    removeRemoteTile(user.uid);
  }
}

function handleUserAllStreamsRemoved(user) {
  writeLog(`All remote streams removed: ${user.uid}`);
  removeRemoteTile(user.uid);
}

function handleError(code, message) {
  writeLog(`SDK error ${code}: ${message}`);
  window.__surveillanceAutomation.lastError = `${code}: ${message}`;
  window.__surveillanceAutomation.lastEvent = "sdk-error";
  setStatus("error", `SDK error: ${code}`);
}

function handleOffline() {
  writeLog("SDK offline event triggered.");
  window.__surveillanceAutomation.lastError = "Connection interrupted.";
  window.__surveillanceAutomation.lastEvent = "offline";
  setStatus("error", "Connection interrupted. Please rejoin.");
}

async function subscribeToVideo(user, preferredType) {
  const mediaType =
    preferredType ||
    (user.hasScreenVideo ? "screen" : user.hasVideo ? "video" : user.hasVideoLow ? "videoLow" : null);

  if (!mediaType) {
    return;
  }

  await client.subscribe(user, mediaType);
  upsertRemoteTile(user.uid);

  const track =
    mediaType === "screen"
      ? user.screenVideoTrack
      : mediaType === "videoLow"
        ? user.videoLowTrack
        : user.videoTrack;

  if (!track) {
    writeLog(`Remote user ${user.uid} has no playable video track.`);
    return;
  }

  const tile = upsertRemoteTile(user.uid);
  const playerHost = tile.querySelector(".remote-player-host");
  track.play(playerHost, { fit: "contain" });
  syncRemoteCount();
  setStatus("live", "Receiving remote video.");
}

function upsertRemoteTile(uid) {
  let tile = state.remoteTiles.get(uid);

  if (!tile) {
    if (els.remoteGrid.querySelector(".remote-empty")) {
      els.remoteGrid.innerHTML = "";
    }

    tile = document.createElement("article");
    tile.className = "remote-tile";
    const player = document.createElement("div");
    player.id = remotePlayerId(uid);
    player.className = "remote-player-host";
    const label = document.createElement("span");
    label.className = "tile-label";
    label.textContent = uid;
    tile.appendChild(player);
    tile.appendChild(label);
    els.remoteGrid.appendChild(tile);
    state.remoteTiles.set(uid, tile);
  }

  return tile;
}

function removeRemoteTile(uid) {
  const tile = state.remoteTiles.get(uid);
  if (tile) {
    tile.remove();
    state.remoteTiles.delete(uid);
  }

  if (state.remoteTiles.size === 0) {
    els.remoteGrid.innerHTML =
      '<div class="remote-empty">Remote video will appear here after a publisher joins.</div>';
  }

  syncRemoteCount();
}

function clearRemoteTiles() {
  for (const tile of state.remoteTiles.values()) {
    tile.remove();
  }
  state.remoteTiles.clear();
  els.remoteGrid.innerHTML =
    '<div class="remote-empty">Remote video will appear here after a publisher joins.</div>';
  syncRemoteCount();
}

function syncRemoteCount() {
  els.remoteCount.textContent = `${state.remoteTiles.size} streams`;
}

function setStatus(kind, text) {
  els.statusPill.className = `status-pill ${kind}`;
  els.statusPill.textContent = kind === "live" ? "Live" : kind === "error" ? "Error" : "Idle";
  els.statusText.textContent = text;
  window.__surveillanceAutomation.statusText = text;
}

function toggleControls(busy) {
  els.joinBtn.disabled = busy || state.joined;
  els.leaveBtn.disabled = busy || !state.joined;
  for (const field of [els.mode, els.room, els.uid, els.displayName]) {
    field.disabled = busy || state.joined;
  }
}

function readForm() {
  return {
    mode: els.mode.value,
    room: els.room.value.trim(),
    uid: els.uid.value.trim(),
    displayName: els.displayName.value.trim(),
  };
}

function persistForm(form) {
  const persistable = {
    mode: form.mode,
    room: form.room,
    uid: form.uid,
    displayName: form.displayName,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
}

function restoreForm() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    applyDefaultGuardConfig();
    return;
  }

  try {
    const parsed = JSON.parse(saved);
    els.mode.value = parsed.mode || DEFAULT_GUARD_CONFIG.mode;
    els.room.value = parsed.room || DEFAULT_GUARD_CONFIG.room;
    els.uid.value = parsed.uid || DEFAULT_GUARD_CONFIG.uid;
    els.displayName.value = parsed.displayName || DEFAULT_GUARD_CONFIG.displayName;
  } catch (error) {
    writeLog(`Failed to restore saved form state: ${formatError(error)}`);
    applyDefaultGuardConfig();
  }
}

function buildRtcToken(uid, roomId) {
  if (!uid) {
    throw new Error("uid not exist");
  }

  if (!roomId) {
    throw new Error("roomid not exist");
  }

  const ts = Date.now();
  const token = md5(`${TOKEN_ALGORITHM}${ts}${roomId}${uid}${RTC_INTERNAL_PARAM}`);
  const tokenParam = `ts=${ts}&rid=${roomId}&uid=${uid}`;

  return {
    token,
    tokenParam,
  };
}

function buildUserProps(form) {
  return {
    oriUserId: form.uid,
    userId: form.uid,
    userName: form.displayName || form.uid,
    accountSystem: "home-patrol",
    company: "personal",
    clientType: "web",
    pt: 1,
    sys: isMobile() ? 2 : 4,
    appVersion: "demo-1.0.0",
  };
}

function labelMode(mode) {
  return mode === "camera" ? "Guard Side" : "Viewer Side";
}

function applyDefaultGuardConfig(roomOverride) {
  els.mode.value = DEFAULT_GUARD_CONFIG.mode;
  els.room.value = roomOverride || DEFAULT_GUARD_CONFIG.room;
  els.uid.value = DEFAULT_GUARD_CONFIG.uid;
  els.displayName.value = DEFAULT_GUARD_CONFIG.displayName;
}

function clearAutomationError() {
  window.__surveillanceAutomation.lastError = "";
}

window.applyDefaultGuardConfig = applyDefaultGuardConfig;
window.joinDefaultGuard = async function joinDefaultGuard(roomOverride) {
  applyDefaultGuardConfig(roomOverride);
  return joinWithForm(readForm());
};

function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function clearElement(node) {
  node.innerHTML = "";
}

function remotePlayerId(uid) {
  return `remote-player-${String(uid).replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

function writeLog(message) {
  const stamp = new Date().toLocaleTimeString("zh-CN", { hour12: false });
  els.log.textContent = `[${stamp}] ${message}\n${els.log.textContent}`.trim();
}

function formatError(error) {
  return error && error.message ? error.message : String(error);
}
