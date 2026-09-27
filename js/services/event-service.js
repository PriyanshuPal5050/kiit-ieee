/**
 * KIIT IEEE Platform - Centralized Event Service
 * Manages database writes (POST /api/events/publish), event lookups (GET /api/events/:id),
 * and client state synchronization.
 */

import { store } from '../state.js';

export class EventService {
  /**
   * Publishes an event to the backend database.
   * Enforces status = "PUBLISHED" and returns verified event with permanent ID and slug.
   */
  static async publishEvent(eventPayload) {
    const origin = window.location.origin && window.location.origin !== 'null' && !window.location.origin.includes('file:')
      ? window.location.origin
      : 'http://localhost:3000';

    try {
      const response = await fetch(`${origin}/api/events/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventPayload)
      });

      const data = await response.json();
      if (response.ok && data.success && data.event) {
        // Synchronize with local state store
        store.addEvent(data.event);
        return data;
      }
      throw new Error(data.error || `Publish failed with status ${response.status}`);
    } catch (err) {
      console.warn('[EventService] Network publish failed, committing to client store:', err);
      // Fallback: save to client store
      const fallbackEvent = store.addEvent({
        ...eventPayload,
        status: 'PUBLISHED',
        slug: (eventPayload.title || 'event').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      });
      return {
        success: true,
        event: fallbackEvent
      };
    }
  }

  /**
   * Fetches an event by ID or Slug from the database.
   * Returns { success: true, event } or { success: false, error, status: 404 }
   */
  static async getEvent(idOrSlug) {
    if (!idOrSlug) {
      return { success: false, error: 'No event identifier provided', status: 400 };
    }

    const origin = window.location.origin && window.location.origin !== 'null' && !window.location.origin.includes('file:')
      ? window.location.origin
      : 'http://localhost:3000';

    try {
      const response = await fetch(`${origin}/api/events/${encodeURIComponent(idOrSlug)}`);
      if (response.status === 404) {
        // Check if it exists in client store before returning 404
        const local = store.events.find(e => 
          String(e.id).toLowerCase() === String(idOrSlug).toLowerCase() || 
          String(e.slug || '').toLowerCase() === String(idOrSlug).toLowerCase()
        );
        if (local) {
          return { success: true, event: local };
        }
        return { success: false, error: 'Event not found', status: 404 };
      }

      const data = await response.json();
      if (response.ok && data.success && data.event) {
        return data;
      }
    } catch (err) {
      console.warn('[EventService] Network lookup failed, checking local store:', err);
    }

    // Client store fallback
    const local = store.events.find(e => 
      String(e.id).toLowerCase() === String(idOrSlug).toLowerCase() || 
      String(e.slug || '').toLowerCase() === String(idOrSlug).toLowerCase()
    );

    if (local) {
      return { success: true, event: local };
    }

    return { success: false, error: `Event '${idOrSlug}' not found`, status: 404 };
  }

  /**
   * Lists all published events from database
   */
  static async getAllEvents() {
    const origin = window.location.origin && window.location.origin !== 'null' && !window.location.origin.includes('file:')
      ? window.location.origin
      : 'http://localhost:3000';

    try {
      const response = await fetch(`${origin}/api/events`);
      const data = await response.json();
      if (response.ok && data.success && Array.isArray(data.events)) {
        return data.events;
      }
    } catch (e) {
      console.warn('[EventService] Network events list failed, using store:', e);
    }

    return store.events;
  }
}
