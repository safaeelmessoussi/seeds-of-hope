import { createContext, useContext, useEffect, useState } from "react";
import { dbService } from "../services/db";
import { useAuth } from "./AuthContext";

const DataContext = createContext();

export function useData() {
    return useContext(DataContext);
}

// Collections to sync
const COLLECTIONS = ['levels', 'rooms', 'teachers', 'contents', 'events', 'branches', 'users', 'students', 'grades'];

export function DataProvider({ children }) {
    const { currentUser } = useAuth();
    const [data, setData] = useState({
        levels: [],
        rooms: [],
        teachers: [],
        contents: [],
        events: [],
        branches: [],
        users: [],
        students: [],
        grades: []
    });
    const [loading, setLoading] = useState(true);

    // Initial Load from LocalStorage
    useEffect(() => {
        const cachedData = localStorage.getItem('appData');
        if (cachedData) {
            try {
                setData(JSON.parse(cachedData));
            } catch (e) {
                console.error("Failed to parse cached data:", e);
            }
        }
        // Don't set loading false yet, wait for fresh fetch
    }, []);

    const processData = (rawData) => {
        // Multi-tenancy Filtering
        let processed = { ...rawData };

        if (currentUser && currentUser.role !== 'super-admin') {
            const userBranch = currentUser.branchId;
            // Filter collections that are branch-specific
            if (userBranch) {
                // Levels, Rooms, Teachers, Events, Contents likely branch specific
                ['levels', 'rooms', 'teachers', 'contents', 'events'].forEach(col => {
                    processed[col] = rawData[col].filter(item => item.branchId === userBranch || !item.branchId);
                    // !item.branchId fallback allows global items if any
                });
            }
        }

        // Content Grouping by School Year
        // We attach a helper structure: contentsByYear
        // Format: { "2025-2026": [items...], "2024-2025": [items...] }
        const grouped = {};
        if (processed.contents) {
            processed.contents.forEach(item => {
                const year = item.schoolYear || 'General'; // Default if missing
                if (!grouped[year]) grouped[year] = [];
                grouped[year].push(item);
            });
        }

        // Sort keys descending (Newest first)
        const sortedYears = Object.keys(grouped).sort().reverse();
        // e.g. ["2025-2026", "2024-2025"]

        processed.contentsByYear = {
            years: sortedYears,
            groups: grouped
        };

        return processed;
    };

    const refreshData = async () => {
        setLoading(true);
        try {
            const promises = COLLECTIONS.map(col => dbService.getAll(col));
            const results = await Promise.all(promises);

            const fetchedData = {};
            COLLECTIONS.forEach((col, index) => {
                fetchedData[col] = results[index];
            });

            const finalData = processData(fetchedData);

            setData(finalData);
            localStorage.setItem('appData', JSON.stringify(finalData));
        } catch (error) {
            console.error("Error refreshing data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Auto-refresh when user changes (e.g. login)
    useEffect(() => {
        refreshData();
    }, [currentUser]); // Re-run if user role changes

    const value = {
        data,
        loading,
        refreshData
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
}
