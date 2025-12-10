import dailyStatsRepository, { DailyStats } from './daily-stats.repository';

class DailyStatsService {
    async updatePosAmount(date: string, amount: number): Promise<DailyStats> {
        return await dailyStatsRepository.upsert({
            date,
            pos_amount: amount
        });
    }

    async getDailyStats(date: string): Promise<DailyStats | null> {
        return await dailyStatsRepository.getByDate(date);
    }

    async getStatsByDateRange(startDate: string, endDate: string): Promise<DailyStats[]> {
        return await dailyStatsRepository.getByDateRange(startDate, endDate);
    }
}

export default new DailyStatsService();
