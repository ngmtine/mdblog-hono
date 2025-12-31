import postgres from "postgres";

const connectionString = import.meta.env.VITE_DB_CONNECTION_STRING || "";

const db = postgres(connectionString);

export const executeQuery = async <T>(
    query: string, //
    params: (string | number)[] = [],
): Promise<T[]> => {
    return (await db.unsafe(query, params)) as T[];
};
