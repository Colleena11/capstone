import { FraudDetection } from '../../components/TransactionMonitoring/FraudDetection';
import { PaymentVerification } from '../../components/TransactionMonitoring/PaymentVerification';

export class TransactionAnalysisService {
    private fraudDetection = new FraudDetection();
    private paymentVerification = new PaymentVerification();

    analyzeTransaction(transactionId: string): boolean {
        return this.paymentVerification.verifyPayment(transactionId) && !this.fraudDetection.detectFraud(transactionId);
    }
}
