import client from "./client";
import type { SupplierRetailerConnection } from "@/types";

interface ConnectionsResponse {
    connections: SupplierRetailerConnection[];
}

export const connectionsApi = {
    // Retailer: get their connected suppliers / Supplier: get their connected retailers
    getMyConnections: () =>
        client.get<ConnectionsResponse>('/connections'),
};