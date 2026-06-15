import { query, transaction } from '../database/connection';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

export class AIService {
  /**
   * Process user message and generate response
   */
  async processMessage(userId: string, message: string, context: string): Promise<string> {
    try {
      const lowerMessage = message.toLowerCase();

      // Wallet queries
      if (context === 'wallet') {
        if (lowerMessage.includes('balance') || lowerMessage.includes('how much')) {
          return await this.getBalanceInsight(userId);
        }
        if (lowerMessage.includes('transaction') || lowerMessage.includes('history')) {
          return await this.getTransactionSummary(userId);
        }
        if (lowerMessage.includes('spend') || lowerMessage.includes('expense')) {
          return await this.getSpendingAnalysis(userId);
        }
      }

      // Group queries
      if (context === 'groups') {
        if (lowerMessage.includes('contribution') || lowerMessage.includes('dues')) {
          return await this.getContributionStatus(userId);
        }
        if (lowerMessage.includes('missed') || lowerMessage.includes('penalty')) {
          return await this.getMissedContributionAlert(userId);
        }
      }

      // Default response
      return this.getDefaultResponse();
    } catch (error) {
      logger.error('Error processing AI message:', error);
      throw new AppError('Failed to process message', 500);
    }
  }

  /**
   * Get balance insight
   */
  private async getBalanceInsight(userId: string): Promise<string> {
    const result = await query(
      'SELECT COALESCE(SUM(amount), 0) as balance FROM wallet WHERE user_id = $1',
      [userId]
    );

    const balance = result.rows[0].balance;

    if (balance === 0) {
      return '💭 Your wallet is currently empty. Would you like to make a deposit?';
    } else if (balance < 1000) {
      return `⚠️ Your balance is KES ${balance.toLocaleString()}. Consider adding funds soon.`;
    } else if (balance > 50000) {
      return `💰 Great! You have KES ${balance.toLocaleString()} available. That\'s a strong balance!`;
    } else {
      return `💳 Your current balance is KES ${balance.toLocaleString()}.`;
    }
  }

  /**
   * Get transaction summary
   */
  private async getTransactionSummary(userId: string): Promise<string> {
    const result = await query(
      `SELECT type, COUNT(*) as count, SUM(amount) as total 
       FROM wallet WHERE user_id = $1 
       AND created_at > NOW() - INTERVAL '30 days'
       GROUP BY type`,
      [userId]
    );

    let summary = '📊 Your transactions in the last 30 days:\n';
    let totalIn = 0, totalOut = 0;

    result.rows.forEach(row => {
      if (row.total > 0) {
        totalIn += row.total;
        summary += `✅ ${row.type}: KES ${row.total.toLocaleString()} (${row.count} transactions)\n`;
      } else {
        totalOut += Math.abs(row.total);
        summary += `❌ ${row.type}: KES ${Math.abs(row.total).toLocaleString()} (${row.count} transactions)\n`;
      }
    });

    return summary;
  }

  /**
   * Get spending analysis
   */
  private async getSpendingAnalysis(userId: string): Promise<string> {
    const result = await query(
      `SELECT 
        SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as expenses,
        SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as income
       FROM wallet WHERE user_id = $1 
       AND created_at > NOW() - INTERVAL '30 days'`,
      [userId]
    );

    const { expenses = 0, income = 0 } = result.rows[0];
    const netChange = income - expenses;

    let analysis = '💡 Your spending analysis this month:\n';
    analysis += `📈 Income: KES ${income.toLocaleString()}\n`;
    analysis += `📉 Expenses: KES ${expenses.toLocaleString()}\n`;
    analysis += `💰 Net: KES ${netChange.toLocaleString()}\n\n`;

    if (netChange > 0) {
      analysis += '🎉 Great! You\'re earning more than spending. Keep it up!';
    } else if (netChange < -5000) {
      analysis += '⚠️ You\'re spending more than earning. Consider reducing expenses.';
    } else {
      analysis += '✨ Balanced spending. You\'re on track!';
    }

    return analysis;
  }

  /**
   * Get contribution status
   */
  private async getContributionStatus(userId: string): Promise<string> {
    const result = await query(
      `SELECT g.name, c.amount, c.due_date, c.status
       FROM contributions c
       JOIN groups g ON c.group_id = g.id
       WHERE c.user_id = $1 AND c.due_date >= NOW()::date
       ORDER BY c.due_date ASC
       LIMIT 5`,
      [userId]
    );

    if (result.rows.length === 0) {
      return '✅ No pending contributions. You\'re all caught up!';
    }

    let status = '📋 Your upcoming contributions:\n';
    result.rows.forEach(row => {
      const daysUntil = Math.ceil(
        (new Date(row.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      status += `• ${row.name}: KES ${row.amount} (Due in ${daysUntil} days)\n`;
    });

    return status;
  }

  /**
   * Get missed contribution alert
   */
  private async getMissedContributionAlert(userId: string): Promise<string> {
    const result = await query(
      `SELECT g.name, mc.miss_count, mc.fine_amount
       FROM missed_contributions mc
       JOIN groups g ON mc.group_id = g.id
       WHERE mc.user_id = $1 AND mc.fine_status = 'pending'
       ORDER BY mc.created_at DESC
       LIMIT 3`,
      [userId]
    );

    if (result.rows.length === 0) {
      return '✨ No missed contributions. Excellent record!';
    }

    let alert = '⚠️ You have pending fines from missed contributions:\n';
    let totalFine = 0;

    result.rows.forEach(row => {
      alert += `• ${row.name}: ${row.miss_count} miss(es) - Fine: KES ${row.fine_amount}\n`;
      totalFine += row.fine_amount;
    });

    alert += `\n💰 Total pending: KES ${totalFine.toLocaleString()}`;
    return alert;
  }

  /**
   * Get default response
   */
  private getDefaultResponse(): string {
    const responses = [
      '👋 I can help you with questions about your wallet, transactions, and group contributions. What would you like to know?',
      '🤔 Try asking me about your balance, recent transactions, or upcoming contributions.',
      '💡 I can provide insights on your spending, contribution status, and more. What interests you?',
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

export default new AIService();
