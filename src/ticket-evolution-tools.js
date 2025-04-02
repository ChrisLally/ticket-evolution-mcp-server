import crypto from 'crypto';
import fetch from 'node-fetch';

export class TicketEvolutionTools {
  constructor(TICKET_EVOLUTION_API_TOKEN = null, TICKET_EVOLUTION_API_SECRET = null) {
    this.TICKET_EVOLUTION_API_TOKEN = TICKET_EVOLUTION_API_TOKEN;
    this.TICKET_EVOLUTION_API_SECRET = TICKET_EVOLUTION_API_SECRET;
    this.baseUrl = "https://api.ticketevolution.com/v9";
  }

  setCredentials(TICKET_EVOLUTION_API_TOKEN, TICKET_EVOLUTION_API_SECRET) {
    this.TICKET_EVOLUTION_API_TOKEN = TICKET_EVOLUTION_API_TOKEN;
    this.TICKET_EVOLUTION_API_SECRET = TICKET_EVOLUTION_API_SECRET;
    return true;
  }

  generateSignature(method, path, params = {}) {
    // Sort parameters alphabetically and create query string
    const sortedParams = Object.keys(params).sort().reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});

    // Create query string
    const queryString = new URLSearchParams();
    for (const [key, value] of Object.entries(sortedParams)) {
      if (Array.isArray(value)) {
        // Handle array parameters
        for (const item of value) {
          queryString.append(`${key}[]`, item.toString());
        }
      } else {
        queryString.append(key, value.toString());
      }
    }
    const queryStringStr = queryString.toString();

    // Ensure path starts with /v9 for signature generation
    const signaturePath = path.startsWith("/v9") ? path : `/v9${path}`;

    // Create the string to sign
    let stringToSign = `${method.toUpperCase()} api.ticketevolution.com${signaturePath}`;
    if (queryStringStr) {
      stringToSign += `?${queryStringStr}`;
    } else {
      stringToSign += "?";  // Always include ? even if no parameters
    }

    // Debug logging
    console.log("\nSignature Generation Debug:");
    console.log(`Method: ${method}`);
    console.log(`Path: ${signaturePath}`);
    console.log(`Params: ${JSON.stringify(params)}`);
    console.log(`Query String: ${queryStringStr}`);
    console.log(`String to Sign: ${stringToSign}`);

    // Generate HMAC signature
    const hmac = crypto.createHmac('sha256', this.TICKET_EVOLUTION_API_SECRET);
    hmac.update(stringToSign);
    const signature = hmac.digest('base64');

    console.log(`Generated Signature: ${signature}`);

    return signature;
  }

  async makeRequest(method, path, params = null, body = null) {
    if (!this.TICKET_EVOLUTION_API_TOKEN || !this.TICKET_EVOLUTION_API_SECRET) {
      throw new Error("Ticket Evolution API token and secret must be configured.");
    }

    // Always add /v9 prefix for signature generation if not present
    const signaturePath = path.startsWith("/v9") ? path : `/v9${path}`;

    // Remove /v9 prefix for URL construction since it's in baseUrl
    const urlPath = path.startsWith("/v9") ? path.substring(3) : path;

    // Format array parameters correctly
    let formattedParams = {};
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (Array.isArray(value)) {
          // Handle array parameters
          for (const item of value) {
            const arrayKey = `${key}[]`;
            if (arrayKey in formattedParams) {
              if (!Array.isArray(formattedParams[arrayKey])) {
                formattedParams[arrayKey] = [formattedParams[arrayKey]];
              }
              formattedParams[arrayKey].push(item.toString());
            } else {
              formattedParams[arrayKey] = item.toString();
            }
          }
        } else {
          formattedParams[key] = value;
        }
      }
    }

    const url = `${this.baseUrl}${urlPath}`;
    const headers = {
      "X-Token": this.TICKET_EVOLUTION_API_TOKEN,
      "X-Signature": this.generateSignature(method, signaturePath, params || {}),
      "Accept": "application/json"
    };

    if (body) {
      headers["Content-Type"] = "application/json";
    }

    try {
      let response;
      const options = {
        method: method.toUpperCase(),
        headers: headers
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      // For GET requests, append query parameters to URL
      if (method.toUpperCase() === "GET" && params) {
        const queryParams = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
          if (Array.isArray(value)) {
            for (const item of value) {
              queryParams.append(`${key}[]`, item.toString());
            }
          } else {
            queryParams.append(key, value.toString());
          }
        }
        response = await fetch(`${url}?${queryParams.toString()}`, options);
      } else {
        response = await fetch(url, options);
      }

      if (!response.ok) {
        let errorMessage = `API request failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = `API error: ${errorData.error || JSON.stringify(errorData)}`;
        } catch (e) {
          errorMessage = `API error: ${await response.text()}`;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`API request failed: ${error.message}`);
    }
  }

  async eventsSearch(q, page = 1, per_page = 10) {
    try {
      const params = {
        q,
        page,
        per_page
      };

      // Get raw API response
      const data = await this.makeRequest("GET", "/events/search", params);

      // Return formatted response
      return [{ type: "text", text: JSON.stringify(data, null, 2) }];
    } catch (error) {
      return [{ type: "text", text: `Error: ${error.message}` }];
    }
  }

  async listTickets(ticket_group_id, page = 1, per_page = 10) {
    try {
      const params = {
        ticket_group_id,
        page,
        per_page
      };

      // Get raw API response
      const data = await this.makeRequest("GET", "/tickets", params);

      // Return formatted response
      return [{ type: "text", text: JSON.stringify(data, null, 2) }];
    } catch (error) {
      return [{ type: "text", text: `Error: ${error.message}` }];
    }
  }

  async showTicket(ticket_id) {
    try {
      // Get raw API response
      const ticket = await this.makeRequest("GET", `/tickets/${ticket_id}`);

      // Return formatted response
      return [{ type: "text", text: JSON.stringify(ticket, null, 2) }];
    } catch (error) {
      return [{ type: "text", text: `Error: ${error.message}` }];
    }
  }

  async updateTicket(ticket_id, eticket = null, barcode = null) {
    try {
      const path = `/tickets/${ticket_id}`;

      // Build request body
      const body = {};
      if (eticket !== null) {
        body.eticket = eticket;
      }
      if (barcode !== null) {
        body.barcode = barcode;
      }

      // Make the request
      const ticket = await this.makeRequest("PUT", path, {}, body);

      // Return formatted response
      return [{ type: "text", text: JSON.stringify(ticket, null, 2) }];
    } catch (error) {
      return [{ type: "text", text: `Error: ${error.message}` }];
    }
  }

  async eventShow(event_id) {
    try {
      // Get raw API response
      const event = await this.makeRequest("GET", `/events/${event_id}`);

      // Return formatted response
      return [{ type: "text", text: JSON.stringify(event, null, 2) }];
    } catch (error) {
      return [{ type: "text", text: `Error: ${error.message}` }];
    }
  }

  async eventStats(event_id, inventory_type = null) {
    try {
      const params = {};
      if (inventory_type) {
        params.inventory_type = inventory_type;
      }

      // Get raw API response
      const stats = await this.makeRequest("GET", `/events/${event_id}/stats`, params);

      // Return formatted response
      return [{ type: "text", text: JSON.stringify(stats, null, 2) }];
    } catch (error) {
      return [{ type: "text", text: `Error: ${error.message}` }];
    }
  }

  async listListings(event_id) {
    try {
      const params = {
        event_id
      };

      // Get raw API response
      const data = await this.makeRequest("GET", "/listings", params);

      // Return formatted response
      return [{ type: "text", text: JSON.stringify(data, null, 2) }];
    } catch (error) {
      return [{ type: "text", text: `Error: ${error.message}` }];
    }
  }

  async showListing(listing_id) {
    try {
      // Get raw API response
      const listing = await this.makeRequest("GET", `/listings/${listing_id}`);

      // Return formatted response
      return [{ type: "text", text: JSON.stringify(listing, null, 2) }];
    } catch (error) {
      return [{ type: "text", text: `Error: ${error.message}` }];
    }
  }
}
