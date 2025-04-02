#!/usr/bin/env node
    import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
    import { createServer } from './server.js';

    console.log('Starting Ticket Evolution MCP server...');

    const server = createServer();
    const transport = new StdioServerTransport();
    
    try {
      await server.connect(transport);
      console.log('Server connected successfully');
    } catch (error) {
      console.error('Error connecting server:', error);
    }
