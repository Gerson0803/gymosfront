import { AT_RISK_DAYS, INACTIVE_DAYS } from "@/lib/constants";
import { daysAgo } from "@/lib/utils";
import type { Client, ClientStats, ClientStatus } from "@/types/client";

export function getLastAttendance(client: Client): string | null {
  if (client.attendance.length === 0) {
    return null;
  }

  return client.attendance
    .map((record) => record.date)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
}

export function getClientStatus(client: Client): ClientStatus {
  const lastAttendance = getLastAttendance(client);

  if (!lastAttendance) {
    return "inactive";
  }

  const inactivityDays = daysAgo(lastAttendance);

  if (inactivityDays <= AT_RISK_DAYS) {
    return "active";
  }

  if (inactivityDays <= INACTIVE_DAYS) {
    return "at-risk";
  }

  return "inactive";
}

export function getStatusCounts(clients: Client[]): ClientStats {
  return clients.reduce<ClientStats>(
    (acc, client) => {
      const status = getClientStatus(client);

      if (status === "active") {
        acc.active += 1;
      } else if (status === "at-risk") {
        acc.atRisk += 1;
      } else {
        acc.inactive += 1;
      }

      acc.total += 1;
      return acc;
    },
    {
      total: 0,
      active: 0,
      atRisk: 0,
      inactive: 0,
    },
  );
}

export function getRiskLabel(client: Client): string {
  const status = getClientStatus(client);
  const lastAttendance = getLastAttendance(client);

  if (!lastAttendance) {
    return "No attendance records";
  }

  const inactiveFor = daysAgo(lastAttendance);

  if (status === "active") {
    return `Engaged in the last ${AT_RISK_DAYS} days`;
  }

  if (status === "at-risk") {
    return `No visits for ${inactiveFor} days`;
  }

  return `Dormant for ${inactiveFor} days`;
}
