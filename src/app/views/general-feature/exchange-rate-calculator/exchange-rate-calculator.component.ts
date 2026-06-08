import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { PageTitleComponent } from '@app/components/page-title.component';
import { NgIcon } from '@ng-icons/core';
import { interval, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface QuoteHistory {
    quoteId: string;
    currencyPair: string;
    exchangeRate: number;
    rebateApplied: string;
    finalAmount: string;
    createdDate: string;
}

interface Agent {
    id: number;
    name: string;
    tier: string;
}

@Component({
    selector: 'app-exchange-rate-calculator',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, PageTitleComponent, NgIcon],
    templateUrl: './exchange-rate-calculator.component.html',
    styleUrls: ['./exchange-rate-calculator.component.scss']
})
export class ExchangeRateCalculatorComponent implements OnInit, OnDestroy {
    calcForm: FormGroup;
    isLoadingRate = false;
    isCalculating = false;
    liveRate: number | null = null;
    manualOverride = false;
    rateTimestamp: Date | null = null;
    apiLatency = 0;
    dailyQuotes = 1240;

    netPayable: number | null = null;
    convertedAmount: number | null = null;
    rebateApplied: number | null = null;
    profitMargin: number | null = null;

    private rateRefreshSub: Subscription | null = null;

    currencies = [
        { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
        { code: 'PKR', name: 'Pakistani Rupee', flag: '🇵🇰' },
        { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
        { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
        { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
        { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦' },
        { code: 'PHP', name: 'Philippine Peso', flag: '🇵🇭' },
        { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
        { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬' },
        { code: 'MYR', name: 'Malaysian Ringgit', flag: '🇲🇾' },
        { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
        { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
    ];

    agents: Agent[] = [
        { id: 1, name: 'Metro Bank Corp (HQ)', tier: 'Gold Tier' },
        { id: 2, name: 'Allied Finance Ltd', tier: 'Silver Tier' },
        { id: 3, name: 'Premier Exchange Co', tier: 'Platinum Tier' },
        { id: 4, name: 'City Money Transfer', tier: 'Bronze Tier' },
    ];

    quoteHistory: QuoteHistory[] = [
        { quoteId: 'QT-88210', currencyPair: 'USD/PKR', exchangeRate: 278.40, rebateApplied: '1.5%', finalAmount: '$3,000.00', createdDate: '2026-06-03 14:30' },
        { quoteId: 'QT-88209', currencyPair: 'GBP/INR', exchangeRate: 105.45, rebateApplied: '0.8%', finalAmount: '£1,200.00', createdDate: '2026-06-03 12:15' },
        { quoteId: 'QT-88208', currencyPair: 'EUR/AED', exchangeRate: 3.98, rebateApplied: '150 AED', finalAmount: '€2,850.00', createdDate: '2026-06-02 16:45' },
        { quoteId: 'QT-88207', currencyPair: 'USD/PHP', exchangeRate: 56.12, rebateApplied: '1.2%', finalAmount: '$4,520.00', createdDate: '2026-06-02 09:10' },
        { quoteId: 'QT-88206', currencyPair: 'SGD/MYR', exchangeRate: 3.52, rebateApplied: '0.5%', finalAmount: '$500.00', createdDate: '2026-06-01 11:55' },
    ];

    get selectedAgent(): Agent | undefined {
        const id = +this.calcForm.get('agentId')?.value;
        return this.agents.find(a => a.id === id);
    }

    get liveConvertedAmount(): number | null {
        if (this.liveRate == null) return null;
        const base = +this.calcForm.get('baseAmount')?.value;
        if (!base || base <= 0) return null;
        return base * this.liveRate;
    }

    get tierChipClass(): string {
        const tier = this.selectedAgent?.tier ?? '';
        if (tier.includes('Gold')) return 'tier-chip gold';
        if (tier.includes('Platinum')) return 'tier-chip platinum';
        if (tier.includes('Silver')) return 'tier-chip silver';
        if (tier.includes('Bronze')) return 'tier-chip bronze';
        return 'tier-chip silver';
    }

    // Interceptor-free client so external currency API calls don't get an
    // Authorization header (which would trigger a blocked CORS preflight).
    private externalHttp: HttpClient;

    constructor(private fb: FormBuilder, private http: HttpClient, httpBackend: HttpBackend) {
        this.externalHttp = new HttpClient(httpBackend);
        this.calcForm = this.fb.group({
            fromCurrency: ['USD', Validators.required],
            toCurrency: ['PKR', Validators.required],
            baseAmount: [1000, [Validators.required, Validators.min(1)]],
            manualRate: [null],
            agentId: [1, Validators.required],
            rebateType: ['percent'],
            rebateValue: [1.5, [Validators.required, Validators.min(0)]]
        });
    }

    ngOnInit(): void {
        this.fetchLiveRate();
        this.rateRefreshSub = interval(60000).subscribe(() => this.fetchLiveRate());

        this.calcForm.get('fromCurrency')?.valueChanges.subscribe(() => this.fetchLiveRate());
        this.calcForm.get('toCurrency')?.valueChanges.subscribe(() => this.fetchLiveRate());
    }

    ngOnDestroy(): void {
        this.rateRefreshSub?.unsubscribe();
    }

    fetchLiveRate(): void {
        const from = (this.calcForm.get('fromCurrency')?.value || '').toLowerCase();
        const to = (this.calcForm.get('toCurrency')?.value || '').toLowerCase();
        if (!from || !to) return;

        this.isLoadingRate = true;
        const start = Date.now();

        // CORS-friendly free currency API (jsDelivr CDN, no key required)
        const primaryUrl = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${from}.json`;
        const fallbackUrl = `https://latest.currency-api.pages.dev/v1/currencies/${from}.json`;

        this.externalHttp.get<any>(primaryUrl).pipe(
            catchError(() => this.externalHttp.get<any>(fallbackUrl))
        ).subscribe({
            next: (res) => {
                this.apiLatency = Date.now() - start;
                const rates = (res && res[from]) ? res[from] : {};
                const rate = rates[to];
                if (rate != null) {
                    this.liveRate = +(+rate).toFixed(4);
                    this.rateTimestamp = new Date();
                }
                this.isLoadingRate = false;
            },
            error: () => {
                this.isLoadingRate = false;
            }
        });
    }

    getEffectiveRate(): number {
        if (this.manualOverride) {
            return +(this.calcForm.get('manualRate')?.value ?? 0);
        }
        return this.liveRate ?? 0;
    }

    onCalculate(): void {
        if (this.calcForm.invalid) return;
        this.isCalculating = true;

        const baseAmount = +this.calcForm.get('baseAmount')?.value;
        const rate = this.getEffectiveRate();
        const rebateType = this.calcForm.get('rebateType')?.value;
        const rebateValue = +this.calcForm.get('rebateValue')?.value;

        this.convertedAmount = baseAmount * rate;

        if (rebateType === 'percent') {
            this.rebateApplied = baseAmount * (rebateValue / 100);
        } else {
            this.rebateApplied = rebateValue;
        }

        this.netPayable = baseAmount - this.rebateApplied;
        this.profitMargin = (this.rebateApplied / baseAmount) * 100;

        setTimeout(() => { this.isCalculating = false; }, 400);
    }

    onSaveQuote(): void {
        if (this.netPayable == null) return;

        const from = this.calcForm.get('fromCurrency')?.value;
        const to = this.calcForm.get('toCurrency')?.value;
        const rebateType = this.calcForm.get('rebateType')?.value;
        const rebateValue = +this.calcForm.get('rebateValue')?.value;

        const newQuote: QuoteHistory = {
            quoteId: `QT-${88211 + this.quoteHistory.length}`,
            currencyPair: `${from}/${to}`,
            exchangeRate: this.getEffectiveRate(),
            rebateApplied: rebateType === 'percent' ? `${rebateValue}%` : `${rebateValue} ${to}`,
            finalAmount: `$${this.netPayable!.toFixed(2)}`,
            createdDate: new Date().toISOString().slice(0, 16).replace('T', ' ')
        };
        this.quoteHistory.unshift(newQuote);
        if (this.quoteHistory.length > 10) this.quoteHistory.pop();
        this.dailyQuotes++;
    }

    onReset(): void {
        this.calcForm.patchValue({
            fromCurrency: 'USD', toCurrency: 'PKR',
            baseAmount: 1000, manualRate: null,
            agentId: 1, rebateType: 'percent', rebateValue: 1.5
        });
        this.netPayable = null;
        this.convertedAmount = null;
        this.rebateApplied = null;
        this.profitMargin = null;
        this.manualOverride = false;
        this.fetchLiveRate();
    }

    swapCurrencies(): void {
        const from = this.calcForm.get('fromCurrency')?.value;
        const to = this.calcForm.get('toCurrency')?.value;
        this.calcForm.patchValue({ fromCurrency: to, toCurrency: from });
    }

    getCurrencyFlag(code: string): string {
        return this.currencies.find(c => c.code === code)?.flag ?? '';
    }
}
