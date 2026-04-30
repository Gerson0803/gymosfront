import CheckInTerminal from "@/components/checkin/checkin-terminal";

export const metadata = {
  title: "Check-in Terminal",
  description: "Register attendance by QR or biometric",
};

export default function CheckInPage() {
  return (
    <div className="space-y-6">
      <CheckInTerminal />
    </div>
  );
}
