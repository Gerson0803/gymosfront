"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { mockClients } from "@/lib/mock-data";
import type { Client } from "@/types/client";

type ClientInput = Omit<Client, "id">;

type ClientsContextValue = {
  clients: Client[];
  addClient: (payload: ClientInput) => Client;
  updateClient: (id: string, payload: ClientInput) => Client | null;
  getClientById: (id: string) => Client | undefined;
};

const ClientsContext = createContext<ClientsContextValue | null>(null);

function buildId(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `cl-${slug}-${Date.now()}`;
}

export function ClientsProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(mockClients);

  const value = useMemo<ClientsContextValue>(
    () => ({
      clients,
      addClient: (payload) => {
        const newClient: Client = {
          ...payload,
          id: buildId(payload.name),
        };
        setClients((current) => [newClient, ...current]);
        return newClient;
      },
      updateClient: (id, payload) => {
        let updatedClient: Client | null = null;

        setClients((current) =>
          current.map((client) => {
            if (client.id !== id) {
              return client;
            }

            updatedClient = {
              ...payload,
              id,
            };

            return updatedClient;
          }),
        );

        return updatedClient;
      },
      getClientById: (id) => clients.find((client) => client.id === id),
    }),
    [clients],
  );

  return (
    <ClientsContext.Provider value={value}>{children}</ClientsContext.Provider>
  );
}

export function useClients() {
  const context = useContext(ClientsContext);

  if (!context) {
    throw new Error("useClients must be used within ClientsProvider");
  }

  return context;
}
