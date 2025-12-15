/**
 * UEBA Testing Helper
 * Automatically loaded in development mode
 */

(function() {
  if (typeof window === 'undefined') return;

  // Make uebaService available globally in development
  window.uebaHelpers = {
    // View all events
    showEvents: () => {
      const events = JSON.parse(localStorage.getItem('ueba_events') || '[]');
      console.clear();
      console.log('%c=== UEBA Events ===', 'color: cyan; font-size: 16px; font-weight: bold');
      console.table(events);
      return events;
    },

    // View analytics summary
    showSummary: () => {
      const events = JSON.parse(localStorage.getItem('ueba_events') || '[]');
      const summary = {
        totalEvents: events.length,
        chatInteractions: events.filter(e => e.eventType === 'chat_interaction').length,
        userLogins: events.filter(e => e.eventType === 'user_login').length,
        userLogouts: events.filter(e => e.eventType === 'user_logout').length,
        anomalies: events.filter(e => e.eventType === 'anomaly_detected').length,
        avgRiskScore: events.reduce((sum, e) => sum + (e.riskScore || 0), 0) / events.length || 0,
        highRiskEvents: events.filter(e => (e.riskScore || 0) > 50).length,
      };
      console.clear();
      console.log('%c=== Analytics Summary ===', 'color: green; font-size: 16px; font-weight: bold');
      console.table([summary]);
      return summary;
    },

    // Show events by type
    showByType: (type) => {
      const events = JSON.parse(localStorage.getItem('ueba_events') || '[]');
      const filtered = events.filter(e => e.eventType === type);
      console.clear();
      console.log(`%c=== ${type} Events ===`, 'color: yellow; font-size: 16px; font-weight: bold');
      console.table(filtered);
      return filtered;
    },

    // Show high-risk events
    showHighRisk: () => {
      const events = JSON.parse(localStorage.getItem('ueba_events') || '[]');
      const highRisk = events.filter(e => (e.riskScore || 0) > 50);
      console.clear();
      console.log('%c=== High Risk Events ===', 'color: red; font-size: 16px; font-weight: bold');
      console.table(highRisk);
      return highRisk;
    },

    // Clear all events
    clearEvents: () => {
      localStorage.removeItem('ueba_events');
      console.log('%c✓ All UEBA events cleared', 'color: lime; font-size: 14px');
    },

    // Get last N events
    getLast: (n = 5) => {
      const events = JSON.parse(localStorage.getItem('ueba_events') || '[]');
      const last = events.slice(-n);
      console.clear();
      console.log(`%c=== Last ${n} Events ===`, 'color: cyan; font-size: 16px; font-weight: bold');
      console.table(last);
      return last;
    },

    // Simulate test event
    testEvent: () => {
      const testMessage = 'EMERGENCY URGENT HELP NEEDED!!!';
      console.log('%c📝 Simulating high-risk event...', 'color: orange; font-size: 14px');
      console.log(`Message: "${testMessage}"`);
      console.log('Check UEBA events to see result');
    },

    // Export events to JSON
    exportEvents: () => {
      const events = JSON.parse(localStorage.getItem('ueba_events') || '[]');
      const dataStr = JSON.stringify(events, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ueba-events-${Date.now()}.json`;
      link.click();
      console.log('%c✓ Events exported to file', 'color: lime; font-size: 14px');
    },

    // Show help
    help: () => {
      console.clear();
      console.log('%c=== UEBA Testing Helpers ===', 'color: cyan; font-size: 18px; font-weight: bold');
      console.log('\n%cAvailable Commands:', 'color: yellow; font-size: 14px; font-weight: bold');
      console.log('%cuebaHelpers.showEvents()', 'color: white', '- View all UEBA events');
      console.log('%cuebaHelpers.showSummary()', 'color: white', '- View analytics summary');
      console.log('%cuebaHelpers.showByType(type)', 'color: white', '- Filter by event type');
      console.log('%cuebaHelpers.showHighRisk()', 'color: white', '- Show high-risk events only');
      console.log('%cuebaHelpers.getLast(n)', 'color: white', '- Get last N events');
      console.log('%cuebaHelpers.clearEvents()', 'color: white', '- Clear all events');
      console.log('%cuebaHelpers.exportEvents()', 'color: white', '- Export events to JSON file');
      console.log('%cuebaHelpers.help()', 'color: white', '- Show this help message');
      console.log('\n%cShort Aliases:', 'color: yellow; font-size: 14px; font-weight: bold');
      console.log('%cuebaHelpers.events', 'color: white', '- Alias for showEvents()');
      console.log('%cuebaHelpers.summary', 'color: white', '- Alias for showSummary()');
      console.log('%cuebaHelpers.risk', 'color: white', '- Alias for showHighRisk()');
      console.log('\n%cEvent Types:', 'color: yellow; font-size: 14px; font-weight: bold');
      console.log('  • chat_interaction\n  • user_login\n  • user_logout\n  • anomaly_detected\n  • page_view');
      console.log('\n%cRisk Levels:', 'color: yellow; font-size: 14px; font-weight: bold');
      console.log('  🟢 Low: 0-39\n  🟠 Medium: 40-69\n  🔴 High: 70-100');
    }
  };

  // Add convenient aliases
  window.uebaHelpers.events = window.uebaHelpers.showEvents;
  window.uebaHelpers.summary = window.uebaHelpers.showSummary;
  window.uebaHelpers.risk = window.uebaHelpers.showHighRisk;
  window.uebaHelpers.clear = window.uebaHelpers.clearEvents;
  window.uebaHelpers.export = window.uebaHelpers.exportEvents;

  // Show welcome message
  console.log('%c🔍 UEBA Testing Helpers Loaded!', 'color: cyan; font-size: 16px; font-weight: bold');
  console.log('%cType uebaHelpers.help() for available commands', 'color: white; font-size: 12px');
})();
