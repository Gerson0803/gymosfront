"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Fingerprint, QrCode, ScanLine, ChevronDown, User } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/layout/page-header";
import { premium } from "@/lib/premium-ui";
import {
  biometricCheckIn,
  getBiometricMemberStatus,
  getCheckInMemberOptions,
  logout,
  qrCheckIn,
  registerBiometricCredential,
} from "@/lib/api";
import type { CheckInMemberOption } from "@/types/checkin";

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function randomChallenge(length = 32): Uint8Array {
  const challenge = new Uint8Array(length);
  crypto.getRandomValues(challenge);
  return challenge;
}

function notifyMembersRefresh() {
  window.dispatchEvent(new Event("members:refresh"));
}

function getCheckInErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "Unknown error";

  if (
    message.includes("401") ||
    /unauthorized/i.test(message) ||
    /jwt/i.test(message)
  ) {
    return "Tu sesión expiró o no es válida. Inicia sesión nuevamente.";
  }

  return message === "Unknown error" ? "Error desconocido" : message;
}

function shouldLogoutForCheckInError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : "";

  return (
    message.includes("401") ||
    /unauthorized/i.test(message) ||
    /jwt/i.test(message)
  );
}

export default function CheckInTerminal() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-camera-reader";

  const [members, setMembers] = useState<CheckInMemberOption[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [membersError, setMembersError] = useState<string | null>(null);

  const [qrPayload, setQrPayload] = useState("");
  const [isCheckingQr, setIsCheckingQr] = useState(false);
  const [isCameraScanning, setIsCameraScanning] = useState(false);
  const [cameraMessage, setCameraMessage] = useState(
    "Apunta la cámara al código QR del miembro.",
  );

  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [isRegisteringFingerprint, setIsRegisteringFingerprint] =
    useState(false);
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
      setMembersError(null);
      const list = await getCheckInMemberOptions();
      setMembers(list);
      if (!selectedMemberId && list.length > 0) {
        setSelectedMemberId(list[0].id);
      }
    } catch (error) {
      const message = getCheckInErrorMessage(error);
      setMembers([]);
      setMembersError(message);
      toast.error(`Error al cargar miembros: ${message}`);
      if (shouldLogoutForCheckInError(error)) {
        window.setTimeout(() => logout(), 900);
      }
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

  const handleQrCheckIn = useCallback(
    async (overridePayload?: string) => {
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
        const response = await qrCheckIn({
          qrData: value,
          duration: 60,
          activities: ["pesas", "cardio"],
        });

        if (response.success === false) {
          throw new Error(response.message || "Falló el registro de ingreso por QR");
        }

        toast.success("Ingreso por QR registrado");
        setQrPayload("");
        notifyMembersRefresh();
        await loadMembers();
      } catch (error) {
        const message = getCheckInErrorMessage(error);
        toast.error(message || "Error en el ingreso por QR");
        if (shouldLogoutForCheckInError(error)) {
          window.setTimeout(() => logout(), 900);
        }
      } finally {
        setIsCheckingQr(false);
      }
    },
    [apiUrl, loadMembers, qrPayload],
  );

  useEffect(() => {
    if (!isCameraScanning) return;

    const startCamera = async () => {
      try {
        setCameraMessage("Iniciando cámara...");
        if (scannerRef.current) {
          try {
            await scannerRef.current.stop();
          } catch {
            /* noop */
          }
          scannerRef.current = null;
        }

        const scanner = new Html5Qrcode(scannerContainerId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1 },
          async (decodedText) => {
            const value = decodedText.trim();
            if (!value) return;
            setQrPayload(value);
            await scanner.stop();
            scannerRef.current = null;
            setIsCameraScanning(false);
            await handleQrCheckIn(value);
          },
          () => undefined,
        );
        setCameraMessage("Cámara activa. Centra el QR en el marco.");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "No se pudo abrir la cámara";
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
  }, [handleQrCheckIn, isCameraScanning]);

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
      toast.error("WebAuthn no es compatible con este navegador");
      return;
    }

    try {
      setIsRegisteringFingerprint(true);
      const credential = (await navigator.credentials.create({
        publicKey: {
          challenge: randomChallenge() as BufferSource,
          rp: { name: "GymOS" },
          user: {
            id: new TextEncoder().encode(selectedMemberId),
            name: `member-${selectedMemberId}`,
            displayName: selectedMember?.name ?? "Miembro de GymOS",
          },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: 60000,
          attestation: "none",
        },
      })) as PublicKeyCredential | null;

      if (!credential) throw new Error("No se pudo crear la credencial biométrica");

      const credentialId = bytesToBase64Url(new Uint8Array(credential.rawId));
      await registerBiometricCredential({
        memberId: selectedMemberId,
        credentialId,
      });

      toast.success("Biometría registrada");
      notifyMembersRefresh();
      await loadMembers();
    } catch (error) {
      const message = getCheckInErrorMessage(error);
      toast.error(message || "Error en el registro");
      if (shouldLogoutForCheckInError(error)) {
        window.setTimeout(() => logout(), 900);
      }
    } finally {
      setIsRegisteringFingerprint(false);
    }
  };

  const handleFingerprintCheckIn = async () => {
    if (!window.PublicKeyCredential) {
      toast.error("WebAuthn no es compatible");
      return;
    }

    try {
      setIsCheckingFingerprint(true);

      if (selectedMemberId) {
        const statusPayload = await getBiometricMemberStatus(selectedMemberId);
        const hasCredential =
          statusPayload.hasCredential ??
          statusPayload.data?.hasCredential ??
          false;

        if (!hasCredential) {
          throw new Error("No hay huella registrada. Regístrala primero.");
        }
      }

      const assertion = (await navigator.credentials.get({
        publicKey: {
          challenge: randomChallenge() as BufferSource,
          userVerification: "required",
          timeout: 60000,
        },
      })) as PublicKeyCredential | null;

      if (!assertion) throw new Error("Falló la verificación biométrica");

      const credentialId = bytesToBase64Url(new Uint8Array(assertion.rawId));
      const response = await biometricCheckIn({
        ...(selectedMemberId ? { memberId: selectedMemberId } : {}),
        credentialId,
        duration: 60,
        activities: ["pesas"],
      });

      if (!response.success) {
        throw new Error(response.message || "Falló el ingreso biométrico");
      }

      toast.success(
        `Ingreso biométrico registrado para ${response.data?.memberName ?? "el miembro"}`,
      );
      notifyMembersRefresh();
      await loadMembers();
    } catch (error) {
      const message = getCheckInErrorMessage(error);
      toast.error(message || "Error en el ingreso biométrico");
      if (shouldLogoutForCheckInError(error)) {
        window.setTimeout(() => logout(), 900);
      }
    } finally {
      setIsCheckingFingerprint(false);
    }
  };

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        centered
        title="Bienvenido a GymOS"
        subtitle="Selecciona tu método de ingreso preferido."
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <article className={`${premium.card} flex flex-col p-8 sm:p-10`}>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B57F0]/10">
            <QrCode className="h-6 w-6 text-[#0B57F0]" strokeWidth={1.75} />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-[#0A1733]">
            Ingreso por app
          </h2>
          <p className="mt-2 text-sm text-[#5B6475]">
            Presenta el código QR de tu app de GymOS al lector de abajo.
          </p>

          <div className="relative my-8 flex min-h-[200px] flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-[#E5EAF3] bg-[#F5F7FB]/80 p-6">
            {isCameraScanning ? (
              <div className="w-full overflow-hidden rounded-xl border border-[#E5EAF3] bg-black">
                <div id={scannerContainerId} className="h-56 w-full" />
                <p className="mt-3 text-center text-xs text-[#5B6475]">
                  {cameraMessage}
                </p>
              </div>
            ) : (
              <div className="relative flex h-40 w-56 items-center justify-center overflow-hidden">
                <span className="absolute left-0 top-0 h-8 w-8 border-l-2 border-t-2 border-[#0B57F0]" />
                <span className="absolute right-0 top-0 h-8 w-8 border-r-2 border-t-2 border-[#0B57F0]" />
                <span className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-[#0B57F0]" />
                <span className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-[#0B57F0]" />
                <QrCode className="h-16 w-16 text-[#0B57F0]/20" />
                <div className="scanner-line absolute left-4 right-4 top-0 h-[3px] bg-gradient-to-b from-[#60A5FA] via-[#2563EB] to-[#93C5FD] shadow-[0_0_14px_#2563EB]" />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              if (isCameraScanning) stopCameraScanning();
              else setIsCameraScanning(true);
            }}
            className={`${premium.pillBtn} w-full`}
          >
            <ScanLine className="h-4 w-4" />
            {isCameraScanning ? "Detener escaneo" : "Iniciar escaneo"}
          </button>

          <textarea
            value={qrPayload}
            onChange={(e) => setQrPayload(e.target.value)}
            placeholder="Pega el QR o el ID del miembro"
            className="mt-4 min-h-[72px] w-full rounded-2xl border border-[#E5EAF3] bg-[#F5F7FB] px-4 py-3 text-sm text-[#0A1733] outline-none focus:border-[#0B57F0]/40 focus:ring-2 focus:ring-[#0B57F0]/10"
          />

          <button
            type="button"
            onClick={() => handleQrCheckIn()}
            disabled={isCheckingQr}
            className="mt-3 text-center text-sm font-semibold text-[#0B57F0] hover:underline disabled:opacity-50"
          >
            {isCheckingQr ? "Registrando..." : "Ingresar ID manualmente"}
          </button>
        </article>

        <article className={`${premium.card} flex flex-col p-8 sm:p-10`}>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
            <Fingerprint
              className="h-6 w-6 text-emerald-600"
              strokeWidth={1.75}
            />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-[#0A1733]">
            Acceso biométrico
          </h2>
          <p className="mt-2 text-sm text-[#5B6475]">
            Usa tu huella registrada para acceder de inmediato.
          </p>

          <div className="my-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Escáner listo
            </span>
          </div>

          <div className="relative my-4 flex min-h-[200px] flex-1 items-center justify-center">
            <div className="absolute h-44 w-44 rounded-full border border-[#0B57F0]/10" />
            <div className="absolute h-36 w-36 rounded-full border border-[#0B57F0]/15" />
            <div className="absolute h-28 w-28 rounded-full border border-[#0B57F0]/20" />
            <Fingerprint
              className="relative h-20 w-20 text-[#5B6475]/40"
              strokeWidth={1}
            />
          </div>

          <label className="sr-only" htmlFor="biometric-member">
            Seleccionar perfil
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5B6475]" />
            <select
              id="biometric-member"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              disabled={loadingMembers}
              className="w-full appearance-none rounded-full border border-[#E5EAF3] bg-white py-3.5 pl-11 pr-10 text-sm font-medium text-[#0A1733] outline-none focus:border-[#0B57F0]/40 focus:ring-2 focus:ring-[#0B57F0]/10"
            >
              <option value="">Selecciona un perfil... (opcional)</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5B6475]" />
          </div>
          {membersError ? (
            <p className="mt-2 text-sm font-medium text-red-600">
              {membersError}
            </p>
          ) : null}

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleRegisterFingerprint}
              disabled={isRegisteringFingerprint || !selectedMemberId}
              className={premium.pillBtnOutline}
            >
              {isRegisteringFingerprint ? "..." : "Registrar"}
            </button>
            <button
              type="button"
              onClick={handleFingerprintCheckIn}
              disabled={isCheckingFingerprint}
              className={premium.pillBtn}
            >
              {isCheckingFingerprint ? "Validando..." : "Ingreso"}
            </button>
          </div>
        </article>
      </section>
      <style jsx>{`
        @keyframes qr-scan {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(calc(10rem - 3px));
          }
        }

        .scanner-line {
          animation: qr-scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
