(function() {
    'use strict';
    
    const LOG = (...args) => console.log('[KefinTweaks WebSocketHelper]', ...args);
    const WARN = (...args) => console.warn('[KefinTweaks WebSocketHelper]', ...args);
    const ERR = (...args) => console.error('[KefinTweaks WebSocketHelper]', ...args);
    
    // Registry of event listeners: MessageType -> array of callbacks
    const listeners = {};
    
    // Track initialization state
    let isInitialized = false;
    let pollingIntervalId = null;
    // jf12: the ApiClient whose 'message' events we listen to (Jellyfin's own event bus; see initialize)
    let hookedClient = null;
    
    const POLL_INTERVAL_MS = 1500;
    
    /**
     * Returns the ApiClient WebSocket if available (e.g. after user has logged in).
     */
    function getSocket() {
        if (!window.ApiClient) return null;
        return window.ApiClient.webSocket || window.ApiClient._webSocket || null;
    }
    
    // Fire the callbacks registered for data.MessageType
    function dispatch(data) {
        const messageType = data && data.MessageType;
        if (messageType && listeners[messageType]) {
            // Fire all callbacks for this message type
            listeners[messageType].slice().forEach(callback => {
                try {
                    callback(data);
                } catch (err) {
                    ERR(`Error in WebSocket listener for ${messageType}:`, err);
                }
            });
        }
    }

    function onClientMessage(event, message) {
        dispatch(message);
    }

    /**
     * Initialize WebSocket monitoring (ApiClient message events; the socket's own onmessage as the fallback).
     * Attempts once; returns true if hooked, false if neither is available yet.
     */
    function initialize() {
        // jf12: subscribe to the ApiClient's own 'message' event instead of replacing the WebSocket's onmessage. The ApiClient opens a NEW
        // WebSocket every time it reconnects (sleep/wake, network loss, server restart), which silently dropped a replaced handler: a
        // listener registered here then never fired again until the page was reloaded. The event is fired for every message, on every socket.
        if (window.Events && typeof window.Events.on === 'function' && window.ApiClient) {
            if (hookedClient === window.ApiClient) return true;
            try {
                if (hookedClient && typeof window.Events.off === 'function') window.Events.off(hookedClient, 'message', onClientMessage);
                window.Events.on(window.ApiClient, 'message', onClientMessage);
                hookedClient = window.ApiClient;
                isInitialized = true;
                LOG('WebSocket monitoring initialized (ApiClient message events)');
                return true;
            } catch (err) {
                ERR('Error subscribing to ApiClient message events:', err);
            }
        }
        if (isInitialized) return true;
        
        try {
            const socket = getSocket();
            if (!socket) return false;
            
            // Store original handler if it exists
            const originalHandler = socket.onmessage;
            
            // Hook into onmessage
            socket.onmessage = function(event) {
                try {
                    // Pass it through so Jellyfin still works normally
                    if (originalHandler) {
                        originalHandler.call(this, event);
                    }
                    
                    // Parse the message data
                    const messageData = event.Data || event.data;
                    const data = typeof messageData === 'string' ? JSON.parse(messageData) : messageData;
                    
                    // Get the MessageType
                    dispatch(data);
                } catch (err) {
                    // Log parse errors but don't break the original handler
                    WARN('WebSocket message parse error:', err);
                }
            };
            
            isInitialized = true;
            LOG('WebSocket monitoring initialized');
            return true;
        } catch (err) {
            ERR('Error initializing WebSocket monitoring:', err);
            return false;
        }
    }
    
    /**
     * Poll until ApiClient WebSocket is available, then initialize once and stop.
     * Safe to call multiple times; only one polling loop runs.
     */
    function startPolling() {
        if (isInitialized) return;
        if (pollingIntervalId != null) return; // already polling
        if (initialize()) return;
        
        pollingIntervalId = setInterval(() => {
            if (isInitialized) {
                clearInterval(pollingIntervalId);
                pollingIntervalId = null;
                return;
            }
            if (initialize()) {
                clearInterval(pollingIntervalId);
                pollingIntervalId = null;
            }
        }, POLL_INTERVAL_MS);
    }
    
    /**
     * Register a callback to listen for a specific WebSocket message type
     * @param {string} messageType - The MessageType to listen for (e.g., 'UserDataChanged', 'PlaybackStopped')
     * @param {Function} callback - Function to call when the message type is received. Receives the parsed message data.
     */
    function listen(messageType, callback) {
        if (typeof messageType !== 'string' || !messageType) {
            ERR('listen() requires a non-empty string messageType');
            return;
        }
        
        if (typeof callback !== 'function') {
            ERR('listen() requires a callback function');
            return;
        }
        
        // Initialize listeners array for this message type if it doesn't exist
        if (!listeners[messageType]) {
            listeners[messageType] = [];
        }

        // Avoid duplicate registrations of the same callback
        if (listeners[messageType].includes(callback)) {
            LOG(`Listener already registered for message type: ${messageType}`);
            if (!isInitialized) {
                startPolling();
            }
            return;
        }
        
        // Add the callback
        listeners[messageType].push(callback);
        LOG(`Registered listener for message type: ${messageType} (${listeners[messageType].length} total listeners)`);
        
        // Ensure we're polling for WebSocket if not yet initialized (or re-subscribe when the ApiClient object was replaced)
        if (!isInitialized || (hookedClient && hookedClient !== window.ApiClient)) {
            isInitialized = false;
            initialize() || startPolling();
        }
    }
    
    /**
     * Remove a callback registered with listen().
     * @param {string} messageType
     * @param {Function} callback
     */
    function unlisten(messageType, callback) {
        if (!listeners[messageType]) return;
        listeners[messageType] = listeners[messageType].filter((cb) => cb !== callback);
        LOG(`Unregistered listener for message type: ${messageType} (${listeners[messageType].length} remaining)`);
    }
    
    // Expose the API globally
    window.websocketHelper = {
        listen: listen,
        unlisten: unlisten
    };
    
    // Start polling until ApiClient WebSocket is available (e.g. after user logs in)
    startPolling();
})();

