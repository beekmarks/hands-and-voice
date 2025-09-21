/**
 * Your Application Class
 * 
 * This is a template for integrating your application with WebMCP tools.
 * Replace the placeholder content with your actual application logic.
 * 
 * KEY INTEGRATION POINTS:
 * 1. Register WebMCP tools that agents can use to interact with your app
 * 2. Provide visual feedback during tool execution (the "Hands at Work" concept)
 * 3. Update your UI in response to agent actions
 * 4. Maintain clean separation between UI logic and tool implementations
 */

class YourApp {
    constructor(container) {
        this.container = container;
        // TODO: Initialize your application state
        this.appState = {
            // Example state structure - customize for your needs
            data: [],
            currentView: 'default',
            lastUpdate: null
        };
        
        this.render();
        this.registerWithWebMCP();
    }

    /**
     * Render your application UI
     * Replace this with your actual application rendering logic
     */
    render() {
        // TODO: Replace with your application's UI structure
        this.container.innerHTML = `
            <div class="app-content">
                <h2>Your Application</h2>
                <div class="app-status">
                    <p><strong>Status:</strong> ${this.getStatusMessage()}</p>
                    <p><strong>Last Update:</strong> ${this.appState.lastUpdate || 'Never'}</p>
                </div>
                <div class="app-data">
                    <h3>Current Data</h3>
                    ${this.renderData()}
                </div>
                <div class="app-actions">
                    <h3>Available Actions</h3>
                    <button onclick="yourApp.performAction('refresh')">Refresh Data</button>
                    <button onclick="yourApp.performAction('analyze')">Analyze</button>
                    <button onclick="yourApp.performAction('report')">Generate Report</button>
                </div>
            </div>
        `;
    }

    /**
     * Render application data
     * Customize this based on your data structure
     */
    renderData() {
        if (this.appState.data.length === 0) {
            return '<p class="no-data">No data available. Use the agent to fetch some data!</p>';
        }
        
        // TODO: Replace with your data rendering logic
        return `
            <ul class="data-list">
                ${this.appState.data.map(item => `
                    <li class="data-item">
                        <strong>${item.name || item.title || 'Item'}:</strong> 
                        ${item.description || item.value || JSON.stringify(item)}
                    </li>
                `).join('')}
            </ul>
        `;
    }

    /**
     * Get current application status message
     */
    getStatusMessage() {
        // TODO: Customize status logic for your application
        if (this.appState.data.length === 0) {
            return 'Waiting for data';
        }
        return `Ready (${this.appState.data.length} items loaded)`;
    }

    /**
     * Render with animation during tool execution
     * This provides visual feedback when WebMCP tools are working
     */
    renderWithAnimation(updateType = 'general') {
        // Show visual feedback that the "Hands" are working
        this.container.parentElement.classList.add('updating');
        this.showHandsAtWork(updateType);
        
        // Re-render the application
        this.render();
        
        // Apply animations based on update type
        setTimeout(() => {
            this.container.parentElement.classList.remove('updating');
            
            // Add specific animations for different types of updates
            const updatedElements = this.container.querySelectorAll('.app-data, .app-status');
            updatedElements.forEach(el => {
                el.classList.add('content-updated');
            });
            
            // Clean up animation classes
            setTimeout(() => {
                updatedElements.forEach(el => {
                    el.classList.remove('content-updated');
                });
            }, 2500);
        }, 100);
    }

    /**
     * Show "Hands at Work" indicator during WebMCP tool execution
     */
    showHandsAtWork(actionType) {
        const handsIndicator = document.createElement('div');
        handsIndicator.className = 'webmcp-hands-indicator';
        
        // Customize messages based on action type
        let actionText = 'WebMCP Tools Executing...';
        let actionIcon = '🤲';
        
        switch(actionType) {
            case 'fetch':
                actionText = 'Hands: Fetching Data';
                actionIcon = '📊';
                break;
            case 'update':
                actionText = 'Hands: Updating Data';
                actionIcon = '✏️';
                break;
            case 'analyze':
                actionText = 'Hands: Analyzing Data';
                actionIcon = '🔍';
                break;
            case 'report':
                actionText = 'Hands: Generating Report';
                actionIcon = '📄';
                break;
            default:
                // Use default values
                break;
        }
        
        handsIndicator.innerHTML = `
            <div class="hands-icon">${actionIcon}</div>
            <div class="hands-text">${actionText}</div>
            <div class="hands-pulse"></div>
        `;
        
        this.container.parentElement.appendChild(handsIndicator);
        
        // Remove indicator after animation
        setTimeout(() => {
            if (handsIndicator.parentNode) {
                handsIndicator.parentNode.removeChild(handsIndicator);
            }
        }, 2000);
    }

    /**
     * Perform an action (can be called by UI buttons or WebMCP tools)
     */
    async performAction(actionType, args = {}) {
        console.log(`Performing action: ${actionType}`, args);
        
        // TODO: Implement your actual business logic here
        switch(actionType) {
            case 'refresh':
                this.appState.data = [
                    { name: 'Sample Item 1', value: 'Sample Value 1' },
                    { name: 'Sample Item 2', value: 'Sample Value 2' }
                ];
                break;
            case 'analyze':
                // Simulate analysis
                this.appState.lastAnalysis = {
                    timestamp: new Date().toISOString(),
                    result: 'Analysis completed successfully'
                };
                break;
            case 'report':
                // Simulate report generation
                this.appState.lastReport = {
                    id: 'RPT_' + Date.now(),
                    timestamp: new Date().toISOString(),
                    title: 'Generated Report'
                };
                break;
        }
        
        this.appState.lastUpdate = new Date().toISOString();
        return { success: true, action: actionType, timestamp: this.appState.lastUpdate };
    }

