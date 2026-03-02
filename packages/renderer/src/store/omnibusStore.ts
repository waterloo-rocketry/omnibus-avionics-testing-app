import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware'

// temp object of data
export interface LatestDataPoint {
    msgPrio: number 
    status: string
    value: number
}

interface AvionicsStore {
    series: Record<string, LatestDataPoint>
    updateSeries: (seriesName: string, dataPoint: LatestDataPoint) => void
    updateMultipleSeries: (updates: Record<string, LatestDataPoint>) => void
}

export const useAvionicsStore = create<AvionicsStore>()(
    subscribeWithSelector((set) => ({
        series: {},

        updateSeries: (seriesName, dataPoint) =>
            set((state) => ({
                series: { ...state.series, [seriesName]: dataPoint },
            })),

        updateMultipleSeries: (updates) =>
            set((state) => ({
                series: { ...state.series, ...updates },
            })),
    })),
)