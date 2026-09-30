import { Howl, Howler } from "howler";

const MUTE_STORAGE_KEY = "lp-cyberpunk-mute";
const BASE = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/audio/cyberpunk`;
const MUSIC_SRC = `${BASE}/rebel-path.mp3`;

const HOLD_END = 53;
export const HOLD_DURATION_MS = 12000;
const HOLD_PLAY_START = Math.max(0, HOLD_END - HOLD_DURATION_MS / 1000);
const DROP_START = 54;
const MUSIC_VOLUME = 0.4;
const HOLD_VOLUME = 0.36;

type SfxName =
  | "hover"
  | "press"
  | "select"
  | "open"
  | "close"
  | "toggle-on"
  | "toggle-off"
  | "focus"
  | "forward"
  | "back"
  | "expand"
  | "collapse"
  | "connect"
  | "disconnect"
  | "notification"
  | "complete"
  | "error"
  | "scanning"
  | "connecting"
  | "streaming";

const SFX_SRC: Record<SfxName, string> = {
  hover: `${BASE}/hover.mp3`,
  press: `${BASE}/press.mp3`,
  select: `${BASE}/select.mp3`,
  open: `${BASE}/open.mp3`,
  close: `${BASE}/close.mp3`,
  "toggle-on": `${BASE}/toggle-on.mp3`,
  "toggle-off": `${BASE}/toggle-off.mp3`,
  focus: `${BASE}/focus.mp3`,
  forward: `${BASE}/forward.mp3`,
  back: `${BASE}/back.mp3`,
  expand: `${BASE}/expand.mp3`,
  collapse: `${BASE}/collapse.mp3`,
  connect: `${BASE}/connect.mp3`,
  disconnect: `${BASE}/disconnect.mp3`,
  notification: `${BASE}/notification.mp3`,
  complete: `${BASE}/complete.mp3`,
  error: `${BASE}/error.mp3`,
  scanning: `${BASE}/scanning.mp3`,
  connecting: `${BASE}/connecting.mp3`,
  streaming: `${BASE}/streaming.mp3`,
};

const VOLUME: Partial<Record<SfxName, number>> = {
  hover: 0.28,
  press: 0.42,
  select: 0.4,
  focus: 0.3,
  forward: 0.38,
  back: 0.36,
  open: 0.55,
  close: 0.5,
  "toggle-on": 0.48,
  "toggle-off": 0.45,
  expand: 0.4,
  collapse: 0.38,
  connect: 0.5,
  disconnect: 0.48,
  notification: 0.42,
  complete: 0.5,
  error: 0.55,
  scanning: 0.18,
  connecting: 0.16,
  streaming: 0.22,
};

type MusicPhase = "off" | "hold" | "drop";

class CyberpunkAudio {
  private sounds = new Map<SfxName, Howl>();
  private music: Howl | null = null;
  private musicId: number | null = null;
  private musicPhase: MusicPhase = "off";
  private initLoopId: number | null = null;
  private holdingActive = false;
  private enabled = false;
  private muted = false;
  private unlocked = false;
  private loaded = false;
  private lastPlayed = new Map<SfxName, number>();

  isMuted() {
    return this.muted;
  }

  isEnabled() {
    return this.enabled;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(MUTE_STORAGE_KEY, muted ? "1" : "0");
    }
    Howler.mute(muted);
    if (!muted && this.enabled && this.musicPhase === "drop") {
      this.startDrop();
    }
  }

  restoreMutePreference() {
    if (typeof window === "undefined") return;
    this.muted = window.sessionStorage.getItem(MUTE_STORAGE_KEY) === "1";
    Howler.mute(this.muted);
  }

  async unlock() {
    this.ensureLoaded();
    if (Howler.ctx?.state === "suspended") {
      await Howler.ctx.resume();
    }
    this.unlocked = true;
  }

  async beginAwaitingStart() {
    this.ensureLoaded();
    await this.unlock();
    this.setMuted(false);
    this.enabled = true;
    this.holdingActive = false;
    this.musicPhase = "hold";
    this.stopMusicTrack();
  }

  syncHold(progress: number, holding = false) {
    if (!this.enabled || !this.unlocked || !this.music || this.muted) return;
    if (this.musicPhase === "drop") return;

    this.musicPhase = "hold";
    const p = Math.min(1, Math.max(0, progress));

    if (holding) {
      if (!this.holdingActive) {
        this.holdingActive = true;
        this.startHoldFromZero();
      }
      if (this.musicId !== null) {
        this.music.volume(HOLD_VOLUME * Math.max(p, 0.05), this.musicId);
      }
      return;
    }

    if (this.holdingActive) {
      this.holdingActive = false;
      this.cutHold();
    }
  }

  playSystemOffline() {
    this.stopInitLoop();
    this.holdingActive = false;
    this.cutHold();
    this.musicPhase = "off";
    this.playOfflineSfx();
  }

  async confirmStart() {
    this.restoreMutePreference();
    this.ensureLoaded();
    await this.unlock();
    this.enabled = true;
    this.startDrop();
  }

  async resume() {
    this.restoreMutePreference();
    this.ensureLoaded();
    await this.unlock();
    this.enabled = true;
    if (
      this.musicPhase === "drop" &&
      this.musicId !== null &&
      this.music?.playing(this.musicId)
    ) {
      return;
    }
    this.startDrop();
  }

  disable() {
    const wasEnabled = this.enabled;
    this.enabled = false;
    this.stopInitLoop();
    if (wasEnabled) this.playShutdown();
    this.stopMusic();
  }

  hover() {
    this.play("hover", { cooldownMs: 70 });
  }

  click() {
    this.play("press");
    window.setTimeout(() => this.play("select"), 35);
  }

  nav() {
    this.play("forward");
  }

  transition(kind: "in" | "out" = "in") {
    this.play(kind === "in" ? "expand" : "collapse");
  }

  bootCue(
    kind: "tick" | "sys" | "ready" | "scan" | "link" | "reboot" | "init" = "tick",
  ) {
    if (kind === "reboot") {
      this.play("open", { force: true });
      window.setTimeout(() => this.play("connect", { force: true }), 90);
      window.setTimeout(() => this.play("toggle-on", { force: true }), 180);
      return;
    }
    if (kind === "init") {
      this.startInitLoop();
      return;
    }
    if (kind === "scan") {
      this.play("scanning", { force: true });
      return;
    }
    if (kind === "link") {
      this.play("connecting", { force: true });
      return;
    }
    if (kind === "sys") {
      this.play("forward", { force: true, cooldownMs: 55 });
      return;
    }
    if (kind === "ready") {
      this.stopInitLoop();
      if (!this.unlocked || this.muted) return;
      this.play("complete", { force: true });
      window.setTimeout(() => this.play("expand", { force: true }), 90);
      window.setTimeout(() => this.play("notification", { force: true }), 170);
      return;
    }
    this.play("focus", { force: true, cooldownMs: 50 });
  }

  stopBootAmbient() {
    this.stopInitLoop();
  }

  private playOfflineSfx() {
    if (!this.unlocked || this.muted) return;
    this.play("error", { force: true });
    window.setTimeout(() => this.play("toggle-off", { force: true }), 90);
    window.setTimeout(() => this.play("collapse", { force: true }), 180);
    window.setTimeout(() => this.play("disconnect", { force: true }), 280);
    window.setTimeout(() => this.play("close", { force: true }), 400);
    window.setTimeout(() => this.play("error", { force: true }), 520);
  }

  private play(
    name: SfxName,
    options?: { cooldownMs?: number; force?: boolean },
  ) {
    if (!this.canPlay() && !options?.force) return;
    const cooldown = options?.cooldownMs ?? 0;
    if (cooldown > 0) {
      const last = this.lastPlayed.get(name) ?? 0;
      const now = performance.now();
      if (now - last < cooldown) return;
      this.lastPlayed.set(name, now);
    }

    const sound = this.sounds.get(name);
    if (!sound) return;
    sound.volume(VOLUME[name] ?? 0.4);
    sound.play();
  }

  private canPlay() {
    return this.enabled && this.unlocked && !this.muted;
  }

  private ensureLoaded() {
    if (this.loaded || typeof window === "undefined") return;
    this.loaded = true;
    Howler.autoUnlock = true;

    (Object.keys(SFX_SRC) as SfxName[]).forEach((name) => {
      this.sounds.set(
        name,
        new Howl({
          src: [SFX_SRC[name]],
          volume: VOLUME[name] ?? 0.4,
          preload: true,
          html5: false,
          loop: false,
        }),
      );
    });

    this.music = new Howl({
      src: [MUSIC_SRC],
      volume: MUSIC_VOLUME,
      preload: true,
      html5: false,
      loop: false,
    });
  }

  private playShutdown() {
    if (!this.unlocked || this.muted) return;
    this.play("toggle-off", { force: true });
    window.setTimeout(() => this.play("disconnect", { force: true }), 70);
    window.setTimeout(() => this.play("close", { force: true }), 140);
  }

  private startInitLoop() {
    this.ensureLoaded();
    const sound = this.sounds.get("streaming");
    if (!sound || !this.unlocked || this.muted) return;
    this.stopInitLoop();
    sound.loop(true);
    sound.volume(VOLUME.streaming ?? 0.22);
    this.initLoopId = sound.play();
  }

  private stopInitLoop() {
    const sound = this.sounds.get("streaming");
    if (!sound) {
      this.initLoopId = null;
      return;
    }
    if (this.initLoopId !== null) sound.stop(this.initLoopId);
    else sound.stop();
    sound.loop(false);
    this.initLoopId = null;
  }

  private startHoldFromZero() {
    if (!this.music) return;
    this.stopMusicTrack();
    this.musicPhase = "hold";
    this.music.off("end");
    this.music.rate(1);
    this.musicId = this.music.play();
    if (this.musicId === null) return;
    this.music.seek(HOLD_PLAY_START, this.musicId);
    this.music.volume(HOLD_VOLUME * 0.05, this.musicId);
  }

  private cutHold() {
    this.stopMusicTrack();
    this.musicPhase = "hold";
  }

  private startDrop() {
    if (!this.music || !this.unlocked) return;
    this.stopInitLoop();
    this.holdingActive = false;
    this.stopMusicTrack();

    this.musicPhase = "drop";
    this.music.off("end");
    this.music.off("play");
    this.music.rate(1);
    this.music.volume(0);

    const targetVol = this.muted ? 0 : MUSIC_VOLUME;
    this.musicId = this.music.play();
    if (this.musicId === null) return;

    const id = this.musicId;
    const armDrop = () => {
      if (!this.music || this.musicPhase !== "drop" || this.musicId !== id) return;
      this.music.rate(1, id);
      this.music.seek(DROP_START, id);
      this.music.volume(0, id);
      this.music.fade(0, targetVol, 700, id);
    };

    this.music.once("play", armDrop, id);
    if (this.music.playing(id)) armDrop();

    this.music.on("end", () => {
      if (this.musicPhase !== "drop" || !this.music || !this.enabled) return;
      this.musicId = this.music.play();
      if (this.musicId === null) return;
      const loopId = this.musicId;
      this.music.rate(1, loopId);
      const armLoop = () => {
        if (!this.music || this.musicPhase !== "drop" || this.musicId !== loopId) {
          return;
        }
        this.music.seek(DROP_START, loopId);
        this.music.volume(this.muted ? 0 : MUSIC_VOLUME, loopId);
      };
      this.music.once("play", armLoop, loopId);
      if (this.music.playing(loopId)) armLoop();
    });
  }

  private stopMusicTrack() {
    if (!this.music) {
      this.musicId = null;
      return;
    }
    this.music.off("fade");
    if (this.musicId !== null) this.music.stop(this.musicId);
    else this.music.stop();
    this.musicId = null;
  }

  private stopMusic() {
    this.holdingActive = false;
    if (this.music) this.music.off("end");
    this.stopMusicTrack();
    this.musicPhase = "off";
  }
}

export const cyberpunkAudio = new CyberpunkAudio();
