import { useMemo, useState } from "react";
import { Lock, Play, Upload, Trash2 } from "lucide-react";

import PageCard from "../layout/PageCard.jsx";
import GameShell from "../layout/GameShell.jsx";
import { PAGE_FRAME_CLASS } from "../../config/pageFrame.js";
import {
  exampleGameModuleManifest,
  normalizeImportedGameModuleManifest,
} from "../../services/importedGameModulesService.js";
import {
  getDeveloperSession,
  isDeveloperUnlocked,
  lockDeveloperPortal,
  setStoredDeveloperCode,
  verifyDeveloperAccessCode,
} from "../../services/developerAccessService.js";
import { importableComponentKeys } from "../../config/importableGameComponents.jsx";
import { getImportableComponent } from "../../config/importableGameComponents.jsx";

export default function DeveloperPortalPage({
  importedGameModules = [],
  setImportedGameModules,
  gameModuleSettings = [],
  setGameModuleSettings,
  normalizeGameModuleSettings,
}) {
  const [unlocked, setUnlocked] = useState(() => isDeveloperUnlocked());
  const [accessCode, setAccessCode] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [newAccessCode, setNewAccessCode] = useState("");
  const [manifestText, setManifestText] = useState(
    JSON.stringify(exampleGameModuleManifest, null, 2)
  );
  const [stagedModules, setStagedModules] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState("");
  const [message, setMessage] = useState("");

  const developerSession = getDeveloperSession();

  const selectedTestModule = useMemo(
    () => stagedModules.find((module) => module.id === selectedTestId),
    [stagedModules, selectedTestId]
  );

  const TestComponent = selectedTestModule
    ? getImportableComponent(selectedTestModule.componentKey)
    : null;

  function loginDeveloper(event) {
    event.preventDefault();
    setLoginMessage("");

    if (!verifyDeveloperAccessCode(accessCode)) {
      setLoginMessage("Developer access code was not accepted.");
      return;
    }

    setAccessCode("");
    setUnlocked(true);
  }

  function changeDeveloperCode(event) {
    event.preventDefault();
    setMessage("");

    try {
      setStoredDeveloperCode(newAccessCode);
      setNewAccessCode("");
      setMessage("Developer access code updated for this browser.");
    } catch (error) {
      setMessage(error?.message || "Could not update developer access code.");
    }
  }

  function logoutDeveloper() {
    lockDeveloperPortal();
    setUnlocked(false);
  }

  function stageManifest() {
    setMessage("");

    try {
      const module = normalizeImportedGameModuleManifest(manifestText);
      const nextStagedModules = stagedModules.some((item) => item.id === module.id)
        ? stagedModules.map((item) => (item.id === module.id ? module : item))
        : [...stagedModules, module];

      setStagedModules(nextStagedModules);
      setSelectedTestId(module.id);
      setMessage("Manifest staged. Test it before publishing to Admin catalog.");
    } catch (error) {
      setMessage(error?.message || "Could not stage manifest.");
    }
  }

  function removeStagedModule(moduleId) {
    setStagedModules(stagedModules.filter((module) => module.id !== moduleId));

    if (selectedTestId === moduleId) {
      setSelectedTestId("");
    }
  }

  function publishToAdminCatalog(moduleId) {
    setMessage("");

    const module = stagedModules.find((item) => item.id === moduleId);

    if (!module) {
      setMessage("Choose a staged module first.");
      return;
    }

    const existingImported = importedGameModules.some(
      (item) => item.id === module.id
    );

    const nextImportedModules = existingImported
      ? importedGameModules.map((item) => (item.id === module.id ? module : item))
      : [...importedGameModules, module];

    setImportedGameModules(nextImportedModules);

    if (typeof setGameModuleSettings === "function" && normalizeGameModuleSettings) {
      setGameModuleSettings(
        normalizeGameModuleSettings(gameModuleSettings, nextImportedModules)
      );
    }

    setMessage(
      existingImported
        ? "Admin catalog module updated."
        : "Module published to Admin catalog."
    );
  }

  if (!unlocked) {
    return (
      <main className="min-h-screen bg-slate-950 p-4 text-white md:p-6">
        <div className="mx-auto max-w-xl">
          <header className="mb-5">
            <div className="text-sm font-bold uppercase tracking-[.25em] text-white/50">
              Private Developer Portal
            </div>
            <div className="text-3xl font-black">
              Ride Companion Developer
            </div>
          </header>

          <PageCard>
            <form onSubmit={loginDeveloper} className="grid gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-slate-100 p-3 text-slate-950">
                  <Lock />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-950">
                    Developer Login
                  </h2>
                  <p className="text-sm text-slate-500">
                    Separate from end-user Admin. Beta local gate only.
                  </p>
                </div>
              </div>

              <input
                value={accessCode}
                onChange={(event) => setAccessCode(event.target.value)}
                type="password"
                placeholder="Developer access code"
                className="rounded-2xl border border-slate-200 p-4 text-slate-950 outline-none"
              />

              <button className="rounded-2xl bg-slate-950 p-4 font-black text-white">
                Unlock Developer Portal
              </button>

              {loginMessage && (
                <div className="rounded-2xl bg-rose-100 p-3 text-sm font-bold text-rose-900">
                  {loginMessage}
                </div>
              )}

              <div className="rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-900">
                First-run beta code: RC-DEV-CHANGE-ME. Change it after unlocking.
              </div>
            </form>
          </PageCard>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-slate-950 md:p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5 flex flex-col gap-3 text-white sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-sm font-bold uppercase tracking-[.25em] text-white/50">
              Private Developer Portal
            </div>
            <div className="text-3xl font-black">
              Ride Companion Developer
            </div>
          </div>

          <button
            type="button"
            onClick={logoutDeveloper}
            className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-black text-white"
          >
            Lock Portal
          </button>
        </header>

        <div className="grid gap-5">
          <PageCard>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-950">
                  Module Staging
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Stage trusted in-house manifests, test them in the fixed game frame, then publish to Admin catalog.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-100 p-3 text-xs font-bold text-slate-600">
                Session expires:{" "}
                {developerSession?.expiresAt
                  ? new Date(developerSession.expiresAt).toLocaleTimeString()
                  : "unknown"}
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-900">
              No arbitrary remote code is executed. Manifests can only map to bundled component keys:
              <span className="ml-1 font-black">{importableComponentKeys.join(", ")}</span>.
            </div>

            <div className="mt-4 grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
              <div>
                <label className="text-sm font-black text-slate-700">
                  Manifest JSON
                </label>
                <textarea
                  value={manifestText}
                  onChange={(event) => setManifestText(event.target.value)}
                  rows={18}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-950 p-4 font-mono text-sm text-white outline-none"
                />

                <button
                  type="button"
                  onClick={stageManifest}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white"
                >
                  <Upload size={16} />
                  Stage Manifest
                </button>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-950">
                  Staged Test Area
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Select a staged module to render it inside the same game card frame used by passengers.
                </p>

                <div className="mt-3 grid gap-2">
                  {stagedModules.length === 0 ? (
                    <div className="rounded-2xl bg-slate-100 p-4 text-sm font-bold text-slate-500">
                      No staged modules yet.
                    </div>
                  ) : (
                    stagedModules.map((module) => (
                      <div
                        key={module.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <button
                            type="button"
                            onClick={() => setSelectedTestId(module.id)}
                            className="text-left"
                          >
                            <div className="font-black text-slate-950">
                              {module.fallbackTitle}
                            </div>
                            <div className="text-xs font-bold text-slate-400">
                              {module.id} · {module.componentKey}
                            </div>
                          </button>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => publishToAdminCatalog(module.id)}
                              className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-black text-white"
                            >
                              Publish
                            </button>

                            <button
                              type="button"
                              onClick={() => removeStagedModule(module.id)}
                              className="rounded-xl bg-white px-3 py-2 text-sm font-black text-rose-700"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {message && (
              <div className="mt-4 rounded-2xl bg-slate-100 p-3 text-sm font-bold text-slate-700">
                {message}
              </div>
            )}
          </PageCard>

          <div className={`grid gap-5 lg:grid-cols-[280px_1fr] ${PAGE_FRAME_CLASS}`}>
            <PageCard className="flex h-full min-h-0 flex-col overflow-hidden">
              <h3 className="text-xl font-black text-slate-950">
                Test Controls
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                This side stays separate from passenger Admin controls.
              </p>

              <div className="mt-4 grid min-h-0 flex-1 content-start gap-2 overflow-y-auto pr-1">
                {stagedModules.map((module) => (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => setSelectedTestId(module.id)}
                    className={`rounded-2xl border p-3 text-left ${
                      selectedTestId === module.id
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-950"
                    }`}
                  >
                    <div className="font-black">{module.fallbackTitle}</div>
                    <div className="text-xs opacity-70">{module.componentKey}</div>
                  </button>
                ))}
              </div>
            </PageCard>

            <section className="min-h-0 min-w-0">
              <GameShell>
                {TestComponent ? (
                  <TestComponent t={(key) => key} />
                ) : (
                  <div className="flex h-full items-center justify-center rounded-3xl bg-slate-950 p-6 text-center text-white">
                    <div>
                      <div className="text-2xl font-black">No module selected</div>
                      <p className="mt-2 text-sm text-white/60">
                        Stage a manifest and select it to test inside the passenger game frame.
                      </p>
                    </div>
                  </div>
                )}
              </GameShell>
            </section>
          </div>

          <PageCard>
            <h3 className="text-xl font-black text-slate-950">
              Developer Access Code
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Beta local gate only. Production should replace this with server-side developer roles.
            </p>

            <form onSubmit={changeDeveloperCode} className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                value={newAccessCode}
                onChange={(event) => setNewAccessCode(event.target.value)}
                placeholder="New developer access code"
                className="flex-1 rounded-2xl border border-slate-200 p-3 outline-none"
              />
              <button className="rounded-2xl bg-slate-950 px-4 py-3 font-black text-white">
                Update Code
              </button>
            </form>
          </PageCard>
        </div>
      </div>
    </main>
  );
}
