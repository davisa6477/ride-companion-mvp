import { useEffect, useMemo, useState } from "react";
import { Link, MonitorSmartphone, RefreshCw } from "lucide-react";

import PageCard from "../layout/PageCard.jsx";
import { DEVICE_TYPES, DEFAULT_DEVICE_TYPE } from "../../config/deviceTypes.js";
import {
  buildLocalPairedDeviceFromPairing,
  clearLocalPairedDevice,
  createPairingCode,
  listenToPairingCode,
  loadLocalPairedDevice,
  saveLocalPairedDevice,
} from "../../services/devicePairingService.js";

export default function PairingPage({
  defaultDeviceType = DEFAULT_DEVICE_TYPE,
  requiredDeviceType = null,
  successRedirectPath = null,
}) {
  const [deviceType, setDeviceType] = useState(defaultDeviceType);
  const [deviceLabel, setDeviceLabel] = useState("");
  const [pairing, setPairing] = useState(null);
  const [pairedDevice, setPairedDevice] = useState(() => loadLocalPairedDevice());
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);

  const deviceTypeOptions = useMemo(() => Object.values(DEVICE_TYPES), []);
  const pairedDeviceMatchesRequired =
    !requiredDeviceType || pairedDevice?.deviceType === requiredDeviceType;
  const hasWrongPairedDevice = Boolean(
    pairedDevice && requiredDeviceType && pairedDevice.deviceType !== requiredDeviceType
  );

  function getSuccessRedirectPath(localDevice) {
    if (successRedirectPath) {
      return successRedirectPath;
    }

    if (localDevice?.deviceType === DEVICE_TYPES.driverConsole.id) {
      return "/console";
    }

    return "/";
  }

  async function startPairing() {
    setMessage("");
    setCreating(true);

    try {
      const nextPairing = await createPairingCode({
        deviceType: requiredDeviceType || deviceType,
        deviceLabel,
      });

      setPairing(nextPairing);
    } catch (error) {
      console.error("Failed to create pairing code:", error);
      setMessage("Could not create a pairing code. Check Firebase permissions.");
    } finally {
      setCreating(false);
    }
  }

  function forgetPairing() {
    clearLocalPairedDevice();
    setPairedDevice(null);
    setPairing(null);
    setMessage("This device pairing was cleared locally.");
  }

  useEffect(() => {
    if (requiredDeviceType) {
      setDeviceType(requiredDeviceType);
    }
  }, [requiredDeviceType]);

  useEffect(() => {
    if (!pairing?.code) return undefined;

    const unsubscribe = listenToPairingCode(pairing.code, (updatedPairing) => {
      if (!updatedPairing) return;

      setPairing({
        ...pairing,
        ...updatedPairing,
      });

      if (updatedPairing.status === "approved") {
        const localDevice = buildLocalPairedDeviceFromPairing(updatedPairing);
        saveLocalPairedDevice(localDevice);
        setPairedDevice(localDevice);
        setMessage("Device paired successfully. Loading paired app...");

        const redirectPath = getSuccessRedirectPath(localDevice);

        window.setTimeout(() => {
          window.location.assign(redirectPath);
        }, 900);
      }

      if (updatedPairing.status === "rejected") {
        setMessage("Pairing request was rejected.");
      }
    });

    return () => unsubscribe();
  }, [pairing?.code, requiredDeviceType, successRedirectPath]);

  return (
    <div className="mx-auto max-w-3xl">
      <PageCard>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-100 p-3">
            <MonitorSmartphone />
          </div>

          <div>
            <h1 className="text-3xl font-black text-slate-950">
              Pair This Device
            </h1>
            <p className="text-sm text-slate-500">
              Connect this tablet or console without using the Admin password on this device.
            </p>
          </div>
        </div>

        {pairedDevice && pairedDeviceMatchesRequired ? (
          <div className="mt-5 grid gap-4">
            <div className="rounded-3xl bg-emerald-50 p-5 text-emerald-900">
              <div className="text-lg font-black">Device Paired</div>
              <div className="mt-1 text-sm">
                Type: {DEVICE_TYPES[pairedDevice.deviceType]?.label || pairedDevice.deviceType}
              </div>
              <div className="text-sm">Device ID: {pairedDevice.deviceId}</div>
              <div className="text-sm">Config: {pairedDevice.configId}</div>
            </div>

            <button
              type="button"
              onClick={forgetPairing}
              className="rounded-2xl bg-slate-950 p-4 font-black text-white"
            >
              Clear Local Pairing
            </button>
          </div>
        ) : (
          <div className="mt-5 grid gap-4">
            {hasWrongPairedDevice && (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
                <div className="font-black">Wrong device type paired</div>
                <p className="mt-1 text-sm">
                  This browser is currently paired as{" "}
                  {DEVICE_TYPES[pairedDevice.deviceType]?.label ||
                    pairedDevice.deviceType}
                  , but this page requires{" "}
                  {DEVICE_TYPES[requiredDeviceType]?.label || requiredDeviceType}.
                </p>
                <button
                  type="button"
                  onClick={forgetPairing}
                  className="mt-3 rounded-xl bg-amber-500 px-4 py-2 text-sm font-black text-amber-950"
                >
                  Clear wrong pairing
                </button>
              </div>
            )}
            <div className="grid gap-3 rounded-3xl border border-slate-200 p-4">
              <label className="text-sm font-black text-slate-700">
                Device Type
              </label>

              <select
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value)}
                disabled={Boolean(requiredDeviceType)}
                className="rounded-2xl border border-slate-200 p-3 outline-none disabled:opacity-60"
              >
                {deviceTypeOptions.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>

              {requiredDeviceType && (
                <p className="text-xs font-bold text-slate-500">
                  This page requires pairing as{" "}
                  {DEVICE_TYPES[requiredDeviceType]?.label || requiredDeviceType}.
                </p>
              )}

              <input
                value={deviceLabel}
                onChange={(e) => setDeviceLabel(e.target.value)}
                placeholder="Optional label, like Backseat tablet"
                className="rounded-2xl border border-slate-200 p-3 outline-none"
              />

              <button
                type="button"
                onClick={startPairing}
                disabled={creating}
                className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 p-4 font-black text-white disabled:opacity-50"
              >
                <RefreshCw size={18} />
                {creating ? "Creating Code..." : "Create Pairing Code"}
              </button>
            </div>

            {pairing?.code && (
              <div className="rounded-3xl bg-slate-950 p-6 text-center text-white">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                  <Link />
                </div>

                <div className="text-sm font-black uppercase tracking-[.25em] text-white/50">
                  Enter this code in Admin
                </div>

                <div className="mt-3 text-6xl font-black tracking-widest">
                  {pairing.code}
                </div>

                <div className="mt-3 text-sm text-white/60">
                  Status: {pairing.status || "pending"}
                </div>
              </div>
            )}

            {message && (
              <div className="rounded-2xl bg-slate-100 p-4 text-sm font-bold text-slate-700">
                {message}
              </div>
            )}
          </div>
        )}
      </PageCard>
    </div>
  );
}
