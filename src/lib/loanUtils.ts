
export type Frequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';
export type InterestType = 'simple' | 'compound';

export interface Installment {
    number: number;
    date: string;
    amount: number;
    isPaid: boolean;
}

const getFrequencyDays = (frequency: Frequency): number => {
    switch (frequency) {
        case 'daily': return 1;
        case 'weekly': return 7;
        case 'biweekly': return 15;
        case 'monthly': return 30;
        default: return 30;
    }
};

export const calculateEndDate = (startDate: string, frequency: Frequency, installments: number): string => {
    const date = new Date(startDate);
    const daysPerInstallment = getFrequencyDays(frequency);

    date.setDate(date.getDate() + (daysPerInstallment * installments));

    return date.toISOString().split('T')[0];
};

export const generateSchedule = (
    startDate: string,
    frequency: Frequency,
    installments: number,
    installmentAmount: number,
    paidInstallments: number = 0
): Installment[] => {
    const schedule: Installment[] = [];
    const date = new Date(startDate);
    const daysPerInstallment = getFrequencyDays(frequency);

    for (let i = 1; i <= installments; i++) {
        date.setDate(date.getDate() + daysPerInstallment);

        schedule.push({
            number: i,
            date: date.toISOString().split('T')[0],
            amount: installmentAmount,
            isPaid: i <= paidInstallments
        });
    }

    return schedule;
};

export const calculateLoanDetails = (
    principal: number,
    rate: number,
    installments: number,
    interestType: InterestType = 'simple'
) => {
    let totalInterest = 0;
    let installmentAmount = 0;
    let totalAmount = 0;

    if (interestType === 'simple') {
        totalInterest = principal * (rate / 100) * installments;
        totalAmount = principal + totalInterest;
        installmentAmount = totalAmount / installments;
    } else {
        const periodicRate = rate / 100;
        const compoundFactor = Math.pow(1 + periodicRate, installments);
        totalAmount = principal * compoundFactor;
        totalInterest = totalAmount - principal;
        installmentAmount = totalAmount / installments;
    }

    return {
        totalInterest,
        totalAmount,
        installmentAmount
    };
};

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};
