import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
    import { z } from 'zod';
    import { TicketEvolutionTools } from './ticket-evolution-tools.js';

    export function createServer() {
      // Create an MCP server for Ticket Evolution tools
      const server = new McpServer({
        name: "Ticket Evolution Tools",
        version: "1.0.0",
        description: "MCP server for interacting with Ticket Evolution API"
      });

      // Initialize the Ticket Evolution tools
      const ticketTools = new TicketEvolutionTools();

      // Add events_search tool
      server.tool(
        "events_search",
        {
          q: z.string().describe("Search query for event names, performers, venues, etc."),
          page: z.number().int().default(1).describe("Page number for pagination (default: 1)"),
          per_page: z.number().int().default(10).describe("Number of results per page (default: 10)")
        },
        async ({ q, page, per_page }) => {
          console.log(`Searching for events with query: ${q}, page: ${page}, per_page: ${per_page}`);
          const result = await ticketTools.eventsSearch(q, page, per_page);
          return { content: result };
        },
        {
          description: "Search for events on Ticket Evolution with pagination support. Returns a JSON response with event details including venue, performers, date, and availability."
        }
      );

      // Add event_show tool
      server.tool(
        "event_show",
        {
          event_id: z.number().int().describe("ID of the event to show details for")
        },
        async ({ event_id }) => {
          console.log(`Showing event details for ID: ${event_id}`);
          const result = await ticketTools.eventShow(event_id);
          return { content: result };
        },
        {
          description: "Display detailed information about a specific event. Returns a JSON object with comprehensive event details including venue, performers, pricing, and configuration."
        }
      );

      // Add event_stats tool
      server.tool(
        "event_stats",
        {
          event_id: z.number().int().describe("ID of the event to show stats for"),
          inventory_type: z.string().optional().describe("Filter for a specific type of inventory (optional)")
        },
        async ({ event_id, inventory_type }) => {
          console.log(`Getting event stats for ID: ${event_id}, inventory type: ${inventory_type || 'all'}`);
          const result = await ticketTools.eventStats(event_id, inventory_type);
          return { content: result };
        },
        {
          description: "Display statistics about a specific event, including ticket group information. Returns pricing statistics, ticket counts, and availability metrics."
        }
      );

      // Add list_listings tool
      server.tool(
        "list_listings",
        {
          event_id: z.number().int().describe("ID of the event to list listings for")
        },
        async ({ event_id }) => {
          console.log(`Listing all listings for event ID: ${event_id}`);
          const result = await ticketTools.listListings(event_id);
          return { content: result };
        },
        {
          description: "List all listings (ticket groups) for an event. Returns available ticket groups with details about section, row, price, quantity, and delivery options."
        }
      );

      // Add show_listing tool
      server.tool(
        "show_listing",
        {
          listing_id: z.number().int().describe("ID of the listing to show details for")
        },
        async ({ listing_id }) => {
          console.log(`Showing listing details for ID: ${listing_id}`);
          const result = await ticketTools.showListing(listing_id);
          return { content: result };
        },
        {
          description: "Display detailed information about a specific listing (ticket group). Returns comprehensive information about a specific ticket group including section, row, price, delivery options, and seller details."
        }
      );

      // Add list_tickets tool
      server.tool(
        "list_tickets",
        {
          ticket_group_id: z.number().int().describe("ID of the ticket group to list tickets from"),
          page: z.number().int().default(1).describe("Page number for pagination (default: 1)"),
          per_page: z.number().int().default(10).describe("Number of results per page (default: 10)")
        },
        async ({ ticket_group_id, page, per_page }) => {
          console.log(`Listing tickets for group ID: ${ticket_group_id}, page: ${page}, per_page: ${per_page}`);
          const result = await ticketTools.listTickets(ticket_group_id, page, per_page);
          return { content: result };
        },
        {
          description: "List individual tickets from a specific ticket group with pagination support. Returns details of individual tickets including barcodes (if available) and e-ticket information."
        }
      );

      // Add show_ticket tool
      server.tool(
        "show_ticket",
        {
          ticket_id: z.number().int().describe("ID of the ticket to show details for")
        },
        async ({ ticket_id }) => {
          console.log(`Showing ticket details for ID: ${ticket_id}`);
          const result = await ticketTools.showTicket(ticket_id);
          return { content: result };
        },
        {
          description: "Display information about a specific ticket. Returns detailed information about an individual ticket, including its barcode (if available) and e-ticket status."
        }
      );

      // Add update_ticket tool
      server.tool(
        "update_ticket",
        {
          ticket_id: z.number().int().describe("ID of the ticket to update"),
          eticket: z.string().optional().describe("Base-64 encoded single page PDF. Send empty string to remove."),
          barcode: z.string().optional().describe("The ticket's barcode (max 30 chars). Send empty string to remove.")
        },
        async ({ ticket_id, eticket, barcode }) => {
          console.log(`Updating ticket ID: ${ticket_id}`);
          const result = await ticketTools.updateTicket(ticket_id, eticket, barcode);
          return { content: result };
        },
        {
          description: "Update a ticket's e-ticket and/or barcode. Send empty string to remove. Returns the updated ticket information."
        }
      );

      // Add set_credentials tool
      server.tool(
        "set_credentials",
        {
          api_token: z.string().describe("Ticket Evolution API token"),
          api_secret: z.string().describe("Ticket Evolution API secret")
        },
        async ({ api_token, api_secret }) => {
          console.log(`Setting Ticket Evolution API credentials`);
          ticketTools.setCredentials(api_token, api_secret);
          return {
            content: [{ type: "text", text: "Credentials set successfully" }]
          };
        },
        {
          description: "Set the Ticket Evolution API credentials for this session"
        }
      );

      return server;
    }
