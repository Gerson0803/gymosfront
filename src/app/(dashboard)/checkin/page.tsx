import CheckInTerminal from "@/components/checkin/checkin-terminal";

export const metadata = {
  title: "Terminal de ingreso",
  description: "Registra asistencia por QR o biometría",
};

export default function CheckInPage() {
  return <CheckInTerminal />;
}
