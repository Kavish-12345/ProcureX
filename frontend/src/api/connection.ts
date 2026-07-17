import client from "./client";
import type { SupplierRetailerConnection } from "@/types";

interface CreateConnectionData {
    supplierId: string;
}

interface CreateConnectionResponse {
    message: string;
    connection: SupplierRetailerConnection;
}

interface ConnectionsResponse {
    connections: SupplierRetailerConnection[];
}

export const connectionsApi = {
    // Retailer: connect to a supplier
    create: (data: CreateConnectionData) =>
        client.post<CreateConnectionResponse>('/connections', data),

    // Retailer: get their connected suppliers / Supplier: get their connected retailers
    getMyConnections: () =>
        client.get<ConnectionsResponse>('/connections'),
};