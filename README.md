# Ticket Evolution MCP Server

    An MCP server for interacting with the Ticket Evolution API. This server provides tools for searching events, viewing event details, listing tickets, and more.

    ## Features

    - Search for events with pagination support
    - View detailed event information
    - Get event statistics
    - List and view ticket listings
    - Manage individual tickets
    - Update ticket information

    ## Getting Started

    1. Install dependencies:
       ```
       npm install
       ```

    2. Run the server:
       ```
       npm run dev
       ```

    3. Test with MCP Inspector:
       ```
       npm run inspect
       ```

    ## Setting Credentials

    Before using the tools, you need to set your Ticket Evolution API credentials using the `set_credentials` tool:

    ```json
    {
      "api_token": "your-api-token",
      "api_secret": "your-api-secret"
    }
    ```

    ## Available Tools

    - **events_search**: Search for events on Ticket Evolution
    - **event_show**: Display detailed information about a specific event
    - **event_stats**: Display statistics about a specific event
    - **list_listings**: List all listings for an event
    - **show_listing**: Display information about a specific listing
    - **list_tickets**: List tickets from a specific ticket group
    - **show_ticket**: Display information about a specific ticket
    - **update_ticket**: Update a ticket's e-ticket and/or barcode
    - **set_credentials**: Set the Ticket Evolution API credentials

    ## Example Usage

    1. Set your credentials
    2. Search for events: `events_search(q="Boston Celtics")`
    3. Get event details: `event_show(event_id=2729115)`
    4. List tickets: `list_tickets(ticket_group_id=4089948589)`
