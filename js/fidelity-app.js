class FidelityApp {
    constructor(container) {
        this.container = container;
        this.portfolio = {
            stocks: 50,
            bonds: 30,
            cash: 20,
        };
        this.portfolioHistory = [];
        this.retirementProjection = null;
        this.render();
        this.registerWithWebMCP();
    }

    render() {
        this.container.innerHTML = `
            <h2>Your Portfolio</h2>
            <div class="portfolio-current">
                <h3>Current Allocation</h3>
                <ul>
                    <li>Stocks: ${this.portfolio.stocks}%</li>
                    <li>Bonds: ${this.portfolio.bonds}%</li>
                    <li>Cash: ${this.portfolio.cash}%</li>
                </ul>
            </div>
            <div class="portfolio-value">
                <p><strong>Total Value:</strong> $${this.calculateTotalValue().toLocaleString()}</p>
                <p><strong>Risk Level:</strong> ${this.getRiskLevel()}</p>
            </div>
            ${this.portfolioHistory.length > 0 ? this.renderHistory() : ''}
            ${this.retirementProjection ? this.renderRetirementProjection() : ''}
        `;
    }

    renderWithAnimation(updateType = 'general') {
        // Add updating class to show the process is happening
        this.container.parentElement.classList.add('updating');
        
        // Show WebMCP "Hands" indicator
        this.showHandsAtWork(updateType);
        
        // Render the new content
        this.render();
        
        // Apply specific animations based on update type
        setTimeout(() => {
            this.container.parentElement.classList.remove('updating');
            
            if (updateType === 'rebalance') {
                const portfolioCurrent = this.container.querySelector('.portfolio-current');
                const portfolioValue = this.container.querySelector('.portfolio-value');
                if (portfolioCurrent) portfolioCurrent.classList.add('content-updated');
                if (portfolioValue) portfolioValue.classList.add('content-updated');
            } else if (updateType === 'retirement') {
                const retirementSection = this.container.querySelector('.retirement-projection');
                if (retirementSection) retirementSection.classList.add('new-content');
            } else if (updateType === 'history') {
                const historySection = this.container.querySelector('.portfolio-history');
                if (historySection) historySection.classList.add('new-content');
            }
            
            // Clean up animation classes after animation completes
            setTimeout(() => {
                const elements = this.container.querySelectorAll('.content-updated, .new-content');
                elements.forEach(el => {
                    el.classList.remove('content-updated', 'new-content');
                });
            }, 2500);
            
        }, 100);
    }

    showHandsAtWork(actionType) {
        const handsIndicator = document.createElement('div');
        handsIndicator.className = 'webmcp-hands-indicator';
        
        let actionText = 'WebMCP Tools Executing...';
        let actionIcon = '🤲';
        
        if (actionType === 'rebalance') {
            actionText = 'Hands: Rebalancing Portfolio';
            actionIcon = '⚖️';
        } else if (actionType === 'retirement') {
            actionText = 'Hands: Calculating Retirement';
            actionIcon = '📊';
        } else if (actionType === 'portfolio') {
            actionText = 'Hands: Retrieving Portfolio Data';
            actionIcon = '📋';
        }
        
        handsIndicator.innerHTML = `
            <div class="hands-icon">${actionIcon}</div>
            <div class="hands-text">${actionText}</div>
            <div class="hands-pulse"></div>
        `;
        
        this.container.parentElement.appendChild(handsIndicator);
        
        // Remove after animation
        setTimeout(() => {
            if (handsIndicator.parentElement) {
                handsIndicator.remove();
            }
        }, 2000);
    }

    renderHistory() {
        return `
            <div class="portfolio-history">
                <h3>Recent Changes</h3>
                <ul>
                    ${this.portfolioHistory.slice(-3).map(entry => `
                        <li>${entry.timestamp}: ${entry.action}</li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    renderRetirementProjection() {
        const proj = this.retirementProjection;
        return `
            <div class="retirement-projection">
                <h3>🏖️ Retirement Projection</h3>
                <div class="projection-details">
                    <div class="projection-row">
                        <span><strong>Timeline:</strong></span>
                        <span>${proj.yearsToRetirement} years</span>
                    </div>
                    <div class="projection-row">
                        <span><strong>Current Value:</strong></span>
                        <span>$${proj.currentValue.toLocaleString()}</span>
                    </div>
                    <div class="projection-row">
                        <span><strong>Monthly Contribution:</strong></span>
                        <span>$${proj.monthlyContribution.toLocaleString()}</span>
                    </div>
                    <div class="projection-row">
                        <span><strong>Expected Growth Rate:</strong></span>
                        <span>${proj.projectedGrowthRate}% annually</span>
                    </div>
                    <div class="projection-row">
                        <span><strong>Total Contributions:</strong></span>
                        <span>$${proj.totalContributions.toLocaleString()}</span>
                    </div>
                    <div class="projection-row highlight">
                        <span><strong>Projected Value:</strong></span>
                        <span class="projected-value">$${proj.projectedValue.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        `;
    }

    calculateTotalValue() {
        // Simulate portfolio value calculation
        return 125000 + (this.portfolio.stocks * 1000) + (this.portfolio.bonds * 500);
    }

    getRiskLevel() {
        if (this.portfolio.stocks >= 70) return 'Aggressive';
        if (this.portfolio.stocks >= 50) return 'Moderate';
        return 'Conservative';
    }

    addToHistory(action) {
        this.portfolioHistory.push({
            timestamp: new Date().toLocaleTimeString(),
            action: action
        });
    }

    // Register tools with WebMCP provider
    registerWithWebMCP() {
        if (window.WebMCP) {
            window.WebMCP.registerTool(
                'getPortfolio',
                'Get the current portfolio allocation and performance metrics',
                async () => {
                    return {
                        allocation: this.portfolio,
                        totalValue: this.calculateTotalValue(),
                        riskLevel: this.getRiskLevel(),
                        lastUpdated: new Date().toISOString()
                    };
                }
            );

            window.WebMCP.registerTool(
                'rebalancePortfolio',
                'Rebalance the portfolio based on a given strategy (conservative, moderate, aggressive)',
                async (args) => {
                    const oldPortfolio = { ...this.portfolio };
                    
                    if (args.strategy === 'aggressive') {
                        this.portfolio = { stocks: 70, bonds: 20, cash: 10 };
                    } else if (args.strategy === 'moderate') {
                        this.portfolio = { stocks: 60, bonds: 30, cash: 10 };
                    } else {
                        this.portfolio = { stocks: 40, bonds: 40, cash: 20 };
                    }
                    
                    this.addToHistory(`Rebalanced to ${args.strategy} strategy`);
                    this.renderWithAnimation('rebalance');
                    
                    return {
                        oldAllocation: oldPortfolio,
                        newAllocation: this.portfolio,
                        strategy: args.strategy,
                        totalValue: this.calculateTotalValue(),
                        riskLevel: this.getRiskLevel()
                    };
                }
            );

            window.WebMCP.registerTool(
                'getRetirementProjection',
                'Get retirement savings projection based on current portfolio',
                async (args) => {
                    const yearsToRetirement = args.yearsToRetirement || 20;
                    const monthlyContribution = args.monthlyContribution || 500;
                    
                    // Simple projection calculation
                    const currentValue = this.calculateTotalValue();
                    const projectedGrowthRate = this.portfolio.stocks * 0.07 + this.portfolio.bonds * 0.04 + this.portfolio.cash * 0.02;
                    const futureValue = currentValue * Math.pow(1 + projectedGrowthRate / 100, yearsToRetirement);
                    const contributionsValue = monthlyContribution * 12 * yearsToRetirement;
                    
                    const projectionData = {
                        currentValue: currentValue,
                        projectedValue: Math.round(futureValue + contributionsValue),
                        yearsToRetirement: yearsToRetirement,
                        monthlyContribution: monthlyContribution,
                        projectedGrowthRate: Math.round(projectedGrowthRate * 100) / 100,
                        totalContributions: contributionsValue
                    };
                    
                    // Store projection data and update UI
                    this.retirementProjection = projectionData;
                    this.addToHistory(`Generated ${yearsToRetirement}-year retirement projection`);
                    this.renderWithAnimation('retirement');
                    
                    return projectionData;
                }
            );
        }
    }

    getTools() {
        return window.WebMCP ? window.WebMCP.getTools() : [];
    }
}