    /**
     * Register WebMCP tools that agents can use to interact with your application
     * 
     * IMPORTANT: This is where you define what actions the AI agent can perform
     * in your application. Each tool should correspond to a meaningful action
     * that provides value to users.
     */
    registerWithWebMCP() {
        // Tool 1: Get current application state/data
        WebMCP.registerTool(
            'getAppData',
            'Retrieve current application data and status',
            async (args) => {
                // TODO: Customize this to return relevant data from your application
                console.log('Agent requesting app data');
                
                return {
                    data: this.appState.data,
                    status: this.getStatusMessage(),
                    lastUpdate: this.appState.lastUpdate,
                    currentView: this.appState.currentView,
                    metadata: {
                        itemCount: this.appState.data.length,
                        timestamp: Date.now()
                    }
                };
            }
        );

        // Tool 2: Update/refresh application data
        WebMCP.registerTool(
            'refreshData',
            'Refresh or reload the application data',
            async (args) => {
                console.log('Agent refreshing data with args:', args);
                
                // Show visual feedback
                this.renderWithAnimation('fetch');
                
                // TODO: Replace with your actual data fetching logic
                const result = await this.performAction('refresh', args);
                
                return {
                    success: true,
                    message: 'Data refreshed successfully',
                    newDataCount: this.appState.data.length,
                    result: result
                };
            }
        );

        // Tool 3: Perform data analysis
        WebMCP.registerTool(
            'analyzeData',
            'Analyze the current application data and provide insights',
            async (args) => {
                console.log('Agent analyzing data with parameters:', args);
                
                // Show visual feedback
                this.renderWithAnimation('analyze');
                
                // TODO: Replace with your actual analysis logic
                const result = await this.performAction('analyze', args);
                
                return {
                    success: true,
                    analysis: this.appState.lastAnalysis || 'No analysis available',
                    insights: [
                        'Analysis insight 1',
                        'Analysis insight 2',
                        'Analysis insight 3'
                    ],
                    parameters: args,
                    result: result
                };
            }
        );

        // Tool 4: Generate reports
        WebMCP.registerTool(
            'generateReport',
            'Generate a report based on current data and specified parameters',
            async (args) => {
                console.log('Agent generating report with options:', args);
                
                // Show visual feedback
                this.renderWithAnimation('report');
                
                // TODO: Replace with your actual report generation logic
                const result = await this.performAction('report', args);
                
                return {
                    success: true,
                    report: this.appState.lastReport || 'No report generated',
                    downloadUrl: '#', // TODO: Provide actual download URL
                    parameters: args,
                    result: result
                };
            }
        );

        // TODO: Add more tools specific to your application domain
        // Examples for different types of applications:
        
        // E-COMMERCE:
        // WebMCP.registerTool('searchProducts', 'Search for products', async (args) => { ... });
        // WebMCP.registerTool('addToCart', 'Add item to shopping cart', async (args) => { ... });
        
        // DOCUMENT MANAGEMENT:
        // WebMCP.registerTool('searchDocuments', 'Search document library', async (args) => { ... });
        // WebMCP.registerTool('createDocument', 'Create new document', async (args) => { ... });
        
        // TASK MANAGEMENT:
        // WebMCP.registerTool('createTask', 'Create a new task', async (args) => { ... });
        // WebMCP.registerTool('updateTaskStatus', 'Update task status', async (args) => { ... });

        console.log('WebMCP tools registered for YourApp');
    }

    /**
     * Get all available WebMCP tools for this application
     */
    getTools() {
        return WebMCP.getTools();
    }

    /**
     * Update application state (can be called by external systems)
     */
    updateState(newState) {
        this.appState = { ...this.appState, ...newState };
        this.render();
    }

    /**
     * Get current application state
     */
    getState() {
        return { ...this.appState };
    }
}

/**
 * CUSTOMIZATION GUIDE:
 * 
 * 1. Replace the placeholder UI in render() with your actual application interface
 * 2. Implement your business logic in performAction() method
 * 3. Add WebMCP tools in registerWithWebMCP() that correspond to meaningful user actions
 * 4. Customize the visual feedback in showHandsAtWork() to match your brand/theme
 * 5. Update the state management to reflect your application's data structure
 * 
 * EXAMPLE IMPLEMENTATIONS:
 * 
 * FOR E-COMMERCE:
 * - Tools: searchProducts, addToCart, getRecommendations, checkout
 * - State: cart, products, user, orders
 * - UI: product grid, cart sidebar, search filters
 * 
 * FOR DOCUMENT MANAGEMENT:
 * - Tools: searchDocuments, createFolder, shareDocument, uploadFile
 * - State: documents, folders, permissions, metadata
 * - UI: folder tree, document list, preview pane
 * 
 * FOR DATA DASHBOARD:
 * - Tools: queryDatabase, generateChart, exportData, applyFilters
 * - State: datasets, charts, filters, queries
 * - UI: chart grid, filter panel, data table
 */