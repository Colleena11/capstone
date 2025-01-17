import { DatabaseService } from '../../services/database/DatabaseService';
import { VerificationStatus, ArtStatus } from '../../types/Art';

interface DashboardStats {
    totalArtworks: number;
    pendingVerifications: number;
    recentTransactions: number;
    activeUsers: number;
    totalRevenue: number;
    fraudAlerts: number;
}

interface RecentActivity {
    id: string;
    type: 'artwork_upload' | 'verification' | 'sale' | 'fraud_alert';
    timestamp: Date;
    details: any;
}

interface SystemStatus {
    aiService: boolean;
    blockchainService: boolean;
    databaseService: boolean;
    verificationQueue: number;
}

export class Overview {
    private db: DatabaseService;

    constructor() {
        this.db = new DatabaseService();
    }

    async getOverviewData(): Promise<{
        stats: DashboardStats;
        recentActivities: RecentActivity[];
        systemStatus: SystemStatus;
    }> {
        try {
            const [
                stats,
                recentActivities,
                systemStatus
            ] = await Promise.all([
                this.getStats(),
                this.getRecentActivities(),
                this.getSystemStatus()
            ]);

            return {
                stats,
                recentActivities,
                systemStatus
            };
        } catch (error) {
            console.error('Failed to fetch overview data:', error);
            throw new Error('Failed to fetch dashboard overview data');
        }
    }

    private async getStats(): Promise<DashboardStats> {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

        return {
            totalArtworks: await this.db.countDocuments('artworks'),
            pendingVerifications: await this.db.countDocuments('artworks', {
                verificationStatus: 'pending'
            }),
            recentTransactions: await this.db.countDocuments('transactions', {
                createdAt: { $gte: thirtyDaysAgo }
            }),
            activeUsers: await this.getActiveUsersCount(),
            totalRevenue: await this.calculateTotalRevenue(),
            fraudAlerts: await this.db.countDocuments('alerts', {
                type: 'fraud',
                status: 'active'
            })
        };
    }

    private async getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
        const activities = await this.db.getRecentActivities(limit);
        return activities.map(activity => ({
            id: activity.id,
            type: activity.type,
            timestamp: activity.timestamp,
            details: this.formatActivityDetails(activity)
        }));
    }

    private async getSystemStatus(): Promise<SystemStatus> {
        return {
            aiService: await this.checkAIService(),
            blockchainService: await this.checkBlockchainService(),
            databaseService: await this.checkDatabaseService(),
            verificationQueue: await this.getVerificationQueueLength()
        };
    }

    private async getActiveUsersCount(): Promise<number> {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        return await this.db.countDocuments('users', {
            lastActivity: { $gte: thirtyDaysAgo }
        });
    }

    private async calculateTotalRevenue(): Promise<number> {
        const result = await this.db.aggregate('transactions', [
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        return result[0]?.total || 0;
    }

    private formatActivityDetails(activity: any): any {
        switch (activity.type) {
            case 'artwork_upload':
                return {
                    artworkId: activity.artworkId,
                    artistName: activity.artistName,
                    title: activity.title
                };
            case 'verification':
                return {
                    artworkId: activity.artworkId,
                    status: activity.status,
                    verifier: activity.verifier
                };
            case 'sale':
                return {
                    artworkId: activity.artworkId,
                    amount: activity.amount,
                    buyer: activity.buyer,
                    seller: activity.seller
                };
            case 'fraud_alert':
                return {
                    alertId: activity.alertId,
                    severity: activity.severity,
                    type: activity.fraudType
                };
            default:
                return activity.details;
        }
    }

    private async checkAIService(): Promise<boolean> {
        try {
            // Implement AI service health check
            return true;
        } catch {
            return false;
        }
    }

    private async checkBlockchainService(): Promise<boolean> {
        try {
            // Implement blockchain service health check
            return true;
        } catch {
            return false;
        }
    }

    private async checkDatabaseService(): Promise<boolean> {
        try {
            await this.db.ping();
            return true;
        } catch {
            return false;
        }
    }

    private async getVerificationQueueLength(): Promise<number> {
        return await this.db.countDocuments('artworks', {
            verificationStatus: 'pending'
        });
    }
}
