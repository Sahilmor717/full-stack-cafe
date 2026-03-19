// 1. Listen for incoming push notifications
self.addEventListener('push', function(event) {
    console.log('[Service Worker] Push Received.');
    
    let data = {};
    
    // Safely parse the incoming data
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            // Fallback if the payload is just plain text instead of JSON
            data = {
                title: 'Full Stack Cafe',
                body: event.data.text(),
                url: '/'
            };
        }
    } else {
        data = {
            title: 'Full Stack Cafe',
            body: 'You have a new update!',
            url: '/'
        };
    }

    // Configure how the notification looks and acts
    const options = {
        body: data.body,
        icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135695.png', // Coffee cup icon
        badge: 'https://cdn-icons-png.flaticon.com/512/3135/3135695.png', // Small icon for Android status bar
        vibrate: [200, 100, 200, 100, 200], // Buzz buzz!
        data: {
            url: data.url || '/' // Store the URL to open when clicked
        }
    };

    // Keep the service worker alive until the notification is displayed
    event.waitUntil(
        self.registration.showNotification(data.title || 'Notification', options)
    );
});

// 2. Listen for the user clicking on the notification
self.addEventListener('notificationclick', function(event) {
    console.log('[Service Worker] Notification clicked.');
    
    // Close the notification popup
    event.notification.close();

    const targetUrl = event.notification.data.url;

    // See if the tab is already open, if so, focus it. If not, open a new tab.
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            // Check all open tabs
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                // If the app is already open, just focus that tab
                if (client.url === new URL(targetUrl, self.location.origin).href && 'focus' in client) {
                    return client.focus();
                }
            }
            // If the app isn't open, open a new window
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});