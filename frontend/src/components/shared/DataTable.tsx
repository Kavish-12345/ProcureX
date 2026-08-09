interface Column<T> {
    header: string;
    accessor: (row: T) => React.ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyExtractor: (row: T) => string;
    emptyMessage?: string;
}

export function DataTable<T>({ data, columns, keyExtractor, emptyMessage }: DataTableProps<T>) {
    if (data.length === 0) {
        return (
            <div className="p-8 text-center text-sm text-muted-foreground">
                {emptyMessage ?? 'No data available'}
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
                <thead className="bg-muted/50">
                    <tr>
                        {columns.map((col, i) => (
                            <th key={i} className={`px-4 py-2 text-left font-medium ${col.className ?? ''}`}>
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row) => (
                        <tr key={keyExtractor(row)} className="border-t">
                            {columns.map((col, i) => (
                                <td key={i} className={`px-4 py-2 ${col.className ?? ''}`}>
                                    {col.accessor(row)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}