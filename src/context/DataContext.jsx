import { createContext, useContext, useEffect, useState } from "react";
import { dbService } from "../services/db";

const DataContext = createContext();

export function useData() {
    return useContext(DataContext);
}

const COLLECTIONS = ['levels', 'rooms', 'teachers', 'contents', 'events'];

export function DataProvider({ children }) {
    const [data, setData] = useState({
        levels: [],
        rooms: [],
        teachers: [],
        contents: [],
        events: []
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
        // Set loading to false regarding the initial render, 
        // but the fetch will happen in the next effect
        setLoading(false);
    }, []);

    // Sync with Firestore
    useEffect(() => {
        const fetchData = async () => {
            try {
                const promises = COLLECTIONS.map(col => dbService.getAll(col));
                const results = await Promise.all(promises);

                const newData = {};
                COLLECTIONS.forEach((col, index) => {
                    newData[col] = results[index];
                });

                setData(newData);
                localStorage.setItem('appData', JSON.stringify(newData));
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    const refreshData = async () => {
        setLoading(true);
        try {
            const promises = COLLECTIONS.map(col => dbService.getAll(col));
            const results = await Promise.all(promises);

            const newData = {};
            COLLECTIONS.forEach((col, index) => {
                newData[col] = results[index];
            });

            setData(newData);
            localStorage.setItem('appData', JSON.stringify(newData));
        } catch (error) {
            console.error("Error refreshing data:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

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
