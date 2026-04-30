"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Fingerprint, QrCode, ScanLine } from "lucide-react";
import toast from "react-hot-toast";

type MemberLite = {
  id: string;
  name: string;
  hasBiometricCredential?: boolean;
};

type MembersResponse = {
  success: boolean;
  data: {
    members: MemberLite[];
  };
};

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function randomChallenge(length = 32): Uint8Array {
  const challenge = new Uint8Array(length);
  crypto.getRandomValues(challenge);
  return challenge;
}

function notifyMembersRefresh() {
  window.dispatchEvent(new Event("members:refresh"));
}

export default function CheckInTerminal() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-camera-reader";

  const [members, setMembers] = useState<MemberLite[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const [qrPayload, setQrPayload] = useState("");
  const [isCheckingQr, setIsCheckingQr] = useState(false);
  const [isCameraScanning, setIsCameraScanning] = useState(false);
  const [cameraMessage, setCameraMessage] = useState("Apunta la cámara al QR del miembro.");

  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [isRegisteringFingerprint, setIsRegisteringFingerprint] = useState(false);
  const [isCheckingFingerprint, setIsCheckingFingerprint] = useState(false);

  const selectedMember = useMemo(
    () => members.find((member) => member.id === selectedMemberId),
    [members, selectedMemberId],
  );

  const loadMembers = useCallback(async () => {
    if (!apiUrl) {
      setCameraMessage("Configura NEXT_PUBLIC_API_URL para cargar miembros");
      setLoadingMembers(false);
      return;
    }

    try {
      setLoadingMembers(true);
      setCameraMessage("Cargando miembros...");
      const res = await fetch(`${apiUrl}/members?page=1&limit=100`);
      if (!res.ok) {
        console.error("Failed to load members:", res.status, res.statusText);
        throw new Error(`HTTP ${res.status}: No fue posible cargar miembros`);
      }

      const payload = (await res.json()) as MembersResponse;
      const list = payload?.data?.members ?? [];
      setMembers(list);
      if (!selectedMemberId && list.length > 0) {
        setSelectedMemberId(list[0].id);
      }
      if (list.length === 0) {
        setCameraMessage("No hay miembros disponibles");
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Error desconocido";
      console.error("Error loading members:", msg);
      setCameraMessage(`Error: ${msg}`);
      toast.error(`Error cargando miembros: ${msg}`);
    } finally {
      setLoadingMembers(false);
    }
  }, [apiUrl, selectedMemberId]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    return () => {
      void scannerRef.current?.stop().catch(() => undefined);
      scannerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isCameraScanning) {
      return;
    }

    const startCamera = async () => {
      try {
        setCameraMessage("Iniciando cámara...");

        if (scannerRef.current) {
          try {
            await scannerRef.current.stop();
          } catch {
            // Ignorar si todavía no estaba activa.
          }
          scannerRef.current = null;
        }

        const scanner = new Html5Qrcode(scannerContainerId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 240, height: 240 },
            aspectRatio: 1,
          },
          async (decodedText) => {
            const value = decodedText.trim();
            if (!value) {
              return;
            }

            setQrPayload(value);
            setCameraMessage("QR detectado. Registrando check-in...");
            await scanner.stop();
            scannerRef.current = null;
            setIsCameraScanning(false);
            await handleQrCheckIn(value);
          },
          () => {
            // Sin ruido visual mientras se encuentra el QR.
          },
        );

        setCameraMessage("Cámara activa. Acerca el QR al centro del cuadro.");
      } catch (error) {
        const message = error instanceof Error ? error.message : "No fue posible abrir la cámara";
        setCameraMessage(message);
        toast.error(message);
        setIsCameraScanning(false);
      }
    };

    void startCamera();

    return () => {
      void scannerRef.current?.stop().catch(() => undefined);
      scannerRef.current = null;
    };
  }, [isCameraScanning]);

  const handleQrCheckIn = async (overridePayload?: string) => {
    const value = (overridePayload ?? qrPayload).trim();
    if (!value) {
      toast.error("Escanea o pega un QR válido");
      return;
    }

    if (!apiUrl) {
      toast.error("Configura NEXT_PUBLIC_API_URL");
      return;
    }

    try {
      setIsCheckingQr(true);
      const res = await fetch(`${apiUrl}/attendance/qr-checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrData: value, duration: 60, activities: ["pesas", "cardio"] }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "No fue posible registrar check-in por QR");
      }

      toast.success("Check-in por QR registrado");
      setQrPayload("");
      notifyMembersRefresh();
      await loadMembers();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error inesperado en check-in QR";
      toast.error(message);
    } finally {
      setIsCheckingQr(false);
    }
  };

  const stopCameraScanning = useCallback(() => {
    setIsCameraScanning(false);
    void scannerRef.current?.stop().catch(() => undefined);
    scannerRef.current = null;
  }, []);

  const handleRegisterFingerprint = async () => {
    if (!selectedMemberId) {
      toast.error("Selecciona un miembro");
      return;
    }

    if (!window.PublicKeyCredential) {
      toast.error("Este navegador no soporta autenticación biométrica (WebAuthn)");
      return;
    }

    try {
      setIsRegisteringFingerprint(true);

      const publicKey: PublicKeyCredentialCreationOptions = {
        challenge: randomChallenge(),
        rp: { name: "GymOS" },
        user: {
          id: new TextEncoder().encode(selectedMemberId),
          name: `member-${selectedMemberId}`,
          displayName: selectedMember?.name ?? "Miembro Gym",
        },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
        },
        timeout: 60000,
        attestation: "none",
      };

      const credential = (await navigator.credentials.create({
        publicKey,
      })) as PublicKeyCredential | null;

      if (!credential) {
        throw new Error("No se pudo crear credencial biométrica");
      }

      const credentialId = bytesToBase64Url(new Uint8Array(credential.rawId));

      const res = await fetch(`${apiUrl}/attendance/biometric/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: selectedMemberId, credentialId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "No fue posible registrar huella");
      }

      toast.success("Huella registrada correctamente");
      notifyMembersRefresh();
      await loadMembers();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error registrando huella";
      toast.error(message);
    } finally {
      setIsRegisteringFingerprint(false);
    }
  };

  const handleFingerprintCheckIn = async () => {
    if (!selectedMemberId) {
      toast.error("Selecciona un miembro");
      return;
    }

    if (!window.PublicKeyCredential) {
      toast.error("Este navegador no soporta autenticación biométrica (WebAuthn)");
      return;
    }

    try {
      setIsCheckingFingerprint(true);

      const statusRes = await fetch(`${apiUrl}/attendance/biometric/member/${selectedMemberId}`);
      if (!statusRes.ok) {
        throw new Error("No fue posible validar el estado biométrico del miembro");
      }

      const statusPayload = (await statusRes.json()) as { hasCredential?: boolean };
      if (!statusPayload.hasCredential) {
        throw new Error("Este miembro no tiene huella registrada. Regístrala primero.");
      }

      const assertion = (await navigator.credentials.get({
        publicKey: {
          challenge: randomChallenge(),
          userVerification: "required",
          timeout: 60000,
        },
      })) as PublicKeyCredential | null;

      if (!assertion) {
        throw new Error("No se obtuvo credencial biométrica");
      }

      const credentialId = bytesToBase64Url(new Uint8Array(assertion.rawId));
      const res = await fetch(`${apiUrl}/attendance/biometric-checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: selectedMemberId,
          credentialId,
          duration: 60,
          activities: ["pesas", "cardio"],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "No fue posible registrar check-in por huella");
      }

      toast.success("Check-in por huella registrado");
      notifyMembersRefresh();
      await loadMembers();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error en check-in biométrico";
      toast.error(message);
    } finally {
      setIsCheckingFingerprint(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Terminal de Check-in</h1>
        <p className="mt-1 text-sm text-slate-600">
          Registra entrada por QR o por huella usando el lector biométrico del dispositivo.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-slate-900">
            <QrCode className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Check-in por QR</h2>
          </div>

          <p className="mb-3 text-sm text-slate-600">
            Puedes escanear desde un lector QR o pegar el contenido del QR. Se acepta memberId directo o JSON con memberId.
          </p>

          <div className="mb-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-900">Escaneo con cámara</p>
                <p className="text-xs text-slate-500">Usa la cámara del PC para leer el QR sin teclearlo.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCameraScanning((current) => !current)}
                className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
              >
                {isCameraScanning ? "Cerrar cámara" : "Abrir cámara"}
              </button>
            </div>

            {isCameraScanning ? (
              <div className="mt-3 space-y-3">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black">
                  <div id={scannerContainerId} className="h-72 w-full" />
                </div>
                <p className="text-xs text-slate-600">{cameraMessage}</p>
                <button
                  type="button"
                  onClick={stopCameraScanning}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Detener cámara
                </button>
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-500">
                Puedes activar la cámara cuando quieras.
              </p>
            )}
          </div>

          <textarea
            value={qrPayload}
            onChange={(e) => setQrPayload(e.target.value)}
            placeholder='Ejemplos: "cm123..." o {"memberId":"cm123..."}'
            className="min-h-28 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />

          <button
            onClick={() => handleQrCheckIn()}
            disabled={isCheckingQr}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ScanLine className="h-4 w-4" />
            {isCheckingQr ? "Registrando..." : "Registrar Check-in QR"}
          </button>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-slate-900">
            <Fingerprint className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold">Check-in por Huella</h2>
          </div>

          <label className="mb-2 block text-sm font-medium text-slate-700">Miembro</label>
          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            disabled={loadingMembers || members.length === 0}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          >
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} ({member.id})
              </option>
            ))}
          </select>

          <p className="mt-2 text-xs text-slate-500">
            Estado biométrico:{" "}
            {selectedMember?.hasBiometricCredential ? "registrado" : "sin registrar"}
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button
              onClick={handleRegisterFingerprint}
              disabled={isRegisteringFingerprint || !selectedMemberId}
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRegisteringFingerprint ? "Registrando..." : "Registrar Huella"}
            </button>

            <button
              onClick={handleFingerprintCheckIn}
              disabled={isCheckingFingerprint || !selectedMemberId}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCheckingFingerprint ? "Validando..." : "Check-in con Huella"}
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}
